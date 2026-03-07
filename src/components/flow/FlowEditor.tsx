import { useCallback, useState, useRef } from "react";
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
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { SendMsgNode } from "./SendMsgNode";
import { WaitResponseNode } from "./WaitResponseNode";
import { SplitNode } from "./SplitNode";
import { WebhookNode } from "./WebhookNode";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { FlowToolbar } from "./FlowToolbar";
import { exportToTextIt, downloadJson } from "@/lib/flowExport";

const nodeTypes = {
  sendMsg: SendMsgNode,
  waitResponse: WaitResponseNode,
  splitExpression: SplitNode,
  webhook: WebhookNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2, stroke: "hsl(160, 84%, 39%)" },
};

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState("Mi Flujo WhatsApp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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
          break;
        case "webhook":
          defaultData.url = "";
          defaultData.method = "GET";
          defaultData.body = "";
          break;
      }

      const newNode: Node = {
        id,
        type,
        position: {
          x: 250 + Math.random() * 200,
          y: 100 + nodes.length * 150,
        },
        data: defaultData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
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

  const handleExport = useCallback(() => {
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

      const importedNodes: Node[] = flow.nodes.map((n: any, i: number) => {
        let type = "sendMsg";
        const data: Record<string, any> = {};

        // Detect node type from router and actions
        if (n.router?.wait?.type === "msg") {
          type = "waitResponse";
          data.label = "";
          data.categories = n.router.categories
            ?.filter((c: any) => c.name !== "Other")
            .map((c: any) => c.name) || [];
        } else if (n.router && n.actions?.some((a: any) => a.type === "call_webhook")) {
          type = "webhook";
          const whAction = n.actions.find((a: any) => a.type === "call_webhook");
          data.url = whAction?.url || "";
          data.method = whAction?.method || "GET";
          data.body = whAction?.body || "";
        } else if (n.router && !n.actions?.length) {
          type = "splitExpression";
          data.operand = n.router.operand || "@input.text";
        } else if (n.actions?.[0]?.type === "call_webhook") {
          type = "webhook";
          data.url = n.actions[0].url || "";
          data.method = n.actions[0].method || "GET";
          data.body = n.actions[0].body || "";
        } else {
          // send_msg or other execute_actions
          const sendAction = n.actions?.find((a: any) => a.type === "send_msg");
          data.text = sendAction?.text || n.actions?.map((a: any) => a.text || a.type).filter(Boolean).join("\n") || "";
          data.quick_replies = sendAction?.quick_replies || [];
        }

        // Use _ui positions if available
        const uiInfo = uiNodes[n.uuid];
        const position = uiInfo?.position
          ? { x: (uiInfo.position.left || 0) * SCALE, y: (uiInfo.position.top || 0) * SCALE }
          : { x: 250, y: i * 180 };

        return {
          id: n.uuid,
          type,
          position,
          data,
        };
      });

      // Filter edges to only reference existing nodes
      const nodeIds = new Set(importedNodes.map((n) => n.id));
      const importedEdges = flow.nodes.flatMap((n: any) =>
        (n.exits || [])
          .filter((exit: any) => exit.destination_uuid && nodeIds.has(exit.destination_uuid))
          .map((exit: any) => ({
            id: uuidv4(),
            source: n.uuid,
            target: exit.destination_uuid,
          }))
      );

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

  return (
    <div className="relative flex h-screen flex-col">
      <FlowToolbar
        flowName={flowName}
        onFlowNameChange={setFlowName}
        onAddNode={addNode}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
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
                default: return "hsl(220, 14%, 92%)";
              }
            }}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(220, 10%, 80%)" />

          {nodes.length === 0 && (
            <Panel position="top-center" className="mt-20">
              <div className="rounded-2xl border border-dashed border-border bg-card/80 px-10 py-8 text-center shadow-lg backdrop-blur-sm">
                <p className="text-lg font-semibold text-foreground">¡Comienza a crear tu flujo!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usa los botones de arriba para añadir nodos, luego conéctalos arrastrando.
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
            onDelete={deleteNode}
          />
        )}
      </div>
    </div>
  );
}
