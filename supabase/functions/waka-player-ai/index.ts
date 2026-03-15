/**
 * WAKA Sovereign Player — AI Intent Engine v3
 * 
 * Full integration of 14 WAKA CORE API tools + 16 sovereign UI blocks.
 * Covers complete conversation flows: BNPL, Fibre, Insurance, MoMo, Payments, KYC.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WAKA_CORE_BASE = "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api";

const SYSTEM_PROMPT = `Tu es WAKA NEXUS, l'intelligence conversationnelle du canal souverain WAKA pour Moov Africa au Burkina Faso.

Tu comprends le français, le mooré et l'anglais. Tu es concis, chaleureux et efficace.

## BLOCS SOUVERAINS (UI riches au-delà de WhatsApp)

Tu disposes de blocs souverains pour afficher des interfaces interactives :
- show_catalog : Carousels de produits (téléphones, plans fibre, assurances)
- show_form : Formulaires inline pour capturer des données
- show_payment : Cartes de paiement/checkout
- show_location : Cartes de localisation
- show_training : Modules de formation avec suivi
- show_rating : Évaluations et feedback
- show_rich_card : Cartes promotionnelles
- show_menu : Menus interactifs
- suggest_quick_replies : Boutons de réponse rapide
- show_credit_simulation : Résultats de simulation de crédit
- show_client_status : Résumé du statut client
- show_momo_card : Statut compte Mobile Money
- show_service_plans : Plans/variantes de services (fibre, assurance)
- show_payment_confirmation : Confirmation/reçu de paiement
- show_credit_contract : Confirmation de contrat de crédit créé
- show_device_lock_consent : Consentement device lock (obligatoire BNPL)

## 14 OUTILS WAKA CORE (opérations backend réelles)

1. get_product_rules — Découvrir produits actifs et contraintes (OBLIGATOIRE en début)
2. get_bnpl_catalog — Catalogue téléphones BNPL (prix/stock temps réel)
3. create_client — Rechercher ou créer un client (onboarding léger)
4. update_client — Modifier données client
5. lookup_entity — Recherche universelle (téléphone, CNI, voice_id, nom)
6. upload_kyc_media — Upload CNI avec OCR automatique (optionnel)
7. simulate_credit — Simuler un crédit (BNPL ou assurance financée UNIQUEMENT)
8. create_credit — Créer un crédit formel (UNE SEULE FOIS)
9. pay_by_client — Paiement simplifié auto-détection
10. register_payment — Paiement à crédit spécifique
11. acquire_service — Acquérir un service COMPTANT (fibre, assurance directe)
12. update_client_location — Capturer GPS (requis pour fibre)
13. open_momo_account — Ouvrir compte Mobile Money
14. quick_status — Résumé rapide solde et paiements

## RÈGLES CRITIQUES

1. **DÉCOUVERTE PRODUITS**: Avant de mentionner un produit, appeler get_product_rules
2. **CATALOGUE BNPL**: Appeler get_bnpl_catalog pour montrer les téléphones
3. **MONNAIE XOF**: Tous montants en francs CFA, arrondis à l'entier, JAMAIS de TVA
4. **JAMAIS** inventer d'IDs, prix, ou produits — utiliser les données API
5. **EXPRESSIONS LOCALES** (max 1 par message): "Laafi bala?", "I ni sogoma"
6. **CACHE VOICE_ID**: Mémoriser le voice_id après create_client — NE PAS rappeler

## FLUX CONVERSATIONNELS COMPLETS

### FLUX BNPL (Téléphones)
1. get_bnpl_catalog → afficher avec show_catalog (catégorie "phone")
2. Client choisit un téléphone → simulate_credit(phone_bnpl, product_id)
3. Afficher simulation avec show_credit_simulation
4. ⚠️ CONSENTEMENT OBLIGATOIRE → show_device_lock_consent AVANT create_credit
5. Client accepte → create_credit(device_lock=true)
6. Afficher contrat avec show_credit_contract

### FLUX FIBRE OPTIQUE (3 étapes)
1. acquire_service(fibre_optique) → afficher plans avec show_service_plans
2. Client choisit un plan → demander localisation
3. update_client_location(lat, lng) → capturer GPS
4. acquire_service(fibre_optique, sku, accept=true) → créer deal
5. Confirmer avec show_payment_confirmation

### FLUX ASSURANCE — ⚠️ DEUX CHEMINS DISTINCTS
**TOUJOURS DEMANDER**: "Comptant ou en plusieurs fois?" AVANT de choisir le chemin

**CHEMIN A — Comptant (DEAL, pas de crédit):**
1. acquire_service(microseguro_salud) → afficher plans avec show_service_plans
2. Client choisit → acquire_service(microseguro_salud, sku, accept=true)
3. Confirmer avec show_payment_confirmation
⛔ NE PAS appeler simulate_credit ni create_credit

**CHEMIN B — Financement (CRÉDIT):**
1. simulate_credit(seguro_salud) → afficher avec show_credit_simulation
2. Client accepte → create_credit(seguro_salud)
3. Confirmer avec show_credit_contract
⛔ NE PAS appeler acquire_service

### FLUX MOMO
1. Vérifier que le client existe (create_client si nécessaire)
2. Demander type: standard (particulier) ou merchant (commerçant)
3. open_momo_account(client_id, account_type)
4. Afficher avec show_momo_card

### FLUX PAIEMENT
1. pay_by_client(client_id, amount) → paiement auto-détecté
2. Si selection_required → montrer les crédits et utiliser register_payment
3. Confirmer avec show_payment_confirmation

### FLUX ONBOARDING
**CHEMIN A — Client envoie photo CNI:**
1. upload_kyc_media(subject_id, image, "doc_front") → OCR automatique
2. Confirmer données OCR au client
3. Demander UNIQUEMENT le téléphone
4. create_client(full_name=OCR, phone=user_phone, document_number=OCR)

**CHEMIN B — Sans document:**
1. Demander nom et téléphone
2. create_client(phone, full_name)
3. Optionnel: proposer envoi CNI

### FLUX STATUT
1. quick_status(client_id ou query) → résumé rapide
2. Afficher avec show_client_status

## RÈGLES DE RÉPONSE — CRITIQUES
- **BOUTONS 100% CONTEXTUELS** : Les quick replies DOIVENT correspondre EXACTEMENT à ce que tu viens de demander ou proposer. JAMAIS de boutons génériques ("Voir les téléphones", "Mon solde", "Menu principal") quand la conversation attend une réponse spécifique.
  
  ⛔ INTERDIT : Tu demandes "Est-ce bien cela ?" puis suggest_quick_replies: ["Voir les téléphones", "Mon solde"] 
  ✅ CORRECT : Tu demandes "Est-ce bien cela ?" puis suggest_quick_replies: ["✅ Oui, confirmer", "✏️ Non, corriger"]
  
  ⛔ INTERDIT : Tu demandes le numéro de téléphone puis suggest_quick_replies: ["Assurance santé", "Menu principal"]
  ✅ CORRECT : Tu demandes le numéro de téléphone → PAS de quick replies (l'utilisateur doit taper)
  
  RÈGLE D'OR : Si ta question attend une saisie libre (nom, téléphone, montant), NE PAS envoyer de quick replies. Si ta question propose des choix, les quick replies doivent refléter EXACTEMENT ces choix.
  
  Exemples corrects :
  - Choix binaire : ["✅ Oui", "❌ Non"]
  - Choix produit : ["🏥 Pack Individuel", "👨‍👩‍👧 Pack Famille"]
  - Choix paiement : ["💰 Comptant", "📅 Financement"]
  - Confirmation : ["✅ Confirmer", "✏️ Modifier", "❌ Annuler"]
  - Après action complète : ["📋 Menu principal", "💬 Autre question"]
  
  Les boutons de navigation générique ("Menu principal") ne sont acceptables QUE après la conclusion d'un flux complet, JAMAIS au milieu d'une interaction.

- Toujours répondre en français sauf si l'utilisateur parle autre langue
- Être proactif : anticiper les besoins
- Un seul bloc souverain PRINCIPAL par réponse + suggest_quick_replies si pertinent
- Si l'intention n'est pas claire, poser une question avec quick replies contextuels
- Après chaque action API, toujours afficher un bloc souverain avec les résultats`;

// ── Sovereign Block Tools (UI rendering) ──
const SOVEREIGN_TOOLS = [
  {
    type: "function",
    function: {
      name: "show_menu",
      description: "Show an interactive service menu.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, icon: { type: "string" }, description: { type: "string" } },
              required: ["label"],
            },
          },
        },
        required: ["title", "options"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_catalog",
      description: "Show a product catalog carousel. Use for browsing products, plans, phones, or offers.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                price: { type: "string" },
                emoji: { type: "string" },
                description: { type: "string" },
                badge: { type: "string" },
                rating: { type: "number" },
                specs: { type: "object", description: "Technical specs like storage, camera, screen" },
                image_url: { type: "string" },
                category: { type: "string", enum: ["phone", "fiber", "insurance", "momo", "general"] },
              },
              required: ["id", "name", "price"],
            },
          },
        },
        required: ["title", "products"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_form",
      description: "Show an inline form to capture user data (onboarding, KYC, etc.).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          icon: { type: "string" },
          submit_label: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" }, label: { type: "string" },
                type: { type: "string", enum: ["text", "number", "select", "date", "phone", "email"] },
                placeholder: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                required: { type: "boolean" },
              },
              required: ["id", "label", "type"],
            },
          },
        },
        required: ["title", "fields"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_payment",
      description: "Show a payment/checkout card with items and total.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" }, icon: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, amount: { type: "string" } },
              required: ["label", "amount"],
            },
          },
          total: { type: "string" },
          currency: { type: "string", default: "FCFA" },
          methods: { type: "array", items: { type: "string", enum: ["mobile_money", "card"] } },
        },
        required: ["title", "items", "total"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_location",
      description: "Show a location card with address and contact info.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }, address: { type: "string" }, hours: { type: "string" },
          phone: { type: "string" }, emoji: { type: "string" }, distance: { type: "string" },
        },
        required: ["name", "address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_training",
      description: "Show a training/learning progress tracker.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          overall_progress: { type: "number" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" }, name: { type: "string" }, emoji: { type: "string" },
                status: { type: "string", enum: ["completed", "current", "locked"] },
                progress: { type: "number" },
              },
              required: ["id", "name", "status"],
            },
          },
        },
        required: ["title", "modules", "overall_progress"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_rating",
      description: "Show a rating/feedback widget.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["stars", "emoji", "nps"] },
        },
        required: ["title", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_rich_card",
      description: "Show a rich promotional card with CTA buttons.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" }, description: { type: "string" },
          icon: { type: "string" }, actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "actions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_quick_replies",
      description: "Suggest quick reply buttons. ALWAYS use to guide conversation after every response.",
      parameters: {
        type: "object",
        properties: {
          replies: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: ["replies"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_credit_simulation",
      description: "Show a credit simulation result card with amortization details. Use after simulate_credit API call.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          product_name: { type: "string" },
          amount: { type: "string" },
          term: { type: "string" },
          frequency: { type: "string" },
          monthly_payment: { type: "string" },
          total_cost: { type: "string" },
          interest_rate: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "amount", "monthly_payment"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_client_status",
      description: "Show a client status/balance summary card. Use after quick_status API call.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string" },
          voice_id: { type: "string" },
          phone: { type: "string" },
          active_credits: { type: "integer" },
          total_balance: { type: "string" },
          next_payment_date: { type: "string" },
          next_payment_amount: { type: "string" },
          icon: { type: "string" },
        },
        required: ["client_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_momo_card",
      description: "Show a Mobile Money account card. Use after open_momo_account API call.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          account_number: { type: "string" },
          account_type: { type: "string", enum: ["standard", "merchant"] },
          status: { type: "string" },
          message: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_service_plans",
      description: "Show available service plans/variants (fiber optic, insurance). Use after acquire_service API returns plans catalog.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string", enum: ["fibre_optique", "microseguro_salud", "general"] },
          plans: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string" },
                name: { type: "string" },
                price: { type: "string" },
                description: { type: "string" },
                features: { type: "array", items: { type: "string" } },
                badge: { type: "string" },
                icon: { type: "string" },
              },
              required: ["sku", "name", "price"],
            },
          },
          message: { type: "string" },
          icon: { type: "string" },
        },
        required: ["title", "category", "plans"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_payment_confirmation",
      description: "Show a payment confirmation/receipt card. Use after pay_by_client or register_payment or acquire_service(accept=true).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          status: { type: "string", enum: ["success", "partial", "failed"] },
          amount_paid: { type: "string" },
          remaining_balance: { type: "string" },
          credit_voice_id: { type: "string" },
          payment_date: { type: "string" },
          next_payment_date: { type: "string" },
          next_payment_amount: { type: "string" },
          message: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "status", "amount_paid"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_credit_contract",
      description: "Show a credit contract confirmation card. Use after create_credit API call.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          credit_voice_id: { type: "string" },
          credit_type: { type: "string" },
          amount: { type: "string" },
          term: { type: "string" },
          frequency: { type: "string" },
          monthly_payment: { type: "string" },
          status: { type: "string", enum: ["active", "pending", "approved", "rejected"] },
          status_explanation: { type: "string" },
          device_lock: { type: "boolean" },
          product_name: { type: "string" },
          next_steps: { type: "array", items: { type: "string" } },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "credit_voice_id", "credit_type", "amount", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_device_lock_consent",
      description: "Show device lock consent card. MANDATORY before create_credit for BNPL. User must accept before proceeding.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          device_name: { type: "string" },
          amount: { type: "string" },
          message: { type: "string" },
          icon: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
];

// ── WAKA CORE API Tools (real backend operations) ──
const WAKA_CORE_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_product_rules",
      description: "OBLIGATOIRE: Découvrir les produits actifs et leurs contraintes. Appeler SANS paramètres pour voir tous les produits. Avec credit_type pour les règles spécifiques.",
      parameters: {
        type: "object",
        properties: {
          credit_type: { type: "string", description: "Optionnel: phone_bnpl, seguro_salud, etc." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_bnpl_catalog",
      description: "Catalogue des téléphones BNPL avec prix en XOF et stock en temps réel. OBLIGATOIRE avant de proposer des téléphones.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_client",
      description: "Rechercher ou créer un client. Seuls phone et full_name requis. Modes: found, created, missing_data.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          full_name: { type: "string" },
          document_number: { type: "string" },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_client",
      description: "Modifier les données d'un client existant.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          full_name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          document_number: { type: "string" },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_entity",
      description: "Recherche universelle par téléphone, CNI, voice_id, nom ou credit_id.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "upload_kyc_media",
      description: "Upload photo CNI avec OCR automatique. Accepte base64 ou URL. Type: doc_front uniquement. subject_id peut être phone ou client_id.",
      parameters: {
        type: "object",
        properties: {
          subject_id: { type: "string", description: "Phone number or client_id" },
          media_type: { type: "string", enum: ["doc_front"], default: "doc_front" },
          attachment_url: { type: "string", description: "URL of the document image" },
          base64_data: { type: "string", description: "Base64 encoded image data" },
        },
        required: ["subject_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_credit",
      description: "Simuler un crédit (BNPL ou assurance financée). UNIQUEMENT pour paiement en plusieurs fois. ⛔ Si comptant → utiliser acquire_service.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          credit_type: { type: "string", enum: ["phone_bnpl", "bnpl", "seguro_salud"] },
          product_id: { type: "string", description: "UUID, nom complet ou modèle du téléphone" },
          amount: { type: "number" },
          term_months: { type: "integer" },
          term_days: { type: "integer" },
          payment_frequency: { type: "string", enum: ["daily", "weekly", "biweekly", "monthly"] },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_credit",
      description: "Créer un crédit formel. UNE SEULE FOIS. device_lock=true OBLIGATOIRE pour BNPL. ⚠️ Exiger show_device_lock_consent AVANT cet appel pour BNPL.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          credit_type: { type: "string", enum: ["phone_bnpl", "bnpl", "seguro_salud"] },
          amount: { type: "number" },
          term_months: { type: "integer" },
          term_days: { type: "integer" },
          payment_frequency: { type: "string", enum: ["daily", "weekly", "biweekly", "monthly"] },
          product_id: { type: "string" },
          device_lock: { type: "boolean" },
        },
        required: ["client_id", "credit_type", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_by_client",
      description: "Paiement simplifié auto-détection du crédit. Méthode PRINCIPALE.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["client_id", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_payment",
      description: "Paiement à un crédit spécifique (si plusieurs crédits actifs).",
      parameters: {
        type: "object",
        properties: {
          credit_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["credit_id", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "acquire_service",
      description: "Acquérir un service COMPTANT (fibre, assurance). Crée un DEAL, PAS un crédit. ⛔ Si financement → utiliser simulate_credit + create_credit. Flux multi-étapes: sans SKU→catalogue, avec SKU→détails, avec accept=true→créer deal.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          product_catalog_key: { type: "string", description: "fibre_optique ou microseguro_salud" },
          product_variant_sku: { type: "string" },
          accept: { type: "boolean" },
          channel: { type: "string", enum: ["whatsapp", "voice", "app", "web"], default: "app" },
        },
        required: ["client_id", "product_catalog_key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_client_location",
      description: "Capturer les coordonnées GPS du client (requis pour fibre optique).",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          raw_text: { type: "string" },
        },
        required: ["client_id", "lat", "lng"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_momo_account",
      description: "Ouvrir un compte Mobile Money. Types: standard (particulier) ou merchant (commerçant).",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          account_type: { type: "string", enum: ["standard", "merchant"], default: "standard" },
          channel: { type: "string", default: "app" },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "quick_status",
      description: "Résumé rapide du solde et paiements d'un client.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          client_id: { type: "string" },
        },
      },
    },
  },
];

// ── API endpoint mapping ──
const TOOL_ENDPOINTS: Record<string, { method: string; path: string }> = {
  get_product_rules: { method: "GET", path: "/bots/product-rules" },
  get_bnpl_catalog: { method: "GET", path: "/bots/bnpl-catalog" },
  create_client: { method: "POST", path: "/bots/client-onboarding" },
  update_client: { method: "POST", path: "/bots/client-update" },
  lookup_entity: { method: "POST", path: "/bots/entity-lookup" },
  upload_kyc_media: { method: "POST", path: "/media/upload" },
  simulate_credit: { method: "POST", path: "/bots/create-credit-template" },
  create_credit: { method: "POST", path: "/credits" },
  pay_by_client: { method: "POST", path: "/bots/pay-by-client" },
  register_payment: { method: "POST", path: "/bots/register-payment" },
  acquire_service: { method: "POST", path: "/bots/acquire-service" },
  update_client_location: { method: "POST", path: "/bots/client-location" },
  open_momo_account: { method: "POST", path: "/bots/open-momo-account" },
  quick_status: { method: "POST", path: "/bots/quick-status" },
};

// Set of tool names that are sovereign UI blocks (not API calls)
const SOVEREIGN_BLOCK_NAMES = new Set([
  "show_menu", "show_catalog", "show_form", "show_payment", "show_location",
  "show_training", "show_rating", "show_rich_card", "suggest_quick_replies",
  "show_credit_simulation", "show_client_status", "show_momo_card",
  "show_service_plans", "show_payment_confirmation", "show_credit_contract",
  "show_device_lock_consent",
]);

async function executeWakaCoreCall(
  toolName: string,
  args: Record<string, unknown>,
  apiKey: string
): Promise<Record<string, unknown>> {
  const endpoint = TOOL_ENDPOINTS[toolName];
  if (!endpoint) {
    return { error: `Unknown tool: ${toolName}` };
  }

  try {
    let url = `${WAKA_CORE_BASE}${endpoint.path}`;
    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };

    let response: Response;
    if (endpoint.method === "GET") {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      response = await fetch(url, { method: "GET", headers });
    } else {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
      });
    }

    const data = await response.json();
    console.log(`WAKA CORE [${toolName}] ${response.status}:`, JSON.stringify(data).slice(0, 500));
    return data;
  } catch (e) {
    console.error(`WAKA CORE call failed [${toolName}]:`, e);
    return { error: `API call failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataMode, flowContext, memoryContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const WAKA_API_KEY = Deno.env.get("WAKA_CORE_API_KEY");
    if (!WAKA_API_KEY) throw new Error("WAKA_CORE_API_KEY is not configured");

    const modeContext = dataMode === "zero-rated"
      ? "\n\nIMPORTANT: L'utilisateur est en mode ZERO-RATED. Sois ultra-concis. Pas d'emojis décoratifs. Réponses courtes."
      : dataMode === "subventionné"
      ? "\n\nL'utilisateur est en mode SUBVENTIONNÉ. Sois concis mais chaleureux."
      : "\n\nL'utilisateur est en mode LIBRE. Tu peux être expressif avec des emojis et des messages riches.";

    // Inject flow context if provided (from TextIt JSON or other sources)
    const flowContextSection = flowContext
      ? `\n\n## CONTEXTO DE FLUJO ACTIVO\n${flowContext}\n\nIMPORTANT: Utiliza este flujo como guía conversacional. Conduce al usuario por los pasos de forma natural y fluida, usando las APIs y webhooks indicados para las operaciones reales. NO sigas los nodos de forma rígida — sé conversacional y dinámico.`
      : "";

    // Ghost context: inject memory/continuity signals so the AI is aware of user history
    let ghostContextSection = "";
    if (memoryContext) {
      const parts: string[] = [];
      if (memoryContext.activeJourney) {
        const j = memoryContext.activeJourney;
        parts.push(`L'utilisateur a un parcours en cours : "${j.journeyName}" (étape actuelle : ${j.currentStepLabel || j.currentStepId || "début"}, ${j.completedSteps?.length || 0} étapes complétées).`);
      }
      if (memoryContext.preferredLanguage) {
        parts.push(`Langue préférée : ${memoryContext.preferredLanguage}`);
      }
      if (memoryContext.lastViewedItems?.length > 0) {
        parts.push(`Derniers éléments consultés : ${memoryContext.lastViewedItems.slice(0, 3).join(", ")}`);
      }
      if (memoryContext.totalSessions > 1) {
        parts.push(`C'est la session #${memoryContext.totalSessions} de cet utilisateur. Adapte ton accueil en conséquence (pas besoin de tout réexpliquer).`);
      }
      if (parts.length > 0) {
        ghostContextSection = `\n\n## MÉMOIRE UTILISATEUR (contexte implicite — NE PAS mentionner explicitement)\n${parts.join("\n")}`;
      }
    }

    const hasImages = messages.some((m: any) =>
      Array.isArray(m.content) && m.content.some((p: any) => p.type === "image_url")
    );
    const model = hasImages ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const allTools = [...SOVEREIGN_TOOLS, ...WAKA_CORE_TOOLS];

    // First AI call — may produce tool calls
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + modeContext + flowContextSection + ghostContextSection },
          ...messages,
        ],
        tools: allTools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Trop de requêtes. Réessayez." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "payment_required", message: "Crédit AI épuisé." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "ai_error", message: "Erreur du moteur IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let choice = data.choices?.[0];

    const result: Record<string, any> = { text: "", blocks: {} };

    // Multi-pass loop: keep executing CORE tool calls until AI produces a final response
    const MAX_PASSES = 5;
    let conversationMessages = [
      { role: "system", content: SYSTEM_PROMPT + modeContext + flowContextSection },
      ...messages,
    ];
    let pass = 0;

    while (pass < MAX_PASSES) {
      pass++;
      const toolCalls = choice?.message?.tool_calls || [];
      const coreToolCalls = toolCalls.filter(
        (tc: any) => tc.type === "function" && !SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
      );
      const uiToolCalls = toolCalls.filter(
        (tc: any) => tc.type === "function" && SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
      );

      // Collect UI blocks from this pass
      for (const tc of uiToolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments);
          result.blocks[tc.function.name] = args;
        } catch { /* skip */ }
      }

      // If no CORE tool calls, we're done — AI has produced its final response
      if (coreToolCalls.length === 0) {
        break;
      }

      console.log(`Pass ${pass}: Executing ${coreToolCalls.length} CORE tool calls: ${coreToolCalls.map((tc: any) => tc.function.name).join(", ")}`);

      // Execute all CORE API calls
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

      for (const tc of coreToolCalls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.function.arguments); } catch { /* empty */ }
        const apiResult = await executeWakaCoreCall(tc.function.name, args, WAKA_API_KEY);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(apiResult),
        });
      }

      // Also acknowledge UI tool calls so the model doesn't complain
      for (const tc of uiToolCalls) {
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ ok: true }),
        });
      }

      // Build next conversation with assistant message + tool results
      conversationMessages = [
        ...conversationMessages,
        choice.message,
        ...toolResults,
      ];

      // Next AI call
      const nextResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: conversationMessages,
          tools: allTools,
          stream: false,
        }),
      });

      if (!nextResponse.ok) {
        console.error(`Pass ${pass} AI call failed:`, nextResponse.status);
        break;
      }

      const nextData = await nextResponse.json();
      choice = nextData.choices?.[0];
    }

    if (pass >= MAX_PASSES) {
      console.warn("Hit max passes limit, returning partial result");
    }

    // Extract final text
    result.text = choice?.message?.content || "";

    // Process any remaining UI tool calls from the final response
    const finalToolCalls = choice?.message?.tool_calls || [];
    for (const tc of finalToolCalls) {
      if (tc.type !== "function") continue;
      if (!SOVEREIGN_BLOCK_NAMES.has(tc.function.name)) continue;
      try {
        const args = JSON.parse(tc.function.arguments);
        result.blocks[tc.function.name] = args;
      } catch {
        console.error("Failed to parse tool call args:", tc.function.arguments);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("waka-player-ai error:", e);
    return new Response(
      JSON.stringify({ error: "internal", message: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
