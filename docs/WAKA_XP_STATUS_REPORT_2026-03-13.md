# WAKA XP — Informe Completo de Situación
> **Fecha:** 13 de marzo de 2026  
> **Propósito:** Documento de referencia para que Claude, Codex y cualquier agente de IA puedan entender el estado actual del proyecto, lo que está hecho, lo que falta y las oportunidades de mejora.  
> **Documento estratégico base:** [`docs/waka-xp-strategic-foundation.md`](./waka-xp-strategic-foundation.md)

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
| **Gap:** Runtime de ejecución completo en backend | ❌ |
| **Gap:** Binding con conectores reales en producción | ❌ |
| **Gap:** Observabilidad avanzada (métricas, alertas) | ❌ |

### Fase 7 — Integración profunda WAKA → 🔜 NO INICIADA (0%)

| Capacidad | Estado |
|---|---|
| Integración con WAKA NEXUS, AXIOM, VOICE, CORE, CRM | ❌ |
| Home muestra WAKA Stack Status (mock) | ✅ (visual, no funcional) |

---

## 4. Infraestructura y Gobernanza

### Base de datos (18 tablas activas en Supabase)

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
| `production_candidates` | Candidatos a producción |
| `asset_versions` | Versionado transversal (4 tipos) |
| `globals` | Variables globales clave-valor |
| `channel_connections` | Conexiones de canales con health check |
| `webhook_logs` | Logs de webhooks |
| `uploaded_demos` | Demos generadas/subidas |
| `demo_shares` / `demo_share_views` | Compartición pública de demos |
| `whatsapp_messages` | Mensajes WhatsApp reales |
| `whatsapp_templates` | Plantillas HSM |
| `telegram_messages` | Mensajes Telegram |

### Edge Functions (Backend)

| Función | Estado |
|---|---|
| `waka-ai-apply` | ✅ Operativa — genera/reescribe JSX con Gemini |
| `waka-ai-proposal` | ✅ Operativa — propuestas IA |
| `whatsapp-send` | ✅ Operativa — envío 360dialog |
| `whatsapp-webhook` | ✅ Operativa — recepción inbound |
| `telegram-send` | ✅ Operativa |
| `telegram-setup` | ✅ Operativa |
| `telegram-webhook` | ✅ Operativa |
| `connection-health-check` | ✅ Operativa |

### Canales configurados

| Canal | Estado |
|---|---|
| 360dialog (WhatsApp) | ✅ Connected (auto-seed) |
| Telegram Bot | ✅ Configurable |
| Azure Communication Services | ✅ Configurable |
| Vonage SMS | ✅ Configurable |
| Mailgun Email | ✅ Configurable |

### Seguridad

| Aspecto | Estado |
|---|---|
| RLS en tablas principales | ✅ Existe |
| Auth obligatoria | ⚠️ Login existe pero usa DEMO_TENANT_ID como fallback |
| Roles por tabla separada | ✅ |
| Función `has_role()` security definer | ✅ |
| Función `get_user_tenant_id()` | ✅ |

---

## 5. Navegación Completa (26 rutas protegidas + 3 públicas)

**Principal:** Home, Journeys, Experience Studio, Demo Builder, Builder, Simulator, Production, Runs  
**Assets:** Library, Demos, Demo Viewer, Templates, Imports  
**Infrastructure:** Integrations, WhatsApp Test, Tenants, Settings  
**Advanced:** Flow Dashboard, Archived, Globals, Starts, Webhooks, Export, Validate  
**Públicas:** /share/:id, /shared/:token, /login

---

## 6. Los 5 Componentes de Mayor Leverage (§17.3 del doc estratégico)

| Componente | Estado actual | Qué existe hoy | Qué falta |
|---|---|---|---|
| **Simulator Shell** | 🟡 Parcial | WhatsApp Simulator funcional en Builder | Shell nativo reutilizable multi-canal |
| **Scenario Editor** | ❌ No iniciado | Demo Builder es precursor | Editor estructurado de escenarios con datos/shell/lógica separados |
| **AI Journey Generator** | 🟡 Parcial | Demo Builder genera JSX con IA | Generación de flows completos desde briefing |
| **Scenario-to-Flow Bridge** | 🟡 Parcial | WakaFlow Mapper existe | Compilación real de escenarios a nodos ejecutables |
| **Blueprint Generator** | ❌ No iniciado | — | Generación de intenciones de integración, contratos, readiness |

---

## 7. Gaps Críticos Priorizados

### 🔴 Alta prioridad (bloquean el valor diferencial)

1. **Runtime de ejecución en backend** — Las tablas `flow_runs` y `flow_run_steps` existen, la UI de Runs existe, pero no hay un engine que realmente ejecute flujos en backend. Esto es el "Carril C" estratégico.

2. **Context Board** — El Flow Context Panel define variables y entidades por flujo, pero no hay una superficie visual para gestionar contexto compartido entre flujos/experiencias. Es el salto de "flow-first" a "journey-first".

3. **Auth enforcement real** — El sistema usa `DEMO_TENANT_ID` como fallback. En producción multi-tenant real, esto debe eliminarse.

### 🟡 Media prioridad (aceleran el producto)

4. **Simulator Shell reutilizable** — Hoy el simulador está acoplado al Builder. Debería ser un componente independiente que renderice experiencias en cualquier canal.

5. **Scenario-to-Flow Bridge completo** — El WakaFlow Mapper es un primer paso, pero falta la compilación real de demos/escenarios a flujos ejecutables.

6. **AI Journey Generator** — Ir más allá de generar JSX de demos: generar flows completos desde un briefing de negocio.

7. **Blueprint Generator** — Para cada experiencia, generar automáticamente qué sistemas intervienen, qué datos hacen falta, qué está listo y qué no.

### 🟢 Baja prioridad (enriquecen pero no bloquean)

8. **Experience Trees & Forests** — Modelo conceptual potente pero aún no necesario operativamente.
9. **Copy/paste semántico** — Muy útil para productividad avanzada.
10. **Vistas alternativas** (Path, Exception, Data Flow) — Valor analítico pero no urgente.
11. **Omnicanalidad real** — La visión es correcta, la implementación puede esperar a que el runtime funcione.

---

## 8. Oportunidades de Mejora Inmediatas

### Arquitectura de código

| Área | Situación | Recomendación |
|---|---|---|
| `FlowEditor.tsx` | Componente muy grande (~700+ líneas) | Extraer lógica a hooks: `useFlowInit`, `useFlowViewport`, `useFlowNodeOperations` |
| `IntegrationsPage.tsx` | 305 líneas, mezcla data + UI | Separar hook `useChannelConnections` del componente de presentación |
| `channelProviders.ts` | 224 líneas, crecerá con cada canal | Ya está limpio pero considerar separar types vs data |
| Páginas sin funcionalidad real | Algunas páginas son placeholders | Documentar cuáles son funcionales vs placeholder |

### UX y diseño

| Área | Oportunidad |
|---|---|
| **Home page** | Actualmente muestra WAKA Stack Status estático. Podría mostrar métricas reales: flows activos, runs recientes, demos creadas. |
| **Onboarding** | No hay guided tour para nuevos usuarios. El `GuidedTourOverlay` existe como componente pero no está integrado globalmente. |
| **Mobile** | La app tiene `use-mobile.tsx` pero no está optimizada para mobile. Evaluar si es necesario. |
| **Canvas UX** | Falta mini-map, fit-to-view button, y atajos de teclado documentados. |

### Backend

| Área | Oportunidad |
|---|---|
| **Edge functions para flow runtime** | Es el gap más importante. Crear un engine que ejecute nodos secuencialmente y persista en `flow_runs` + `flow_run_steps`. |
| **Realtime** | Las tablas de runs podrían usar Supabase Realtime para actualización en vivo. |
| **Storage** | No se está usando Supabase Storage. Las demos con imágenes/media podrían beneficiarse. |
| **Scheduled functions** | Para expiración automática de runs, limpieza de logs, etc. |

---

## 9. Resumen Ejecutivo para Agentes IA

### Lo que ya funciona bien (usar como base, no romper):
- Classic Builder con 16 tipos de nodos y simulador WhatsApp
- Auto-save, versionado, import/export JSON v13
- Experience Studio con CRUD y vinculación de activos
- Demo Builder con generación IA conversacional
- Production Layer con ciclo de vida de candidatos
- Multi-tenancy con RLS, roles, workspaces
- Sistema de conexiones de canales con health check
- Runs page con trazabilidad (UI lista, falta engine)

### Lo que se debe construir siguiente (por impacto):
1. **Flow Runtime Engine** — Edge function que ejecute flujos reales
2. **Context Board** — Superficie visual de entidades compartidas
3. **Auth hardening** — Eliminar DEMO_TENANT_ID fallback
4. **Simulator Shell nativo** — Componente independiente multi-canal
5. **AI Flow Generator** — De briefing a flow completo

### Principios de desarrollo obligatorios:
- **No romper lo existente** — Toda nueva capa se construye encima
- **Multi-tenant desde el diseño** — Todo con `tenant_id`
- **IA transversal** — No como bloque aislado sino como capacidad del sistema
- **Versionado de todo** — Usar `asset_versions` para cualquier activo nuevo
- **Semantic tokens** — Usar design tokens HSL, no colores hardcodeados

---

## 10. Archivos Clave para Contexto

| Archivo | Propósito |
|---|---|
| `docs/waka-xp-strategic-foundation.md` | Documento base estratégico completo (1161 líneas) |
| `README.md` | Documentación técnica actualizada (621 líneas) |
| `src/components/flow/FlowEditor.tsx` | Componente central del Builder |
| `src/pages/ExperienceStudioPage.tsx` | Experience Studio |
| `src/pages/WakaFlowPreview.tsx` | Demo Builder |
| `src/pages/ProductionPage.tsx` | Production Layer |
| `src/pages/RunsPage.tsx` | Runs / Runtime visibility |
| `src/contexts/WorkspaceContext.tsx` | Contexto global tenant/workspace |
| `src/hooks/useFlowPersistence.ts` | Auto-save de flujos |
| `src/hooks/useAssetVersions.ts` | Versionado transversal |
| `src/lib/wakaflowMapper.ts` | Mapper WakaFlow → TextIt |
| `src/lib/flowValidation.ts` | Motor de validación |
| `src/integrations/supabase/types.ts` | Schema de DB (auto-generado, no editar) |

---

*Informe generado el 13 de marzo de 2026 — WAKA XP v0.2*
