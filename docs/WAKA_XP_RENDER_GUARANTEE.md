# WAKA XP — Render Guarantee & `x-waka-xp-display` Spec v1

> **Fecha:** 16 de marzo de 2026  
> **Propósito:** Documento de referencia para el sistema de renderizado garantizado de bloques soberanos.  
> **Relación:** Extiende `docs/WAKA_XP_PLAYER_COMPLETE.md` §5 (Motor IA) y §4 (Bloques Soberanos).

---

## 1. Problema que Resuelve

En el modelo original, la IA era responsable de decidir qué bloque soberano renderizar mediante tool calls. Esto generaba **inconsistencia visual**: si la IA no invocaba `show_catalog`, el usuario no veía el catálogo aunque la API de CORE devolviera productos.

El **Render Guarantee** asegura que **siempre se renderice UI rica** cuando la API de CORE devuelve datos, independientemente de si la IA invoca explícitamente un bloque soberano.

---

## 2. Arquitectura del Sistema

```
YAML con x-waka-xp-display
        ↓
generate-player-flow (parsea YAML)
        ↓
scenario_config.displayMap (guardado en DB)
        ↓
waka-player-ai (lee displayMap al recibir request)
        ↓
IA invoca tool de CORE (ej: get_bnpl_catalog)
        ↓
CORE API responde con datos (productos, planes, etc.)
        ↓
┌─────────────────────────────────────────┐
│  RENDER GUARANTEE ENGINE                │
│                                         │
│  1. ¿La IA ya generó un bloque?        │
│     → SÍ: usar bloque de IA            │
│     → NO: buscar en displayMap          │
│                                         │
│  2. ¿Existe displayMap para este tool?  │
│     → SÍ: aplicar template engine       │
│     → NO: intentar heurística legacy    │
│                                         │
│  3. Template engine:                    │
│     → Resolver items_from / payload     │
│     → Interpolar {campos} desde datos   │
│     → Generar bloque soberano           │
└─────────────────────────────────────────┘
        ↓
Bloque soberano renderizado en el Player
```

### 2.1. Prioridad de renderizado

1. **Bloque explícito de la IA** → Siempre tiene prioridad máxima
2. **displayMap del scenario_config** → Template engine v1 (spec completa)
3. **Heurística legacy** → Detección por nombre de tool (fallback)

---

## 3. Spec `x-waka-xp-display` v1

### 3.0. Convenciones base

```yaml
x-waka-xp-display:
  type: <block_type>        # Tipo de bloque soberano
  title: "..."               # Título del bloque
  items_from: "response_path" # Ruta JSON para listas de items
  card_template: { ... }     # Template para cada item (listas)
  item_template: { ... }     # Alternativa a card_template
  payload: { ... }           # Template para bloques de objeto único
```

**Interpolación:** Todos los templates usan `{field}` con soporte de rutas anidadas: `{client.name}`.

### 3.1. Tipos de bloque soportados

| Tipo YAML | Bloque Soberano | Usa `items_from` | Usa `payload` |
|---|---|---|---|
| `product_carousel` | `show_catalog` (ProductCatalog) | ✅ | ❌ |
| `menu` | `show_menu` | ✅ | ❌ |
| `decision_tree` | `show_menu` | ✅ | ❌ |
| `status_card` | `show_client_status` (ClientStatusCard) | ❌ | ✅ |
| `credit_simulation` | `show_credit_simulation` (CreditSimulationCard) | ❌ | ✅ |
| `credit_contract` | `show_credit_contract` (CreditContractCard) | ❌ | ✅ |
| `payment_card` | `show_payment` (PaymentCard) | ❌ | ✅ |
| `confirmation_card` | `show_payment_confirmation` (PaymentConfirmationCard) | ❌ | ✅ |
| `service_plans` | `show_service_plans` (ServicePlansCard) | ✅ | ❌ |
| `kyc_card` | `show_form` (InlineForm) | ❌ | ✅ |
| `location_card` | `show_location` (LocationCard) | ❌ | ✅ |
| `training_progress` | `show_training` (TrainingProgress) | ❌ | ✅ |
| `media_carousel` | `show_media_carousel` (MediaCarousel) | ✅ | ❌ |
| `device_lock_consent` | `show_device_lock_consent` (DeviceLockConsentCard) | ❌ | ✅ |
| `momo_card` | `show_momo_card` (MoMoAccountCard) | ❌ | ✅ |

---

## 4. Ejemplos YAML Completos

### 4.1. PRODUCT_CAROUSEL (Catálogo BNPL)

```yaml
x-waka-xp-display:
  type: product_carousel
  title: "Téléphones disponibles"
  items_from: "products"
  card_template:
    id: "{id}"
    image: "{image_url}"
    title: "{name}"
    subtitle: "{description_short}"
    price: "{price} {currency}"
    badge: "{display_tag}"
```

**CORE Response esperado:**
```json
{
  "products": [
    {
      "id": "p1",
      "name": "Samsung A05",
      "price": "59000",
      "currency": "XOF",
      "image_url": "https://...",
      "description_short": "128GB · Dual SIM",
      "display_tag": "Nouveau"
    }
  ]
}
```

### 4.2. MENU / DECISION_TREE

```yaml
x-waka-xp-display:
  type: menu
  title: "Menu principal"
  items_from: "items"
  item_template:
    label: "{label}"
    icon: "{icon}"
    description: "{description}"
```

### 4.3. STATUS_CARD

```yaml
x-waka-xp-display:
  type: status_card
  payload:
    client_name: "{client.name}"
    phone: "{client.phone}"
    total_balance: "{balance}"
    next_payment_date: "{next_payment_date}"
```

### 4.4. CREDIT_SIMULATION

```yaml
x-waka-xp-display:
  type: credit_simulation
  payload:
    product_name: "{product_name}"
    amount: "{amount}"
    term: "{term}"
    monthly_payment: "{monthly_payment}"
    interest_rate: "{interest_rate}"
```

### 4.5. CONFIRMATION_CARD

```yaml
x-waka-xp-display:
  type: confirmation_card
  payload:
    title: "Paiement confirmé"
    amount_paid: "{amount_paid}"
    remaining_balance: "{remaining_balance}"
    payment_date: "{payment_date}"
```

### 4.6. SERVICE_PLANS

```yaml
x-waka-xp-display:
  type: service_plans
  title: "Plans disponibles"
  items_from: "available_variants"
  item_template:
    label: "{name}"
    price: "{price}"
    description: "{description_short}"
```

### 4.7. DEVICE_LOCK_CONSENT

```yaml
x-waka-xp-display:
  type: device_lock_consent
  payload:
    title: "Consentement Device Lock"
    device_name: "{device_name}"
    amount: "{amount}"
```

### 4.8. MEDIA_CAROUSEL

```yaml
x-waka-xp-display:
  type: media_carousel
  items_from: "media"
  item_template:
    src: "{url}"
    type: "{type}"
    caption: "{caption}"
```

---

## 5. Template Engine — Implementación Técnica

### 5.1. Resolución de rutas (`resolvePath`)

```typescript
// Resuelve "client.name" desde { client: { name: "Amadou" } }
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc, key) => 
    acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined, 
    obj as unknown
  );
}
```

### 5.2. Interpolación de strings (`interpolate`)

```typescript
// Reemplaza "{field}" con valores del objeto
function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    const val = resolvePath(data, path.trim());
    return val !== undefined && val !== null ? String(val) : "";
  });
}
```

### 5.3. Aplicación de templates (`applyTemplate`)

```typescript
// Aplica un template a un item, interpolando cada campo
function applyTemplate(
  template: Record<string, string>, 
  item: Record<string, unknown>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, tmpl] of Object.entries(template)) {
    result[key] = typeof tmpl === "string" ? interpolate(tmpl, item) : String(tmpl);
  }
  return result;
}
```

### 5.4. Mapa de tipos spec → bloques soberanos

```typescript
const SPEC_TYPE_TO_BLOCK: Record<string, string> = {
  product_carousel: "show_catalog",
  menu: "show_menu",
  decision_tree: "show_menu",
  status_card: "show_client_status",
  credit_simulation: "show_credit_simulation",
  credit_contract: "show_credit_contract",
  payment_card: "show_payment",
  confirmation_card: "show_payment_confirmation",
  service_plans: "show_service_plans",
  kyc_card: "show_form",
  location_card: "show_location",
  training_progress: "show_training",
  media_carousel: "show_media_carousel",
  device_lock_consent: "show_device_lock_consent",
  momo_card: "show_momo_card",
};
```

### 5.5. Construcción de bloques (`buildBlockFromSpec`)

La función principal que transforma una respuesta CORE + spec en un bloque soberano:

1. **Listas** (`items_from` + `card_template`/`item_template`):
   - Resuelve el array desde `items_from` (ej: `"products"`)
   - Aplica el template a cada item
   - Genera el bloque con la lista procesada

2. **Objetos** (`payload`):
   - Interpola cada campo del payload con los datos de la respuesta
   - Genera el bloque con el objeto procesado

---

## 6. displayMap en `scenario_config`

El `displayMap` es un objeto JSON guardado en `player_saved_flows.scenario_config` que mapea cada tool de CORE a su spec de renderizado:

```json
{
  "displayMap": {
    "get_bnpl_catalog": {
      "type": "product_carousel",
      "title": "Catalogue BNPL",
      "items_from": "products",
      "card_template": {
        "id": "{id}",
        "image": "{image_url}",
        "title": "{name}",
        "subtitle": "{description_short}",
        "price": "{price} {currency}",
        "badge": "{display_tag}"
      }
    },
    "simulate_credit": {
      "type": "credit_simulation",
      "title": "Simulation de crédit",
      "payload": {
        "product_name": "{simulation.product_name}",
        "amount": "{simulation.amount}",
        "term": "{simulation.term}",
        "monthly_payment": "{simulation.installment_amount}"
      }
    }
  }
}
```

### 6.1. Origen del displayMap

| Fuente | Cómo llega al displayMap |
|---|---|
| **YAML con `x-waka-xp-display`** | `generate-player-flow` parsea el YAML y genera el displayMap |
| **Migración SQL** | Se puede inyectar directamente via SQL en `scenario_config` |
| **Manual** | El usuario edita el `scenario_config` desde el Workbench |

---

## 7. Flujo de Datos End-to-End

```
1. YAML del agente incluye x-waka-xp-display por endpoint
       ↓
2. generate-player-flow parsea YAML → crea scenario_config con displayMap
       ↓
3. Flujo se guarda en player_saved_flows con displayMap
       ↓
4. Usuario abre flujo en Player (/player/live?flow=ID)
       ↓
5. WakaPlayerDemo carga scenario_config → pasa a PlayerContextProvider
       ↓
6. useWakaPlayerAI envía scenarioConfig al edge function waka-player-ai
       ↓
7. waka-player-ai:
   a. IA genera respuesta con tool calls
   b. Ejecuta tool calls contra WAKA CORE API
   c. CORE devuelve datos (productos, simulaciones, etc.)
   d. RENDER GUARANTEE ENGINE:
      - Si la IA ya generó bloque → lo usa
      - Si no → busca en displayMap → aplica template engine → genera bloque
   e. Devuelve texto + bloques al frontend
       ↓
8. WakaSovereignPlayer renderiza los bloques soberanos
```

---

## 8. Integración con WAKA CORE API

### 8.1. 14 herramientas CORE

| Tool | Endpoint | displayMap recomendado |
|---|---|---|
| `get_product_rules` | `/bots/product-rules` | — (info interna) |
| `get_bnpl_catalog` | `/bots/bnpl-catalog` | `product_carousel` |
| `create_client` | `/bots/create-client` | — |
| `update_client` | `/bots/update-client` | — |
| `lookup_entity` | `/bots/lookup-entity` | `status_card` |
| `upload_kyc_media` | `/bots/upload-kyc-media` | `kyc_card` |
| `simulate_credit` | `/bots/simulate-credit` | `credit_simulation` |
| `create_credit` | `/bots/create-credit` | `credit_contract` |
| `pay_by_client` | `/bots/pay-by-client` | `confirmation_card` |
| `register_payment` | `/bots/register-payment` | `confirmation_card` |
| `acquire_service` | `/bots/acquire-service` | `service_plans` |
| `update_client_location` | `/bots/update-client-location` | `location_card` |
| `open_momo_account` | `/bots/open-momo-account` | `momo_card` |
| `quick_status` | `/bots/quick-status` | `status_card` |

### 8.2. Resolución de API Key

La API key de CORE se resuelve jerárquicamente:

1. `scenarioConfig.sourceData.secretValues.X_API_KEY`
2. `scenarioConfig.endpoints[].x-api-key`
3. `scenarioConfig.sourceData` (búsqueda recursiva)
4. `scenarioConfig` (búsqueda recursiva por patrón `waka_*`)
5. `flowContext` (búsqueda en texto)
6. `env.WAKA_CORE_API_KEY` (secret de backend, fallback)

La función `resolveWakaApiKey` sanitiza claves eliminando caracteres invisibles y valida el prefijo `waka_`.

---

## 9. Respeto de Data Modes

| Modo | Comportamiento del Render Guarantee |
|---|---|
| `libre` | Renderizado completo con imágenes, animaciones, efectos |
| `subventionné` | Renderizado con imágenes pero sin animaciones pesadas |
| `zero-rated` | **Sin imágenes** (image_url se omite), formato ultra-ligero, estilo terminal |

El `dataMode` se propaga vía `DataModeContext` y cada bloque soberano lo respeta internamente.

---

## 10. Footer Opcional (`x-waka-xp-footer`)

Cualquier endpoint puede incluir un footer persistente:

```yaml
x-waka-xp-footer:
  type: menu
  items_from: "products"
  append:
    - label: "Retour au menu"
      icon: "arrow-left"
```

**Estado:** Definido en spec, implementación pendiente en el template engine.

---

## 11. Reglas de Implementación

### Para CORE (API backend)
- ✅ Siempre devolver los campos referenciados en el YAML
- ✅ `image_url` debe ser una URL pública accesible
- ✅ Precios como números o strings sin formato
- ✅ Moneda en campo separado (`currency: "XOF"`)

### Para XP (Frontend/Edge Functions)
- ✅ Bloques de IA tienen prioridad absoluta
- ✅ Si no hay bloque de IA, displayMap genera automáticamente
- ✅ Si falta imagen → fallback visual (emoji o placeholder)
- ✅ Zero-rated → no enviar media al renderizador
- ✅ Template engine es puro (sin side effects, sin estado)

### Para YAML (Diseño de agentes)
- ✅ Cada endpoint con UI debe tener `x-waka-xp-display`
- ✅ `items_from` para colecciones, `payload` para objetos únicos
- ✅ Templates usan `{field}` con rutas anidadas `{obj.field}`
- ✅ Mantener consistencia de nombres con la API de CORE

---

## 12. Validación Realizada (16 marzo 2026)

| Test | Resultado |
|---|---|
| `get_bnpl_catalog` → catálogo con 4 productos + imágenes reales | ✅ |
| API key resuelta desde `scenarioConfig.sourceData.secretValues` | ✅ |
| `x-waka-xp-display` auto-genera `show_catalog` sin intervención IA | ✅ |
| Template engine interpola `{name}`, `{price}`, `{image_url}` correctamente | ✅ |
| Log confirma: `Auto-generated show_catalog from get_bnpl_catalog` | ✅ |
| displayMap v1 con 8 endpoints configurados en MOOV FIBRA MONEY | ✅ |

---

## 13. Archivos Clave

| Archivo | Propósito |
|---|---|
| `supabase/functions/waka-player-ai/index.ts` | Motor IA + Render Guarantee Engine (~1423 líneas) |
| `supabase/functions/generate-player-flow/index.ts` | Parser YAML → displayMap |
| `src/hooks/useWakaPlayerAI.ts` | Hook frontend que pasa scenarioConfig al backend |
| `src/contexts/PlayerContextProvider.tsx` | Proveedor de contexto con scenarioConfig |
| `src/xp-spatial/adapters/spatialPresentationAdapter.ts` | Adapter para capa espacial |
| `docs/openapi-waka-africa-agent.yaml` | YAML de referencia con `x-waka-xp-display` |

---

*Documento generado el 16 de marzo de 2026 — WAKA XP Render Guarantee v1.0*
