import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  type OnConnectStart,
  type OnConnectEnd,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LabeledEdge } from "./LabeledEdge";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { SendMsgNode } from "./SendMsgNode";
import { WaitResponseNode } from "./WaitResponseNode";
import { SplitNode } from "./SplitNode";
import { WebhookNode } from "./WebhookNode";
import { SaveResultNode } from "./SaveResultNode";
import { UpdateContactNode } from "./UpdateContactNode";
import { SendEmailNode } from "./SendEmailNode";
import { CallAINode } from "./CallAINode";
import { EnterFlowNode } from "./EnterFlowNode";
import { OpenTicketNode } from "./OpenTicketNode";
import { CallZapierNode } from "./CallZapierNode";
import { SendAirtimeNode } from "./SendAirtimeNode";
import { AddGroupNode } from "./AddGroupNode";
import { RemoveGroupNode } from "./RemoveGroupNode";
import { ModuleGroupNode } from "./ModuleGroupNode";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { FlowToolbar, EditorViewMode } from "./FlowToolbar";

import { exportToTextIt, downloadJson } from "@/lib/flowExport";
import { validateFlow, ValidationError } from "@/lib/flowValidation";
import { ValidationPanel } from "./ValidationPanel";
import { WhatsAppSimulator } from "./WhatsAppSimulator";
import { TranslatorPanel } from "./TranslatorPanel";
import { StructuredView } from "./StructuredView";
import { FlowContextPanel, ContextItem } from "./FlowContextPanel";
import { useFlowPersistence } from "@/hooks/useFlowPersistence";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useFlowModules } from "@/hooks/useFlowModules";
import { VersionHistoryPanel } from "@/components/versioning/VersionHistoryPanel";
import { DropNodeMenu, DropMenuPosition } from "./DropNodeMenu";
const nodeTypes = {
  sendMsg: SendMsgNode,
  waitResponse: WaitResponseNode,
  splitExpression: SplitNode,
  webhook: WebhookNode,
  saveResult: SaveResultNode,
  updateContact: UpdateContactNode,
  sendEmail: SendEmailNode,
  callAI: CallAINode,
  enterFlow: EnterFlowNode,
  openTicket: OpenTicketNode,
  callZapier: CallZapierNode,
  sendAirtime: SendAirtimeNode,
  addGroup: AddGroupNode,
  removeGroup: RemoveGroupNode,
  splitContactField: SplitNode,
  splitResult: SplitNode,
  splitRandom: SplitNode,
  splitGroup: SplitNode,
  moduleGroup: ModuleGroupNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

const SPLIT_NODE_TYPES = new Set([
  "splitExpression", "splitContactField", "splitResult", "splitRandom", "splitGroup",
]);

const defaultEdgeOptions = {
  type: "step",
  animated: false,
  style: { strokeWidth: 2, stroke: "hsl(200, 30%, 65%)" },
};

function FlowEditorInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const flowIdParam = searchParams.get("id");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [flowName, setFlowName] = useState("Mi Flujo WhatsApp");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [experienceName, setExperienceName] = useState<string | null>(null);
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<EditorViewMode>("canvas");
  const [showContext, setShowContext] = useState(false);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [channel, setChannel] = useState("whatsapp");
  const [dropMenu, setDropMenu] = useState<DropMenuPosition | null>(null);
  const connectStartRef = useRef<{ nodeId: string; handleId?: string | null } | null>(null);
  const navigate = useNavigate();
  const reactFlowInstance = useReactFlow();
  const initialLoadDone = useRef(false);

  const { tenantId } = useWorkspace();
  const { loadFlow, debouncedSave, saveStatus, isLoading } = useFlowPersistence({
    flowId: flowIdParam,
    onFlowIdChange: (id) => {
      setSearchParams({ id }, { replace: true });
    },
    tenantId,
  });

  const {
    modules,
    addModule,
    deleteModule,
    renameModule,
    toggleCollapse,
    assignNodeToModule,
    updateModuleCounts,
    MODULE_TEMPLATES,
  } = useFlowModules(nodes, setNodes);

  // Inject callbacks into module group nodes — use ref to avoid re-triggering setNodes
  const moduleCallbacksRef = useRef({ toggleCollapse, renameModule, deleteModule });
  moduleCallbacksRef.current = { toggleCollapse, renameModule, deleteModule };

  // Track which module node IDs have had callbacks injected
  const injectedModuleIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const moduleNodeIds = nodes.filter((n) => n.type === "moduleGroup").map((n) => n.id);
    if (moduleNodeIds.length === 0) return;

    // Only inject if there are new modules that haven't been injected yet
    const needsInjection = moduleNodeIds.some((id) => !injectedModuleIdsRef.current.has(id));
    if (!needsInjection) return;

    injectedModuleIdsRef.current = new Set(moduleNodeIds);

    setNodes((nds) =>
      nds.map((n) =>
        n.type === "moduleGroup"
          ? {
              ...n,
              data: {
                ...n.data,
                onToggleCollapse: moduleCallbacksRef.current.toggleCollapse,
                onRename: moduleCallbacksRef.current.renameModule,
                onDelete: moduleCallbacksRef.current.deleteModule,
              },
            }
          : n
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, setNodes]);

  // Keep module counts updated (only when node count or parentId changes)
  const prevCountKey = useRef("");
  useEffect(() => {
    const key = nodes.map((n) => `${n.id}:${n.parentId || ""}`).join(",");
    if (key === prevCountKey.current) return;
    prevCountKey.current = key;
    updateModuleCounts();
  }, [nodes, updateModuleCounts]);

  // Load flow from DB on mount if ?id= is present
  useEffect(() => {
    if (flowIdParam && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadFlow(flowIdParam).then(async (result) => {
        if (result) {
          setNodes(result.nodes);
          setEdges(result.edges);
          setFlowName(result.name);
          const { data } = await supabase
            .from("flows")
            .select("experience_id")
            .eq("id", flowIdParam)
            .single();
          if (data?.experience_id) {
            setExperienceId(data.experience_id);
            const { data: exp } = await supabase
              .from("experiences")
              .select("name")
              .eq("id", data.experience_id)
              .single();
            if (exp) setExperienceName(exp.name);
          }
        }
      });
    }
  }, [flowIdParam, loadFlow, setNodes, setEdges]);

  // Pick up flow from Import page via sessionStorage
  useEffect(() => {
    const importParam = searchParams.get("import");
    if (importParam === "true" && !flowIdParam) {
      const raw = sessionStorage.getItem("waka_import_flow");
      if (raw) {
        try {
          const json = JSON.parse(raw);
          importFlowFromJson(json);
          sessionStorage.removeItem("waka_import_flow");
          setSearchParams({}, { replace: true });
        } catch {
          toast.error("Error al cargar el flujo importado");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on changes (skip initial load)
  const changeCount = useRef(0);
  useEffect(() => {
    if (!initialLoadDone.current && !flowIdParam) {
      // New flow — allow saving after first edit
    }
    changeCount.current++;
    if (changeCount.current <= 2) return;
    debouncedSave(nodes, edges, flowName);
  }, [nodes, edges, flowName, debouncedSave]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const isSplit = sourceNode && SPLIT_NODE_TYPES.has(sourceNode.type || "");
      const label = isSplit && connection.sourceHandle ? connection.sourceHandle : undefined;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            ...(label
              ? {
                  type: "labeled",
                  label,
                  style: {
                    strokeWidth: 2,
                    stroke: label === "Other"
                      ? "hsl(220, 10%, 65%)"
                      : "hsl(260, 60%, 55%)",
                  },
                }
              : {}),
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  const onConnectStart: OnConnectStart = useCallback((_event, params) => {
    connectStartRef.current = { nodeId: params.nodeId || "", handleId: params.handleId };
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectStartRef.current) return;
      // Only show menu if the connection was dropped on the pane (not on a node handle)
      const target = (event as MouseEvent).target as HTMLElement;
      if (target.closest(".react-flow__handle")) return;

      const reactFlowBounds = document.querySelector(".react-flow")?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const clientX = (event as MouseEvent).clientX;
      const clientY = (event as MouseEvent).clientY;

      // Check if drop is inside the pane area
      if (
        clientX < reactFlowBounds.left ||
        clientX > reactFlowBounds.right ||
        clientY < reactFlowBounds.top ||
        clientY > reactFlowBounds.bottom
      ) return;

      setDropMenu({
        x: clientX,
        y: clientY,
        sourceNodeId: connectStartRef.current.nodeId,
        sourceHandleId: connectStartRef.current.handleId,
      });
    },
    []
  );

  const handleDropMenuSelect = useCallback(
    (type: string) => {
      if (!dropMenu) return;
      const id = uuidv4();
      const defaultData: Record<string, unknown> = {};

      switch (type) {
        case "sendMsg": defaultData.text = ""; defaultData.quick_replies = []; break;
        case "waitResponse": defaultData.label = ""; defaultData.categories = ["Sí", "No"]; break;
        case "splitExpression": defaultData.operand = "@input.text"; defaultData.cases = ["Has Text"]; defaultData.testType = "has_any_word"; break;
        case "splitContactField": defaultData.operand = "@contact.language"; defaultData.cases = ["en", "fr"]; break;
        case "splitResult": defaultData.operand = "@results.response"; defaultData.cases = ["Yes", "No"]; break;
        case "splitRandom": defaultData.operand = ""; defaultData.cases = ["Bucket 1", "Bucket 2"]; defaultData.buckets = 2; break;
        case "splitGroup": defaultData.operand = ""; defaultData.cases = ["In Group"]; break;
        case "webhook": defaultData.url = ""; defaultData.method = "GET"; defaultData.body = ""; break;
        case "saveResult": defaultData.value = "@input.text"; defaultData.resultName = "Result"; break;
        case "updateContact": defaultData.field = "name"; defaultData.value = ""; break;
        case "sendEmail": defaultData.to = ""; defaultData.subject = ""; defaultData.body = ""; break;
        case "callAI": defaultData.prompt = ""; break;
        case "enterFlow": defaultData.flowName = ""; break;
        case "openTicket": defaultData.topic = ""; defaultData.body = ""; break;
        case "callZapier": defaultData.url = ""; break;
        case "sendAirtime": defaultData.amount = ""; defaultData.currency = "XOF"; break;
        case "addGroup": defaultData.groupName = ""; break;
        case "removeGroup": defaultData.groupName = ""; break;
      }

      // Position node at the drop point in flow coordinates
      const viewport = reactFlowInstance.getViewport();
      const reactFlowBounds = document.querySelector(".react-flow")?.getBoundingClientRect();
      let position = { x: 250, y: 200 };
      if (reactFlowBounds) {
        position = {
          x: (dropMenu.x - reactFlowBounds.left - viewport.x) / viewport.zoom - 110,
          y: (dropMenu.y - reactFlowBounds.top - viewport.y) / viewport.zoom - 20,
        };
      }

      const newNode: Node = { id, type, position, data: defaultData };
      setNodes((nds) => [...nds, newNode]);

      // Auto-create edge from source to new node
      const sourceNode = nodes.find((n) => n.id === dropMenu.sourceNodeId);
      const isSplit = sourceNode && SPLIT_NODE_TYPES.has(sourceNode.type || "");
      const label = isSplit && dropMenu.sourceHandleId ? dropMenu.sourceHandleId : undefined;

      const newEdge: Edge = {
        id: uuidv4(),
        source: dropMenu.sourceNodeId,
        target: id,
        ...(dropMenu.sourceHandleId ? { sourceHandle: dropMenu.sourceHandleId } : {}),
        ...(label
          ? {
              type: "labeled",
              label,
              style: {
                strokeWidth: 2,
                stroke: label === "Other" ? "hsl(220, 10%, 65%)" : "hsl(260, 60%, 55%)",
              },
            }
          : {}),
      };
      setEdges((eds) => [...eds, newEdge]);

      setDropMenu(null);
      connectStartRef.current = null;

      // Auto-select the new node
      setTimeout(() => {
        setSelectedNode({ ...newNode });
      }, 50);
    },
    [dropMenu, setNodes, setEdges, nodes, reactFlowInstance]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "moduleGroup") return; // don't open config for modules
    setSelectedNode(node);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const deleteEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
      setSelectedEdge(null);
    },
    [setEdges]
  );

  const addNode = useCallback(
    (type: string) => {
      const id = uuidv4();
      const defaultData: Record<string, unknown> = {};

      switch (type) {
        case "sendMsg":
          defaultData.text = "";
          defaultData.quick_replies = [];
          break;
        case "waitResponse":
          defaultData.label = "";
          defaultData.categories = ["Sí", "No"];
          break;
        case "splitExpression":
          defaultData.operand = "@input.text";
          defaultData.cases = ["Has Text"];
          defaultData.testType = "has_any_word";
          break;
        case "splitContactField":
          defaultData.operand = "@contact.language";
          defaultData.cases = ["en", "fr"];
          break;
        case "splitResult":
          defaultData.operand = "@results.response";
          defaultData.cases = ["Yes", "No"];
          break;
        case "splitRandom":
          defaultData.operand = "";
          defaultData.cases = ["Bucket 1", "Bucket 2"];
          defaultData.buckets = 2;
          break;
        case "splitGroup":
          defaultData.operand = "";
          defaultData.cases = ["In Group"];
          break;
        case "webhook":
          defaultData.url = "";
          defaultData.method = "GET";
          defaultData.body = "";
          break;
        case "saveResult":
          defaultData.value = "@input.text";
          defaultData.resultName = "Result";
          break;
        case "updateContact":
          defaultData.field = "name";
          defaultData.value = "";
          break;
        case "sendEmail":
          defaultData.to = "";
          defaultData.subject = "";
          defaultData.body = "";
          break;
        case "callAI":
          defaultData.prompt = "";
          break;
        case "enterFlow":
          defaultData.flowName = "";
          break;
        case "openTicket":
          defaultData.topic = "";
          defaultData.body = "";
          break;
        case "callZapier":
          defaultData.url = "";
          break;
        case "sendAirtime":
          defaultData.amount = "";
          defaultData.currency = "XOF";
          break;
        case "addGroup":
          defaultData.groupName = "";
          break;
        case "removeGroup":
          defaultData.groupName = "";
          break;
      }

      // Calculate position at viewport center so the new node is always visible
      let position = { x: 250, y: 200 };
      try {
        const viewport = reactFlowInstance.getViewport();
        const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
        if (bounds) {
          const cx = (bounds.width / 2 - viewport.x) / viewport.zoom;
          const cy = (bounds.height / 2 - viewport.y) / viewport.zoom;
          position = { x: cx - 110, y: cy - 40 };
        }
      } catch {
        // fallback to default position
      }

      const newNode: Node = {
        id,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, reactFlowInstance]
  );

  const updateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data } : n))
      );
      setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data } : prev));
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  // ── Copy/Paste ──
  const clipboardRef = useRef<Node | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "c" && selectedNode) {
        e.preventDefault();
        clipboardRef.current = selectedNode;
        toast.info("Node copied");
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "v" && clipboardRef.current) {
        e.preventDefault();
        const src = clipboardRef.current;
        const id = uuidv4();
        const newNode: Node = {
          id,
          type: src.type,
          position: { x: src.position.x + 40, y: src.position.y + 60 },
          data: { ...(src.data as Record<string, any>) },
        };
        setNodes((nds) => [...nds, newNode]);
        setSelectedNode(newNode);
        toast.success("Node pasted");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, setNodes]);

  // ── Auto edge cleanup when split cases / wait categories change ──
  useEffect(() => {
    setEdges((eds) => {
      let changed = false;
      const filtered = eds.filter((e) => {
        if (!e.sourceHandle) return true;
        const sourceNode = nodes.find((n) => n.id === e.source);
        if (!sourceNode) return true;
        const d = sourceNode.data as any;

        if (SPLIT_NODE_TYPES.has(sourceNode.type || "")) {
          const validHandles = new Set([...(d.cases || []).filter((c: string) => c.trim()), "Other"]);
          if (!validHandles.has(e.sourceHandle)) { changed = true; return false; }
        }

        if (sourceNode.type === "waitResponse") {
          const validHandles = new Set([
            ...(d.categories || []).filter((c: string) => c.trim()),
            "default",
            ...(d.timeoutSeconds > 0 ? ["Timeout"] : []),
          ]);
          if (!validHandles.has(e.sourceHandle)) { changed = true; return false; }
        }

        return true;
      });
      return changed ? filtered : eds;
    });
  }, [nodes, setEdges]);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const handleValidate = useCallback(() => {
    const errors = validateFlow(nodes, edges, channel);
    setValidationErrors(errors);
    setShowValidation(true);
    return errors;
  }, [nodes, edges, channel]);

  const handleExport = useCallback(() => {
    const errors = validateFlow(nodes, edges);
    const hasErrors = errors.some((e) => e.type === "error");
    if (hasErrors) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error("Corrige los errores antes de exportar");
      return;
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.warning("Hay advertencias — se exportó de todos modos");
    }
    const result = exportToTextIt(nodes, edges, flowName);
    downloadJson(result, `${flowName.replace(/\s+/g, "_")}.json`);
    toast.success("Flujo exportado correctamente");
  }, [nodes, edges, flowName]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const importFlowFromJson = useCallback(
    (json: any) => {
      const flow = json.flows?.[0];
      if (!flow) {
        toast.error("No se encontró un flujo válido en el archivo");
        return;
      }

      setFlowName(flow.name || "Importado");
      const uiNodes = flow._ui?.nodes || {};
      const SCALE = 0.8;

      // Map TextIt action types to Waka XP node types
      const actionTypeMap: Record<string, string> = {
        send_msg: "sendMsg",
        call_webhook: "webhook",
        set_run_result: "saveResult",
        set_contact_field: "updateContact",
        send_email: "sendEmail",
        enter_flow: "enterFlow",
        open_ticket: "openTicket",
        call_zapier: "callZapier",
        send_airtime: "sendAirtime",
        add_contact_groups: "addGroup",
        remove_contact_groups: "removeGroup",
        call_resthook: "webhook",
        call_classifier: "callAI",
        transfer_airtime: "sendAirtime",
      };

      const importedNodes: Node[] = flow.nodes.map((n: any, i: number) => {
        let type = "sendMsg";
        const data: Record<string, any> = {};

        // 1) Wait for response (has router with wait)
        if (n.router?.wait?.type === "msg") {
          type = "waitResponse";
          data.label = "";
          data.categories = n.router.categories
            ?.filter((c: any) => c.name !== "Other")
            .map((c: any) => c.name) || [];
          if (n.router.result_name) data.resultName = n.router.result_name;

        // 2) Pure split (router, no actions or only set_run_result)
        } else if (n.router && (!n.actions?.length || n.actions.every((a: any) => a.type === "set_run_result"))) {
          type = "splitExpression";
          data.operand = n.router.operand || "@input.text";
          data.cases = n.router.categories
            ?.filter((c: any) => c.name !== "Other")
            .map((c: any) => c.name) || [];
          data.testType = n.router.cases?.[0]?.type || "has_any_word";
          // Preserve result saving
          const saveAction = n.actions?.find((a: any) => a.type === "set_run_result");
          if (saveAction) {
            data.resultName = saveAction.name;
          }

        // 3) Action node with optional router (action+split combo)
        } else if (n.actions?.length > 0) {
          const primaryAction = n.actions[0];
          type = actionTypeMap[primaryAction.type] || "sendMsg";

          // Extract data based on action type
          switch (primaryAction.type) {
            case "send_msg":
              data.text = primaryAction.text || "";
              data.quick_replies = primaryAction.quick_replies || [];
              data.attachments = primaryAction.attachments || [];
              break;
            case "call_webhook":
            case "call_resthook":
              data.url = primaryAction.url || "";
              data.method = primaryAction.method || "GET";
              data.body = primaryAction.body || "";
              data.headers = primaryAction.headers || {};
              data.resultName = primaryAction.result_name || "";
              break;
            case "set_run_result":
              data.resultName = primaryAction.name || "";
              data.value = primaryAction.value || "";
              data.category = primaryAction.category || "";
              break;
            case "set_contact_field":
              data.field = primaryAction.field?.key || "";
              data.fieldName = primaryAction.field?.name || "";
              data.value = primaryAction.value || "";
              break;
            case "send_email":
              data.to = Array.isArray(primaryAction.addresses) ? primaryAction.addresses.join(", ") : (primaryAction.addresses || "");
              data.subject = primaryAction.subject || "";
              data.body = primaryAction.body || "";
              break;
            case "enter_flow":
              data.flowName = primaryAction.flow?.name || "";
              data.flowUuid = primaryAction.flow?.uuid || "";
              break;
            case "open_ticket":
              data.subject = primaryAction.subject || "";
              data.body = primaryAction.body || "";
              data.topic = primaryAction.topic?.name || "";
              break;
            case "add_contact_groups":
              data.groups = (primaryAction.groups || []).map((g: any) => g.name || g.uuid);
              break;
            case "remove_contact_groups":
              data.groups = (primaryAction.groups || []).map((g: any) => g.name || g.uuid);
              data.allGroups = primaryAction.all_groups || false;
              break;
            default:
              data.text = primaryAction.text || JSON.stringify(primaryAction).slice(0, 200);
              break;
          }

          // If this action node also has a router (action+split combo), store split data
          if (n.router && !n.router.wait) {
            data.hasSplitAfter = true;
            data.categories = n.router.categories
              ?.filter((c: any) => c.name !== "Other")
              .map((c: any) => c.name) || [];
          }

        // 4) Fallback: empty node
        } else {
          data.text = "";
        }

        const uiInfo = uiNodes[n.uuid];
        const position = uiInfo?.position
          ? { x: (uiInfo.position.left || 0) * SCALE, y: (uiInfo.position.top || 0) * SCALE }
          : { x: 250, y: i * 180 };

        return { id: n.uuid, type, position, data };
      });

      // Build edges from exits
      const nodeIds = new Set(importedNodes.map((n) => n.id));
      const importedEdges = flow.nodes.flatMap((n: any) => {
        const categories = n.router?.categories || [];
        return (n.exits || [])
          .filter((exit: any) => exit.destination_uuid && nodeIds.has(exit.destination_uuid))
          .map((exit: any) => {
            const cat = categories.find((c: any) => c.exit_uuid === exit.uuid);
            const label = cat?.name || undefined;
            const isSplitLike = n.router && !n.router?.wait;
            return {
              id: uuidv4(),
              source: n.uuid,
              target: exit.destination_uuid,
              ...(isSplitLike && label
                ? {
                    type: "labeled",
                    sourceHandle: label,
                    label,
                    style: {
                      strokeWidth: 2,
                      stroke: label === "Other"
                        ? "hsl(220, 10%, 65%)"
                        : "hsl(260, 60%, 55%)",
                    },
                  }
                : {}),
            };
          });
      });

      // Mark the entry node: first node in the flow array is TextIt's convention
      if (importedNodes.length > 0 && flow.nodes[0]?.uuid) {
        const entryIdx = importedNodes.findIndex((n) => n.id === flow.nodes[0].uuid);
        if (entryIdx >= 0) {
          importedNodes[entryIdx] = {
            ...importedNodes[entryIdx],
            data: { ...importedNodes[entryIdx].data, isStart: true },
          };
        }
      }

      setNodes(importedNodes);
      setEdges(importedEdges);
      toast.success(`Flujo importado: ${importedNodes.length} nodos, ${importedEdges.length} conexiones`);
    },
    [setNodes, setEdges]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string);
          importFlowFromJson(json);
        } catch {
          toast.error("Error al leer el archivo JSON");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importFlowFromJson]
  );

  const handleLoadSample = useCallback(async () => {
    try {
      const res = await fetch("/sample-flow.json");
      const json = await res.json();
      importFlowFromJson(json);
    } catch {
      toast.error("Error al cargar el flujo de ejemplo");
    }
  }, [importFlowFromJson]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast.info("Canvas limpiado");
  }, [setNodes, setEdges]);

  const handlePromoteToCandidate = useCallback(async () => {
    if (!flowIdParam) {
      toast.error("Save the flow first before promoting");
      return;
    }
    const { data, error } = await supabase.from("production_candidates").insert({
      name: `${flowName} — Candidate`,
      flow_id: flowIdParam,
      experience_id: experienceId,
      tenant_id: (await supabase.from("flows").select("tenant_id").eq("id", flowIdParam).single()).data?.tenant_id,
    }).select("id").single();
    if (error) {
      toast.error("Error creating candidate");
      return;
    }
    toast.success("Production Candidate created");
    navigate(`/production?id=${data.id}`);
  }, [flowIdParam, flowName, experienceId, navigate]);


  const handleFocusNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setSelectedNode(node);
    },
    [nodes]
  );

  const handleAddModuleAndFocus = useCallback(
    (label?: string) => {
      // Get viewport center in flow coordinates for smart placement
      const viewport = reactFlowInstance.getViewport();
      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      let center: { x: number; y: number } | undefined;
      if (bounds) {
        const cx = (bounds.width / 2 - viewport.x) / viewport.zoom;
        const cy = (bounds.height / 2 - viewport.y) / viewport.zoom;
        center = { x: cx, y: cy };
      }
      const id = addModule(label, center);
      // Wait for render then smoothly zoom to the new module
      setTimeout(() => {
        reactFlowInstance.fitView({ nodes: [{ id }], padding: 0.4, duration: 500 });
      }, 200);
      return id;
    },
    [addModule, reactFlowInstance]
  );

  const handleFocusModule = useCallback(
    (moduleId: string) => {
      const wasStructure = viewMode !== "canvas";
      setViewMode("canvas");
      // Longer delay when switching from structure view (ReactFlow needs to mount)
      setTimeout(() => {
        reactFlowInstance.fitView({ nodes: [{ id: moduleId }], padding: 0.4, duration: 500 });
      }, wasStructure ? 300 : 100);
    },
    [reactFlowInstance, viewMode]
  );

  const handleFocusNodeInCanvas = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const wasStructure = viewMode !== "canvas";
        setSelectedNode(node);
        setViewMode("canvas");
        setTimeout(() => {
          reactFlowInstance.fitView({ nodes: [{ id: nodeId }], padding: 0.5, duration: 500 });
        }, wasStructure ? 300 : 100);
      }
    },
    [nodes, reactFlowInstance, viewMode]
  );

  return (
    <div className="relative flex h-screen flex-col">
      <FlowToolbar
        flowName={flowName}
        onFlowNameChange={setFlowName}
        onAddNode={addNode}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
        onLoadSample={handleLoadSample}
        onValidate={handleValidate}
        onSimulate={() => setShowSimulator(true)}
        onTranslate={() => setShowTranslator(true)}
        onVersions={() => setShowVersions((v) => !v)}
        onPromoteToCandidate={flowIdParam ? handlePromoteToCandidate : undefined}
        saveStatus={saveStatus}
        experienceName={experienceName}
        onOpenExperience={() => {
          if (experienceId) navigate(`/studio?id=${experienceId}`);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleContext={() => setShowContext((v) => !v)}
        showContext={showContext}
        onAddModule={handleAddModuleAndFocus}
        moduleTemplates={MODULE_TEMPLATES}
        channel={channel}
        onChannelChange={setChannel}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative flex-1">
        {viewMode === "canvas" ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
            connectOnClick
            className="bg-canvas-bg"
          >
            <Controls className="!border-border !bg-card !shadow-lg [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground" />
            <MiniMap
              className="!border-border !bg-card !shadow-lg"
              nodeColor={(n) => {
                switch (n.type) {
                  case "sendMsg": return "hsl(160, 84%, 39%)";
                  case "waitResponse": return "hsl(220, 80%, 55%)";
                  case "splitExpression": return "hsl(260, 60%, 55%)";
                  case "webhook": return "hsl(30, 90%, 55%)";
                  case "moduleGroup": return (n.data?.color as string) || "hsl(160, 84%, 39%)";
                  default: return "hsl(220, 14%, 92%)";
                }
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={0.8} color="hsl(220, 10%, 85%)" />

            {nodes.filter((n) => n.type !== "moduleGroup").length === 0 && !isLoading && (
              <Panel position="top-center" className="mt-20">
                <div className="rounded-2xl border border-dashed border-border bg-card/80 px-10 py-8 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-lg font-semibold text-foreground">¡Comienza a crear tu flujo!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Usa los botones de arriba para añadir nodos y módulos, luego conéctalos arrastrando.
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        ) : (
          <StructuredView
            nodes={nodes}
            edges={edges}
            modules={modules}
            onFocusModule={handleFocusModule}
            onFocusNode={handleFocusNodeInCanvas}
            onSwitchToCanvas={() => setViewMode("canvas")}
            onAssignNode={assignNodeToModule}
          />
        )}

        {/* Flow Context Panel */}
        {showContext && (
          <FlowContextPanel
            items={contextItems}
            onChange={setContextItems}
            onClose={() => setShowContext(false)}
          />
        )}

        {selectedNode && viewMode === "canvas" && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
            onDelete={deleteNode}
            channel={channel}
            availableEntities={contextItems
              .filter((i) => i.category === "entity")
              .map((i) => ({ name: i.name, entityType: i.entityType }))}
          />
        )}

        {showValidation && (
          <ValidationPanel
            errors={validationErrors}
            onClose={() => setShowValidation(false)}
            onFocusNode={(nodeId) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (node) setSelectedNode(node);
            }}
          />
        )}

        {showSimulator && (
          <WhatsAppSimulator
            nodes={nodes}
            edges={edges}
            onClose={() => setShowSimulator(false)}
            onHighlightNode={(nodeId) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (node) setSelectedNode(node);
            }}
          />
        )}

        {showTranslator && (
          <TranslatorPanel
            nodes={nodes}
            edges={edges}
            flowName={flowName}
            onClose={() => setShowTranslator(false)}
          />
        )}


        {showVersions && (
          <div className="absolute right-0 top-0 h-full w-80 border-l border-border bg-card shadow-xl z-20">
            <VersionHistoryPanel
              assetType="flow"
              assetId={flowIdParam}
              getSnapshotData={() => ({
                nodes: nodes as unknown as Record<string, unknown>[],
                edges: edges as unknown as Record<string, unknown>[],
                flowName,
                contextItems,
              })}
              onRestore={(data) => {
                const snap = data as { nodes?: any[]; edges?: any[]; flowName?: string; contextItems?: ContextItem[] };
                if (snap.nodes) setNodes(snap.nodes);
                if (snap.edges) setEdges(snap.edges);
                if (snap.flowName) setFlowName(snap.flowName);
                if (snap.contextItems) setContextItems(snap.contextItems);
              }}
              onClose={() => setShowVersions(false)}
            />
          </div>
        )}
      </div>

      {/* Drop-to-create node menu */}
      {dropMenu && (
        <DropNodeMenu
          position={dropMenu}
          onSelect={handleDropMenuSelect}
          onClose={() => { setDropMenu(null); connectStartRef.current = null; }}
        />
      )}
    </div>
  );
}

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
