
UPDATE public.player_saved_flows 
SET scenario_config = jsonb_set(
  jsonb_set(
    scenario_config,
    '{endpoints}',
    '[
      {"name":"get_product_rules","description":"Découvrir les produits actifs et contraintes du tenant (PREMIER APPEL OBLIGATOIRE)"},
      {"name":"get_bnpl_catalog","description":"Catalogue des téléphones BNPL (prix et stock en temps réel)","x-waka-xp-display":{"block":"catalog","title":"Catalogue BNPL","dataPath":"products"}},
      {"name":"create_client","description":"Rechercher ou créer un client (onboarding léger: nom + téléphone)"},
      {"name":"update_client","description":"Modifier les données du client"},
      {"name":"lookup_entity","description":"Recherche universelle (client, crédit ou paiement par voice_id, téléphone, nom)"},
      {"name":"upload_kyc_media","description":"Upload frontal CNI (optionnel, auto-OCR)"},
      {"name":"client_credits","description":"Lister les crédits d un client avec filtres (active, completed)","x-waka-xp-display":{"block":"client_status","title":"Crédits client"}},
      {"name":"simulate_credit","description":"Simuler un crédit (paiement en plusieurs fois uniquement)","x-waka-xp-display":{"block":"credit_simulation","title":"Simulation de crédit"}},
      {"name":"create_credit","description":"Créer un crédit formel (BNPL ou assurance financée) — UNE SEULE FOIS","x-waka-xp-display":{"block":"credit_contract","title":"Contrat de crédit"}},
      {"name":"pay_by_client","description":"Paiement simplifié auto-détection (1 crédit actif)","x-waka-xp-display":{"block":"payment_confirmation","title":"Confirmation paiement"}},
      {"name":"register_payment","description":"Paiement à un crédit spécifique (N crédits actifs)","x-waka-xp-display":{"block":"payment_confirmation","title":"Confirmation paiement"}},
      {"name":"get_payment_options","description":"Montants de paiement suggérés (minimum, courant, liquidation)"},
      {"name":"acquire_service","description":"Acquérir un service COMPTANT (fibre, assurance directe — PAS de crédit)","x-waka-xp-display":{"block":"service_plans","title":"Plans disponibles","dataPath":"available_variants"}},
      {"name":"update_client_location","description":"Capturer coordonnées GPS pour installation fibre"},
      {"name":"open_momo_account","description":"Ouverture de compte Mobile Money (standard ou merchant)","x-waka-xp-display":{"block":"momo_card","title":"Compte MoMo"}},
      {"name":"quick_status","description":"Résumé rapide du solde et paiements (optimisé voix)","x-waka-xp-display":{"block":"client_status","title":"Statut client"}}
    ]'::jsonb
  ),
  '{displayMap}',
  '{
    "get_bnpl_catalog": {"block":"show_catalog","title":"Catalogue BNPL","dataPath":"products"},
    "acquire_service": {"block":"show_service_plans","title":"Plans disponibles","dataPath":"available_variants"},
    "simulate_credit": {"block":"show_credit_simulation","title":"Simulation de crédit","dataPath":"simulation"},
    "create_credit": {"block":"show_credit_contract","title":"Contrat de crédit","dataPath":"credit"},
    "quick_status": {"block":"show_client_status","title":"Statut client","dataPath":"data"},
    "pay_by_client": {"block":"show_payment_confirmation","title":"Paiement confirmé"},
    "register_payment": {"block":"show_payment_confirmation","title":"Paiement confirmé"},
    "open_momo_account": {"block":"show_momo_card","title":"Compte MoMo"}
  }'::jsonb
)
WHERE id = '9c52ece4-3706-489c-ae67-7bf43b915596';
