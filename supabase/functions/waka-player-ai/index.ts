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

const SYSTEM_PROMPT = `Tu es WAKA NEXUS, l'intelligence conversationnelle du canal souverain du client actif.

Tu comprends le français, l'anglais et t'adaptes au ton/langue du contexte de flujo activo. Tu es concis, chaleureux et efficace.

RÈGLE ABSOLUE: N'invente jamais une marque, un pays, une identité client, ni un contexte (ex: Moov/Burkina/Moussa) s'ils ne sont pas explicitement présents dans le contexte de flujo activo.

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
3. **IMAGE_URL OBLIGATOIRE**: Quand l'API retourne image_url pour un produit, tu DOIS le passer tel quel dans show_catalog. NE JAMAIS remplacer image_url par un emoji. Si image_url existe, l'utiliser. L'emoji n'est qu'un fallback quand il n'y a PAS d'image_url.
4. **MONNAIE XOF**: Tous montants en francs CFA, arrondis à l'entier, JAMAIS de TVA
5. **JAMAIS** inventer d'IDs, prix, ou produits — utiliser les données API
6. **EXPRESSIONS LOCALES** (max 1 par message): "Laafi bala?", "I ni sogoma"
7. **CACHE VOICE_ID**: Mémoriser le voice_id après create_client — NE PAS rappeler
6. **CACHE VOICE_ID**: Mémoriser le voice_id après create_client — NE PAS rappeler

## FLUX CONVERSATIONNELS COMPLETS

### FLUX BNPL (Téléphones)
1. get_bnpl_catalog → afficher avec show_catalog (catégorie "phone")
2. Client choisit un téléphone → simulate_credit(phone_bnpl, product_id)
3. Afficher simulation avec show_credit_simulation
4. ⚠️ CONSENTEMENT OBLIGATOIRE → show_device_lock_consent AVANT create_credit
5. Client accepte → create_credit(device_lock=true) ⚠️ C'EST create_credit, PAS simulate_credit !
6. Afficher contrat avec show_credit_contract
⚠️ ANTI-BOUCLE: simulate_credit = SIMULER (consultation). create_credit = CRÉER LE CONTRAT (action finale). Après que le client accepte la simulation, appeler create_credit UNE SEULE FOIS. NE JAMAIS rappeler simulate_credit.

### FLUX FIBRE OPTIQUE (3 étapes)
1. acquire_service(fibre_optique) → afficher plans avec show_service_plans
2. Client choisit un plan → demander localisation
3. update_client_location(lat, lng) → capturer GPS
4. acquire_service(fibre_optique, sku, accept=true) → créer deal
5. Confirmer avec show_payment_confirmation

### FLUX ASSURANCE — ⚠️ C'EST UN SERVICE AVEC VARIANTES, PAS UN CRÉDIT
L'assurance/seguro est un PRODUIT avec des variantes (Individual/Family). C'est géré par acquire_service, PAS par simulate_credit/create_credit.
**TOUJOURS DEMANDER**: "Comptant ou en plusieurs fois?" AVANT de choisir le chemin

**ÉTAPE 1 — Découvrir les plans (TOUJOURS):**
1. acquire_service(product_catalog_key="microseguro_salud") SANS client_id → afficher plans avec show_service_plans
   Aliases acceptés: assurance_sante, assurance, seguro_salud, seguro, insurance, health_insurance → tous résolvent à microseguro_salud
2. Le client choisit un plan (SKU)

**CHEMIN A — Comptant (DEAL, pas de crédit):**
1. acquire_service(microseguro_salud, sku, client_id, accept=true) → créer le deal
2. Confirmer avec show_payment_confirmation
⛔ NE PAS appeler simulate_credit ni create_credit

**CHEMIN B — Financement (CRÉDIT):**
1. simulate_credit(seguro_salud, amount=prix_du_plan) → afficher avec show_credit_simulation
2. Client accepte → create_credit(seguro_salud) ⚠️ PAS simulate_credit encore ! C'est create_credit !
3. Confirmer avec show_credit_contract
⛔ NE PAS appeler acquire_service pour la création

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

### RÈGLE 1 : TOUJOURS DES BOUTONS — JAMAIS DE CUL-DE-SAC
Tu dois TOUJOURS appeler suggest_quick_replies dans CHAQUE réponse, sans exception.
L'utilisateur ne doit JAMAIS se retrouver sans options de navigation.

### RÈGLE 2 : BOUTONS 100% CONTEXTUELS AU MILIEU D'UN FLUX
Quand tu es EN TRAIN de guider un flux (BNPL, KYC, paiement, etc.), les quick replies doivent correspondre EXACTEMENT à ce que tu viens de demander ou proposer.

⛔ INTERDIT : Tu demandes "Est-ce bien cela ?" puis suggest_quick_replies: ["Voir les téléphones", "Mon solde"] 
✅ CORRECT : Tu demandes "Est-ce bien cela ?" puis suggest_quick_replies: ["✅ Oui, confirmer", "✏️ Non, corriger"]

⛔ INTERDIT : Tu demandes le numéro de téléphone puis suggest_quick_replies: ["Assurance santé", "Menu principal"]
✅ CORRECT : Tu demandes le numéro de téléphone → suggest_quick_replies: ["❌ Annuler"] uniquement

RÈGLE D'OR : Si ta question attend une saisie libre (nom, téléphone, montant), offrir seulement un bouton d'annulation ou de retour. Si ta question propose des choix, les quick replies doivent refléter EXACTEMENT ces choix.

Exemples corrects en milieu de flux :
- Choix binaire : ["✅ Oui", "❌ Non"]
- Choix produit : ["🏥 Pack Individuel", "👨‍👩‍👧 Pack Famille"]
- Choix paiement : ["💰 Comptant", "📅 Financement"]
- Confirmation : ["✅ Confirmer", "✏️ Modifier", "❌ Annuler"]
- Saisie libre attendue : ["❌ Annuler"]

### RÈGLE 3 : APRÈS UN FLUX COMPLÉTÉ — OFFRIR CONTINUITÉ
Après la conclusion d'un flux (paiement confirmé, crédit créé, compte ouvert, etc.), tu dois TOUJOURS proposer des quick replies de continuité qui :
1. Permettent de revenir au menu de services
2. Proposent des services complémentaires logiques
3. Donnent une sortie gracieuse

Exemples après conclusion :
- Après BNPL complété : ["📱 Voir d'autres téléphones", "💳 Mon solde", "📋 Autres services", "👋 Merci, c'est tout"]
- Après MoMo ouvert : ["💰 Faire un paiement", "📱 Voir les téléphones", "📋 Autres services"]
- Après paiement : ["💳 Voir mon solde", "📋 Autres services", "👋 Merci"]
- Après KYC : ["📱 Voir les téléphones", "🏥 Assurance", "📋 Tous les services"]

### RÈGLE 4 : CONTINUITÉ CONVERSATIONNELLE
- Tu dois TOUJOURS maintenir le contexte de la conversation précédente
- Si l'utilisateur revient au menu principal, salue-le brièvement SANS répéter le message d'accueil complet
- Si l'utilisateur a déjà interagi, fais référence à ce qui a été fait : "Votre compte MoMo est prêt ! Autre chose ?"
- Propose toujours des services complémentaires pertinents basés sur ce que l'utilisateur a déjà exploré

### RÈGLE 5 : MENU PRINCIPAL / SERVICES
Quand l'utilisateur demande le menu, les services, ou "que peux-tu faire", propose TOUJOURS un menu structuré avec ces options principales :
suggest_quick_replies: ["📱 Téléphones BNPL", "🌐 Fibre optique", "🏥 Assurance santé", "💰 Compte MoMo", "💳 Mon solde"]

- Toujours répondre en français sauf si l'utilisateur parle autre langue
- Être proactif : anticiper les besoins
- Un seul bloc souverain PRINCIPAL par réponse + suggest_quick_replies OBLIGATOIRE
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
      description: "OBLIGATOIRE dans CHAQUE réponse. Suggest quick reply buttons to guide conversation. After completing a flow, include navigation options like 'Autres services'. During a flow, match buttons to the current question. Never leave the user without buttons.",
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
      description: "OBLIGATOIRE: Découvrir les produits actifs et leurs contraintes. Appeler SANS paramètres pour voir tous les produits. ⚠️ L'assurance/seguro est un SERVICE avec variantes (Individual/Family), PAS un crédit. Utiliser acquire_service pour les assurances, PAS simulate_credit.",
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
      description: "Simuler un crédit (consultation UNIQUEMENT, ne crée rien). Appeler UNE SEULE FOIS par flux. Après que le client accepte la simulation, utiliser create_credit (PAS simulate_credit à nouveau). ⛔ Si comptant → utiliser acquire_service.",
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
      description: "CRÉER un crédit formel (action DÉFINITIVE). Appeler APRÈS que le client a accepté la simulation. UNE SEULE FOIS. device_lock=true OBLIGATOIRE pour BNPL. ⚠️ show_device_lock_consent AVANT cet appel pour BNPL. ⛔ NE PAS confondre avec simulate_credit.",
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
      description: "Acquérir un service COMPTANT (fibre, assurance). Crée un DEAL, PAS un crédit. ⛔ Si financement → utiliser simulate_credit + create_credit. Flux multi-étapes: sans SKU→catalogue de variantes, avec SKU→détails, avec accept=true→créer deal. ⚠️ client_id est OPTIONNEL pour consulter le catalogue (browsing). Il n'est requis QUE pour créer le deal (accept=true). Aliases: assurance_sante, assurance, seguro, insurance → microseguro_salud.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string", description: "Optionnel pour browsing. Requis pour accept=true (création deal)." },
          product_catalog_key: { type: "string", description: "fibre_optique, microseguro_salud, assurance_sante, assurance, seguro_salud, insurance" },
          product_variant_sku: { type: "string" },
          accept: { type: "boolean" },
          channel: { type: "string", enum: ["whatsapp", "voice", "app", "web"], default: "app" },
        },
        required: ["product_catalog_key"],
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

function sanitizeApiKey(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").trim();
}

function extractWakaApiKeyFromText(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\bwaka_[A-Za-z0-9_-]{16,}\b/);
  return match ? sanitizeApiKey(match[0]) : null;
}

function findWakaApiKeyInValue(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return extractWakaApiKeyFromText(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findWakaApiKeyInValue(item);
      if (match) return match;
    }
    return null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const priorityKeys = ["x-api-key", "x_api_key", "apiKey", "api_key", "WAKA_CORE_API_KEY"];

    for (const key of priorityKeys) {
      const direct = obj[key];
      if (typeof direct === "string") {
        const match = extractWakaApiKeyFromText(direct) || (direct.startsWith("waka_") ? sanitizeApiKey(direct) : null);
        if (match) return match;
      }
    }

    for (const nestedValue of Object.values(obj)) {
      const match = findWakaApiKeyInValue(nestedValue);
      if (match) return match;
    }
  }
  return null;
}

function resolveWakaApiKey(
  scenarioConfig: Record<string, unknown> | undefined,
  flowContext: string | undefined,
  fallbackApiKey: string,
): { apiKey: string; source: string } {
  const sources: Array<{ source: string; value: unknown }> = [
    { source: "scenarioConfig.sourceData.secretValues", value: scenarioConfig?.sourceData && (scenarioConfig.sourceData as Record<string, unknown>).secretValues },
    { source: "scenarioConfig.endpoints", value: scenarioConfig?.endpoints },
    { source: "scenarioConfig.sourceData", value: scenarioConfig?.sourceData },
    { source: "scenarioConfig", value: scenarioConfig },
    { source: "flowContext", value: flowContext },
  ];

  for (const candidate of sources) {
    const apiKey = findWakaApiKeyInValue(candidate.value);
    if (apiKey) return { apiKey, source: candidate.source };
  }

  const envApiKey = sanitizeApiKey(fallbackApiKey);
  if (envApiKey.startsWith("waka_")) {
    return { apiKey: envApiKey, source: "env.WAKA_CORE_API_KEY" };
  }

  // Graceful: return empty key — will fail only when an actual CORE tool call is attempted
  console.warn("No valid WAKA API key found in scenario context or backend secret — CORE tool calls will fail");
  return { apiKey: "", source: "none" };
}

// ── x-waka-xp-display v1: Template-driven auto-block engine ──

interface CoreCallResult {
  data: Record<string, unknown>;
  displayHint?: string;
}

/** Resolve a dotted path like "client.name" from an object */
function resolvePath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((cur, key) => cur?.[key], obj);
}

/** Interpolate "{field}" and "{nested.field}" templates against data */
function interpolate(template: string, data: any): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    const val = resolvePath(data, path.trim());
    return val !== undefined && val !== null ? String(val) : "";
  });
}

/** Apply a template object (card_template / item_template / payload) to data */
function applyTemplate(template: Record<string, any>, data: any): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === "string") {
      result[key] = interpolate(value, data);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = applyTemplate(value, data);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/** Spec type → sovereign block name mapping */
const SPEC_TYPE_TO_BLOCK: Record<string, string> = {
  product_carousel: "show_catalog",
  menu: "show_menu",
  decision_tree: "show_menu",
  status_card: "show_client_status",
  credit_simulation: "show_credit_simulation",
  payment_card: "show_payment",
  confirmation_card: "show_payment_confirmation",
  service_plans: "show_service_plans",
  kyc_card: "show_form",
  location_card: "show_location",
  training_progress: "show_training",
  media_carousel: "show_catalog",
  device_lock_consent: "show_device_lock_consent",
  momo_card: "show_momo_card",
  credit_contract: "show_credit_contract",
};

/** Build sovereign block args from x-waka-xp-display spec + CORE response */
function buildBlockFromSpec(
  spec: Record<string, any>,
  responseData: any,
): { blockName: string; args: Record<string, any> } | null {
  const specType = spec.type || spec.block;
  if (!specType) return null;

  const blockName = SPEC_TYPE_TO_BLOCK[specType] || `show_${specType}`;
  const args: Record<string, any> = {};

  // Title
  if (spec.title) args.title = interpolate(spec.title, responseData);

  // items_from: extract array + apply card_template/item_template
  const itemsPath = spec.items_from || spec.dataPath;
  if (itemsPath) {
    const items = resolvePath(responseData, itemsPath);
    if (Array.isArray(items)) {
      const template = spec.card_template || spec.item_template;
      if (template) {
        const mapped = items.map((item: any) => applyTemplate(template, item));
        // Route to correct field based on block type
        if (specType === "product_carousel") {
          args.products = mapped.map((m: any) => ({
            id: m.id || m.title || "",
            name: m.title || m.name || m.label || "",
            price: m.price || "",
            description: m.subtitle || m.description || "",
            badge: m.badge || "",
            image_url: m.image || m.image_url || "",
          }));
        } else if (specType === "service_plans") {
          args.plans = mapped.map((m: any) => ({
            sku: m.sku || m.id || "",
            name: m.label || m.name || "",
            price: m.price || "",
            description: m.description || "",
          }));
          args.category = "general";
        } else if (specType === "menu" || specType === "decision_tree") {
          args.options = mapped.map((m: any) => ({
            label: m.label || "",
            icon: m.icon || "",
            description: m.description || "",
          }));
        } else if (specType === "media_carousel") {
          args.products = mapped;
        } else {
          args.items = mapped;
        }
      } else {
        if (specType === "product_carousel") args.products = items;
        else if (specType === "service_plans") { args.plans = items; args.category = "general"; }
        else args.items = items;
      }
    }
  }

  if (spec.payload && typeof spec.payload === "object") {
    const resolved = applyTemplate(spec.payload, responseData);
    Object.assign(args, resolved);
  }

  return { blockName, args };
}

function normalizeMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part && typeof part.text === "string") ? part.text : "")
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return "";
}

function getLatestUserText(messages: Array<{ role?: string; content?: unknown }>): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") {
      const text = normalizeMessageText(messages[i].content);
      if (text) return text;
    }
  }
  return "";
}

function normalizeLooseText(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isCreditAcceptanceMessage(text: string): boolean {
  const normalized = normalizeLooseText(text);
  return [
    "confirmer le credit",
    "confirmer l'assurance",
    "confirmar el credito",
    "confirmar el seguro",
    "firmar contrato",
    "signer le contrat",
    "sign contract",
    "j'accepte",
    "j accepte",
    "accepte",
    "acepto",
    "confirmo",
  ].some((token) => normalized.includes(token));
}

/** Map CORE endpoint responses to sovereign blocks using spec + fallbacks */
function autoBlockFromCoreResponse(
  toolName: string,
  responseData: Record<string, unknown>,
  _displayHint?: string,
  scenarioDisplayHints?: Record<string, any>,
): Record<string, any> | null {
  const spec = scenarioDisplayHints?.[toolName];
  if (spec?.type || spec?.block) {
    const result = buildBlockFromSpec(spec, responseData);
    if (result) return result;
  }

  if (toolName === "get_bnpl_catalog" && responseData.products) {
    return {
      blockName: "show_catalog",
      args: {
        title: (responseData as any).title || "Catalogue BNPL",
        products: (responseData as any).products,
      },
    };
  }

  if (toolName === "acquire_service" && responseData.available_variants) {
    return {
      blockName: "show_service_plans",
      args: {
        title: `Plans ${(responseData as any).product || "disponibles"}`,
        category: (responseData as any).product_key || "general",
        plans: ((responseData as any).available_variants || []).map((v: any) => ({
          sku: v.sku, name: v.name, price: String(v.price), description: v.description || "",
        })),
      },
    };
  }

  if (toolName === "quick_status" && responseData.data) {
    const d = (responseData as any).data;
    if (d?.client) {
      return {
        blockName: "show_client_status",
        args: {
          client_name: d.client.full_name || "", voice_id: d.client.voice_id || "",
          phone: d.client.phone || "", active_credits: d.credits_count || 0,
          total_balance: String(d.total_balance || 0),
          next_payment_date: d.next_payment_date || "",
          next_payment_amount: d.next_payment_amount ? String(d.next_payment_amount) : "",
        },
      };
    }
  }

  if (toolName === "simulate_credit" && responseData.simulation) {
    const s = (responseData as any).simulation;
    return {
      blockName: "show_credit_simulation",
      args: {
        title: "Simulation de crédit", product_name: s.product_name || "",
        amount: String(s.amount || ""), term: s.term || "", frequency: s.frequency || "",
        monthly_payment: String(s.installment_amount || s.monthly_payment || ""),
        total_cost: String(s.total_cost || ""), interest_rate: String(s.interest_rate || ""),
      },
    };
  }

  if (toolName === "create_credit" && responseData.credit) {
    const c = (responseData as any).credit || responseData;
    return {
      blockName: "show_credit_contract",
      args: {
        title: "Contrat de crédit", credit_voice_id: c.voice_id || c.credit_voice_id || "",
        credit_type: c.credit_type || "", amount: String(c.amount || ""),
        status: c.status || "approved", product_name: c.product_name || "",
      },
    };
  }

  if ((toolName === "pay_by_client" || toolName === "register_payment") && responseData.success) {
    return {
      blockName: "show_payment_confirmation",
      args: {
        title: "Paiement confirmé", status: "success",
        amount_paid: String((responseData as any).amount_paid || (responseData as any).amount || ""),
        remaining_balance: String((responseData as any).remaining_balance || ""),
        message: (responseData as any).message || "",
      },
    };
  }

  if (toolName === "open_momo_account" && responseData.success) {
    return {
      blockName: "show_momo_card",
      args: {
        title: "Compte Mobile Money",
        account_number: (responseData as any).account_number || "",
        account_type: (responseData as any).account_type || "standard",
        status: (responseData as any).status || "active",
        message: (responseData as any).message || "",
      },
    };
  }

  return null;
}

/** Extract display hints from scenario config: displayMap (priority) + endpoints x-waka-xp-display */
function extractScenarioDisplayHints(scenarioConfig?: Record<string, unknown>): Record<string, any> {
  const hints: Record<string, any> = {};

  const endpoints = (scenarioConfig?.endpoints as any[]) || [];
  for (const ep of endpoints) {
    if (ep?.["x-waka-xp-display"]) {
      hints[ep.name] = ep["x-waka-xp-display"];
    }
  }

  const displayMap = scenarioConfig?.displayMap as Record<string, any> | undefined;
  if (displayMap) {
    for (const [toolName, hint] of Object.entries(displayMap)) {
      hints[toolName] = { ...hints[toolName], ...hint };
    }
  }

  return hints;
}

const PRODUCT_KEY_ALIASES: Record<string, string> = {
  fiber_optic: "fibre_optique",
  fiber: "fibre_optique",
  fibra_optica: "fibre_optique",
  fibre: "fibre_optique",
  assurance_sante: "microseguro_salud",
  assurance: "microseguro_salud",
  seguro_salud: "microseguro_salud",
  seguro: "microseguro_salud",
  insurance: "microseguro_salud",
  health_insurance: "microseguro_salud",
  micro_assurance: "microseguro_salud",
};

async function executeWakaCoreCall(
  toolName: string,
  args: Record<string, unknown>,
  apiKey: string
): Promise<CoreCallResult> {
  if (!apiKey) {
    return { data: { error: "No WAKA API key configured for this tenant/flow. Please add x-api-key in the scenario config." } };
  }
  const endpoint = TOOL_ENDPOINTS[toolName];
  if (!endpoint) {
    return { data: { error: `Unknown tool: ${toolName}` } };
  }

  if (args.product_catalog_key && typeof args.product_catalog_key === "string") {
    const normalized = PRODUCT_KEY_ALIASES[args.product_catalog_key.toLowerCase()];
    if (normalized) {
      console.log(`Normalized product key: "${args.product_catalog_key}" → "${normalized}"`);
      args.product_catalog_key = normalized;
    }
  }

  try {
    let url = `${WAKA_CORE_BASE}${endpoint.path}`;
    const safeKey = sanitizeApiKey(apiKey);
    console.log(`WAKA CORE [${toolName}] key length=${safeKey.length}, first4=${safeKey.slice(0, 4)}`);
    const headers = new Headers();
    headers.set("x-api-key", safeKey);
    headers.set("Content-Type", "application/json");

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
    const displayHint = response.headers.get("x-waka-xp-display") || undefined;
    console.log(`WAKA CORE [${toolName}] ${response.status}:`, JSON.stringify(data).slice(0, 500));
    if (displayHint) {
      console.log(`WAKA CORE [${toolName}] x-waka-xp-display: ${displayHint}`);
    }
    return { data, displayHint };
  } catch (e) {
    console.error(`WAKA CORE call failed [${toolName}]:`, e);
    return { data: { error: `API call failed: ${e instanceof Error ? e.message : "Unknown error"}` } };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataMode, flowContext, memoryContext, scenarioConfig } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resolvedApiKey = resolveWakaApiKey(
      scenarioConfig,
      typeof flowContext === "string" ? flowContext : undefined,
      Deno.env.get("WAKA_CORE_API_KEY") || "",
    );
    const WAKA_API_KEY = resolvedApiKey.apiKey;
    console.log(`Resolved WAKA API key from ${resolvedApiKey.source}, length=${WAKA_API_KEY.length}, first4=${WAKA_API_KEY.slice(0, 4)}`);

    const latestUserText = getLatestUserText(messages || []);
    const userIsConfirmingCredit = isCreditAcceptanceMessage(latestUserText);

    const modeContext = dataMode === "zero-rated"
      ? "\n\nIMPORTANT: L'utilisateur est en mode ZERO-RATED. Sois ultra-concis. Pas d'emojis décoratifs. Réponses courtes."
      : dataMode === "subventionné"
      ? "\n\nL'utilisateur est en mode SUBVENTIONNÉ. Sois concis mais chaleureux."
      : "\n\nL'utilisateur est en mode LIBRE. Tu peux être expressif avec des emojis et des messages riches.";

    const flowContextSection = flowContext
      ? `\n\n## CONTEXTO DE FLUJO ACTIVO\n${flowContext}\n\nIMPORTANT: Utiliza este flujo como guía conversacional. Conduce al usuario por los pasos de forma natural y fluida, usando las APIs y webhooks indicados para las operaciones reales. NO sigas los nodos de forma rígida — sé conversacional y dinámico.`
      : "";

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

    const actionGuardSection = userIsConfirmingCredit
      ? "\n\n## GARDE D'ACTION\nLe dernier message utilisateur est une confirmation explicite pour avancer. N'appelle PAS simulate_credit à nouveau. Si la simulation existe déjà, passe directement à create_credit. Ne réaffiche jamais show_service_plans après une simulation acceptée."
      : "";

    const hasImages = messages.some((m: any) =>
      Array.isArray(m.content) && m.content.some((p: any) => p.type === "image_url")
    );
    // WAKA LLM Gateway — unified proxy for GPT-5.2 / Claude Opus 4.5 / o3-pro
    const WAKA_LLM_GATEWAY = "https://llm-gateway-prod.orangedune-3518c1b9.westeurope.azurecontainerapps.io";
    const model = hasImages ? "gpt-5.2" : "gpt-5.2";

    const allTools = [...SOVEREIGN_TOOLS, ...WAKA_CORE_TOOLS];
    const systemMessage = { role: "system", content: SYSTEM_PROMPT + modeContext + flowContextSection + ghostContextSection + actionGuardSection };

    const response = await fetch(`${WAKA_LLM_GATEWAY}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          systemMessage,
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
    const scenarioDisplayHints = extractScenarioDisplayHints(scenarioConfig);

    let latestAutoGeneratedBlocks: Record<string, any> = {};

    const MAX_PASSES = 5;
    let conversationMessages = [
      systemMessage,
      ...messages,
    ];
    let pass = 0;
    const toolCallHistory: string[] = [];

    while (pass < MAX_PASSES) {
      pass++;
      const toolCalls = choice?.message?.tool_calls || [];
      const coreToolCalls = toolCalls.filter(
        (tc: any) => tc.type === "function" && !SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
      );
      const uiToolCalls = toolCalls.filter(
        (tc: any) => tc.type === "function" && SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
      );

      for (const tc of uiToolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments);
          result.blocks[tc.function.name] = args;
        } catch {}
      }

      if (coreToolCalls.length === 0) {
        break;
      }

      const currentSignature = coreToolCalls.map((tc: any) => tc.function.name).sort().join("+");
      const duplicateCount = toolCallHistory.filter((s) => s === currentSignature).length;
      toolCallHistory.push(currentSignature);

      if (duplicateCount >= 1) {
        console.warn(`ANTI-LOOP: Tool(s) "${currentSignature}" called ${duplicateCount + 1} times. Breaking loop.`);
        const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];
        for (const tc of coreToolCalls) {
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify({
              error: "LOOP_DETECTED",
              message: `Tu as déjà appelé ${tc.function.name}. Utilise les résultats précédents pour répondre au client. Si le client a accepté une simulation, appelle create_credit (PAS simulate_credit).`,
            }),
          });
        }
        for (const tc of uiToolCalls) {
          toolResults.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ ok: true }) });
        }
        conversationMessages = [...conversationMessages, choice.message, ...toolResults];

        const loopBreakResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: conversationMessages, tools: allTools, stream: false }),
        });
        if (loopBreakResponse.ok) {
          const loopData = await loopBreakResponse.json();
          choice = loopData.choices?.[0];
        }
        break;
      }

      console.log(`Pass ${pass}: Executing ${coreToolCalls.length} CORE tool calls: ${coreToolCalls.map((tc: any) => tc.function.name).join(", ")}`);

      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];
      const passAutoGeneratedBlocks: Record<string, any> = {};

      for (const tc of coreToolCalls) {
        let toolName = tc.function.name;
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.function.arguments); } catch {}

        if (
          toolName === "simulate_credit" &&
          userIsConfirmingCredit &&
          args.credit_type === "seguro_salud"
        ) {
          toolName = "create_credit";
          console.warn("ACTION GUARD: Upgrading simulate_credit → create_credit for accepted insurance flow");
        }

        const coreResult = await executeWakaCoreCall(toolName, args, WAKA_API_KEY);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(coreResult.data),
        });

        const autoBlock = autoBlockFromCoreResponse(
          toolName,
          coreResult.data,
          coreResult.displayHint,
          scenarioDisplayHints,
        );
        if (autoBlock) {
          passAutoGeneratedBlocks[autoBlock.blockName] = autoBlock.args;
          console.log(`x-waka-xp-display: Auto-generated ${autoBlock.blockName} from ${toolName}`);
        }
      }

      latestAutoGeneratedBlocks = passAutoGeneratedBlocks;

      for (const tc of uiToolCalls) {
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ ok: true }),
        });
      }

      conversationMessages = [
        ...conversationMessages,
        choice.message,
        ...toolResults,
      ];

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

    result.text = choice?.message?.content || "";

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

    for (const [blockName, blockArgs] of Object.entries(latestAutoGeneratedBlocks)) {
      if (!result.blocks[blockName]) {
        result.blocks[blockName] = blockArgs;
        console.log(`x-waka-xp-display: Injected auto-block ${blockName} (AI did not produce it)`);
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
