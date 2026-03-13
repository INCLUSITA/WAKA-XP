# WAKA XP — Experience Platform

> Plataforma AI-native para diseñar, simular, validar y operacionalizar journeys conversacionales omnicanal. Construida para el equipo interno de WAKA y partners especiales.

**Documento estratégico de referencia:** [`docs/waka-xp-strategic-foundation.md`](docs/waka-xp-strategic-foundation.md)

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Navegación y Rutas](#navegación-y-rutas)
5. [Capas del Producto](#capas-del-producto)
   - [Classic Builder](#51-classic-builder)
   - [XP Layer (Estructura, Contexto, Entidades)](#52-xp-layer)
   - [Experience Studio](#53-experience-studio)
   - [Demo Builder / Sandbox AI](#54-demo-builder--sandbox-ai)
   - [Waka XP Player (Simulador IA Soberano)](#55-waka-xp-player)
   - [Production Layer](#56-production-layer)
   - [Simulation Engine](#57-simulation-engine)
6. [Sistema de Persistencia](#sistema-de-persistencia)
7. [Multi-Tenancy y Gobernanza](#multi-tenancy-y-gobernanza)
8. [Versionado Transversal](#versionado-transversal)
9. [Edge Functions (Backend)](#edge-functions-backend)
10. [WakaFlow Mapper](#wakaflow-mapper)
11. [AI Engine Selector](#ai-engine-selector)
12. [Sistema de Demos](#sistema-de-demos)
13. [Sistema de Diseño](#sistema-de-diseño)
14. [Estado del Roadmap Estratégico](#estado-del-roadmap-estratégico)
15. [Instalación y Desarrollo](#instalación-y-desarrollo)

---

## Visión General

**WAKA XP** es la plataforma central del ecosistema WAKA para el diseño, simulación y operacionalización de experiencias conversacionales. Opera bajo dos superficies de trabajo complementarias:

- **Classic Builder** — Capa estable para la edición técnica de flujos, inspirada en TextIt/RapidPro.
- **Experience Studio / XP Layer** — Capa emergente para la gestión de alto nivel de experiencias de negocio.

Esta dualidad asegura la continuidad operativa de los flujos de trabajo actuales mientras el sistema evoluciona.

### Activos principales

El trabajo se organiza en torno a cuatro tipos de activos:

| Activo | Descripción |
|---|---|
| **Experience** | Unidad de negocio de alto nivel (onboarding, cobro, soporte...) |
| **Demo** | Artefacto visual/interactivo para validación y venta |
| **Flow** | Implementación técnica de un journey (nodos, edges, lógica) |
| **Production Candidate** | Activo promovido con ciclo de vida hacia producción |

---

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Bundler y dev server |
| @xyflow/react | Editor visual de flujos (nodos y edges) |
| Tailwind CSS + shadcn/ui | Estilos y componentes UI |
| Framer Motion | Animaciones |
| React Router DOM v6 | Enrutamiento SPA |
| @tanstack/react-query | Data fetching y cache |
| Supabase (Lovable Cloud) | DB, Auth, Edge Functions, Storage |
| Sucrase | Transpilación JSX en runtime (demos) |
| Vitest | Testing |

---

## Arquitectura del Proyecto

```
src/
├── components/
│   ├── flow/                        # Editor de flujos (Classic Builder)
│   │   ├── FlowEditor.tsx           # ★ Componente principal del canvas
│   │   ├── FlowToolbar.tsx          # Barra de herramientas
│   │   ├── NodeConfigPanel.tsx      # Panel lateral de configuración de nodos
│   │   ├── FlowContextPanel.tsx     # Panel de contexto (variables + entidades)
│   │   ├── StructuredView.tsx       # Vista jerárquica de módulos
│   │   ├── ModuleGroupNode.tsx      # Nodo contenedor de módulos
│   │   ├── NodeEffectsEditor.tsx    # Editor de side-effects por nodo
│   │   ├── ValidationPanel.tsx      # Panel de validación
│   │   ├── TranslatorPanel.tsx      # Panel de traducción multi-idioma
│   │   ├── WhatsAppSimulator.tsx    # Simulador WhatsApp integrado
│   │   ├── SaveStatusIndicator.tsx  # Indicador de auto-guardado
│   │   ├── EdgeInfoPanel.tsx        # Panel info de conexiones
│   │   ├── SendMsgNode.tsx          # Nodo: Enviar mensaje
│   │   ├── WaitResponseNode.tsx     # Nodo: Esperar respuesta
│   │   ├── SplitNode.tsx            # Nodo: Divisiones (5 variantes)
│   │   ├── WebhookNode.tsx          # Nodo: Llamar webhook
│   │   ├── CallAINode.tsx           # Nodo: Llamar servicio IA
│   │   ├── SaveResultNode.tsx       # Nodo: Guardar resultado
│   │   ├── UpdateContactNode.tsx    # Nodo: Actualizar contacto
│   │   ├── SendEmailNode.tsx        # Nodo: Enviar email
│   │   ├── EnterFlowNode.tsx        # Nodo: Entrar en otro flujo
│   │   ├── OpenTicketNode.tsx       # Nodo: Abrir ticket
│   │   ├── CallZapierNode.tsx       # Nodo: Llamar Zapier
│   │   └── SendAirtimeNode.tsx      # Nodo: Enviar airtime
│   ├── player/                      # Componentes del Waka XP Player
│   │   ├── WakaSovereignPlayer.tsx  # ★ Componente principal del simulador IA
│   │   ├── FlowCreationWizard.tsx   # Wizard multi-fuente de creación de flujos
│   │   ├── FlowContextSelector.tsx  # Selector de contexto de flujo
│   │   ├── SavedFlowsPanel.tsx      # Panel lateral de flujos guardados
│   │   ├── SaveFlowDialog.tsx       # Diálogo de guardado
│   │   ├── SalamandraSvg.tsx        # Logo animado
│   │   ├── dataMode.ts             # Tipos de modalidad de datos
│   │   └── sovereign-blocks/       # 16+ bloques soberanos nativos
│   │       ├── ProductCatalog.tsx   # Catálogo de productos
│   │       ├── PaymentCard.tsx      # Tarjeta de pago
│   │       ├── CreditSimulationCard.tsx # Simulación de crédito
│   │       ├── RatingWidget.tsx     # Widget de valoración
│   │       ├── LocationCard.tsx     # Tarjeta de ubicación
│   │       ├── MediaCarousel.tsx    # Carrusel multimedia
│   │       ├── InlineForm.tsx       # Formulario inline
│   │       └── ...                  # +9 bloques especializados
│   ├── demos/                       # Componentes del Demo Builder
│   │   ├── AIEngineSelector.tsx     # Selector de motor IA
│   │   ├── AIProposalsPanel.tsx     # Panel de propuestas IA
│   │   ├── BlockPalette.tsx         # Paleta de bloques estructurales
│   │   ├── StructuralEditor.tsx     # Editor de bloques estructurales
│   │   ├── StructuralBlockCard.tsx  # Card de bloque
│   │   ├── StructuralBlocksPreview.tsx # Preview de bloques
│   │   ├── SandboxVersionBar.tsx    # Barra de versiones sandbox
│   │   ├── MediaUploader.tsx        # Subida de archivos/imágenes
│   │   ├── GuidedTourOverlay.tsx    # Tour guiado
│   │   ├── LLMSelector.tsx          # Selector legacy de LLM
│   │   └── DemoContextMenu.tsx      # Menú contextual de demos
│   ├── versioning/
│   │   └── VersionHistoryPanel.tsx  # Panel de historial de versiones
│   ├── whatsapp/
│   │   └── InboundMessages.tsx      # Mensajes entrantes WhatsApp
│   ├── ui/                          # Componentes shadcn/ui (50+)
│   ├── AppLayout.tsx                # Layout principal con sidebar
│   ├── AppSidebar.tsx               # Sidebar de navegación
│   ├── AuthGuard.tsx                # Guardia de autenticación
│   ├── DemoDomainGuard.tsx          # Enrutamiento por dominio para demos
│   ├── WorkspaceContextBar.tsx      # Barra de contexto tenant/workspace
│   ├── ThemeToggle.tsx              # Toggle dark/light mode
│   └── NavLink.tsx                  # Link de navegación activo
├── pages/                           # Páginas/rutas de la aplicación
│   ├── HomePage.tsx                 # Home con WAKA Stack status
│   ├── JourneysPage.tsx             # Gestión de journeys
│   ├── ExperienceStudioPage.tsx     # Experience Studio
│   ├── WakaFlowPreview.tsx          # Demo Builder / Sandbox AI
│   ├── Index.tsx                    # Classic Flow Editor
│   ├── FlowDashboard.tsx            # Dashboard de flujos
│   ├── ProductionPage.tsx           # Production Candidates
│   ├── Demos.tsx                    # Lista de demos
│   ├── DemoViewer.tsx               # Visor de demo individual
│   ├── ShareDemo.tsx                # Compartir demo (ruta pública)
│   ├── LibraryPage.tsx              # Librería de activos
│   ├── TemplatesPage.tsx            # Templates
│   ├── ImportPage.tsx               # Importación de flujos JSON
│   ├── ExportPage.tsx               # Exportación
│   ├── ValidatePage.tsx             # Validación
│   ├── IntegrationsPage.tsx         # Integraciones / conectores
│   ├── WhatsAppTestPage.tsx         # Testing WhatsApp real
│   ├── TenantsPage.tsx              # Gestión de tenants
│   ├── PlayerFlowsPage.tsx          # ★ Galería de flujos del Player
│   ├── WakaPlayerDemo.tsx           # ★ Player Live (simulador IA)
│   ├── GlobalsPage.tsx              # Variables globales
│   ├── WebhookLogs.tsx              # Logs de webhooks
│   ├── SettingsPage.tsx             # Configuración
│   ├── LoginPage.tsx                # Login / registro
│   ├── PhoneSimulator.tsx           # Simulador de teléfono
│   └── ArchivedFlows.tsx            # Flujos archivados
├── hooks/
│   ├── useFlowPersistence.ts        # Auto-save con debounce a DB
│   ├── useFlowModules.ts            # Gestión de módulos/agrupación
│   ├── useFlowSimulation.ts         # Motor de simulación WhatsApp
│   ├── useSavedPlayerFlows.ts       # CRUD de flujos guardados del Player
│   ├── usePlayerConversation.ts     # Gestión de conversaciones del Player
│   ├── useWakaPlayerAI.ts           # Motor IA del Player
│   ├── useAssetVersions.ts          # Versionado transversal
│   ├── useUploadedDemos.ts          # Demos subidas por usuario
│   ├── use-mobile.tsx               # Detección de móvil
│   └── use-toast.ts                 # Hook de toasts
├── contexts/
│   └── WorkspaceContext.tsx         # Contexto global tenant/workspace
├── demos/
│   ├── registry.ts                  # Registro de demos (built-in + uploaded)
│   ├── MoovWakaDemo.tsx             # Demo: Moov Africa BF
│   └── RuntimeJSXRenderer.tsx       # Renderizador JSX en runtime
├── lib/
│   ├── flowExport.ts                # Exportación a TextIt JSON v13
│   ├── flowValidation.ts            # Motor de validación
│   ├── flowTranslator.ts            # Motor de traducción (MyMemory API)
│   ├── wakaflowMapper.ts            # Mapper WakaFlow → TextIt
│   ├── constants.ts                 # Constantes globales
│   └── utils.ts                     # Utilidades
├── types/
│   ├── flow.ts                      # Tipos TextIt/RapidPro
│   └── structuralBlocks.ts          # Tipos de bloques estructurales
├── integrations/supabase/
│   ├── client.ts                    # Cliente Supabase (auto-generado)
│   └── types.ts                     # Tipos de DB (auto-generado)
├── App.tsx                          # Router principal
├── main.tsx                         # Entry point
└── index.css                        # Design tokens y estilos globales

supabase/
├── functions/
│   ├── waka-ai-apply/index.ts       # Generación/rewrite de JSX con IA
│   ├── waka-ai-proposal/index.ts    # Propuestas de cambio IA
│   ├── waka-player-ai/index.ts      # ★ Motor conversacional IA del Player
│   ├── generate-player-flow/index.ts # ★ Generación de flujos desde texto/JSON/YAML/imagen
│   ├── run-flow/index.ts            # Ejecución de flujos en backend
│   ├── whatsapp-send/index.ts       # Envío de mensajes WhatsApp reales
│   └── whatsapp-webhook/index.ts    # Recepción de webhooks WhatsApp
└── config.toml                      # Configuración Supabase (auto-generado)

docs/
├── waka-xp-strategic-foundation.md  # Documento base estratégico
└── source/                          # Documentos fuente originales
```

---

## Navegación y Rutas

### Rutas protegidas (requieren AuthGuard)

| Sección | Ruta | Página | Descripción |
|---|---|---|---|
| **Principal** | `/` | HomePage | Home con WAKA Stack status |
| | `/journeys` | JourneysPage | Gestión de journeys |
| | `/studio` | ExperienceStudioPage | Experience Studio |
| | `/wakaflow` | WakaFlowPreview | Demo Builder / Sandbox AI |
| | `/editor` | Index (FlowEditor) | Classic Flow Editor |
| | `/simulator` | PhoneSimulator | Simulador completo |
| | `/production` | ProductionPage | Production Candidates |
| **Player** | `/player` | PlayerFlowsPage | Galería de flujos del Player |
| | `/player/live` | WakaPlayerDemo | Simulador conversacional IA live |
| **Assets** | `/library` | LibraryPage | Librería de activos |
| | `/demos` | Demos | Lista de demos |
| | `/demo/:id` | DemoViewer | Visor de demo |
| | `/templates` | TemplatesPage | Templates |
| | `/import` | ImportPage | Importación JSON |
| **Infra** | `/integrations` | IntegrationsPage | Conectores |
| | `/whatsapp` | WhatsAppTestPage | Testing WhatsApp real |
| | `/tenants` | TenantsPage | Gestión de tenants |
| | `/settings` | SettingsPage | Configuración |
| **Tools** | `/flows` | FlowDashboard | Dashboard de flujos |
| | `/archived` | ArchivedFlows | Flujos archivados |
| | `/globals` | GlobalsPage | Variables globales |
| | `/webhooks` | WebhookLogs | Logs de webhooks |
| | `/export` | ExportPage | Exportación |
| | `/validate` | ValidatePage | Validación |

### Rutas públicas

| Ruta | Página | Descripción |
|---|---|---|
| `/share/:id` | ShareDemo | Demo compartida públicamente |
| `/login` | LoginPage | Login / registro |

### Enrutamiento por dominio

El componente `DemoDomainGuard` detecta subdominios específicos (ej. `wakaxp.wakacore.com`) y renderiza demos dedicadas omitiendo el shell principal y la autenticación.

---

## Capas del Producto

### 5.1. Classic Builder

Capa estable de edición técnica de flujos, inspirada en TextIt/RapidPro.

**Ruta:** `/editor`

**Componente principal:** `FlowEditor.tsx`

#### 16 tipos de nodos registrados

| Tipo | Componente | Color | Descripción |
|---|---|---|---|
| `sendMsg` | SendMsgNode | 🟢 Verde | Enviar mensaje con quick replies |
| `waitResponse` | WaitResponseNode | 🔵 Azul | Esperar respuesta del usuario |
| `splitExpression` | SplitNode | 🟣 Púrpura | Dividir por expresión |
| `splitContactField` | SplitNode | 🟣 | Dividir por campo de contacto |
| `splitResult` | SplitNode | 🟣 | Dividir por resultado |
| `splitRandom` | SplitNode | 🟣 | Dividir aleatoriamente |
| `splitGroup` | SplitNode | 🟣 | Dividir por grupo |
| `webhook` | WebhookNode | 🟠 Naranja | Llamar webhook HTTP |
| `callAI` | CallAINode | 🟣 Violeta | Llamar servicio IA |
| `saveResult` | SaveResultNode | 🟡 Amarillo | Guardar resultado |
| `updateContact` | UpdateContactNode | 🔵 | Actualizar campo de contacto |
| `sendEmail` | SendEmailNode | 🔴 Rosa | Enviar email |
| `enterFlow` | EnterFlowNode | 🔵 Cyan | Entrar en otro flujo |
| `openTicket` | OpenTicketNode | 🟠 | Abrir ticket de soporte |
| `callZapier` | CallZapierNode | 🟠 | Llamar Zapier |
| `sendAirtime` | SendAirtimeNode | 🟡 | Enviar airtime/saldo |

#### Capacidades del Classic Builder

- ✅ Importación/exportación JSON v13 TextIt
- ✅ Validación de flujos con errores y warnings
- ✅ Traducción automática a 17 idiomas (MyMemory API)
- ✅ Simulador WhatsApp con modo live (webhooks reales)
- ✅ Auto-save con debounce 2s a base de datos
- ✅ Variables globales clave-valor
- ✅ Webhook logs con vista detallada request/response
- ✅ Flow dashboard con listado, búsqueda y estados

### 5.2. XP Layer

Capa de estructura, contexto y entidades que coexiste con el Classic Builder sin romperlo.

#### Módulos (ModuleGroupNode)

- Contenedores visuales colapsables para agrupar nodos semánticamente
- Hook `useFlowModules` para gestión de módulos
- Expand/collapse con animaciones

#### Structure View (StructuredView)

- Vista jerárquica alternativa al canvas
- Auto-focus/pan al canvas al hacer clic en un nodo
- Navegación rápida entre módulos

#### Flow Context Panel (FlowContextPanel)

- Definición centralizada de variables y entidades
- **Variables locales al flujo:** campos simples de contexto de ejecución
- **Entidades estructuradas:** conceptos reutilizables de negocio (Customer, Loan, Payment...)
- Formularios inline diferenciados, iconografía específica y descripciones
- Precursor del futuro Context Board

#### Node Effects Editor (NodeEffectsEditor)

- Side-effects por nodo (acciones secundarias que un nodo puede disparar)

### 5.3. Experience Studio

**Ruta:** `/studio`

Centro relacional de activos donde se gestionan experiencias de negocio.

- ✅ CRUD de experiencias con nombre, descripción, environment, tags
- ✅ Vinculación/desvinculación de flujos reales a una experiencia
- ✅ Contadores actualizados de activos vinculados
- ✅ Pestañas: Demos, Flows, Version History
- ✅ Promote to Production desde el Studio

### 5.4. Demo Builder / Sandbox AI

**Ruta:** `/wakaflow`

Entorno de creación e iteración de demos basado en IA, estilo "Claude-like sandbox".

- ✅ Generación de artefactos JSX mediante lenguaje natural
- ✅ Iteración conversacional (rebuild con historial)
- ✅ Vista dual: Preview (renderizado) + Code (fuente JSX)
- ✅ Historial de versiones con restore
- ✅ Upload JSX externo como punto de partida
- ✅ Attach Image para referencia visual
- ✅ Load Demo existente de la librería
- ✅ AI Engine Selector (WAKA AI activo, Azure/BYOM coming soon)

**Edge Functions:**
- `waka-ai-apply` — Generación/rewrite de JSX con Gemini Flash
- `waka-ai-proposal` — Propuestas de cambio IA

### 5.5. Waka XP Player (Simulador Conversacional IA Soberano)

**Rutas:** `/player` (galería) · `/player/live` (simulador)

Capa troncal del sistema que materializa la visión del **Simulator Shell** y del **AI Journey Generator** descritos en el documento estratégico (§8.5, §17.3). El Player es un simulador conversacional IA nativo que permite diseñar, probar y validar experiencias conversacionales completas sin necesidad de construir un flow clásico.

#### Principio arquitectónico

El Player representa el **primer artefacto verdaderamente journey-first** de Waka XP: en lugar de partir de nodos y conexiones (block-first), parte de una conversación IA que genera la experiencia completa, incluyendo mensajes, bloques soberanos interactivos y configuración de escenario.

#### Bloques Soberanos (16+ tipos nativos)

Componentes UI interactivos que la IA inyecta en la conversación para representar experiencias ricas:

| Bloque | Descripción |
|---|---|
| `ProductCatalog` | Catálogo de productos con selección |
| `PaymentCard` / `PaymentConfirmationCard` | Tarjetas de pago y confirmación |
| `CreditSimulationCard` / `CreditContractCard` | Simulación y contrato de crédito |
| `ServicePlansCard` | Planes de servicio con comparación |
| `MoMoAccountCard` | Estado de cuenta Mobile Money |
| `ClientStatusCard` | Estado del cliente |
| `CertificateCard` | Certificados y documentos |
| `LocationCard` | Ubicación con mapa |
| `MediaCarousel` | Carrusel de imágenes/media |
| `RatingWidget` | Valoración con estrellas |
| `InlineForm` | Formularios inline |
| `TrainingProgress` | Progreso de formación |
| `DeviceLockConsentCard` | Consentimiento de bloqueo de dispositivo |

#### Wizard de Creación Multi-Fuente

El `FlowCreationWizard` permite crear flujos desde múltiples fuentes:

- ✅ **Texto libre + IA** — Descripción en lenguaje natural que la IA convierte en conversación + scenario_config
- ✅ **JSON TextIt/RapidPro** — Importación de flujos existentes con mapeo automático
- ✅ **YAML de agente** — Definición de agente con endpoints, intenciones y personalidad
- ✅ **Imágenes/logos** — Assets visuales que la IA usa para personalizar la experiencia

#### Motor IA (AI Engine Selector)

| Engine | Estado | Descripción |
|---|---|---|
| **WAKA AI** | ✅ Activo | Built-in via Lovable AI (Gemini) — sin configuración |
| **Azure OpenAI** | 🔜 Coming Soon | GPT-4o via Waka's managed Azure deployment |
| **BYOM** | 🔜 Demo | Bring Your Own Model — funcional cuando el usuario configure claves |

#### Ciclo de vida de flujos

- **Sandbox** — Flujo en desarrollo/experimentación
- **Stable** — Flujo validado y protegido
- **Production** — Flujo listo para despliegue

#### Output de la generación IA

Cada flujo generado produce dos artefactos persistidos en `player_saved_flows`:

- `conversation_snapshot` — Array de mensajes (texto + bloques soberanos) que representan la conversación demo
- `scenario_config` — Configuración del escenario (system prompt, endpoints, intents, persona) para que el Player continúe coherentemente en modo live

#### Edge Functions del Player

| Función | Descripción |
|---|---|
| `waka-player-ai` | Respuestas conversacionales IA en tiempo real con bloques soberanos |
| `generate-player-flow` | Generación completa de flujos desde texto/JSON/YAML/imagen |

#### Tablas de persistencia

| Tabla | Descripción |
|---|---|
| `player_conversations` | Sesiones de conversación con metadata (canal, data_mode, tenant) |
| `player_messages` | Mensajes individuales con bloques, modelo IA y latencia |
| `player_saved_flows` | Flujos guardados con conversation_snapshot, scenario_config, ciclo de vida |

### 5.6. Production Layer

**Ruta:** `/production`

Gestión de Production Candidates con ciclo de vida completo.

- ✅ Estados: `Candidate` → `Validated` → `Live` → `Archived`
- ✅ Promote inteligente desde Experience Studio o Builder
- ✅ Vinculación automática de flow si hay uno solo, selección si hay múltiples
- ✅ Trazabilidad completa via versionado transversal

### 5.7. Simulation Engine

**Simulador WhatsApp integrado** en el Classic Builder:

- ✅ Modo Live con ejecución real de webhooks
- ✅ Detección inteligente del punto de inicio (nodos Start, módulos Entry)
- ✅ Banners explicativos sobre la lógica de selección de entrada
- ✅ Burbujas de chat con renderizado de attachments (imágenes, archivos)
- ✅ Motor de depuración: JSON resuelto de webhooks
- ✅ Inyección global de `x-api-key`

**WhatsApp real:**
- Edge function `whatsapp-send` para envío de mensajes
- Edge function `whatsapp-webhook` para recepción de mensajes entrantes

---

## Sistema de Persistencia

- **Auto-save** con debounce de 2 segundos (`useFlowPersistence`)
- **Vinculación** a `tenant_id` para aislamiento de datos
- **Indicador visual** sutil de sincronización (spinner → check → ocultar)
- **DEMO_TENANT_ID** fijo para pruebas antes de autenticación obligatoria

### Tablas principales (Supabase)

| Tabla | Descripción |
|---|---|
| `tenants` | Entidades aisladas (clientes, ambientes WAKA) |
| `workspaces` | Espacios de trabajo dentro de un tenant |
| `profiles` | Perfiles de usuario con tenant_id |
| `user_roles` | Roles (admin, editor, viewer) — tabla separada por seguridad |
| `flows` | Flujos con nodos, edges, status, tenant_id |
| `flow_versions` | Versiones de flujos (snapshots de nodos/edges) |
| `experiences` | Experiencias de negocio |
| `production_candidates` | Candidatos a producción con ciclo de estados |
| `asset_versions` | Versionado transversal (4 tipos de activo) |
| `globals` | Variables globales clave-valor por tenant |
| `webhook_logs` | Logs de webhooks con payload y response |
| `uploaded_demos` | Demos subidas/generadas por usuarios |
| `player_conversations` | Sesiones de conversación del Player IA |
| `player_messages` | Mensajes del Player con bloques y metadata IA |
| `player_saved_flows` | Flujos conversacionales guardados del Player |
| `whatsapp_messages` | Mensajes WhatsApp reales (inbound/outbound) |

---

## Multi-Tenancy y Gobernanza

### Jerarquía

```
Tenant → Workspace → Environment (Draft / Sandbox / Production)
```

### Aislamiento

- `tenant_id` como clave en todas las tablas de datos
- RLS (Row Level Security) en Supabase
- Función `get_user_tenant_id()` para resolver tenant del usuario

### Gestión de Tenants (`/tenants`)

- Branding: colores, logo, display name
- Localización: país, timezone
- Canales habilitados
- Simulador de roles integrado (Superadmin, Admin, Viewer)

### Workspace Context Bar

- Selector de tenant y workspace activo
- Contexto visible en toda la aplicación

---

## Versionado Transversal

**Hook:** `useAssetVersions`

Sistema unificado de versionado aplicable a los 4 tipos de activo:

| Tipo | Enum |
|---|---|
| Experience | `experience` |
| Demo | `demo` |
| Flow | `flow` |
| Production Candidate | `production_candidate` |

### Capacidades

- ✅ Snapshots completos (`snapshot_data` JSON)
- ✅ Historial visible con nombre y nota editable
- ✅ Restore a versión anterior
- ✅ Función `set_current_version()` para marcar versión activa
- ✅ Función `next_asset_version_number()` para autoincremento
- ✅ Environments: Draft → Sandbox → Production
- ✅ Estados: Draft → Validated → Candidate → Live → Archived

---

## Edge Functions (Backend)

| Función | Descripción |
|---|---|
| `waka-ai-apply` | Genera/reescribe JSX de demos usando Lovable AI (Gemini Flash) |
| `waka-ai-proposal` | Genera propuestas de cambio IA para artefactos |
| `waka-player-ai` | Motor conversacional IA del Player con bloques soberanos |
| `generate-player-flow` | Generación de flujos Player desde texto/JSON/YAML/imagen |
| `run-flow` | Ejecución de flujos en backend |
| `whatsapp-send` | Envía mensajes WhatsApp reales via API |
| `whatsapp-webhook` | Recibe y almacena mensajes entrantes de WhatsApp |
| `telegram-send` | Envío de mensajes Telegram |
| `telegram-setup` | Configuración de bot Telegram |
| `telegram-webhook` | Recepción de webhooks Telegram |
| `connection-health-check` | Health check de conexiones de canales |

---

## WakaFlow Mapper

**Archivo:** `src/lib/wakaflowMapper.ts`

Puente técnico entre el diseño de alto nivel y la implementación TextIt.

- Convierte `WakaFlowModel` a JSON compatible con TextIt
- Identifica bloques no soportados y genera warnings
- Vista de previsualización: comparación **Flow-first** (legacy) vs **Model-first** (WakaFlow)
- Transición guiada hacia la nueva arquitectura

---

## AI Engine Selector

**Componente:** `AIEngineSelector.tsx`

Selector de motor IA para el Demo Builder:

| Engine | Estado | Descripción |
|---|---|---|
| **WAKA AI** | ✅ Active | Built-in AI via Lovable Cloud (Gemini Flash) |
| **Azure OpenAI** | 🔜 Coming Soon | GPT-4o via Waka's managed Azure deployment |
| **BYOM** | 🔜 Planned | Bring Your Own Model, routed via Waka Azure layer |

- Default seguro: WAKA AI siempre funciona sin configuración
- Dropdown premium con Radix Popover

---

## Sistema de Demos

### Registry (`demos/registry.ts`)

- **Built-in demos:** Componentes pre-compilados (ej. Moov Africa BF)
- **Uploaded demos:** Almacenadas en DB (`uploaded_demos`)
- Sistema de estados: `Stable` (protegidas), `Sandbox` (editables), `Approved`

### Runtime JSX Renderer

- Transpilación JSX en runtime usando Sucrase
- `sourceId` para resolver componentes built-in originales
- Error boundary con fallback visual

### Compartir demos

- Ruta pública `/share/:id` para compartir demos sin autenticación

---

## Sistema de Diseño

### Design Tokens (HSL en `index.css`)

```css
:root {
  --background, --foreground, --card, --primary, --accent, --destructive
  --node-send (verde), --node-wait (azul), --node-split (púrpura), --node-webhook (naranja)
  --canvas-bg, --sidebar-*
}
```

- Dark mode completo via `.dark` class
- Clases Tailwind semánticas: `bg-node-send`, `text-node-wait`, etc.
- Componentes shadcn/ui personalizados con variantes

---

## Estado del Roadmap Estratégico

Referencia: `docs/waka-xp-strategic-foundation.md`, secciones §17 y §20.

| Fase | Descripción | Estado | Progreso |
|---|---|---|---|
| **Fase 1** | Builder + compatibilidad heredada | ✅ Completa | 100% |
| **Fase 2** | Experience Studio | 🟡 En curso | ~70% |
| **Fase 3** | Blueprint Layer | 🟡 Parcial | ~40% |
| **Fase 4** | Structure & Context Layer | 🟡 Parcial | ~50% |
| **Fase 5** | Omnichannel & Modality Layer | 🔜 No iniciada | 0% |
| **Fase 6** | Production Promotion | 🟡 Parcial | ~60% |
| **Fase 7** | Integración profunda WAKA | 🔜 No iniciada | 0% |

### Detalle de componentes estratégicos

| Componente (§17.3) | Estado |
|---|---|
| Simulator Shell | 🟡 Parcial — WhatsApp Simulator funcional, falta shell nativo reutilizable |
| Scenario Editor | 🔜 No iniciado — Demo Builder es el precursor |
| AI Journey Generator | 🟡 Parcial — Demo Builder genera con IA, falta generación de flows |
| Scenario-to-Flow Bridge | 🔜 Diseñado — WakaFlow Mapper es el primer paso |
| Blueprint Generator | 🔜 No iniciado |

### Conceptos estratégicos pendientes

| Concepto (§19) | Estado |
|---|---|
| Experience Trees | 🔜 Conceptual — sin implementación |
| Experience Forests | 🔜 Conceptual |
| Context Board | 🔜 Conceptual — Flow Context Panel es el precursor |
| Contexto cross-flow | 🔜 Diseñado — entidades por flujo, sin resolución compartida |
| Vistas alternativas (Path, Exception, Data Flow) | 🔜 No iniciadas |
| Copy/paste semántico | 🔜 No iniciado |

### Gaps operativos conocidos

| Área | Estado |
|---|---|
| Autenticación obligatoria | ⚠️ Login existe pero no es enforced — se usa DEMO_TENANT_ID |
| RLS por tenant real | ⚠️ Políticas existen pero dependen de auth activa |
| Azure OpenAI engine | 🔜 Planned — routing pendiente |
| BYOM engine | 🔜 Planned — sin path propio |

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

### Variables de entorno (auto-configuradas por Lovable Cloud)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Home: WAKA Stack Status

La página principal (`/`) incluye una sección **Connected WAKA Stack** con visibilidad del estado de integración:

| Módulo | Estados posibles |
|---|---|
| WAKA NEXUS | Connected / Simulated / Inactive |
| WAKA AXIOM | Connected / Simulated / Inactive |
| WAKA VOICE | Connected / Simulated / Inactive |
| WAKA CORE | Connected / Simulated / Inactive |
| WAKA CRM | Connected / Simulated / Inactive |

---

*Documentación actualizada el 10 de marzo de 2026 — WAKA XP v0.2*
