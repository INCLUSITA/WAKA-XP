# Waka-Flow — Editor Visual de Flujos WhatsApp (TextIt-compatible)

> Constructor visual de flujos conversacionales para WhatsApp, compatible con el formato JSON v13 de TextIt/RapidPro. Diseñado para operaciones WAKA en África Occidental.

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Navegación y Rutas](#navegación-y-rutas)
5. [Editor de Flujos (Core)](#editor-de-flujos-core)
6. [Nodos Implementados](#nodos-implementados)
7. [Panel de Configuración de Nodos](#panel-de-configuración-de-nodos)
8. [Sistema de Conexiones (Edges)](#sistema-de-conexiones-edges)
9. [Exportación TextIt JSON v13](#exportación-textit-json-v13)
10. [Importación de Flujos](#importación-de-flujos)
11. [Validación de Flujos](#validación-de-flujos)
12. [Simulador WhatsApp](#simulador-whatsapp)
13. [Traductor de Flujos](#traductor-de-flujos)
14. [Webhook Logs](#webhook-logs)
15. [Páginas de Gestión](#páginas-de-gestión)
16. [Sistema de Demos](#sistema-de-demos)
17. [Sistema de Diseño (Design Tokens)](#sistema-de-diseño-design-tokens)
18. [Tipos TypeScript](#tipos-typescript)
19. [Instalación y Desarrollo](#instalación-y-desarrollo)

---

## Visión General

**Waka-Flow** es un editor visual drag-and-drop que permite crear, editar, validar, simular y exportar flujos conversacionales para WhatsApp en formato compatible con TextIt/RapidPro. Replica las funcionalidades clave de TextIt con una interfaz moderna basada en React Flow.

### Funcionalidades principales:
- ✅ Editor visual con 12 tipos de nodos
- ✅ Exportación/importación JSON v13 de TextIt
- ✅ Simulador WhatsApp integrado
- ✅ Validación de flujos con errores y advertencias
- ✅ Traductor automático a 17 idiomas
- ✅ Logs de Webhooks con vista detallada request/response
- ✅ Gestión de variables globales
- ✅ Sidebar de navegación tipo TextIt

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | ^18.3.1 | UI framework |
| TypeScript | ^5.8.3 | Tipado estático |
| Vite | ^5.4.19 | Bundler y dev server |
| @xyflow/react | ^12.10.1 | Editor de flujos (nodos y edges) |
| Tailwind CSS | ^3.4.17 | Estilos utilitarios |
| shadcn/ui | — | Componentes UI (Radix primitives) |
| React Router DOM | ^6.30.1 | Enrutamiento SPA |
| Sonner | ^1.7.4 | Notificaciones toast |
| uuid | ^13.0.0 | Generación de UUIDs para nodos |
| Sucrase | ^3.35.1 | Transpilación JSX en runtime (demos) |
| Vitest | ^3.2.4 | Testing unitario |

---

## Arquitectura del Proyecto

```
src/
├── components/
│   ├── flow/                    # Componentes del editor de flujos
│   │   ├── FlowEditor.tsx       # ★ Componente principal (470 líneas)
│   │   ├── FlowToolbar.tsx      # Barra de herramientas superior
│   │   ├── NodeConfigPanel.tsx   # Panel lateral de configuración (630 líneas)
│   │   ├── EdgeInfoPanel.tsx     # Panel info de conexiones
│   │   ├── ValidationPanel.tsx   # Panel de resultados de validación
│   │   ├── WhatsAppSimulator.tsx # Simulador tipo WhatsApp
│   │   ├── TranslatorPanel.tsx   # Panel de traducción
│   │   ├── SendMsgNode.tsx       # Nodo: Enviar mensaje
│   │   ├── WaitResponseNode.tsx  # Nodo: Esperar respuesta
│   │   ├── SplitNode.tsx         # Nodo: Divisiones (5 variantes)
│   │   ├── WebhookNode.tsx       # Nodo: Llamar webhook
│   │   ├── SaveResultNode.tsx    # Nodo: Guardar resultado
│   │   ├── UpdateContactNode.tsx # Nodo: Actualizar contacto
│   │   ├── SendEmailNode.tsx     # Nodo: Enviar email
│   │   ├── CallAINode.tsx        # Nodo: Llamar servicio IA
│   │   ├── EnterFlowNode.tsx     # Nodo: Entrar en otro flujo
│   │   ├── OpenTicketNode.tsx    # Nodo: Abrir ticket
│   │   ├── CallZapierNode.tsx    # Nodo: Llamar Zapier
│   │   └── SendAirtimeNode.tsx   # Nodo: Enviar airtime
│   ├── AppLayout.tsx             # Layout con sidebar
│   ├── AppSidebar.tsx            # Sidebar de navegación
│   ├── NavLink.tsx               # Link de navegación activo
│   └── ui/                       # Componentes shadcn/ui (50+)
├── pages/
│   ├── Index.tsx                 # Página principal (editor)
│   ├── ArchivedFlows.tsx         # Flujos archivados
│   ├── GlobalsPage.tsx           # Variables globales
│   ├── StartsPage.tsx            # Historial de inicios
│   ├── WebhookLogs.tsx           # Logs de webhooks
│   ├── ExportPage.tsx            # Exportación
│   ├── ImportPage.tsx            # Importación
│   ├── ValidatePage.tsx          # Validación
│   ├── SettingsPage.tsx          # Configuración
│   ├── PhoneSimulator.tsx        # Simulador de teléfono
│   ├── Demos.tsx                 # Lista de demos
│   ├── DemoViewer.tsx            # Visor de demos
│   └── NotFound.tsx              # 404
├── lib/
│   ├── flowExport.ts             # Exportación a TextIt JSON v13
│   ├── flowValidation.ts         # Motor de validación
│   ├── flowTranslator.ts         # Motor de traducción (MyMemory API)
│   └── utils.ts                  # Utilidades (cn)
├── hooks/
│   ├── useFlowSimulation.ts      # Lógica del simulador WhatsApp
│   ├── use-mobile.tsx            # Detección de móvil
│   └── use-toast.ts              # Hook de toasts
├── types/
│   └── flow.ts                   # Tipos TextIt/RapidPro
├── demos/
│   ├── registry.ts               # Registro de demos (built-in + uploaded)
│   ├── MoovWakaDemo.tsx          # Demo: Moov Africa BF
│   └── RuntimeJSXRenderer.tsx    # Renderizador JSX en runtime
├── App.tsx                       # Enrutador principal
├── main.tsx                      # Entry point
└── index.css                     # Design tokens y estilos globales
```

---

## Navegación y Rutas

### Sidebar (AppSidebar.tsx)
Organizada en 3 secciones tipo TextIt:

| Sección | Ruta | Componente | Descripción |
|---|---|---|---|
| **Flows** | `/` | `Index.tsx` → `FlowEditor` | Editor visual activo |
| | `/archived` | `ArchivedFlows.tsx` | Flujos archivados |
| | `/globals` | `GlobalsPage.tsx` | Variables globales clave-valor |
| **History** | `/starts` | `StartsPage.tsx` | Historial de ejecuciones |
| | `/webhooks` | `WebhookLogs.tsx` | Logs de webhooks |
| **Settings** | `/export` | `ExportPage.tsx` | Exportación de flujos |
| | `/import` | `ImportPage.tsx` | Importación de flujos |
| | `/validate` | `ValidatePage.tsx` | Validación de flujos |
| | `/settings` | `SettingsPage.tsx` | Configuración general |

### Rutas adicionales (sin sidebar):
- `/simulator` — Simulador de teléfono completo
- `/demos` — Lista de demos interactivas
- `/demo/:id` — Visor de demo individual

### Layout (AppLayout.tsx)
```
┌──────────┬─────────────────────────────────┐
│          │                                 │
│ Sidebar  │         <Outlet />              │
│ (collap- │    (contenido de la ruta)       │
│  sable)  │                                 │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

---

## Editor de Flujos (Core)

### FlowEditor.tsx — Componente Principal

**Archivo:** `src/components/flow/FlowEditor.tsx` (470 líneas)

Gestiona todo el estado del editor:

```typescript
// Estado principal
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
const [selectedNode, setSelectedNode] = useState<Node | null>(null);
const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
const [flowName, setFlowName] = useState("Mi Flujo WhatsApp");
const [showSimulator, setShowSimulator] = useState(false);
const [showTranslator, setShowTranslator] = useState(false);
const [showValidation, setShowValidation] = useState(false);
```

**Funciones clave:**
| Función | Descripción |
|---|---|
| `addNode(type)` | Crea un nodo nuevo con datos por defecto según el tipo |
| `updateNodeData(id, data)` | Actualiza los datos de un nodo existente |
| `deleteNode(id)` | Elimina nodo y sus conexiones |
| `deleteEdge(id)` | Elimina una conexión |
| `onConnect(connection)` | Crea nueva conexión entre nodos |
| `handleValidate()` | Ejecuta validación y muestra panel |
| `handleExport()` | Valida → exporta JSON v13 → descarga |
| `handleImport()` | Abre selector de archivo JSON |
| `importFlowFromJson(json)` | Parsea JSON TextIt e importa nodos/edges |
| `handleLoadSample()` | Carga flujo de ejemplo desde `/sample-flow.json` |
| `handleClear()` | Limpia todo el canvas |

**Componentes integrados en el canvas:**
- `ReactFlow` con `MiniMap`, `Controls`, `Background` (dots)
- `NodeConfigPanel` — panel lateral derecho al seleccionar nodo
- `EdgeInfoPanel` — panel inferior al seleccionar edge
- `ValidationPanel` — panel inferior izquierdo
- `WhatsAppSimulator` — panel lateral derecho
- `TranslatorPanel` — panel inferior izquierdo

### FlowToolbar.tsx — Barra de Herramientas

**Elementos:**
1. `SidebarTrigger` — Colapsar/expandir sidebar
2. `Input` — Nombre editable del flujo
3. `DropdownMenu "Add Node"` — Menú desplegable con 3 secciones:
   - **Actions:** Send Message, Update Contact, Send Email, Save Result, Webhook, Call AI, Zapier, Enter Flow, Open Ticket, Send Airtime
   - **Splits:** Expression, Contact Field, Result, Random, Group
   - **Wait:** Wait for Response
4. **Botones derecha:** Simulate, Translate, Validate, Sample, Import, Export, Clear

---

## Nodos Implementados

### 12 tipos de nodos registrados en `nodeTypes`:

| Tipo | Componente | Color | Descripción |
|---|---|---|---|
| `sendMsg` | `SendMsgNode` | `hsl(160, 84%, 39%)` 🟢 | Enviar mensaje de texto con quick replies |
| `waitResponse` | `WaitResponseNode` | `hsl(220, 80%, 55%)` 🔵 | Esperar respuesta del usuario |
| `splitExpression` | `SplitNode` | `hsl(260, 60%, 55%)` 🟣 | Dividir por expresión |
| `splitContactField` | `SplitNode` | 🟣 | Dividir por campo de contacto |
| `splitResult` | `SplitNode` | 🟣 | Dividir por resultado de flujo |
| `splitRandom` | `SplitNode` | 🟣 | Dividir aleatoriamente |
| `splitGroup` | `SplitNode` | 🟣 | Dividir por grupo |
| `webhook` | `WebhookNode` | `hsl(30, 90%, 55%)` 🟠 | Llamar webhook HTTP |
| `saveResult` | `SaveResultNode` | `hsl(45, 80%, 50%)` 🟡 | Guardar resultado del flujo |
| `updateContact` | `UpdateContactNode` | `hsl(200, 70%, 50%)` | Actualizar campo de contacto |
| `sendEmail` | `SendEmailNode` | `hsl(340, 70%, 50%)` | Enviar email |
| `callAI` | `CallAINode` | `hsl(270, 70%, 55%)` | Llamar servicio IA |
| `enterFlow` | `EnterFlowNode` | `hsl(190, 70%, 45%)` | Entrar en otro flujo |
| `openTicket` | `OpenTicketNode` | `hsl(15, 80%, 50%)` | Abrir ticket de soporte |
| `callZapier` | `CallZapierNode` | `hsl(20, 90%, 55%)` | Llamar Zapier |
| `sendAirtime` | `SendAirtimeNode` | `hsl(50, 80%, 45%)` | Enviar airtime/saldo |

### Anatomía de un nodo visual (ejemplo SendMsgNode):
```
┌─────────────────────────────────┐
│ ● Handle (target/entrada)       │
├─────────────────────────────────┤
│ 📨 SEND MESSAGE          (pill) │  ← Header con color del tipo
├─────────────────────────────────┤
│ Texto del mensaje...            │  ← Body con preview
│                                 │
│ [Opción 1] [Opción 2]          │  ← Quick replies como chips
├─────────────────────────────────┤
│ ● Handle (source/salida)        │
└─────────────────────────────────┘
```

---

## Panel de Configuración de Nodos

**Archivo:** `src/components/flow/NodeConfigPanel.tsx` (630 líneas)

Panel lateral derecho que aparece al hacer clic en un nodo. Campos dinámicos según tipo:

### Campos por tipo de nodo:

| Tipo | Campos |
|---|---|
| **sendMsg** | Texto del mensaje (textarea), Quick Replies (lista dinámica), Attachments (lista URLs) |
| **waitResponse** | Save as Result (input), Categorías de respuesta (lista dinámica), nota "Other" automático |
| **splitExpression** | Operando (@input.text), Test Type (select: has_any_word, regex, number, date, email, phone, pattern), Cases (lista) |
| **splitContactField** | Contact Field (select: name, language, channel, URN, groups, created_on), Cases (lista) |
| **splitResult** | Flow Result (input @results.xxx), Cases (lista) |
| **splitRandom** | Number of Buckets (input numérico 2-10) |
| **splitGroup** | Group Name (input) |
| **webhook** | URL, Method (GET/POST/PUT/PATCH/DELETE), Headers (key-value dinámicos), Request Body JSON (textarea), Save as Result |
| **saveResult** | Result Name, Value, Category |
| **updateContact** | Field (select: name, first_name, language, channel, status), Custom Field Name, Value |
| **sendEmail** | To, Subject, Body |
| **callAI** | Provider (OpenAI/Anthropic/Custom), System Prompt, User Prompt, Save as Result |
| **enterFlow** | Flow Name, Flow UUID, nota informativa |
| **openTicket** | Ticketer (Internal/Zendesk/Mailgun), Topic, Body, Assignee |
| **callZapier** | Webhook URL, Data to Send (JSON) |
| **sendAirtime** | Amount, Currency (XOF/XAF/USD/EUR/GHS/NGN/KES) |

### Funciones helper reutilizables:
- `renderListEditor(key, label, placeholder)` — Editor de listas dinámicas (add/edit/remove)
- `addHeader()` / `updateHeader()` / `removeHeader()` — Gestión de headers HTTP
- `update(key, value)` — Actualizar cualquier campo del nodo

---

## Sistema de Conexiones (Edges)

### Configuración por defecto:
```typescript
const defaultEdgeOptions = {
  type: "step",
  animated: false,
  style: { strokeWidth: 2, stroke: "hsl(200, 30%, 65%)" },
};
```

### EdgeInfoPanel.tsx
Al hacer clic en una conexión, muestra:
- Nodo origen y destino con tipo, color e icono
- Preview del contenido de cada nodo
- UUID truncados de la conexión
- Botón para eliminar la conexión
- Clic en nodo origen/destino abre su configuración

### Estilos CSS de edges (index.css):
```css
.react-flow__edge:hover .react-flow__edge-path { stroke: hsl(200, 60%, 50%); stroke-width: 3; }
.react-flow__edge.selected .react-flow__edge-path { stroke: hsl(200, 70%, 45%); stroke-width: 3; }
.react-flow__edge-interaction { stroke-width: 20; } /* Área clicable ampliada */
```

---

## Exportación TextIt JSON v13

**Archivo:** `src/lib/flowExport.ts`

### Función `exportToTextIt(nodes, edges, flowName) → FlowExport`

Convierte nodos de React Flow a formato TextIt v13:

```typescript
interface FlowExport {
  version: "13";
  site: "https://textit.com";
  flows: [{
    uuid: string;
    name: string;
    language: "spa";
    type: "messaging";
    nodes: TextItNode[];
  }];
}
```

### Mapeo de nodos React Flow → TextIt:

| Tipo React Flow | TextIt Action Type | Router |
|---|---|---|
| `sendMsg` | `send_msg` (text, quick_replies) | — |
| `waitResponse` | — | `switch` con `wait: { type: "msg" }` |
| `splitExpression` | — | `switch` con `operand` y `cases` |
| `webhook` | `call_webhook` (url, method, body) | `switch` con Success/Failure |
| Otros | Exit simple | — |

### Función `downloadJson(data, filename)`
Crea blob JSON y descarga como archivo.

---

## Importación de Flujos

**Lógica en:** `FlowEditor.tsx → importFlowFromJson(json)`

### Proceso de importación:
1. Lee `json.flows[0]`
2. Detecta tipo de nodo por `router` y `actions`:
   - `router.wait.type === "msg"` → `waitResponse`
   - `actions.type === "call_webhook"` → `webhook`
   - `router && !actions.length` → `splitExpression`
   - Default → `sendMsg`
3. Posiciona nodos usando `_ui.nodes[uuid].position` si disponible (con escala 0.8x)
4. Genera edges desde `exits[].destination_uuid`
5. Filtra edges a nodos existentes

### Flujo de ejemplo:
`public/sample-flow.json` — archivo de demostración cargable desde el toolbar.

---

## Validación de Flujos

**Archivo:** `src/lib/flowValidation.ts`

### Reglas implementadas:

| Tipo | Condición | Severidad |
|---|---|---|
| Conectividad | Nodo sin conexión de entrada (excepto primero) | ⚠️ Warning |
| Conectividad | Nodo sin conexión de salida | ⚠️ Warning |
| sendMsg | Texto vacío | ❌ Error |
| sendMsg | Quick replies vacías | ⚠️ Warning |
| waitResponse | Sin categorías definidas | ❌ Error |
| waitResponse | Categorías vacías | ⚠️ Warning |
| webhook | URL vacía | ❌ Error |
| webhook | URL inválida (no parseable) | ❌ Error |
| webhook | Body no es JSON válido | ⚠️ Warning |
| splitExpression | Operando vacío | ❌ Error |

### ValidationPanel.tsx
- Muestra conteo de errores y warnings
- Lista clickable que enfoca el nodo problemático
- Bloquea exportación si hay errores (warnings permiten exportar)

---

## Simulador WhatsApp

### WhatsAppSimulator.tsx
Panel lateral derecho con UI estilo WhatsApp:
- Header verde con estado (en línea / esperando / finalizado)
- Burbujas de chat (bot = izquierda/blanco, usuario = derecha/verde)
- Quick replies como chips clickables
- Categorías de respuesta como botones centrales
- Mensajes de sistema (splits, webhooks, fin de flujo)
- Input con botón de envío
- Botón de reinicio

### useFlowSimulation.ts (Hook)
Motor de simulación que recorre el grafo de nodos:

```typescript
interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  quickReplies?: string[];
  timestamp: Date;
}
```

**Lógica por tipo de nodo:**
- `sendMsg` → Emite mensaje bot, avanza automáticamente (800ms)
- `waitResponse` → Pausa, muestra categorías, espera input del usuario
- `splitExpression` → Emite mensaje sistema, avanza (500ms)
- `webhook` → Emite mensaje sistema con URL, avanza (600ms)
- Otros → Avanza automáticamente

**Navegación del grafo:**
- `findFirstNode()` — Busca nodo sin edges de entrada
- `getNextNodeId(nodeId, sourceHandle?)` — Sigue edge, opcionalmente por handle
- Match de categorías case-insensitive

---

## Traductor de Flujos

### TranslatorPanel.tsx + flowTranslator.ts

**API utilizada:** MyMemory Translation API (`api.mymemory.translated.net`)

### 17 idiomas soportados:
ES, EN, FR, PT, DE, IT, NL, PL, RU, ZH, JA, KO, AR, HI, TR, UK, CA

### Proceso de traducción:
1. Escanea nodos para textos traducibles (mensajes, quick replies, categorías, labels)
2. Preserva variables (@contact.name, @input.text) reemplazándolas con placeholders
3. Traduce texto por texto con delay de 300ms (rate limiting)
4. Restaura variables en texto traducido
5. Exporta como JSON v13 con nombre `{flowName}_{lang}.json`
6. **No modifica el flujo original** — genera copia

### Panel UI:
- Selectores de idioma origen/destino
- Conteo de textos a traducir
- Barra de progreso con texto actual
- Info: qué se preserva (webhooks, variables, estructura)
- Nombre del archivo de salida

---

## Webhook Logs

**Archivo:** `src/pages/WebhookLogs.tsx`

### Vista de lista:
- Tabla con columnas: Flow, URL, Status, Elapsed, Time
- Buscador por nombre de flujo o URL
- Badges de status coloreados (200-299 verde, 400-499 naranja, 500+ rojo)
- Filas clickables

### Vista de detalle (WebhookDetail):
- Status banner (Success/Error con tiempo de respuesta)
- **Request:** Método + URL + Headers + Body (formatted)
- **Response:** HTTP status + Headers + Body (coloreado según status)
- Formato HTTP raw con syntax highlighting

### Datos de ejemplo:
Genera 25 registros de muestra con flujos WAKA reales y URLs de Supabase/OpenAI.

---

## Páginas de Gestión

### GlobalsPage.tsx — Variables Globales
- Editor clave-valor dinámico
- Datos de ejemplo: `org_name=WAKA`, `support_phone=+22670000000`, `default_language=fr`
- Botones Add/Remove por fila

### StartsPage.tsx — Historial de Inicios
- Tabla con Flow, Contacts, Time
- Datos de ejemplo con flujos WAKA

### ArchivedFlows.tsx — Flujos Archivados
- Placeholder: "No archived flows yet"

### ExportPage.tsx — Exportación
- Instrucciones para usar el botón Export del toolbar
- Formato: TextIt JSON v13

### ImportPage.tsx — Importación
- Placeholder para funcionalidad de importación

### SettingsPage.tsx — Configuración
- Campos: Organization Name, Default Language, TextIt API Token

---

## Sistema de Demos

### registry.ts — Registro de demos
- **Built-in demos:** Moov Africa BF × WAKA
- **Uploaded demos:** Almacenadas en localStorage
- Funciones: `getUploadedDemos()`, `saveUploadedDemo()`, `deleteUploadedDemo()`

### MoovWakaDemo.tsx
Demo completa de onboarding GSM→Moov Money para Burkina Faso.

### RuntimeJSXRenderer.tsx
Renderizador que transpila JSX en runtime usando Sucrase para demos subidas por el usuario.

---

## Sistema de Diseño (Design Tokens)

### index.css — Variables CSS (HSL)

```css
:root {
  /* Base */
  --background: 220 20% 97%;    /* Fondo general */
  --foreground: 220 30% 10%;    /* Texto principal */
  --card: 0 0% 100%;            /* Fondo de tarjetas */
  --primary: 160 84% 39%;       /* Verde principal (nodo send) */
  --accent: 260 60% 55%;        /* Púrpura (nodo split) */
  --destructive: 0 72% 51%;     /* Rojo para errores */

  /* Nodos del editor */
  --node-send: 160 84% 39%;     /* Verde — enviar mensaje */
  --node-wait: 220 80% 55%;     /* Azul — esperar respuesta */
  --node-split: 260 60% 55%;    /* Púrpura — splits */
  --node-webhook: 30 90% 55%;   /* Naranja — webhooks */

  /* Canvas */
  --canvas-bg: 220 20% 95%;     /* Fondo del editor */

  /* Sidebar */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
}
```

### Clases Tailwind personalizadas:
- `bg-node-send`, `text-node-send`, `border-node-send`
- `bg-node-wait`, `text-node-wait`, `border-node-wait`
- `bg-node-split`, `text-node-split`
- `bg-node-webhook`, `text-node-webhook`
- `bg-canvas-bg`

---

## Tipos TypeScript

**Archivo:** `src/types/flow.ts`

```typescript
// Tipos del formato TextIt/RapidPro JSON v13
type FlowNodeType = "send_msg" | "wait_for_response" | "split_by_expression" | "call_webhook";

interface TextItAction {
  uuid: string; type: string;
  text?: string; quick_replies?: string[];
  url?: string; method?: string; headers?: Record<string, string>; body?: string;
}

interface TextItCategory { uuid: string; name: string; exit_uuid: string; }
interface TextItRouter { type: string; default_category_uuid: string; categories: TextItCategory[]; operand?: string; cases?: TextItCase[]; wait?: { type: string }; }
interface TextItCase { uuid: string; type: string; arguments: string[]; category_uuid: string; }
interface TextItExit { uuid: string; destination_uuid: string | null; }
interface TextItNode { uuid: string; actions: TextItAction[]; exits: TextItExit[]; router?: TextItRouter; }
interface TextItFlow { uuid: string; name: string; language: string; type: "messaging"; nodes: TextItNode[]; }
interface FlowExport { version: "13"; site: string; flows: TextItFlow[]; }
```

---

## Instalación y Desarrollo

```bash
# Clonar repositorio
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Tests
npm run test
npm run test:watch

# Lint
npm run lint
```

### Scripts disponibles:
| Script | Descripción |
|---|---|
| `npm run dev` | Inicia Vite dev server |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo development |
| `npm run preview` | Preview del build |
| `npm run test` | Ejecuta tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run lint` | ESLint |

---

## Estado Actual y Limitaciones

### ✅ Implementado:
- Editor visual completo con 12 tipos de nodos
- Exportación/importación JSON v13
- Panel de configuración con campos completos por tipo
- Simulador WhatsApp funcional
- Validación con errores y warnings
- Traductor a 17 idiomas
- Webhook logs con vista detallada
- Sidebar de navegación tipo TextIt
- Variables globales
- Sistema de demos con upload

### ⏳ Pendiente / Placeholder:
- Persistencia de datos (actualmente en memoria/localStorage)
- Conexión real con API de TextIt
- Flujos archivados (UI placeholder)
- Importación desde página dedicada (solo funciona desde toolbar)
- Autenticación de usuarios
- Webhook logs con datos reales (actualmente datos de ejemplo)
- Multi-flujo (gestión de lista de flujos)

---

*Documentación generada el 7 de marzo de 2026 — Proyecto Waka-Flow v0.1*
