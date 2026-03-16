# WAKA XP — Informe Completo de Situación
> **Fecha:** 16 de marzo de 2026 (actualizado desde 13 de marzo)  
> **Propósito:** Documento de referencia para que Claude, Codex y cualquier agente de IA puedan entender el estado actual del proyecto, lo que está hecho, lo que falta y las oportunidades de mejora.  
> **Documento estratégico base:** [`docs/waka-xp-strategic-foundation.md`](./waka-xp-strategic-foundation.md)  
> **Documentos relacionados:**
> - [`docs/WAKA_XP_PLAYER_COMPLETE.md`](./WAKA_XP_PLAYER_COMPLETE.md) — Manual técnico del Player
> - [`docs/WAKA_XP_RENDER_GUARANTEE.md`](./WAKA_XP_RENDER_GUARANTEE.md) — Spec `x-waka-xp-display` v1

---

## 1. ¿Qué es WAKA XP?

Plataforma AI-native para **diseñar, simular, validar y operacionalizar journeys conversacionales omnicanal**. Construida para el equipo interno de WAKA y partners especiales. No es un clon de TextIt: es una plataforma que absorbe su valor operativo y lo eleva hacia una categoría superior de diseño de experiencias.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS + shadcn/ui, @xyflow/react, Supabase (Lovable Cloud), Framer Motion, Sucrase (runtime JSX).

---

## 2. Arquitectura por Capas (Resumen)

| Capa | Descripción | Superficie |
|---|---|---|
| **Classic Builder** | Editor de flujos tipo TextIt con 16 tipos de nodos | `/editor` |
| **XP Layer** | Módulos, vistas estructuradas, contexto, entidades | Integrado en Builder |
| **Experience Studio** | Gestión relacional de experiencias de negocio | `/studio` |
| **Demo Builder / Sandbox AI** | Generación de demos JSX con IA conversacional | `/wakaflow` |
| **Production Layer** | Ciclo de vida de candidatos a producción | `/production` |
| **Simulation Engine** | Simulador WhatsApp con modo live | Integrado en Builder |
| **Waka XP Player** | Simulador conversacional IA soberano con bloques nativos | `/player`, `/player/live` |
| **Render Guarantee** | Motor de plantillas `x-waka-xp-display` para UI rica automática | Integrado en Player |
| **WAKA CORE Integration** | 14 herramientas API backend reales (BNPL, fibre, MoMo, etc.) | Edge functions |
| **XP Spatial** | Capa de presentación espacial 3D con superficies soberanas | `/spatial` |
| **Runtime / Runs** | Ejecución de backend con trazabilidad de pasos | `/runs` |
| **Governance** | Multi-tenant, roles, RLS, versionado transversal | Transversal |

---

## 3. Estado por Fase del Roadmap Estratégico (§20)

### Fase 1 — Builder + Compatibilidad Heredada → ✅ COMPLETA (~95%)

| Capacidad | Estado |
|---|---|
| 16 tipos de nodos registrados | ✅ |
| Import/Export JSON v13 TextIt | ✅ |
| Validación de flujos (errores + warnings) | ✅ |
| Traducción automática 17 idiomas | ✅ |
| Simulador WhatsApp con modo live y webhooks reales | ✅ |
| Auto-save con debounce 2s | ✅ |
| Variables globales clave-valor | ✅ |
| Webhook logs con detalle request/response | ✅ |
| Flow dashboard con listado, búsqueda, estados | ✅ |
| Enrutamiento multi-salida real (splits: expression, contact field, result, random, group) | ✅ |
| Gestión de grupos (add/remove) | ✅ |
| Subflujos (enter_flow) | ✅ |
| Autocompletado de expresiones @ | ✅ |
| Reintentos de webhook con backoff | ✅ |
| Nodo Start pinnable con persistencia | ✅ |
| Vista inicial inteligente (centrado en entry node) | ✅ |
| **Gap:** Resolución de contexto cross-flow | ⚠️ Parcial |

### Fase 1b — Waka XP Player (Simulador Conversacional IA Soberano) → ✅ COMPLETA (~98%)

| Capacidad | Estado |
|---|---|
| Simulador conversacional IA con modelo soberano (Gemini via Lovable AI) | ✅ |
| Bloques soberanos nativos: ProductCatalog, PaymentCard, CreditSimulation, RatingWidget, LocationCard, etc. (16+ tipos) | ✅ |
| Tres modalidades de datos: Libre, Subventionné, Zero-Rated | ✅ |
| Persistencia de conversaciones en DB (player_conversations + player_messages) | ✅ |
| Flujos guardados con ciclo de vida: Stable → Sandbox → Production (player_saved_flows) | ✅ |
| Galería de flujos guardados con filtros por estado, búsqueda y acciones CRUD | ✅ |
| Wizard de creación multi-fuente: Texto libre + IA, JSON TextIt/RapidPro, YAML de agente, Imágenes/logos | ✅ |
| Selector de motor IA: WAKA AI (default), Azure OpenAI (coming soon), BYOM (demo) | ✅ |
| Edge function `generate-player-flow` para generación IA con merge mode iterativo | ✅ |
| Edge function `waka-player-ai` para respuestas conversacionales en tiempo real | ✅ |
| Panel lateral de flujos guardados con highlight del flujo activo | ✅ |
| Carga reactiva de flujos por URL query param (?flow=ID) con aislamiento estricto | ✅ |
| Clonación de flujos (Stable → Sandbox) | ✅ |
| Renombrado, cambio de estado y eliminación de flujos | ✅ |
| Indicador visual del flujo activo en header del Player | ✅ |
| **PlayerWorkbench**: Panel de iteración IA con instrucciones, uploads y motor seleccionable | ✅ |
| **WAKA VOICE**: Iframe real de waka.services integrado dentro del simulador de teléfono | ✅ |
| **Avatar**: Iframe configurable de avatar integrado dentro del simulador de teléfono | ✅ |
| **Merge automático con IA**: Instrucciones + assets se combinan con el flujo existente | ✅ |
| **Persistencia de instrucciones**: systemPrompt guardado en scenario_config | ✅ |
| **PlayerContextProvider**: Contexto enriquecido con persona, tools, knowledge, policies | ✅ |
| **PlayerMemoryProvider**: Memoria de sesión con journey tracking y perfil de usuario | ✅ |
| **Block Variants**: Variantes compact/standard/expanded/zero-rated por bloque soberano | ✅ |
| **Gap:** Integración real con Azure OpenAI | ❌ Pendiente de claves |
| **Gap:** BYOM funcional (requiere configuración de usuario) | ❌ Pendiente |

### Fase 1c — Render Guarantee & CORE Integration → ✅ COMPLETA (100%) — NUEVO

| Capacidad | Estado |
|---|---|
| **`x-waka-xp-display` spec v1**: 15 tipos de bloque con template engine | ✅ |
| **displayMap**: Mapeo tool→spec guardado en scenario_config | ✅ |
| **Template engine**: Resolución de rutas + interpolación de campos `{field}` | ✅ |
| **Render Guarantee**: Bloques soberanos generados automáticamente sin intervención IA | ✅ |
| **14 herramientas WAKA CORE API**: BNPL, fibre, MoMo, crédito, pagos, KYC | ✅ |
| **Resolución jerárquica de API key**: secretValues → endpoints → env | ✅ |
| **Sanitización de claves**: Eliminación de caracteres invisibles, validación `waka_*` | ✅ |
| **YAML parsing**: `generate-player-flow` parsea `x-waka-xp-display` del YAML | ✅ |
| **Catálogo BNPL con imágenes reales**: Samsung A05, A15, ZTE A34, A75 | ✅ |
| **ProductCatalog con vista de detalle**: Specs técnicas, imagen, precio, badge | ✅ |
| **Prioridad IA > displayMap > heurística**: Cadena de fallback garantizada | ✅ |
| **Zero-rated sin media**: Bloques auto-generados respetan política de datos | ✅ |
| **Gap:** `x-waka-xp-footer` (footer persistente) | ⚠️ Spec definida, no implementada |

### Fase 1d — XP Spatial Layer → 🟡 EN CURSO (~60%) — NUEVO

| Capacidad | Estado |
|---|---|
| **SpatialRoot**: Escena 3D con R3F + Drei | ✅ |
| **PhoneHub**: Teléfono 3D con poses animadas (idle, catalog_retreat, payment_pulse, etc.) | ✅ |
| **FrontStage**: Contenedor de superficies soberanas | ✅ |
| **PeripheralHUD**: HUD informativo en el espacio 3D | ✅ |
| **spatialPresentationAdapter**: Intent resolution + surface routing | ✅ |
| **5 superficies**: CatalogGrid, KYCScanner, Receipt, FloatingPanel, Confirmation | ✅ |
| **Tipos espaciales**: RuntimeIntent, PhonePose, SpatialSurfaceType, SpatialBlockType | ✅ |
| **Gap:** Superficie de formularios (form_surface) | ⚠️ Tipo definido, no implementada |
| **Gap:** Superficie de media (media_surface) | ⚠️ Tipo definido, no implementada |

### Fase 2 — Experience Studio → 🟡 EN CURSO (~70%)

| Capacidad | Estado |
|---|---|
| CRUD de experiencias (nombre, descripción, tags, environment) | ✅ |
| Vinculación/desvinculación de flujos a experiencias | ✅ |
| Pestañas: Demos, Flows, Version History | ✅ |
| Promote to Production desde Studio | ✅ |
| Demo Builder con generación IA (Gemini Flash) | ✅ |
| Iteración conversacional con historial | ✅ |
| Upload JSX externo como punto de partida | ✅ |
| Attach Image para referencia visual | ✅ |
| AI Engine Selector (WAKA AI activo) | ✅ |
| **Gap:** Simulator Shell nativo reutilizable | ❌ No iniciado |
| **Gap:** Scenario Editor estructurado | ❌ No iniciado |
| **Gap:** Edición sin código de demos (WYSIWYG) | ❌ No iniciado |
| **Gap:** Branding por tenant en demos | ❌ No iniciado |

### Fase 3 — Blueprint Layer → 🟡 PARCIAL (~35%)

| Capacidad | Estado |
|---|---|
| WakaFlow Mapper (modelo → TextIt JSON) | ✅ |
| Promote to Production (acción) | ✅ |
| **Gap:** Blueprint Generator (intenciones de integración) | ❌ |
| **Gap:** Contratos de datos | ❌ |
| **Gap:** Readiness checker para producción | ❌ |
| **Gap:** Modos fake/mock/live para integraciones | ❌ |
| **Gap:** Scenario-to-Flow Bridge completo | ❌ |

### Fase 4 — Structure & Context Layer → 🟡 PARCIAL (~45%)

| Capacidad | Estado |
|---|---|
| Módulos colapsables (ModuleGroupNode) | ✅ |
| Structured View (vista jerárquica) | ✅ |
| Flow Context Panel (variables + entidades) | ✅ |
| Node Effects Editor (side-effects) | ✅ |
| **Gap:** Context Board (superficie visual de entidades) | ❌ |
| **Gap:** Experience Trees (árboles de experiencia) | ❌ |
| **Gap:** Contexto compartido cross-flow | ❌ |
| **Gap:** Copy/paste semántico | ❌ |
| **Gap:** Vistas alternativas (Path, Exception, Data Flow, Forest) | ❌ |

### Fase 5 — Omnichannel & Modality Layer → 🔜 NO INICIADA (0%)

| Capacidad | Estado |
|---|---|
| Journey central con variantes por canal | ❌ |
| Variantes por modalidad (guiado/híbrido/conversacional) | ❌ |
| Comparación entre experiencias multicanal | ❌ |
| Configuración de agentes voz/escritos/avatar | ❌ |

### Fase 6 — Production Promotion → 🟡 PARCIAL (~55%)

| Capacidad | Estado |
|---|---|
| Estados: Candidate → Validated → Live → Archived | ✅ |
| Promote inteligente (auto-link flow) | ✅ |
| Versionado transversal (4 tipos de activo) | ✅ |
| Tabla flow_runs con estados (waiting, active, completed, expired, errored) | ✅ |
| Tabla flow_run_steps con trazas de ejecución | ✅ |
| Vista de Runs con filtrado por canal y timeline | ✅ |
| **run-flow Edge Function**: Node Walker resiliente con pausa/reanudación | ✅ |
| **Gap:** Binding con conectores reales en producción | ❌ |
| **Gap:** Observabilidad avanzada (métricas, alertas) | ❌ |

### Fase 7 — Integración profunda WAKA → 🟡 EN CURSO (~40%) — ACTUALIZADO

| Capacidad | Estado |
|---|---|
| **WAKA CORE API operativa** (14 herramientas via edge function) | ✅ |
| **waka-core-api**: Punto de entrada único multi-tenant con x-api-key | ✅ |
| Integración con WAKA VOICE (iframe en Player) | ✅ |
| Integración con Avatar (iframe en Player) | ✅ |
| Home muestra WAKA Stack Status (mock) | ✅ (visual, no funcional) |
| **Gap:** WAKA NEXUS / AXIOM / CRM conectores operativos | ❌ |

---

## 4. Infraestructura y Gobernanza

### Base de datos (21 tablas activas en Supabase)

| Tabla | Uso |
|---|---|
| `tenants` | Entidades multi-tenant con branding |
| `workspaces` | Espacios de trabajo por tenant |
| `profiles` | Perfiles de usuario con tenant_id |
| `user_roles` | Roles (admin, editor, viewer) — tabla separada |
| `flows` | Flujos con nodos, edges, status |
| `flow_versions` | Snapshots de versiones de flujos |
| `flow_runs` | Ejecuciones de backend |
| `flow_run_steps` | Trazas de pasos por ejecución |
| `experiences` | Experiencias de negocio |
| `experience_entities` | Entidades de contexto por experiencia |
| `experience_context_values` | Valores de contexto por entidad y run |
| `production_candidates` | Candidatos a producción |
| `asset_versions` | Versionado transversal (4 tipos) |
| `globals` | Variables globales clave-valor |
| `channel_connections` | Conexiones de canales con health check |
| `webhook_logs` | Logs de webhooks |
| `uploaded_demos` | Demos generadas/subidas |
| `player_conversations` | Conversaciones del Player IA |
| `player_messages` | Mensajes individuales del Player IA |
| `player_saved_flows` | Flujos conversacionales guardados del Player (incluye `scenario_config.displayMap`) |
| `demo_shares` / `demo_share_views` | Compartición pública de demos |
| `whatsapp_messages` | Mensajes WhatsApp reales |
| `whatsapp_templates` | Plantillas HSM |
| `telegram_messages` | Mensajes Telegram |

### Edge Functions (Backend)

| Función | Estado | Descripción |
|---|---|---|
| `waka-player-ai` | ✅ Operativa | Motor IA + Render Guarantee + 14 tools CORE (~1423 líneas) |
| `generate-player-flow` | ✅ Operativa | Generación de flujos + YAML parser + displayMap |
| `waka-ai-apply` | ✅ Operativa | Genera/reescribe JSX con Gemini |
| `waka-ai-proposal` | ✅ Operativa | Propuestas IA |
| `run-flow` | ✅ Operativa | Node Walker para ejecución backend |
| `whatsapp-send` | ✅ Operativa | Envío 360dialog |
| `whatsapp-webhook` | ✅ Operativa | Recepción inbound |
| `telegram-send` | ✅ Operativa | Envío Telegram |
| `telegram-setup` | ✅ Operativa | Configuración bot |
| `telegram-webhook` | ✅ Operativa | Recepción inbound |
| `connection-health-check` | ✅ Operativa | Health check canales |

### Canales configurados

| Canal | Estado |
|---|---|
| 360dialog (WhatsApp) | ✅ Connected (auto-seed) |
| Telegram Bot | ✅ Configurable |
| Azure Communication Services | ✅ Configurable |
| Vonage SMS | ✅ Configurable |
| Mailgun Email | ✅ Configurable |
| WAKA VOICE | ✅ Iframe integrado en Player |
| Avatar | ✅ Iframe integrado en Player |

### Seguridad

| Aspecto | Estado |
|---|---|
| RLS en tablas principales | ✅ Existe |
| Auth obligatoria | ⚠️ Login existe pero usa DEMO_TENANT_ID como fallback |
| Roles por tabla separada | ✅ |
| Función `has_role()` security definer | ✅ |
| Función `get_user_tenant_id()` | ✅ |
| Sanitización de API keys (caracteres invisibles) | ✅ |

---

## 5. Navegación Completa (30+ rutas protegidas + 4 públicas)

**Principal:** Home, Journeys, Experience Studio, Demo Builder, Builder, Simulator, Production, Runs  
**Player:** Player Gallery (`/player`), Player Live (`/player/live`), Player Live con flujo (`/player/live?flow={id}`)  
**Spatial:** XP Spatial (`/spatial`)  
**Assets:** Library, Demos, Demo Viewer, Templates, Imports  
**Infrastructure:** Integrations, WhatsApp Test, Tenants, Settings  
**Advanced:** Flow Dashboard, Archived, Globals, Starts, Webhooks, Export, Validate  
**Públicas:** /share/:id, /shared/:token, /login, /public-player

---

## 6. Los 5 Componentes de Mayor Leverage (§17.3 del doc estratégico)

| Componente | Estado actual | Qué existe hoy | Qué falta |
|---|---|---|---|
| **Simulator Shell** | ✅ Operativo | Waka XP Player como shell soberano con bloques nativos + Render Guarantee | Variantes multi-canal del mismo shell |
| **Scenario Editor** | 🟡 Parcial | FlowCreationWizard con multi-fuente + displayMap en scenario_config | Editor visual WYSIWYG de escenarios |
| **AI Journey Generator** | ✅ Operativo | Player genera conversation_snapshot + scenario_config + displayMap desde briefing/YAML | Refinamiento iterativo post-generación |
| **Scenario-to-Flow Bridge** | 🟡 Parcial | WakaFlow Mapper + Player saved flows con promote to production | Compilación real de escenarios a nodos ejecutables |
| **Blueprint Generator** | ❌ No iniciado | — | Generación de intenciones de integración, contratos, readiness |

---

## 7. Cambios Recientes (13 → 16 marzo 2026)

### ✅ Implementado

| Fecha | Cambio | Impacto |
|---|---|---|
| 14 mar | **PlayerContextProvider** con persona, tools, knowledge, policies | Contexto enriquecido para IA |
| 14 mar | **PlayerMemoryProvider** con journey tracking y perfil de usuario | Memoria de sesión persistente |
| 14 mar | **Block Variants** (compact/standard/expanded/zero-rated) | Adaptación visual por runtime |
| 15 mar | **14 herramientas WAKA CORE API** integradas en waka-player-ai | Operaciones backend reales |
| 15 mar | **Resolución jerárquica de API key** con sanitización | Conexión fiable a CORE |
| 15 mar | **ProductCatalog con vista de detalle** (specs, imagen, precio) | UX de catálogo profesional |
| 16 mar | **`x-waka-xp-display` spec v1** — 15 tipos de bloque | Renderizado declarativo |
| 16 mar | **Template engine** con resolución de rutas e interpolación | Motor de plantillas puro |
| 16 mar | **Render Guarantee** — bloques soberanos sin intervención IA | UI rica garantizada |
| 16 mar | **displayMap** en scenario_config (8 endpoints configurados) | Mapeo tool→bloque |
| 16 mar | **XP Spatial layer** — escena 3D, PhoneHub, 5 superficies | Presentación espacial |
| 16 mar | **Catálogo BNPL validado** con imágenes reales desde CORE | E2E verificado |

### 📝 Documentación añadida

| Documento | Contenido |
|---|---|
| `docs/WAKA_XP_RENDER_GUARANTEE.md` | Spec completa `x-waka-xp-display` v1 con ejemplos |
| `docs/WAKA_XP_STATUS_REPORT_2026-03-13.md` | Actualizado a 16 de marzo |

---

## 8. Gaps Críticos Priorizados (Actualizado)

### 🔴 Alta prioridad

1. **Context Board** — Superficie visual para gestionar contexto compartido entre flujos/experiencias.
2. **Auth enforcement real** — Eliminar `DEMO_TENANT_ID` como fallback.
3. **`x-waka-xp-footer`** — Footer persistente definido en spec pero no implementado.

### 🟡 Media prioridad

4. **Simulator Shell reutilizable** — Componente independiente multi-canal.
5. **Scenario-to-Flow Bridge completo** — Compilación de demos/escenarios a flujos ejecutables.
6. **XP Spatial superficies faltantes** — form_surface, media_surface.
7. **Blueprint Generator** — Generar contratos de integración desde scenario_config.

### 🟢 Baja prioridad

8. **Experience Trees & Forests** — Modelo conceptual potente pero no urgente.
9. **Copy/paste semántico** — Productividad avanzada.
10. **Vistas alternativas** (Path, Exception, Data Flow) — Valor analítico.
11. **Omnicanalidad real** — Esperar a que el runtime esté completo.

---

## 9. Resumen Ejecutivo para Agentes IA

### Lo que ya funciona bien (usar como base, no romper):
- Classic Builder con 16 tipos de nodos y simulador WhatsApp
- Auto-save, versionado, import/export JSON v13
- Experience Studio con CRUD y vinculación de activos
- Demo Builder con generación IA conversacional
- **Waka XP Player** — Simulador conversacional IA soberano con 16+ bloques nativos, Render Guarantee, 14 herramientas CORE API, galería de flujos, wizard multi-fuente
- **Render Guarantee** — Motor de plantillas `x-waka-xp-display` que garantiza UI rica automática desde respuestas de CORE
- **WAKA CORE Integration** — 14 herramientas API reales operativas con resolución jerárquica de API key
- **XP Spatial** — Capa de presentación 3D con superficies soberanas
- Production Layer con ciclo de vida de candidatos
- Multi-tenancy con RLS, roles, workspaces
- Run-flow engine con Node Walker y trazabilidad

### Lo que se debe construir siguiente (por impacto):
1. **Context Board** — Superficie visual de entidades compartidas
2. **Auth hardening** — Eliminar DEMO_TENANT_ID fallback
3. **`x-waka-xp-footer`** — Footer persistente
4. **Simulator Shell nativo** — Componente independiente multi-canal
5. **AI Flow Generator** — De briefing a flow completo

### Principios de desarrollo obligatorios:
- **No romper lo existente** — Toda nueva capa se construye encima
- **Multi-tenant desde el diseño** — Todo con `tenant_id`
- **IA transversal** — No como bloque aislado sino como capacidad del sistema
- **Render Guarantee** — Usar `x-waka-xp-display` para todo endpoint con UI
- **Versionado de todo** — Usar `asset_versions` para cualquier activo nuevo
- **Semantic tokens** — Usar design tokens HSL, no colores hardcodeados

---

## 10. Archivos Clave para Contexto

| Archivo | Propósito |
|---|---|
| `docs/waka-xp-strategic-foundation.md` | Documento base estratégico completo (1251 líneas) |
| `docs/WAKA_XP_PLAYER_COMPLETE.md` | Manual técnico del Player (664 líneas) |
| `docs/WAKA_XP_RENDER_GUARANTEE.md` | Spec `x-waka-xp-display` v1 (nuevo) |
| `docs/openapi-waka-africa-agent.yaml` | YAML de referencia WAKA CORE con `x-waka-xp-display` |
| `README.md` | Documentación técnica general |
| `src/components/player/WakaSovereignPlayer.tsx` | Shell del simulador |
| `src/contexts/PlayerContextProvider.tsx` | Contexto enriquecido del Player |
| `src/contexts/PlayerMemoryProvider.tsx` | Memoria de sesión del Player |
| `src/hooks/useWakaPlayerAI.ts` | Hook IA frontend |
| `supabase/functions/waka-player-ai/index.ts` | Motor IA + Render Guarantee (~1423 líneas) |
| `supabase/functions/generate-player-flow/index.ts` | Generación de flujos + YAML parser |
| `src/xp-spatial/` | Capa espacial completa |
| `src/integrations/supabase/types.ts` | Schema de DB (auto-generado, no editar) |

---

*Informe actualizado el 16 de marzo de 2026 — WAKA XP v0.4 (incluye Render Guarantee, CORE Integration, XP Spatial)*
