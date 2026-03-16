# WAKA XP Player — Documento Completo para Codex

> **Fecha:** 16 de marzo de 2026 (actualizado desde 13 de marzo)  
> **Propósito:** Documento de referencia exhaustivo para Codex y cualquier agente de IA que necesite comprender, mantener o evolucionar el Waka XP Player.  
> **Relación con el proyecto:** El Player es una **capa troncal** de Waka XP, documentada en `docs/waka-xp-strategic-foundation.md` §19b y referenciada en `docs/WAKA_XP_STATUS_REPORT_2026-03-13.md` como Fase 1b.  
> **Documentos relacionados:**
> - [`docs/WAKA_XP_RENDER_GUARANTEE.md`](./WAKA_XP_RENDER_GUARANTEE.md) — Spec `x-waka-xp-display` v1 y Render Guarantee

---

## 1. ¿Qué es el Waka XP Player?

El Waka XP Player es un **simulador conversacional IA nativo** que permite diseñar, probar y validar experiencias conversacionales completas sin necesidad de construir un flow clásico (nodos + edges). Es la primera expresión **journey-first** del sistema Waka XP.

### 1.1. Cambio de paradigma

| Modelo anterior (block-first) | Modelo Player (journey-first) |
|---|---|
| Crear nodos → conectar → añadir reglas → simular | Describir objetivo → IA genera conversación → validar → guardar |
| El flow ES la experiencia | La conversación ES la experiencia |
| Mockups artesanales JSX | Pre-runtimes generativos con scenario_config |
| Canal único (WhatsApp simulator) | Bloques soberanos que trascienden canales |

### 1.2. Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/player` | `PlayerFlowsPage.tsx` | Galería de flujos guardados con filtros, búsqueda y acciones CRUD |
| `/player/live` | `WakaPlayerDemo.tsx` | Simulador conversacional IA en tiempo real |
| `/player/live?flow={id}` | `WakaPlayerDemo.tsx` | Carga un flujo específico guardado |

---

## 2. Arquitectura de Componentes

### 2.1. Árbol de componentes

```
src/
├── pages/
│   ├── PlayerFlowsPage.tsx          # ★ Galería de flujos (404 líneas)
│   └── WakaPlayerDemo.tsx           # ★ Página del Player live (~690 líneas)
├── components/player/
│   ├── WakaSovereignPlayer.tsx      # ★ Componente principal del simulador (~970 líneas)
│   ├── PlayerWorkbench.tsx          # ★ Panel lateral Workbench IA (instrucciones, uploads, motor IA)
│   ├── VoiceCallOverlay.tsx         # ★ Overlay WAKA VOICE — iframe real dentro del teléfono
│   ├── AvatarOverlay.tsx            # ★ Overlay Avatar — iframe configurable dentro del teléfono
│   ├── FlowCreationWizard.tsx       # Wizard de creación multi-fuente (492 líneas)
│   ├── FlowContextSelector.tsx      # Selector de contexto de flujo
│   ├── SavedFlowsPanel.tsx          # Panel lateral de flujos guardados
│   ├── SaveFlowDialog.tsx           # Diálogo de guardado
│   ├── SalamandraSvg.tsx            # Logo animado
│   ├── dataMode.ts                  # Context + tipos de modalidad de datos
│   └── sovereign-blocks/            # 16 bloques soberanos
│       ├── index.ts                 # Barrel export
│       ├── ProductCatalog.tsx       # Catálogo de productos con selección
│       ├── PaymentCard.tsx          # Tarjeta de pago/checkout
│       ├── PaymentConfirmationCard.tsx # Confirmación/recibo de pago
│       ├── CreditSimulationCard.tsx # Simulación de crédito
│       ├── CreditContractCard.tsx   # Confirmación contrato crédito
│       ├── ServicePlansCard.tsx     # Planes de servicio con comparación
│       ├── MoMoAccountCard.tsx      # Estado cuenta Mobile Money
│       ├── ClientStatusCard.tsx     # Resumen estado cliente
│       ├── CertificateCard.tsx      # Certificados y documentos
│       ├── LocationCard.tsx         # Ubicación con mapa
│       ├── MediaCarousel.tsx        # Carrusel de imágenes/media
│       ├── RatingWidget.tsx         # Valoración (estrellas/emoji/NPS)
│       ├── InlineForm.tsx           # Formularios inline captura datos
│       ├── TrainingProgress.tsx     # Progreso de formación
│       └── DeviceLockConsentCard.tsx # Consentimiento device lock (BNPL)
├── hooks/
│   ├── useWakaPlayerAI.ts           # Motor IA conversacional (218 líneas)
│   ├── usePlayerConversation.ts     # Persistencia de conversaciones (224 líneas)
│   └── useSavedPlayerFlows.ts       # CRUD flujos guardados (175 líneas)
```

### 2.2. Edge Functions (Backend)

```
supabase/functions/
├── waka-player-ai/index.ts          # ★ Motor IA conversacional (993 líneas)
└── generate-player-flow/index.ts    # ★ Generación de flujos multi-fuente con merge mode (295 líneas)
```

### 2.3. Canales Interactivos (Nuevos)

#### WAKA VOICE (`VoiceCallOverlay.tsx`)
- Carga el iframe real de WAKA VOICE (`waka.services/agents/voice/...`) a pantalla completa dentro del simulador de teléfono
- Transición animada con botón "Volver a la conversación"
- Permisos: `microphone; autoplay`
- URL configurable, actualmente apuntando al endpoint de test WAKA

#### Avatar (`AvatarOverlay.tsx`)
- Carga un iframe configurable de avatar a pantalla completa dentro del simulador
- Permisos: `camera; microphone; autoplay`
- URL configurable (default: `avatar.waka.africa/agent`)

#### Triggers
Los canales se activan de dos formas:
1. **Botones persistentes en la barra de entrada**: Iconos 📞 (Phone) y 👤 (User) visibles junto al clip 📎 y micrófono
2. **Quick replies del flujo**: Mensajes con etiquetas que contengan "Llamar", "VOICE", "📞", "Avatar", "🎭"

### 2.4. Player Workbench (`PlayerWorkbench.tsx`)

Panel lateral derecho que reemplaza el antiguo toolbox. Funcionalidades:

| Sección | Descripción |
|---|---|
| **Instrucciones / Prompt** | Editor de texto para escribir instrucciones del flujo, persiste en `scenario_config.systemPrompt` |
| **Archivos y Assets** | Upload de JSON TextIt, YAML agente, imágenes, logos, documentos |
| **Motor IA** | Selector de engine: WAKA AI (default), Azure OpenAI, BYOM |
| **Aplicar instrucciones** | Envía instrucciones + assets a `generate-player-flow` con merge automático |
| **Acciones** | Guardar flujo, ver flujos guardados, nueva conversación |
| **Prompt activo** | Preview del systemPrompt y los intents activos |

---

## 3. Componente Principal: WakaSovereignPlayer

**Archivo:** `src/components/player/WakaSovereignPlayer.tsx` (965 líneas)

### 3.1. Propósito

Shell visual reutilizable que renderiza una conversación IA con bloques soberanos interactivos. Es la interfaz de usuario del simulador.

### 3.2. Interfaz PlayerMessage

```typescript
export interface PlayerMessage {
  id: string;
  text: string;
  direction: "inbound" | "outbound";
  timestamp: Date;
  quickReplies?: string[];
  progress?: number;
  progressLabel?: string;
  isVoice?: boolean;
  source?: string;
  isSystemEvent?: boolean;
  richCard?: RichCard;
  menu?: MenuOption[];
  menuTitle?: string;
  reaction?: string;
  imageUrl?: string;
  // Sovereign blocks
  catalog?: { title?: string; products: CatalogProduct[] };
  inlineForm?: { title: string; fields: FormField[]; submitLabel?: string; icon?: string };
  location?: LocationData;
  payment?: PaymentCardData;
  rating?: { title: string; type?: "stars" | "emoji" | "nps" };
  certificate?: CertificateData;
  training?: { title: string; modules: TrainingModule[]; overallProgress: number };
  mediaCarousel?: { title?: string; slides: MediaSlide[] };
  creditSimulation?: CreditSimulationData;
  clientStatus?: ClientStatusData;
  momoAccount?: MoMoAccountData;
  servicePlans?: ServicePlansData;
  paymentConfirmation?: PaymentConfirmationData;
  creditContract?: CreditContractData;
  deviceLockConsent?: DeviceLockConsentData;
}
```

### 3.3. Props principales

```typescript
interface WakaSovereignPlayerProps {
  messages: PlayerMessage[];
  botName?: string;
  onSend?: (text: string) => void;
  onSendImage?: (imageDataUrl: string, caption?: string) => void;
  onSendLocation?: (lat: number, lng: number) => void;
  onSendDocument?: (file: File) => void;
  onQuickReply?: (label: string) => void;
  onVoiceToggle?: (active: boolean) => void;
  onMenuSelect?: (label: string) => void;
  onCardAction?: (action: string) => void;
  onAddToCart?: (product: CatalogProduct) => void;
  onFormSubmit?: (values: Record<string, string>) => void;
  onPayment?: (method: string) => void;
  onRate?: (value: number | string) => void;
  onModuleClick?: (moduleId: string) => void;
  onSlideAction?: (slide: MediaSlide) => void;
  onCreditAction?: (action: string) => void;
  onMomoAction?: (action: string) => void;
  onSelectPlan?: (sku: string, name: string) => void;
  onPaymentConfirmAction?: (action: string) => void;
  onCreditContractAction?: (action: string) => void;
  onDeviceLockConsent?: (accepted: boolean) => void;
  status?: "online" | "typing" | "offline";
  statusBar?: { label: string; value: string; accent?: boolean };
  dataMode?: DataMode;
  onDataModeChange?: (mode: DataMode) => void;
}
```

### 3.4. Data Modes (Modalidades de datos)

```typescript
export type DataMode = "libre" | "subventionné" | "zero-rated";
```

| Modo | Descripción | Comportamiento visual |
|---|---|---|
| `libre` | Conexión completa | Animaciones completas, emojis animados, efectos ricos |
| `subventionné` | Datos subsidiados | Animaciones reducidas, emojis estáticos, rendering más ligero |
| `zero-rated` | Sin costo de datos | UI mínima, sin animaciones, solo texto, ultra-ligero |

Los Data Modes se propagan via `DataModeContext` a todos los bloques soberanos hijos.

---

## 4. Bloques Soberanos (Sovereign Blocks)

### 4.1. Concepto

Los Bloques Soberanos son componentes UI nativos que la IA inyecta en la conversación para representar experiencias ricas e interactivas. Superan las limitaciones de canales como WhatsApp, ofreciendo capacidades de UI completas.

### 4.2. Catálogo de bloques

| Bloque | Archivo | Prop en PlayerMessage | Casos de uso |
|---|---|---|---|
| `ProductCatalog` | `ProductCatalog.tsx` | `catalog` | Catálogos BNPL, planes, productos |
| `InlineForm` | `InlineForm.tsx` | `inlineForm` | Captura de datos KYC, registro |
| `LocationCard` | `LocationCard.tsx` | `location` | Agencias, puntos de venta |
| `PaymentCard` | `PaymentCard.tsx` | `payment` | Checkout, resumen de pago |
| `PaymentConfirmationCard` | `PaymentConfirmationCard.tsx` | `paymentConfirmation` | Recibos, confirmación |
| `RatingWidget` | `RatingWidget.tsx` | `rating` | Feedback, NPS, satisfacción |
| `CertificateCard` | `CertificateCard.tsx` | `certificate` | Documentos, certificados |
| `TrainingProgress` | `TrainingProgress.tsx` | `training` | Módulos de formación |
| `MediaCarousel` | `MediaCarousel.tsx` | `mediaCarousel` | Galerías de imágenes/promociones |
| `CreditSimulationCard` | `CreditSimulationCard.tsx` | `creditSimulation` | Simulación de crédito BNPL |
| `ClientStatusCard` | `ClientStatusCard.tsx` | `clientStatus` | Resumen del cliente |
| `MoMoAccountCard` | `MoMoAccountCard.tsx` | `momoAccount` | Estado cuenta Mobile Money |
| `ServicePlansCard` | `ServicePlansCard.tsx` | `servicePlans` | Planes con comparación |
| `CreditContractCard` | `CreditContractCard.tsx` | `creditContract` | Contrato de crédito |
| `DeviceLockConsentCard` | `DeviceLockConsentCard.tsx` | `deviceLockConsent` | Consentimiento device lock |

### 4.3. Ejemplo de bloque en un mensaje

```typescript
const message: PlayerMessage = {
  id: "msg-1",
  text: "Voici les téléphones disponibles :",
  direction: "outbound",
  timestamp: new Date(),
  catalog: {
    title: "Catalogue BNPL",
    products: [
      { id: "p1", name: "Samsung Galaxy A15", description: "128GB", price: 89900, currency: "XOF", image: "..." },
      { id: "p2", name: "iPhone SE", description: "64GB", price: 149900, currency: "XOF", image: "..." },
    ]
  }
};
```

---

## 5. Motor IA (waka-player-ai)

### 5.1. Edge Function

**Archivo:** `supabase/functions/waka-player-ai/index.ts` (~1423 líneas)

### 5.2. Arquitectura

La edge function actúa como un **intent engine + render guarantee engine** que:

1. Recibe el mensaje del usuario + historial de conversación + `scenarioConfig`
2. Resuelve la API key de WAKA CORE (resolución jerárquica)
3. Lo envía al modelo IA (Gemini via Lovable AI gateway)
4. Interpreta la respuesta para extraer:
   - Texto de respuesta natural
   - Tool calls (bloques soberanos a renderizar)
   - Tool calls de WAKA CORE (14 herramientas backend)
   - Quick replies sugeridos
5. **Pass 1**: Ejecuta tool calls de CORE (API real)
6. **Pass 2**: Inyecta resultados de CORE y obtiene respuesta final de la IA
7. **Render Guarantee**: Si la IA no generó un bloque pero el displayMap lo define → auto-genera el bloque via template engine
8. Devuelve un `PlayerMessage` parcial al frontend

### 5.3. System Prompt

El prompt define al bot como **WAKA NEXUS**, con:

- Idiomas: francés, mooré, inglés, dioula, fulfuldé
- 16 bloques soberanos disponibles como funciones
- 14 herramientas WAKA CORE API:
  1. `get_product_rules` — Productos activos y restricciones
  2. `get_bnpl_catalog` — Catálogo BNPL (téléphones)
  3. `create_client` — Crear/buscar cliente
  4. `update_client` — Modificar datos
  5. `lookup_entity` — Búsqueda universal (phone, CNI, voice_id)
  6. `upload_kyc_media` — Upload CNI con OCR
  7. `simulate_credit` — Simulación de crédito
  8. `create_credit` — Crear contrato de crédito
  9. `pay_by_client` — Pago simplifié auto-détection
  10. `register_payment` — Pago a crédito específico
  11. `acquire_service` — Servicio comptant (fibre, assurance)
  12. `update_client_location` — GPS para instalación fibre
  13. `open_momo_account` — Ouverture compte MoMo
  14. `quick_status` — Résumé rapide solde et paiements

### 5.4. Render Guarantee Engine

> **Doc completa:** [`docs/WAKA_XP_RENDER_GUARANTEE.md`](./WAKA_XP_RENDER_GUARANTEE.md)

El Render Guarantee asegura que siempre se renderice UI rica cuando CORE devuelve datos:

```
CORE responde datos
       ↓
¿IA ya generó bloque? → SÍ: usar bloque IA
                       → NO: buscar en displayMap
                              ↓
                       ¿Existe spec? → SÍ: template engine → generar bloque
                                     → NO: heurística legacy (fallback)
```

**displayMap** en `scenario_config`:
```json
{
  "displayMap": {
    "get_bnpl_catalog": {
      "type": "product_carousel",
      "title": "Catalogue BNPL",
      "items_from": "products",
      "card_template": { "title": "{name}", "price": "{price} {currency}" }
    }
  }
}
```

### 5.5. Flujo de datos

```
Usuario → WakaPlayerDemo → useWakaPlayerAI → Edge Function (waka-player-ai)
                                                   ↓
                                              Gemini IA (Lovable AI)
                                                   ↓
                                              Tool calls → WAKA CORE API (14 tools)
                                                   ↓
                                              Render Guarantee Engine
                                                   ↓
                                              PlayerMessage parcial (texto + bloques)
                                                   ↓
WakaSovereignPlayer ← useWakaPlayerAI ← WakaPlayerDemo
```

### 5.5. Hook useWakaPlayerAI

**Archivo:** `src/hooks/useWakaPlayerAI.ts` (218 líneas)

```typescript
export function useWakaPlayerAI() {
  const [isThinking, setIsThinking] = useState(false);
  const historyRef = useRef<ConversationMessage[]>([]);
  const flowContextRef = useRef<string | null>(null);

  const setFlowContext = useCallback((ctx: string | null) => { ... }, []);
  const sendToAI = useCallback(async (
    userText: string,
    dataMode: DataMode,
    imageDataUrl?: string
  ): Promise<Partial<PlayerMessage> | null> => { ... }, []);
  const clearHistory = useCallback(() => { ... }, []);

  return { sendToAI, isThinking, clearHistory, setFlowContext };
}
```

- Mantiene historial de conversación en memoria (`historyRef`)
- Soporta input multimodal (texto + imagen)
- `flowContext` permite inyectar contexto de escenario para flujos guardados
- `clearHistory` reinicia la conversación

---

## 6. Persistencia

### 6.1. Tablas de base de datos

#### player_conversations

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `session_id` | text | ID de sesión del navegador |
| `tenant_id` | uuid | FK → tenants |
| `channel` | text | Default: `waka_sovereign` |
| `data_mode` | text | `libre`, `subventionné`, `zero-rated` |
| `contact_urn` | text | Default: `anonymous` |
| `message_count` | integer | Contador de mensajes |
| `metadata` | jsonb | Metadata adicional |
| `started_at` | timestamptz | Inicio de la conversación |
| `last_message_at` | timestamptz | Último mensaje |

**RLS:** Acceso público para insert/select/update. Sin delete.

#### player_messages

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `conversation_id` | uuid | FK → player_conversations |
| `content` | text | Texto del mensaje |
| `direction` | text | `inbound` / `outbound` |
| `blocks` | jsonb | Bloques soberanos serializados |
| `image_url` | text | Imagen adjunta |
| `ai_model` | text | Modelo IA usado |
| `ai_latency_ms` | integer | Latencia de respuesta IA |
| `source` | text | Origen del mensaje |

**RLS:** Acceso público para insert/select. Sin update/delete.

#### player_saved_flows

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK → tenants |
| `name` | text | Nombre del flujo |
| `description` | text | Descripción |
| `status` | text | `sandbox`, `stable`, `production` |
| `data_mode` | text | Modalidad de datos |
| `conversation_snapshot` | jsonb | Array de PlayerMessage serializado |
| `scenario_config` | jsonb | Configuración del escenario (system prompt, endpoints, intents) |
| `message_count` | integer | Número de mensajes |
| `source_id` | uuid | Flujo padre (si es clon) |
| `source_name` | text | Nombre del flujo padre |
| `created_by` | uuid | Usuario creador |

**RLS:** Acceso por tenant (autenticado). Insert/select/update/delete.

### 6.2. Hook usePlayerConversation

**Archivo:** `src/hooks/usePlayerConversation.ts` (224 líneas)

- Gestiona sesiones basadas en `sessionStorage`
- Reanuda conversaciones existentes al montar
- Persiste mensajes individuales en `player_messages`
- Actualiza contadores en `player_conversations`

### 6.3. Hook useSavedPlayerFlows

**Archivo:** `src/hooks/useSavedPlayerFlows.ts` (175 líneas)

Operaciones CRUD:

| Función | Descripción |
|---|---|
| `loadFlows()` | Lista flujos del tenant (sin snapshot, ligero) |
| `saveFlow(name, description, messages, dataMode, status, scenarioConfig)` | Crea nuevo flujo |
| `loadFlowFull(flowId)` | Carga flujo completo con snapshot y config |
| `updateFlowStatus(flowId, status)` | Cambia estado (sandbox/stable/production) |
| `updateFlowName(flowId, name)` | Renombra |
| `deleteFlow(flowId)` | Elimina |
| `cloneFlow(flowId, newName)` | Clona como sandbox con `source_id` y `source_name` |

---

## 7. Wizard de Creación (FlowCreationWizard)

**Archivo:** `src/components/player/FlowCreationWizard.tsx` (492 líneas)

### 7.1. Fuentes de entrada

| Tab | Modo | Descripción |
|---|---|---|
| **Instrucciones** | `generate` | Texto libre + IA. El usuario describe el flujo en lenguaje natural. |
| **JSON TextIt** | `import` | Subir archivo JSON v13 de TextIt/RapidPro. Se parsea y mapea. |
| **YAML Agente** | `import` | Subir definición YAML de agente con endpoints/intenciones. |
| **Imágenes** | `generate` | Subir logos/capturas como contexto visual para la IA. |

### 7.2. AI Engine Selector

```typescript
type EngineId = "waka-ai" | "azure-openai" | "byom";

const ENGINES = [
  { id: "waka-ai",       name: "WAKA AI",       available: true,  description: "Gemini · Lovable Cloud nativo" },
  { id: "azure-openai",  name: "Azure OpenAI",   available: false, description: "GPT-4o via Azure · Requiere claves" },
  { id: "byom",          name: "BYOM",           available: false, description: "Bring Your Own Model · Requiere config" },
];
```

### 7.3. Edge Function generate-player-flow

**Archivo:** `supabase/functions/generate-player-flow/index.ts` (295 líneas)

Input:
```typescript
{
  name: string;
  description: string;
  engineId: EngineId;
  tenantId: string;
  sourceData: {
    instructions?: string;    // Texto libre
    jsonContent?: string;     // JSON TextIt
    yamlContent?: string;     // YAML agente
    assets?: UploadedAsset[]; // Imágenes/logos base64
  };
  mode: "generate" | "import";
}
```

Output:
```typescript
{
  flowId: string;      // ID del flujo creado en player_saved_flows
  messageCount: number; // Número de mensajes generados
}
```

Cuando `mode === "generate"`:
- Llama a Gemini via Lovable AI con las instrucciones + contexto
- El modelo genera un JSON con `conversation` (mensajes + bloques) y `config` (scenario_config)
- Se persiste en `player_saved_flows`

Cuando `mode === "import"`:
- Parsea el JSON/YAML directamente
- Crea un scenario_config básico a partir de la estructura del flujo
- No requiere llamada a IA

### 7.4. Output generativo dual

Cada flujo generado produce dos artefactos:

**conversation_snapshot** — Array de `PlayerMessage`:
```json
[
  { "id": "gen-1", "text": "Bienvenue...", "direction": "outbound", "quickReplies": [...] },
  { "id": "gen-2", "text": "Je voudrais...", "direction": "inbound" },
  { "id": "gen-3", "text": "Voici les options:", "direction": "outbound", "catalog": { "products": [...] } }
]
```

**scenario_config** — Configuración para continuación en modo live:
```json
{
  "systemPrompt": "Tu es un assistant spécialisé en...",
  "persona": { "name": "WAKA Agent", "tone": "chaleureux" },
  "endpoints": [ { "name": "catalog", "url": "...", "method": "GET" } ],
  "intents": [ "product_inquiry", "payment", "support" ],
  "context": { "brand": "Moov Africa", "country": "BF" }
}
```

---

## 8. Página del Player Live (WakaPlayerDemo)

**Archivo:** `src/pages/WakaPlayerDemo.tsx` (680 líneas)

### 8.1. Funcionalidades

- Simulador conversacional completo con `WakaSovereignPlayer`
- Selector de Data Mode (libre/subventionné/zero-rated)
- Integración con `useWakaPlayerAI` para respuestas IA
- Integración con `usePlayerConversation` para persistencia
- Carga reactiva de flujos guardados via `?flow={id}` query param
- Panel lateral de flujos guardados (`SavedFlowsPanel`)
- Indicador visual del flujo activo en header
- Botones: Reset, Save, Open flows panel
- Aislamiento estricto de flujos (cada flow carga su propio snapshot)

### 8.2. Carga de flujos

```
URL: /player/live?flow=abc123
                        ↓
useEffect detecta flowIdParam
                        ↓
loadFlowFull(flowIdParam) → DB query
                        ↓
setMessages(full.conversationSnapshot)
setActiveFlowTitle(full.name)
setFlowContext(full.scenarioConfig) → inyecta en useWakaPlayerAI
```

### 8.3. Callbacks del Player

El componente `WakaPlayerDemo` conecta todos los callbacks del `WakaSovereignPlayer` con la lógica de negocio:

- `onSend` → `sendToAI` + `persistMessage`
- `onSendImage` → `sendToAI` con imagen + `persistMessage`
- `onQuickReply` → Reenvía como mensaje de texto
- `onFormSubmit` → Envía valores como mensaje del usuario
- `onAddToCart` → Confirma selección de producto
- `onPayment`, `onRate`, `onCreditAction`, etc. → Acciones específicas de bloques

---

## 9. Galería de Flujos (PlayerFlowsPage)

**Archivo:** `src/pages/PlayerFlowsPage.tsx` (404 líneas)

### 9.1. Funcionalidades

- Grid de cards con todos los flujos guardados del tenant
- Tabs: Todos / Stable / Sandbox / Production
- Búsqueda por nombre
- Acciones por flujo:
  - ▶ Abrir en Player
  - 📋 Clonar como Sandbox
  - ✏️ Renombrar
  - 🔄 Cambiar estado
  - 🗑️ Eliminar
- Metadata visible: mensaje count, data mode, origen (si es clon), fecha
- Botón "Crear flujo" → abre `FlowCreationWizard`
- Botón "Player libre" → `/player/live` sin flujo específico

### 9.2. Ciclo de vida

```
Sandbox ←→ Stable ←→ Production
   ↑
   └── Clonar (desde cualquier estado)
```

- **Sandbox:** Flujo en desarrollo. Editable y eliminable libremente.
- **Stable:** Flujo validado. Puede clonarse a sandbox para iterar.
- **Production:** Flujo promovido. Listo para despliegue operativo.

---

## 10. Relación con el Documento Estratégico

### 10.1. Conceptos materializados

| Concepto (§ del doc estratégico) | Materialización en el Player |
|---|---|
| Simulator Shell (§8.5) | `WakaSovereignPlayer` es el shell nativo reutilizable |
| Scenario Editor (§8.6) | `FlowCreationWizard` define escenarios desde múltiples fuentes |
| Separación datos/shell/simulación (§16.1) | `scenario_config` (datos), Player (shell), IA (simulación) |
| AI Journey Generator (§17.3) | `generate-player-flow` genera conversación + config desde briefing |
| Del mockup al pre-runtime (§9.5) | Cada flujo guardado es un pre-runtime con artefactos ejecutables |
| IA transversal (§13.3) | La IA no es un bloque; es el tejido fundamental del Player |
| Promote to Production (§9.3) | Ciclo de vida Sandbox → Stable → Production |
| Compatibilidad sin dependencia (§7.4) | Import JSON TextIt como fuente, pero sin depender de él |
| Journey-first (§16.6) | El Player parte del objetivo de negocio, no de nodos |

### 10.2. Conceptos pendientes de materializar

| Concepto | Estado | Próximo paso |
|---|---|---|
| Blueprint Generator (§9.4) | ❌ | Generar blueprint de integración desde scenario_config |
| Scenario-to-Flow Bridge completo (§9.2) | 🟡 Parcial | Compilar conversation_snapshot a nodos de flow clásico |
| Omnicanalidad (§10) | 🟡 Concepto | Adaptar bloques soberanos a variantes por canal |
| BYOM funcional (§19b.6) | ❌ | Routing de modelos propios del usuario |
| Azure OpenAI (§19b.6) | ❌ | Configuración de claves Azure |
| Previsualización pre-guardado | ❌ | Mostrar mensajes generados antes de persistir |
| `x-waka-xp-footer` (footer persistente) | ⚠️ Spec definida | Implementar en template engine |

### 10.3. Conceptos materializados recientemente (16 marzo 2026)

| Concepto | Materialización |
|---|---|
| Render Guarantee (nuevo) | Motor de plantillas `x-waka-xp-display` que asegura bloques soberanos sin intervención IA |
| WAKA CORE Integration (§7, Fase 7) | 14 herramientas API reales operativas en waka-player-ai |
| displayMap declarativo (nuevo) | Mapeo tool→bloque en scenario_config, parseado desde YAML |
| Template engine (nuevo) | Resolución de rutas + interpolación de campos para generar bloques |
| XP Spatial (nuevo) | Capa de presentación 3D con superficies soberanas |
| Block Variants (§16.1) | Variantes compact/standard/expanded/zero-rated por bloque |
| PlayerContextProvider (§16.1) | Contexto enriquecido con persona, tools, knowledge, policies |
| PlayerMemoryProvider (nuevo) | Memoria de sesión con journey tracking |

---

## 11. Principios de Desarrollo

### 11.1. Para mantener

- **No romper el Player existente** — Toda evolución se construye encima
- **Aislamiento por tenant** — Todo con `tenant_id`, respetando RLS
- **Data Modes** — Los tres modos deben funcionar en todo bloque nuevo
- **Reactive flow loading** — El URL query param `?flow=` es la fuente de verdad

### 11.2. Para nuevos bloques soberanos

1. Crear componente en `src/components/player/sovereign-blocks/`
2. Exportar en `sovereign-blocks/index.ts`
3. Añadir la prop correspondiente a `PlayerMessage`
4. Renderizar en `WakaSovereignPlayer.tsx` dentro del message renderer
5. Añadir la instrucción de uso en el system prompt de `waka-player-ai`
6. Respetar `useDataMode()` para adaptarse al modo de datos

### 11.3. Para nuevas fuentes de entrada en el Wizard

1. Añadir tab en `FlowCreationWizard.tsx`
2. Manejar el parsing/preparación de datos en el frontend
3. Enviar a `generate-player-flow` con el `sourceData` apropiado
4. Actualizar el parsing en la edge function

---

## 12. Archivos Clave (Quick Reference)

| Archivo | LOC | Propósito |
|---|---|---|
| `src/components/player/WakaSovereignPlayer.tsx` | 965 | Shell del simulador |
| `src/pages/WakaPlayerDemo.tsx` | 680 | Página Player live |
| `src/components/player/FlowCreationWizard.tsx` | 492 | Wizard de creación |
| `src/pages/PlayerFlowsPage.tsx` | 404 | Galería de flujos |
| `supabase/functions/waka-player-ai/index.ts` | 993 | Motor IA backend |
| `supabase/functions/generate-player-flow/index.ts` | 295 | Generación de flujos |
| `src/hooks/usePlayerConversation.ts` | 224 | Persistencia |
| `src/hooks/useWakaPlayerAI.ts` | 218 | Hook IA frontend |
| `src/hooks/useSavedPlayerFlows.ts` | 175 | CRUD flujos |
| `src/components/player/dataMode.ts` | 12 | Context de data mode |
| `src/components/player/sovereign-blocks/index.ts` | 15 | Barrel de bloques |

---

*Documento generado el 13 de marzo de 2026 — WAKA XP Player v1.0*
