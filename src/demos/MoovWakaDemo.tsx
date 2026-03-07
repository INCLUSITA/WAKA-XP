import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   BRAND — Moov Africa BF x WAKA
══════════════════════════════════════════════════════════════ */
const C = {
  moovBlue:   "#003DA5",   // Moov primary blue
  moovCyan:   "#00AEEF",   // Moov accent cyan
  moovWhite:  "#FFFFFF",
  wakaNavy:   "#0D1B4B",
  wakaGold:   "#F0932B",
  waBg:       "#ECE5DD",
  waBubbleBot:"#FFFFFF",
  waBubbleUser:"#DCF8C6",
  waHeader:   "#003DA5",
  waGreen:    "#128C7E",
  ok:         "#25D366",
  red:        "#E74C3C",
  blue:       "#3498DB",
  purple:     "#8B5CF6",
  amber:      "#F59E0B",
  cyan:       "#00AEEF",
  teal:       "#14B8A6",
  orange:     "#EA580C",
  moovMoney:  "#FF6B00",
};


/* ══════════════════════════════════════════════════════════════
   CODE-SWITCHING — FR / MOORÉ / DYULA
   Strategy: greetings + key phrases in local language,
   technical/numbers stay in French (authentic BF code-switching)
══════════════════════════════════════════════════════════════ */
const LS = {
  fr: {
    welcome_gsm:    "🇧🇫 *Bonjour Oumarou !*\n\nIci Moov Africa Burkina Faso 👋",
    welcome_react:  "💤 *Bonjour Aminata !*\n\nNous avons détecté que votre compte Moov Money est *inactif depuis 203 jours*.",
    welcome_agent:  "🏪 *Bonjour et bienvenue sur Moov Agent !* 🇧🇫\n\nJe suis votre assistant WAKA pour l'enrôlement des *agents et marchands*.",
    welcome_lead:   "👋 *Bonjour et bienvenue chez Moov Africa BF !* 🇧🇫\n\nJe suis votre assistant WAKA.",
    welcome_fibre:  "🌐 *Bonjour !* Vous avez demandé des informations sur la *Fibre Moov*.",
    yes_subscribe:  "✅ Oui, m'inscrire",
    yes_reactivate: "✅ Réactiver mon compte",
    processing:     "⏳ Traitement en cours...",
    confirmed:      "✅ Confirmé",
    cancel:         "❌ Annuler",
    confirm_btn:    "✅ Confirmer",
    offer_label:    "🎁 *Offre spéciale :*",
    bonus_500:      "*500 FCFA offerts !*",
    lang_flag:      "🇧🇫 FR",
    kyc_intro:      "🪪 *Vérification d'identité (KYC)*\n\nChoisissez votre document :",
    kyb_intro:      "🏪 *Bonjour et bienvenue sur Moov Agent !* 🇧🇫\n\nJe suis votre assistant WAKA pour l'enrôlement des *agents et marchands*.",
    type_commerce:  "Quel est le *type de votre commerce* ?",
    nom_commerce:   "Parfait ! Quel est le *nom officiel* de votre commerce ?",
    ville_secteur:  "📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
    num_moov:       "📱 Quel est le *numéro Moov* du gérant ?\n_(Sera lié au compte Agent Moov)_",
    send_cnib:      "Envoyez la *CNIB* du gérant :",
    equip_choix:    "*Quel équipement de paiement souhaitez-vous ?*",
    merci:          "Merci !",
    super:          "Super !",
    parfait:        "Parfait !",
    tag_greeting:   "Salutation",
  },
  moore: {
    welcome_gsm:    "🇧🇫 *Ne y windg, Oumarou !* (Bonjour !)\n\nMoov Africa Burkina Faso la 👋\n_Tõnd welga fo !_ (Nous sommes contents de te voir !)",
    welcome_react:  "💤 *Ne y windg, Aminata !*\n\n_A Moov Money roog ka yõog ye_ — compte inactif depuis *203 jours*.",
    welcome_agent:  "🏪 *Ne y windg, Moov Agent zuɣu !* 🇧🇫\n\n_WAKA n tõnd sõamb yãmb_ (WAKA vous accompagne)\npour l'enrôlement des *agents et marchands*.",
    welcome_lead:   "👋 *Ne y windg !* 🇧🇫 Bienvenue chez Moov Africa BF !\n\n_Fo sõng yãmb sida ?_ (Comment puis-je vous aider ?)",
    welcome_fibre:  "🌐 *Ne y windg !* Vous avez demandé des informations sur la *Fibre Moov*.\n_Tõnd na wilg fo_ (Nous allons vous expliquer).",
    yes_subscribe:  "✅ Oui — _Mam datɩ_ (Je veux !)",
    yes_reactivate: "✅ Oui — _Kell n kõ togs_ (Réactiver)",
    processing:     "⏳ _A yõog pʋg..._ Traitement en cours...",
    confirmed:      "✅ _Nonga !_ Confirmé",
    cancel:         "❌ _Pag yaa_ — Annuler",
    confirm_btn:    "✅ _Mam maneg_ — Confirmer",
    offer_label:    "🎁 *_Naf-kõore_ (Cadeau spécial) :*",
    bonus_500:      "*500 FCFA — _n kõ kõ fo !_* (offerts !)",
    lang_flag:      "🫅 Mooré",
    kyc_intro:      "🪪 *KYC — Vérification identité*\n\n_Fo KYC pids yell_ — Envoyez votre document :",
    kyb_intro:      "🏪 *Ne y windg, Moov Agent zuɣu !* 🇧🇫\n\n_WAKA n tõnd sõamb yãmb_\npour l'enrôlement des *agents et marchands*.",
    type_commerce:  "_Fo tɩɩg bõe la ?_ (Quel type de commerce ?)",
    nom_commerce:   "_Tɩɩg yʋʋre la bõe ?_ (Quel est le nom de votre commerce ?)",
    ville_secteur:  "📍 _Fo be yɛng la ?_ (Où êtes-vous situé ?)",
    num_moov:       "📱 _Fo Moov nõmoor la bõe ?_\n_(Sera lié au compte Agent Moov)_",
    send_cnib:      "_Tʋm fo CNIB_ — Envoyez votre CNIB :",
    equip_choix:    "_Bõe la fo data ?_ (Quel équipement souhaitez-vous ?)",
    merci:          "_Baarakɩ !_ Merci !",
    super:          "_Nonga !_ Super !",
    parfait:        "_Yaa sõama !_ Parfait !",
    tag_greeting:   "Kõ sebre — Mooré",
  },
  dyula: {
    welcome_gsm:    "🇧🇫 *I ni sogoma, Oumarou !* (Bonjour !)\n\nMoov Africa Burkina Faso ye 👋\n_An b'i fe !_ (Nous sommes contents !)",
    welcome_react:  "💤 *I ni sogoma, Aminata !*\n\n_I ka Moov Money compte tun_ — inactif depuis *203 jours*.",
    welcome_agent:  "🏪 *I ni sogoma, Moov Agent !* 🇧🇫\n\n_WAKA b'i dɛmɛ_ (WAKA vous accompagne)\npour l'enrôlement des *agents et marchands*.",
    welcome_lead:   "👋 *I ni sogoma !* 🇧🇫 Bienvenue chez Moov Africa BF !\n\n_N bɛ se ka i dɛmɛ cogo di ?_ (Comment puis-je vous aider ?)",
    welcome_fibre:  "🌐 *I ni sogoma !* Vous avez demandé des informations sur la *Fibre Moov*.\n_An bɛ a fɔ i ye_ (Nous allons vous expliquer).",
    yes_subscribe:  "✅ Oui — _Nse_ (Je veux !)",
    yes_reactivate: "✅ Oui — _A to segin_ (Réactiver)",
    processing:     "⏳ _A bɛ tɛmɛ..._ Traitement en cours...",
    confirmed:      "✅ _Hɛrɛ !_ Confirmé",
    cancel:         "❌ _A bɔ_ — Annuler",
    confirm_btn:    "✅ _N sɔnna_ — Confirmer",
    offer_label:    "🎁 *_Jiɲɛ kɛrɛnkɛrɛnnen_ (Offre spéciale) :*",
    bonus_500:      "*500 FCFA — _i ka sɔrɔ !_* (offerts !)",
    lang_flag:      "🫅 Dioula",
    kyc_intro:      "🪪 *KYC — Vérification identité*\n\n_I ka sɛbɛ ci_ — Envoyez votre document :",
    kyb_intro:      "🏪 *I ni sogoma, Moov Agent !* 🇧🇫\n\n_WAKA b'i dɛmɛ_\npour l'enrôlement des *agents et marchands*.",
    type_commerce:  "_I ka baaraden cogo jumɛn lo ?_ (Quel type de commerce ?)",
    nom_commerce:   "_I ka baaraden tɔgɔ bɛ mun ?_ (Quel est le nom de votre commerce ?)",
    ville_secteur:  "📍 _I bɛ min lo ?_ (Où êtes-vous situé ?)",
    num_moov:       "📱 _I ka Moov nimɔrɔ bɛ jumɛn ?_\n_(Sera lié au compte Agent Moov)_",
    send_cnib:      "_I ka CNIB ci_ — Envoyez votre CNIB :",
    equip_choix:    "_I b'a fɛ cogo jumɛn ?_ (Quel équipement souhaitez-vous ?)",
    merci:          "_I ni cɛ !_ Merci !",
    super:          "_Hɛrɛ !_ Super !",
    parfait:        "_A ka nɔgɔn !_ Parfait !",
    tag_greeting:   "Kuma — Dioula",
  },
};

/* ══════════════════════════════════════════════════════════════
   MOOV AFRICA BF LOGO (SVG inline)
══════════════════════════════════════════════════════════════ */
const MoovLogo = () => (
  <svg viewBox="0 0 80 80" width="33" height="33" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="12" fill="#003DA5"/>
    <text x="40" y="30" textAnchor="middle" fill="#00AEEF" fontSize="11" fontWeight="900" fontFamily="Arial,sans-serif">MOOV</text>
    <text x="40" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700" fontFamily="Arial,sans-serif">AFRICA</text>
    <rect x="14" y="50" width="52" height="2" rx="1" fill="#FF6B00"/>
    <text x="40" y="64" textAnchor="middle" fill="#FF6B00" fontSize="7.5" fontWeight="800" fontFamily="Arial,sans-serif">BF</text>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   ONBOARDING SEQUENCES — BURKINA FASO
══════════════════════════════════════════════════════════════ */
const RAW_ONBOARDING: Record<string, any[]> = {
  gsm2money: [
    { from:"bot", delay:0,    text:"__LS_welcome_gsm__" + "\n\nNous avons remarqué que vous utilisez Moov depuis *2 ans* mais vous n'avez pas encore de compte *Moov Money*.", tag:"WAKA NEXUS → WhatsApp · " + "__LS_tag_greeting__" },
    { from:"bot", delay:1400, text:"💰 Avec *Moov Money* vous pouvez :\n✅ Envoyer & recevoir de l'argent\n✅ Payer vos factures SONABEL / ONEA\n✅ Acheter du crédit Moov\n✅ Payer en boutiques partenaires\n\nTout depuis votre téléphone, *sans compte bancaire.*" },
    { from:"bot", delay:1200, text:"🎁 *Offre spéciale :*\nOuvrez votre Moov Money aujourd'hui et recevez *500 FCFA offerts !*\n\nVoulez-vous créer votre compte maintenant ?", tag:"AXIOM Brain — Offer Engine", choices:["__LS_yes_subscribe__","❌ Non merci"] },
    { from:"bot", delay:800,  text:"__LS_kyc_intro__", tag:"AXIOM Brain — KYC Init", choices:["🪪 CNIB (Carte Nationale)","📘 Passeport","🪖 Carte militaire"] },
    { from:"bot", delay:700,  text:"📸 Parfait ! Envoyez une photo de votre *CNIB* (recto + verso) :", tag:"WAKA AXIOM — Document Intelligence" },
    { from:"user", delay:1800,type:"image", text:"CNIB_Oumarou_Sawadogo.jpg", icon:"🪪" },
    { from:"bot", delay:400,  type:"processing", text:"⏳ Analyse IA de votre CNIB...", tag:"WAKA AXIOM OCR + AXIOM Brain" },
    { from:"bot", delay:2200, text:"✅ *Identité vérifiée !*\n\n👤 Oumarou Sawadogo\n📅 22/08/1990 · Ouagadougou\n🆔 CNIB: BF-5831047-OUA\n✅ BCEAO — Sans restrictions\n✅ AML/LFT — OK", tag:"AXIOM Brain — KYC Clear ✓" },
    { from:"bot", delay:1000, text:"🎉 *Compte Moov Money créé !*\n\n📱 Numéro : *+226 70 123 456*\n💰 Solde initial : *500 FCFA* 🎁\n🔐 PIN temporaire envoyé par SMS\n\n*Bienvenue dans Moov Money !* 💙🇧🇫", tag:"Moov Core API — Account Created ✓", DONE:true },
  ],

  reactivation: [
    { from:"system", delay:0,   text:"WAKA NEXUS — Compte dormant détecté\nDernière TX : il y a 203 jours · Solde : 8.750 FCFA", tag:"WAKA NEXUS — Moov Dormant API Trigger" },
    { from:"bot",    delay:1000, text:"🇧🇫 *Bonjour Aminata !*\n\nIci Moov Money 👋\n\nVotre compte Moov Money est *inactif depuis 203 jours*.", tag:"WAKA NEXUS → WhatsApp" },
    { from:"bot",    delay:1400, text:"💰 *Votre solde de 8.750 FCFA vous attend !*\n\n⚠️ Selon les conditions BCEAO, les comptes inactifs +180 jours peuvent être soumis à des frais de maintenance." },
    { from:"bot",    delay:1200, text:"🎁 *Offre de réactivation :*\n• 0% frais sur votre prochaine transaction\n• *+300 FCFA* bonus de retour\n\nQue souhaitez-vous faire ?", tag:"AXIOM Brain — Re-engagement Offer", choices:["__LS_yes_reactivate__","📞 Parler à un agent Moov"] },
    { from:"bot",    delay:800,  text:"🔐 *Vérification de sécurité*\n\nEntrez les *4 derniers chiffres* de votre CNIB pour protéger votre compte :", tag:"AXIOM Brain — Security Check" },
    { from:"user",   delay:1800, text:"3  9  1  4" },
    { from:"bot",    delay:400,  type:"processing", text:"⏳ Vérification en cours...", tag:"Moov API — Identity Validation" },
    { from:"bot",    delay:1500, text:"✅ *Identité confirmée !*\n\nVotre compte Moov Money est *réactivé*.\n\n💰 *Solde mis à jour :*\n• Solde précédent : 8.750 FCFA\n• Bonus retour : +300 FCFA\n• *Total : 9.050 FCFA* 🎉\n\n🎁 Payez votre prochaine facture SONABEL avec *0% de frais* !", tag:"Moov Core API — Account Reactivated ✓", DONE:true },
  ],

  fibre_product: [
    { from:"bot",  delay:0,    text:"🌐 *Bonjour ! Bienvenue chez Moov Africa BF !* 🇧🇫\n\nJe suis votre assistant WAKA. Je vois que vous êtes intéressé par nos offres *Fibre Optique*.\n\nPuis-je vous aider à trouver l'offre idéale ?", tag:"WAKA NEXUS → WhatsApp — Fibre Funnel" },
    { from:"bot",  delay:1200, text:"🚀 *Nos offres Fibre Optique Moov Africa :*\n\n⚡ 50 Mbps — 15.000 FCFA\n⚡ 100 Mbps — 24.900 FCFA (+4Go data +2H appels)\n⚡ 200 Mbps — 30.000 FCFA (+4Go data +2H appels)\n⚡ 300 Mbps — 40.000 FCFA (+5Go data +4H appels)\n⚡ 400 Mbps — 105.020 FCFA (+8Go data +4H appels)\n\nEngagement : 1 ou 2 ans\n\nQuel débit vous intéresse ?", tag:"WAKA NEXUS — Fibre Catalog API",
      choices:["⚡ 50 Mbps / 15.000F","⚡ 100 Mbps / 24.900F","⚡ 200 Mbps / 30.000F","⚡ 300 Mbps / 40.000F","⚡ 400 Mbps / 105.020F"] },
    { from:"bot",  delay:900,  text:"✅ Excellent choix ! *Fibre 200 Mbps à 30.000 FCFA/mois*\n\n📦 *Inclus dans votre offre :*\n📶 200 Mbps symétrique\n📱 +4Go data mobile/mois\n📞 +2H appels vers mobiles & fixes Moov\n📅 Durée bénéfice : Tous les mois\n📋 Engagement : 1 ou 2 ans\n\nPour organiser l'installation, j'ai besoin de vos informations :\n\n👤 Quel est votre *nom complet* ?" },
    { from:"user", delay:2000, text:"Seydou Compaoré" },
    { from:"bot",  delay:700,  text:"📱 *Merci Seydou !*\n\nQuel est votre *numéro de téléphone* ?" },
    { from:"user", delay:1500, text:"+226 76 458 912" },
    { from:"bot",  delay:600,  text:"📍 *Localisation pour l'installation*\n\nPour vérifier la couverture fibre et programmer l'installation, puis-je accéder à votre *position GPS* ?", tag:"WAKA NEXUS — GPS + Coverage Check", choices:["📍 Partager ma position","🏠 Entrer mon adresse"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Localisation & vérification couverture...", tag:"AXIOM Brain — GPS + Fibre Coverage API" },
    { from:"bot",  delay:2000, text:"📍 *Position détectée :*\n🗺️ Secteur 30, Ouagadougou\n📌 12.3714° N, -1.5197° O\n\n✅ *Zone fibre couverte !*\nDistance au nœud : 380m\nQualité signal estimée : *Excellente*", tag:"Moov Fibre API — Coverage Confirmed ✓" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification de votre statut Moov Money...", tag:"AXIOM Brain — Moov Money Status Check" },
    { from:"bot",  delay:2000, text:"💡 *Seydou, bonne nouvelle !*\n\nNous avons détecté que vous n'avez pas encore de compte *Moov Money*.\n\n🎁 Si vous domiciliez votre abonnement fibre sur *Moov Money*, vous bénéficiez de :\n✅ *-2.000 FCFA/mois* de réduction permanente\n✅ Installation *prioritaire* (48h)\n✅ Ouverture Moov Money *gratuite*\n✅ *1Go data* bonus chaque mois\n\nQue souhaitez-vous faire ?", tag:"AXIOM Brain — Cross-sell Moov Money", choices:["💰 Ouvrir Moov Money (-2.000F/mois)","📋 Garder paiement classique","⏸️ Me rappeler plus tard"] },
    { from:"bot",  delay:800,  text:"🪪 *Ouverture Moov Money rapide*\n\nEnvoyez une photo de votre *CNIB* :", tag:"AXIOM Brain — KYC Express" },
    { from:"user", delay:2000, type:"image", text:"CNIB_Seydou_Compaore.jpg", icon:"🪪" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification CNIB + ouverture compte...", tag:"WAKA AXIOM OCR + Moov Money API" },
    { from:"bot",  delay:2200, text:"🎉 *Récapitulatif complet :*\n\n🌐 *Fibre Moov — Offre sélectionnée*\n💰 Réduction : *-2.000 FCFA/mois* 🎁 (domiciliation Moov Money)\n📱 Data mobile + Appels Moov inclus selon débit\n📅 Engagement : 1 an\n\n💙 *Moov Money ouvert* → +226 76 458 912\n🎁 1Go bonus/mois activé\n\n📍 Installation : Secteur 30, Ouagadougou\n⏱️ Délai : *48h prioritaire*\n\n✅ Un *technicien Moov* vous contactera au *+226 76 458 912* sous 24h !", tag:"Moov Core API — Order + Money Committed ✓", DONE:true },
  ],

  merchant: [
    { from:"system", delay:0,   text:"WAKA NEXUS — Demande Agent/Marchand reçue\nType : Nouveau point de service · Canal : WhatsApp Business", tag:"WAKA NEXUS — Agent Onboarding Trigger" },
    { from:"bot",  delay:1000, text:"__LS_kyb_intro__" + "\n\nEn tant qu'*Agent / Marchand Moov*, vous pourrez offrir à vos clients :\n💵 *Dépôts & Retraits* (dont QR code)\n🌍 *Transferts National & International*\n🧾 *Paiement de factures* (SONABEL, ONEA…)\n🏪 *Paiement Marchands* (Pharmacie, Librairie…)\n📱 *Recharges forfaits mobiles*\n🛵 *Achats Nanan Express*\n🎓 *Frais de scolarité*\n🏦 *Microcrédits commerciaux* BCEAO\n\n" + "__LS_type_commerce__", tag:"WAKA NEXUS → WhatsApp Business",
      choices:["🛒 Commerce général / épicerie","📱 Boutique téléphonie","🍽️ Restaurant / alimentation","💊 Pharmacie / santé","🏗️ BTP / matériaux"],
      branch:{"🛒 Commerce général / épicerie":"kyb_epicerie","📱 Boutique téléphonie":"kyb_telephonie","🍽️ Restaurant / alimentation":"kyb_restaurant","💊 Pharmacie / santé":"kyb_pharmacie","🏗️ BTP / matériaux":"kyb_btp"} },
  ],
  kyb_epicerie: [
    { from:"bot",  delay:700,  text:"🛒 *Commerce général / épicerie*\n\n" + "__LS_nom_commerce__", tag:"AXIOM Brain — KYB Init" },
    { from:"user", delay:1800, text:"Épicerie Wend-Kuni" },
    { from:"bot",  delay:700,  text:"📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
      choices:["📍 Ouagadougou — Secteur 1–15","📍 Ouagadougou — Secteur 16–30","📍 Bobo-Dioulasso","📍 Koudougou / Autre ville"],
      branch:{"📍 Ouagadougou — Secteur 1–15":"kyb_docs_oua1","📍 Ouagadougou — Secteur 16–30":"kyb_docs_oua2","📍 Bobo-Dioulasso":"kyb_docs_bobo","📍 Koudougou / Autre ville":"kyb_docs_autre"} },
  ],
  kyb_telephonie: [
    { from:"bot",  delay:700,  text:"📱 *Boutique téléphonie*\n\n" + "__LS_nom_commerce__", tag:"AXIOM Brain — KYB Init" },
    { from:"user", delay:1800, text:"TéléShop Ouaga" },
    { from:"bot",  delay:700,  text:"📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
      choices:["📍 Ouagadougou — Secteur 1–15","📍 Ouagadougou — Secteur 16–30","📍 Bobo-Dioulasso","📍 Koudougou / Autre ville"],
      branch:{"📍 Ouagadougou — Secteur 1–15":"kyb_docs_oua1","📍 Ouagadougou — Secteur 16–30":"kyb_docs_oua2","📍 Bobo-Dioulasso":"kyb_docs_bobo","📍 Koudougou / Autre ville":"kyb_docs_autre"} },
  ],
  kyb_restaurant: [
    { from:"bot",  delay:700,  text:"🍽️ *Restaurant / alimentation*\n\n" + "__LS_nom_commerce__", tag:"AXIOM Brain — KYB Init" },
    { from:"user", delay:1800, text:"Chez Fatou" },
    { from:"bot",  delay:700,  text:"📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
      choices:["📍 Ouagadougou — Secteur 1–15","📍 Ouagadougou — Secteur 16–30","📍 Bobo-Dioulasso","📍 Koudougou / Autre ville"],
      branch:{"📍 Ouagadougou — Secteur 1–15":"kyb_docs_oua1","📍 Ouagadougou — Secteur 16–30":"kyb_docs_oua2","📍 Bobo-Dioulasso":"kyb_docs_bobo","📍 Koudougou / Autre ville":"kyb_docs_autre"} },
  ],
  kyb_pharmacie: [
    { from:"bot",  delay:700,  text:"💊 *Pharmacie / santé*\n\n" + "__LS_nom_commerce__", tag:"AXIOM Brain — KYB Init" },
    { from:"user", delay:1800, text:"Pharmacie Yennenga" },
    { from:"bot",  delay:700,  text:"📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
      choices:["📍 Ouagadougou — Secteur 1–15","📍 Ouagadougou — Secteur 16–30","📍 Bobo-Dioulasso","📍 Koudougou / Autre ville"],
      branch:{"📍 Ouagadougou — Secteur 1–15":"kyb_docs_oua1","📍 Ouagadougou — Secteur 16–30":"kyb_docs_oua2","📍 Bobo-Dioulasso":"kyb_docs_bobo","📍 Koudougou / Autre ville":"kyb_docs_autre"} },
  ],
  kyb_btp: [
    { from:"bot",  delay:700,  text:"🏗️ *BTP / matériaux*\n\n" + "__LS_nom_commerce__", tag:"AXIOM Brain — KYB Init" },
    { from:"user", delay:1800, text:"Construc BF Sarl" },
    { from:"bot",  delay:700,  text:"📍 Dans quelle *ville et quel secteur* êtes-vous situé ?",
      choices:["📍 Ouagadougou — Secteur 1–15","📍 Ouagadougou — Secteur 16–30","📍 Bobo-Dioulasso","📍 Koudougou / Autre ville"],
      branch:{"📍 Ouagadougou — Secteur 1–15":"kyb_docs_oua1","📍 Ouagadougou — Secteur 16–30":"kyb_docs_oua2","📍 Bobo-Dioulasso":"kyb_docs_bobo","📍 Koudougou / Autre ville":"kyb_docs_autre"} },
  ],
  kyb_docs_oua1: [
    { from:"bot",  delay:700,  text:"📍 *Ouagadougou — Secteur 1 à 15*\n\n📱 Quel est le *numéro Moov* du gérant ?\n_(Sera lié au compte Agent Moov)_" },
    { from:"user", delay:1800, text:"+226 70 881 203" },
    { from:"bot",  delay:700,  text:"🪪 *KYB — Vérification documents*\n\n1️⃣ *CNIB* du gérant (recto/verso)\n2️⃣ *RCCM* ou attestation d'exploitation\n\nEnvoyez la *CNIB* :", tag:"AXIOM Brain — KYB Document Check" },
    { from:"user", delay:2000, type:"image", text:"CNIB_Gerant_Secteur8_OUA.jpg", icon:"🪪" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Lecture IA de la CNIB...", tag:"WAKA AXIOM OCR" },
    { from:"bot",  delay:2000, text:"✅ *CNIB vérifiée !*\n\n👤 Idrissa Ouédraogo · Ouagadougou\n✅ BCEAO — Aucune restriction · AML/LFT OK\n\nEnvoyez le *RCCM* :", tag:"AXIOM Brain — KYB Identity ✓" },
    { from:"user", delay:2000, type:"image", text:"RCCM_Commerce_OUA1.pdf", icon:"📄" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification RCCM + BCEAO/UEMOA...", tag:"AXIOM Brain — KYB Compliance" },
    { from:"bot",  delay:2400, text:"✅ *Commerce vérifié !*\n\n📄 RCCM : BF-OUA-2019-B-4471\n📍 Secteur 8, Ouagadougou\n✅ Conforme BCEAO / UEMOA · LFT/AML OK\n\n*Quel équipement de paiement souhaitez-vous ?*", tag:"AXIOM Brain — KYB Full Compliance ✓",
      choices:["🖥️ Terminal TPE physique","📲 QR Code uniquement","🖥️ TPE + 📲 QR Code (recommandé)"],
      branch:{"🖥️ Terminal TPE physique":"kyb_activation_tpe","📲 QR Code uniquement":"kyb_activation_qr","🖥️ TPE + 📲 QR Code (recommandé)":"kyb_activation_both"} },
  ],
  kyb_docs_oua2: [
    { from:"bot",  delay:700,  text:"📍 *Ouagadougou — Secteur 16 à 30*\n\n📱 Quel est le *numéro Moov* du gérant ?\n_(Sera lié au compte Agent Moov)_" },
    { from:"user", delay:1800, text:"+226 74 881 203" },
    { from:"bot",  delay:700,  text:"🪪 *KYB — Vérification documents*\n\n1️⃣ *CNIB* du gérant (recto/verso)\n2️⃣ *RCCM* ou attestation d'exploitation\n\nEnvoyez la *CNIB* :", tag:"AXIOM Brain — KYB Document Check" },
    { from:"user", delay:2000, type:"image", text:"CNIB_Idrissa_Ouedraogo_Gerant.jpg", icon:"🪪" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Lecture IA de la CNIB...", tag:"WAKA AXIOM OCR" },
    { from:"bot",  delay:2000, text:"✅ *CNIB vérifiée !*\n\n👤 Idrissa Ouédraogo · Ouagadougou\n✅ BCEAO — Aucune restriction · AML/LFT OK\n\nEnvoyez le *RCCM* :", tag:"AXIOM Brain — KYB Identity ✓" },
    { from:"user", delay:2000, type:"image", text:"RCCM_Epicerie_WendKuni_BF.pdf", icon:"📄" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification RCCM + BCEAO/UEMOA...", tag:"AXIOM Brain — KYB Compliance" },
    { from:"bot",  delay:2400, text:"✅ *Commerce vérifié !*\n\n📄 RCCM : BF-OUA-2019-B-4471\n📍 Secteur 22, Ouagadougou\n✅ Conforme BCEAO / UEMOA · LFT/AML OK\n\n*Quel équipement de paiement souhaitez-vous ?*", tag:"AXIOM Brain — KYB Full Compliance ✓",
      choices:["🖥️ Terminal TPE physique","📲 QR Code uniquement","🖥️ TPE + 📲 QR Code (recommandé)"],
      branch:{"🖥️ Terminal TPE physique":"kyb_activation_tpe","📲 QR Code uniquement":"kyb_activation_qr","🖥️ TPE + 📲 QR Code (recommandé)":"kyb_activation_both"} },
  ],
  kyb_docs_bobo: [
    { from:"bot",  delay:700,  text:"📍 *Bobo-Dioulasso*\n\n📱 Quel est le *numéro Moov* du gérant ?\n_(Sera lié au compte Agent Moov)_" },
    { from:"user", delay:1800, text:"+226 71 554 302" },
    { from:"bot",  delay:700,  text:"🪪 *KYB — Vérification documents*\n\n1️⃣ *CNIB* du gérant\n2️⃣ *RCCM* ou attestation d'exploitation\n\nEnvoyez la *CNIB* :", tag:"AXIOM Brain — KYB Document Check" },
    { from:"user", delay:2000, type:"image", text:"CNIB_Gerant_Bobo.jpg", icon:"🪪" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Lecture IA de la CNIB...", tag:"WAKA AXIOM OCR" },
    { from:"bot",  delay:2000, text:"✅ *CNIB vérifiée !*\n\n👤 Moussa Coulibaly · Bobo-Dioulasso\n✅ BCEAO — Aucune restriction · AML/LFT OK\n\nEnvoyez le *RCCM* :", tag:"AXIOM Brain — KYB Identity ✓" },
    { from:"user", delay:2000, type:"image", text:"RCCM_Commerce_Bobo.pdf", icon:"📄" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification RCCM + BCEAO/UEMOA...", tag:"AXIOM Brain — KYB Compliance" },
    { from:"bot",  delay:2400, text:"✅ *Commerce vérifié !*\n\n📄 RCCM : BF-BOB-2021-C-1182\n📍 Bobo-Dioulasso\n✅ Conforme BCEAO / UEMOA · LFT/AML OK\n\n*Quel équipement de paiement souhaitez-vous ?*", tag:"AXIOM Brain — KYB Full Compliance ✓",
      choices:["🖥️ Terminal TPE physique","📲 QR Code uniquement","🖥️ TPE + 📲 QR Code (recommandé)"],
      branch:{"🖥️ Terminal TPE physique":"kyb_activation_tpe","📲 QR Code uniquement":"kyb_activation_qr","🖥️ TPE + 📲 QR Code (recommandé)":"kyb_activation_both"} },
  ],
  kyb_docs_autre: [
    { from:"bot",  delay:700,  text:"📍 *Koudougou / Autre ville*\n\n📱 Quel est le *numéro Moov* du gérant ?\n_(Sera lié au compte Agent Moov)_" },
    { from:"user", delay:1800, text:"+226 76 223 441" },
    { from:"bot",  delay:700,  text:"🪪 *KYB — Vérification documents*\n\n1️⃣ *CNIB* du gérant\n2️⃣ *RCCM* ou attestation d'exploitation\n\nEnvoyez la *CNIB* :", tag:"AXIOM Brain — KYB Document Check" },
    { from:"user", delay:2000, type:"image", text:"CNIB_Gerant_Koudougou.jpg", icon:"🪪" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Lecture IA de la CNIB...", tag:"WAKA AXIOM OCR" },
    { from:"bot",  delay:2000, text:"✅ *CNIB vérifiée !*\n\n👤 Dramane Zongo · Koudougou\n✅ BCEAO — Aucune restriction · AML/LFT OK\n\nEnvoyez le *RCCM* :", tag:"AXIOM Brain — KYB Identity ✓" },
    { from:"user", delay:2000, type:"image", text:"RCCM_Commerce_Koudougou.pdf", icon:"📄" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification RCCM + BCEAO/UEMOA...", tag:"AXIOM Brain — KYB Compliance" },
    { from:"bot",  delay:2400, text:"✅ *Commerce vérifié !*\n\n📄 RCCM : BF-KDG-2022-B-0331\n📍 Koudougou\n✅ Conforme BCEAO / UEMOA · LFT/AML OK\n\n*Quel équipement de paiement souhaitez-vous ?*", tag:"AXIOM Brain — KYB Full Compliance ✓",
      choices:["🖥️ Terminal TPE physique","📲 QR Code uniquement","🖥️ TPE + 📲 QR Code (recommandé)"],
      branch:{"🖥️ Terminal TPE physique":"kyb_activation_tpe","📲 QR Code uniquement":"kyb_activation_qr","🖥️ TPE + 📲 QR Code (recommandé)":"kyb_activation_both"} },
  ],
  kyb_activation_tpe: [
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Provisionnement Terminal TPE en cours...", tag:"Moov Core API — TPE Provisioning" },
    { from:"bot",  delay:2000, text:"🎉 *Pack Agent Moov — Activé !*\n\n💳 *Compte Agent Moov* → compte créé\n🖥️ *Terminal TPE physique* → livraison sous *48h*\n\n*Services disponibles dès maintenant :*\n💵 Dépôts / Retraits · 🌍 Transferts · 🧾 Factures\n🏪 Paiement Marchands · 📱 Forfaits · 🛵 Nanan Express\n🎓 Frais scolarité · 🏦 Microcrédit BCEAO\n\n✅ *Point de service opérationnel !*", tag:"Moov Core API — Agent TPE Committed ✓", DONE:true },
  ],
  kyb_activation_qr: [
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Génération QR Code marchand...", tag:"Moov Core API — QR Provisioning" },
    { from:"bot",  delay:2000, text:"🎉 *Pack Agent Moov — Activé !*\n\n💳 *Compte Agent Moov* → compte créé\n📲 *QR Code marchand* → *disponible maintenant*\n\n*Services disponibles dès maintenant :*\n💵 Dépôts / Retraits QR · 🌍 Transferts · 🧾 Factures\n🏪 Paiement Marchands · 📱 Forfaits · 🛵 Nanan Express\n🎓 Frais scolarité · 🏦 Microcrédit BCEAO\n\n✅ *Point de service opérationnel !*", tag:"Moov Core API — Agent QR Committed ✓", DONE:true },
  ],
  kyb_activation_both: [
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Provisionnement TPE + QR Code en cours...", tag:"Moov Core API — Hardware + QR Provisioning" },
    { from:"bot",  delay:2000, text:"🎉 *Pack Agent Moov — Activé !*\n\n💳 *Compte Agent Moov* → compte créé\n🖥️ *Terminal TPE* → livraison sous *48h*\n📲 *QR Code marchand* → *disponible maintenant*\n\n*Services disponibles dès maintenant :*\n💵 Dépôts / Retraits QR · 🌍 Transferts · 🧾 Factures\n🏪 Paiement Marchands · 📱 Forfaits · 🛵 Nanan Express\n🎓 Frais scolarité · 🏦 Microcrédit BCEAO\n\n✅ *Point de service opérationnel immédiatement !*", tag:"Moov Core API — Agent Account + TPE + QR ✓", DONE:true },
  ],
  new_gsm_lead: [
    { from:"bot",  delay:0,    text:"__LS_welcome_lead__" + "\n\nJe vois que vous explorez nos offres. Êtes-vous déjà client *Moov Africa* ?", tag:"WAKA NEXUS → WhatsApp — Lead Capture", choices:["📱 Je suis client Moov","🔄 Je suis sur un autre réseau","❓ Je ne sais pas"] },
    { from:"bot",  delay:900,  text:"Pas de problème ! Nous pouvons vous aider à *rejoindre Moov Africa* facilement.\n\nQuel est votre opérateur actuel ?", tag:"AXIOM Brain — Competitor Intel", choices:["📡 Orange Burkina","📡 Telecel (ex-Airtel)","📡 Autre"] },
    { from:"bot",  delay:800,  text:"Merci ! Depuis combien de temps êtes-vous chez *Orange* ?", choices:["⏱️ Moins de 1 an","⏱️ 1 à 3 ans","⏱️ Plus de 3 ans"] },
    { from:"bot",  delay:700,  text:"Quels services utilisez-vous le plus au quotidien ?\n\n_(Choisissez le profil qui vous correspond le mieux)_", tag:"AXIOM Brain — Usage Profiling", choices:["📞 Surtout appels voix","📱 Surtout data internet","💸 Surtout mobile money","🌐 Fibre / internet fixe","📦 Tout à la fois"] },
    { from:"bot",  delay:800,  text:"Quelle est votre *dépense mensuelle* estimée en télécoms ?", choices:["💰 Moins de 3.000F","💰 3.000 – 10.000F","💰 10.000 – 25.000F","💰 Plus de 25.000F"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Analyse de votre profil...", tag:"AXIOM Brain — Lead Scoring Engine" },
    { from:"bot",  delay:2000, text:"🏆 *Excellent profil Ibrahim !*\n\n📊 *Votre score Moov :*\n⭐ Profil : Utilisateur mobile money intensif\n💡 Potentiel : Premium\n📈 Économies estimées vs Orange : *+3.200 FCFA/mois*\n\nVoici ce que Moov Africa vous offre *en exclusivité* :", tag:"AXIOM Brain — Offer Personalization ✓" },
    { from:"bot",  delay:1200, text:"🎁 *Offre de bienvenue Moov Africa BF :*\n\n✅ *3 mois* à tarif préférentiel\n✅ *500 FCFA* offerts sur Moov Money\n✅ Portabilité conservée *(gardez votre numéro)*\n✅ Compte *Moov Money gratuit* inclus\n✅ SIM livrée à domicile *gratuitement* à Ouaga / Bobo\n\nVoulez-vous qu'un *conseiller Moov* vous rappelle ?", tag:"AXIOM Brain — Personalized Bundle", choices:["✅ Oui, me rappeler","📋 Recevoir l'offre par SMS","⏸️ Pas maintenant"] },
    { from:"bot",  delay:700,  text:"📱 Quel numéro pour vous rappeler ?\n_(Votre numéro Orange actuel est OK)_" },
    { from:"user", delay:1800, text:"+226 65 234 789" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Enregistrement de votre demande...", tag:"WAKA NEXUS — CRM Lead Push" },
    { from:"bot",  delay:1800, text:"✅ *Lead enregistré avec succès !*\n\n👤 Profil pré-qualifié : *Premium — Mobile Money*\n📱 Rappel programmé : *+226 65 234 789*\n⏱️ Délai : Moins de *2 heures ouvrables*\n🎁 Offre réservée : *Bundle Bienvenue Moov*\n\nMerci de votre intérêt ! Un conseiller Moov va vous *contacter très bientôt* 💙🇧🇫\n\n_Référence lead : LDM-OUA-2024-2287_", tag:"WAKA NEXUS — CRM Lead Committed ✓", DONE:true },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WALLET FLOWS — Moov Money BF
══════════════════════════════════════════════════════════════ */
const RAW_WALLET_FLOWS: Record<string, any[]> = {
  send_money: [
    { from:"bot",  delay:0,    text:"💸 *Transfert Moov Money*\n\nEntrez le numéro du destinataire :", tag:"WAKA CORE — Transfer Init" },
    { from:"user", delay:1800, text:"+226 71 987 654" },
    { from:"bot",  delay:900,  text:"👤 *Destinataire trouvé :*\nFatimata Ouédraogo\n📍 Ouagadougou\n\nCombien souhaitez-vous envoyer ?", tag:"Moov API — Recipient Lookup" },
    { from:"user", delay:1600, text:"2.000 FCFA" },
    { from:"bot",  delay:700,  text:"📋 *Confirmation du transfert :*\n\n👤 À : Fatimata Ouédraogo\n💵 Montant : *2.000 FCFA*\n💳 Frais : *50 FCFA*\n📤 Total débité : *2.050 FCFA*\n\nConfirmez-vous ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Traitement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:1800, text:"🎉 *Transfert réussi !*\n\n✅ *2.000 FCFA* envoyés à Fatimata Ouédraogo\n🆔 Réf: TXN-OUA-20240315-4421\n💰 Nouveau solde : *6.950 FCFA*\n\n_Fatimata a été notifiée par SMS._", tag:"Moov Core — TXN Committed ✓", OPDONE:true },
  ],
  pay_bill: [
    { from:"bot",  delay:0,    text:"🧾 *Paiement de factures*\n\nChoisissez votre prestataire :", tag:"WAKA CORE — Billers Catalog",
      choices:["⚡ SONABEL (Électricité)","💧 ONEA (Eau)","📺 Canal+","📡 Moov Fibre"],
      branch:{ "⚡ SONABEL (Électricité)":"pay_sonabel","💧 ONEA (Eau)":"pay_onea","📺 Canal+":"pay_canal","📡 Moov Fibre":"pay_fibre" }
    },
  ],
  pay_sonabel: [
    { from:"bot",  delay:0,    text:"⚡ *Paiement SONABEL*\n\nEntrez votre numéro de compteur :", tag:"WAKA NEXUS — SONABEL API" },
    { from:"user", delay:1800, text:"OUA-7741-22B" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Récupération de votre facture SONABEL...", tag:"SONABEL API — Invoice Fetch" },
    { from:"bot",  delay:1800, text:"📋 *Facture SONABEL trouvée :*\n\n🏠 Oumarou Sawadogo\n📍 Secteur 15, Ouagadougou\n💡 Consommation : 74 kWh\n💵 Montant dû : *3.700 FCFA*\n📅 Échéance : 25/03/2024\n\nVoulez-vous payer maintenant ?", choices:["✅ Payer 3.700 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000, text:"✅ *Facture payée !*\n\n⚡ SONABEL · Oumarou Sawadogo\n💵 *3.700 FCFA* débités\n🆔 Réf: SNB-PAY-2024-88312\n\n_Reçu envoyé par SMS au +226 70 123 456_", tag:"SONABEL API — Payment Confirmed ✓", OPDONE:true },
  ],
  pay_onea: [
    { from:"bot",  delay:0,    text:"💧 *Paiement ONEA*\n\nEntrez votre numéro de contrat eau :", tag:"WAKA NEXUS — ONEA API" },
    { from:"user", delay:1800, text:"ONEA-OUA-3312" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Récupération de votre facture ONEA...", tag:"ONEA API — Invoice Fetch" },
    { from:"bot",  delay:1800, text:"📋 *Facture ONEA trouvée :*\n\n🏠 Oumarou Sawadogo\n📍 Secteur 15, Ouagadougou\n💧 Consommation : 9 m³\n💵 Montant dû : *1.800 FCFA*\n\nVoulez-vous payer maintenant ?", choices:["✅ Payer 1.800 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000, text:"✅ *Facture ONEA payée !*\n\n💧 ONEA · Oumarou Sawadogo\n💵 *1.800 FCFA* débités\n🆔 Réf: ONEA-PAY-2024-5531", tag:"ONEA API — Payment Confirmed ✓", OPDONE:true },
  ],
  pay_canal: [
    { from:"bot",  delay:0,    text:"📺 *Paiement Canal+*\n\nEntrez votre numéro d'abonné :", tag:"WAKA NEXUS — Canal+ API" },
    { from:"user", delay:1800, text:"CAN-00481229" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification de votre abonnement...", tag:"Canal+ API — Account Lookup" },
    { from:"bot",  delay:1800, text:"📋 *Abonnement Canal+ :*\n\n📺 Oumarou Sawadogo\n🎬 Offre Evasion · Mensuel\n💵 Montant dû : *5.000 FCFA*\n\nRenouveler ?", choices:["✅ Payer 5.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000, text:"✅ *Abonnement renouvelé !*\n\n📺 Canal+ Evasion\n💵 *5.000 FCFA* débités\n🆔 Réf: CAN-PAY-2024-3318", tag:"Canal+ API — Confirmed ✓", OPDONE:true },
  ],
  pay_fibre: [
    { from:"bot",  delay:0,    text:"📡 *Paiement Abonnement Fibre Moov*\n\nEntrez votre numéro de contrat fibre :", tag:"WAKA NEXUS — Moov Fibre API" },
    { from:"user", delay:1800, text:"FIBRE-OUA-1182" },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Vérification de votre abonnement...", tag:"Moov Fibre API — Account Lookup" },
    { from:"bot",  delay:1800, text:"📋 *Abonnement Fibre Moov :*\n\n🌐 Oumarou Sawadogo\n⚡ Fibre 200 Mbps\n📅 Renouvellement : 01/04/2024\n💵 Montant dû : *30.000 FCFA*\n\nRenouveler ?", choices:["✅ Payer 30.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000, text:"✅ *Abonnement Fibre renouvelé !*\n\n🌐 Fibre 200 Mbps · Oumarou Sawadogo\n💵 *30.000 FCFA* débités\n🆔 Réf: FIB-PAY-2024-0087\n📅 Valide jusqu'au 01/05/2024", tag:"Moov Fibre API — Payment Confirmed ✓", OPDONE:true },
  ],
  credit: [
    { from:"bot",  delay:0,    text:"📱 *Achat de crédit Moov*\n\nPour quel numéro ?", tag:"WAKA CORE — Airtime Module", choices:["📱 Mon numéro (+226 70 123 456)","👥 Autre numéro"] },
    { from:"bot",  delay:700,  text:"💰 *Choisissez le montant :*", choices:["200 FCFA","500 FCFA","1.000 FCFA","2.000 FCFA"] },
    { from:"bot",  delay:600,  text:"📋 *Confirmation :*\n\n📱 +226 70 123 456\n💵 Crédit : *500 FCFA*\n\n✅ Confirmez ?", choices:["✅ Oui, acheter","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Chargement du crédit...", tag:"Moov IN — Top-up API" },
    { from:"bot",  delay:1500, text:"✅ *Crédit rechargé !*\n\n📱 +226 70 123 456\n💵 *500 FCFA* de crédit ajoutés\n🆔 Réf: AIR-OUA-20240315-7733", tag:"Moov IN — Confirmed ✓", OPDONE:true },
  ],
  balance: [
    { from:"bot", delay:0,    type:"processing", text:"⏳ Consultation du solde...", tag:"Moov Core — Balance Query" },
    { from:"bot", delay:1200, text:"💰 *Votre solde Moov Money*\n\n━━━━━━━━━━━━━━━\n💵 *Solde principal :* 500 FCFA\n🎁 *Bonus :* 0 FCFA\n📱 *Crédit voix :* 0 min\n━━━━━━━━━━━━━━━\n\n_Mise à jour : maintenant_", tag:"Moov Core — Balance Returned ✓", OPDONE:true },
  ],
  history: [
    { from:"bot", delay:0,    type:"processing", text:"⏳ Chargement de l'historique...", tag:"AXIOM Brain — Transaction Log" },
    { from:"bot", delay:1500, text:"📊 *Vos 5 dernières transactions :*\n\n✅ 15/03 · Compte créé          +500 FCFA\n─────────────────────────────\n📤 15/03 · Transfert F.Ouédraogo −2.050 FCFA\n─────────────────────────────\n⚡ 15/03 · Facture SONABEL     −3.700 FCFA\n─────────────────────────────\n📱 15/03 · Crédit Moov          −500 FCFA\n─────────────────────────────\n\n💰 *Solde actuel : 6.950 FCFA*", tag:"AXIOM Brain — Audit Trail ✓", OPDONE:true },
  ],
  depot_retrait: [
    { from:"bot",  delay:0,   text:"💵 *Dépôt / Retrait Moov Money*\n\nQuelle opération pour votre client ?", tag:"WAKA CORE — Agent Cash Services",
      choices:["📥 Dépôt (Cash In)","📤 Retrait QR code","📤 Retrait classique"],
      branch:{"📥 Dépôt (Cash In)":"depot_cashin","📤 Retrait QR code":"depot_qr","📤 Retrait classique":"depot_classique"} },
  ],
  depot_cashin: [
    { from:"bot",  delay:700, text:"📥 *Dépôt Cash In*\n\nNuméro Moov Money du client :", tag:"Moov API — Client Lookup" },
    { from:"user", delay:1600,text:"+226 77 334 512" },
    { from:"bot",  delay:900, text:"👤 *Client trouvé :*\nKorotimi Zongo · Ouagadougou\n✅ Compte actif\n\nMontant à déposer ?", tag:"Moov Core — Client Verified" },
    { from:"user", delay:1500,text:"15.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Confirmation Dépôt :*\n\n👤 Korotimi Zongo\n💵 *15.000 FCFA*\n💸 Commission : *+150 FCFA*\n\n⚠️ Recevez le cash puis confirmez :", choices:["✅ Cash reçu — Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Crédit du compte client...", tag:"Moov Core — Cash In API" },
    { from:"bot",  delay:1800,text:"🎉 *Dépôt confirmé !*\n\n✅ *15.000 FCFA* déposés sur le compte de Korotimi Zongo\n💸 Commission : *+150 FCFA*\n🆔 Réf: CIN-OUA-20240315-7712\n💰 Solde agent : *47.387 FCFA*\n\n_Client notifié par SMS._", tag:"Moov Core — Cash In ✓", OPDONE:true },
  ],
  depot_qr: [
    { from:"bot",  delay:700, text:"📲 *Retrait par QR Code*\n\nDemandez au client de *générer son QR de retrait* dans son app Moov Money, puis scannez-le avec votre TPE.", tag:"WAKA NEXUS — QR Withdraw Init" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Lecture QR client en cours...", tag:"Moov Core — QR Scan" },
    { from:"bot",  delay:1800,text:"📋 *QR Retrait validé :*\n\n👤 Adama Compaoré (+226 70 *** 441)\n💵 Montant : *20.000 FCFA*\n💸 Commission agent : *+200 FCFA*\n\nRemettez le cash au client et confirmez :", choices:["✅ Cash remis — Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Finalisation du retrait...", tag:"Moov Core — QR Withdraw API" },
    { from:"bot",  delay:1800,text:"🎉 *Retrait QR confirmé !*\n\n✅ *20.000 FCFA* remis à Adama Compaoré\n💸 Commission : *+200 FCFA*\n🆔 Réf: WDR-QR-OUA-20240315-5512\n💰 Solde agent : *47.437 FCFA*\n\n_Client notifié par SMS._", tag:"Moov Core — QR Withdraw ✓", OPDONE:true },
  ],
  depot_classique: [
    { from:"bot",  delay:700, text:"📤 *Retrait classique*\n\nNuméro Moov Money du client :", tag:"Moov API — Client Lookup" },
    { from:"user", delay:1600,text:"+226 70 441 882" },
    { from:"bot",  delay:900, text:"👤 *Client trouvé :*\nHalimata Sawadogo · Ouagadougou\n✅ Compte actif\n\nMontant à retirer ?", tag:"Moov Core — Client Verified" },
    { from:"user", delay:1500,text:"8.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Confirmation Retrait :*\n\n👤 Halimata Sawadogo\n💵 *8.000 FCFA*\n💸 Commission : *+80 FCFA*\n\n⚠️ Remettez le cash au client puis confirmez :", choices:["✅ Cash remis — Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Finalisation du retrait...", tag:"Moov Core — Withdraw API" },
    { from:"bot",  delay:1800,text:"🎉 *Retrait confirmé !*\n\n✅ *8.000 FCFA* remis à Halimata Sawadogo\n💸 Commission : *+80 FCFA*\n🆔 Réf: WDR-CLS-OUA-20240315-3301\n💰 Solde agent : *47.517 FCFA*\n\n_Client notifié par SMS._", tag:"Moov Core — Withdraw ✓", OPDONE:true },
  ],
  transfert_national: [
    { from:"bot",  delay:0,   text:"🇧🇫 *Transfert National Moov Money*\n\nNuméro Moov du *client expéditeur* :", tag:"WAKA CORE — National Transfer" },
    { from:"user", delay:1600,text:"+226 74 552 881" },
    { from:"bot",  delay:900, text:"👤 *Expéditeur :* Salimata Diallo · Ouaga\n✅ Limite disponible\n\nNuméro du *destinataire* ?", tag:"Moov API — Sender Verified" },
    { from:"user", delay:1600,text:"+226 78 112 007" },
    { from:"bot",  delay:900, text:"👤 *Destinataire :* Boubacar Sawadogo · Bobo-Dioulasso\n✅ Compte actif\n\nMontant ?", tag:"Moov API — Recipient Verified" },
    { from:"user", delay:1500,text:"25.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert national :*\n\n📤 Salimata → Boubacar\n💵 *25.000 FCFA*\n💳 Frais : 250 FCFA · Commission agent : *+125 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement transfert...", tag:"Moov Core — National Transfer API" },
    { from:"bot",  delay:1800,text:"🎉 *Transfert réussi !*\n\n✅ *25.000 FCFA* → Boubacar Sawadogo (Bobo)\n💸 Commission : *+125 FCFA*\n🆔 Réf: TRF-NAT-OUA-20240315-9901\n💰 Solde : *47.562 FCFA*", tag:"Moov Core — National Transfer ✓", OPDONE:true },
  ],
  transfert_intl: [
    { from:"bot",  delay:0,   text:"🌍 *Transfert International Moov Money*\n\nVers quel pays ?", tag:"WAKA CORE — International Transfer",
      choices:["🇨🇮 Côte d'Ivoire","🇸🇳 Sénégal","🇲🇱 Mali","🇬🇳 Guinée","🌍 Autre pays UEMOA"],
      branch:{"🇨🇮 Côte d'Ivoire":"tintl_ci","🇸🇳 Sénégal":"tintl_sn","🇲🇱 Mali":"tintl_ml","🇬🇳 Guinée":"tintl_gn","🌍 Autre pays UEMOA":"tintl_autre"} },
  ],
  tintl_ci: [
    { from:"bot",  delay:700, text:"🇨🇮 *Transfert vers Côte d'Ivoire*\n\nNuméro du destinataire (Moov CI ou partenaire) :", tag:"Moov Intl — Corridor BF→CI" },
    { from:"user", delay:1600,text:"+225 07 112 3344" },
    { from:"bot",  delay:900, text:"👤 *Destinataire :* Kofi Atta · Abidjan\n✅ Corridor BF→CI actif · Taux 1:1 (zone CFA)\n\nMontant (FCFA) ?", tag:"Moov Intl — Recipient Verified" },
    { from:"user", delay:1500,text:"50.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert BF → Côte d'Ivoire :*\n\n💵 *50.000 FCFA* · Frais : 750F · Commission : *+250 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement corridor UEMOA...", tag:"Moov Core — Intl Transfer API" },
    { from:"bot",  delay:2000,text:"🎉 *Transfert réussi !*\n\n✅ *50.000 FCFA* → Kofi Atta, Abidjan\n💸 Commission : *+250 FCFA*\n🆔 Réf: TRF-INTL-BF-CI-20240315-0055\n💰 Solde : *47.812 FCFA*\n\n_Kofi notifié depuis Abidjan._", tag:"Moov Core — Intl CI ✓", OPDONE:true },
  ],
  tintl_sn: [
    { from:"bot",  delay:700, text:"🇸🇳 *Transfert vers Sénégal*\n\nNuméro du destinataire (Wave, Orange Money ou partenaire) :", tag:"Moov Intl — Corridor BF→SN" },
    { from:"user", delay:1600,text:"+221 77 441 2233" },
    { from:"bot",  delay:900, text:"👤 *Destinataire :* Aminata Diallo · Dakar\n✅ Corridor BF→SN actif · Taux 1:1 (zone CFA)\n\nMontant (FCFA) ?", tag:"Moov Intl — Recipient Verified" },
    { from:"user", delay:1500,text:"30.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert BF → Sénégal :*\n\n💵 *30.000 FCFA* · Frais : 500F · Commission : *+150 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement corridor UEMOA...", tag:"Moov Core — Intl Transfer API" },
    { from:"bot",  delay:2000,text:"🎉 *Transfert réussi !*\n\n✅ *30.000 FCFA* → Aminata Diallo, Dakar\n💸 Commission : *+150 FCFA*\n🆔 Réf: TRF-INTL-BF-SN-20240315-0112\n💰 Solde : *47.662 FCFA*\n\n_Aminata notifiée depuis Dakar._", tag:"Moov Core — Intl SN ✓", OPDONE:true },
  ],
  tintl_ml: [
    { from:"bot",  delay:700, text:"🇲🇱 *Transfert vers Mali*\n\nNuméro du destinataire (Moov Mali ou Orange Mali) :", tag:"Moov Intl — Corridor BF→ML" },
    { from:"user", delay:1600,text:"+223 76 881 4422" },
    { from:"bot",  delay:900, text:"👤 *Destinataire :* Moussa Keïta · Bamako\n✅ Corridor BF→ML actif · Taux 1:1 (zone CFA)\n\nMontant (FCFA) ?", tag:"Moov Intl — Recipient Verified" },
    { from:"user", delay:1500,text:"20.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert BF → Mali :*\n\n💵 *20.000 FCFA* · Frais : 400F · Commission : *+100 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement corridor UEMOA...", tag:"Moov Core — Intl Transfer API" },
    { from:"bot",  delay:2000,text:"🎉 *Transfert réussi !*\n\n✅ *20.000 FCFA* → Moussa Keïta, Bamako\n💸 Commission : *+100 FCFA*\n🆔 Réf: TRF-INTL-BF-ML-20240315-0233\n💰 Solde : *47.612 FCFA*\n\n_Moussa notifié depuis Bamako._", tag:"Moov Core — Intl ML ✓", OPDONE:true },
  ],
  tintl_gn: [
    { from:"bot",  delay:700, text:"🇬🇳 *Transfert vers Guinée*\n\nNuméro du destinataire :", tag:"Moov Intl — Corridor BF→GN" },
    { from:"user", delay:1600,text:"+224 62 334 5511" },
    { from:"bot",  delay:900, text:"👤 *Destinataire :* Ibrahima Bah · Conakry\n✅ Corridor BF→GN actif\n\nMontant (FCFA) ?", tag:"Moov Intl — Recipient Verified" },
    { from:"user", delay:1500,text:"25.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert BF → Guinée :*\n\n💵 *25.000 FCFA* · Frais : 500F · Commission : *+125 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement...", tag:"Moov Core — Intl Transfer API" },
    { from:"bot",  delay:2000,text:"🎉 *Transfert réussi !*\n\n✅ *25.000 FCFA* → Ibrahima Bah, Conakry\n💸 Commission : *+125 FCFA*\n🆔 Réf: TRF-INTL-BF-GN-20240315-0344\n💰 Solde : *47.737 FCFA*", tag:"Moov Core — Intl GN ✓", OPDONE:true },
  ],
  tintl_autre: [
    { from:"bot",  delay:700, text:"🌍 *Autre pays UEMOA*\n\nVers quel pays exactement ?", tag:"Moov Intl — UEMOA Corridor", choices:["🇳🇪 Niger","🇹🇬 Togo","🇧🇯 Bénin","🇬🇼 Guinée-Bissau"] },
    { from:"bot",  delay:800, text:"📱 Numéro du destinataire :", tag:"Moov Intl — Recipient Init" },
    { from:"user", delay:1600,text:"+227 90 112 4433" },
    { from:"bot",  delay:900, text:"👤 *Destinataire localisé*\n✅ Corridor UEMOA actif · Taux 1:1 (zone CFA)\n\nMontant (FCFA) ?", tag:"Moov Intl — Recipient Verified" },
    { from:"user", delay:1500,text:"15.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Transfert UEMOA :*\n\n💵 *15.000 FCFA* · Frais : 300F · Commission : *+75 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement corridor UEMOA...", tag:"Moov Core — Intl Transfer API" },
    { from:"bot",  delay:2000,text:"🎉 *Transfert réussi !*\n\n✅ *15.000 FCFA* envoyés\n💸 Commission : *+75 FCFA*\n🆔 Réf: TRF-INTL-BF-UMA-20240315-0455\n💰 Solde : *47.587 FCFA*", tag:"Moov Core — Intl UEMOA ✓", OPDONE:true },
  ],
  paiement_factures: [
    { from:"bot",  delay:0,   text:"🧾 *Paiement de Factures*\n\nQuelle facture pour votre client ?", tag:"WAKA CORE — Billers Catalog",
      choices:["⚡ SONABEL","💧 ONEA","📺 Canal+ / CanalBox","📡 Moov Fibre"],
      branch:{"⚡ SONABEL":"fact_sonabel","💧 ONEA":"fact_onea","📺 Canal+ / CanalBox":"fact_canal","📡 Moov Fibre":"fact_fibre"} },
  ],
  fact_sonabel: [
    { from:"bot",  delay:700, text:"⚡ *Paiement SONABEL*\n\nNuméro de compteur du client :", tag:"WAKA NEXUS — SONABEL API" },
    { from:"user", delay:1600,text:"OUA-8821-44C" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Récupération facture SONABEL...", tag:"SONABEL API — Invoice Fetch" },
    { from:"bot",  delay:1800,text:"📋 *Facture SONABEL :*\n\n🏠 Mariam Kaboré · Secteur 22, OUA\n💡 91 kWh · *4.550 FCFA*\n📅 Échéance : 28/03/2024\n\nPayer ?", choices:["✅ Payer 4.550 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000,text:"✅ *Facture SONABEL payée !*\n\n⚡ Mariam Kaboré · *4.550 FCFA*\n💸 Commission : *+45 FCFA*\n🆔 Réf: SNB-AGT-2024-77123\n\n_Reçu SMS envoyé à Mariam._", tag:"SONABEL API — Payment ✓", OPDONE:true },
  ],
  fact_onea: [
    { from:"bot",  delay:700, text:"💧 *Paiement ONEA*\n\nNuméro de contrat eau du client :", tag:"WAKA NEXUS — ONEA API" },
    { from:"user", delay:1600,text:"ONEA-OUA-5521" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Récupération facture ONEA...", tag:"ONEA API — Invoice Fetch" },
    { from:"bot",  delay:1800,text:"📋 *Facture ONEA :*\n\n🏠 Kofi Ouédraogo · Secteur 10, OUA\n💧 11 m³ · *2.200 FCFA*\n📅 Échéance : 31/03/2024\n\nPayer ?", choices:["✅ Payer 2.200 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000,text:"✅ *Facture ONEA payée !*\n\n💧 Kofi Ouédraogo · *2.200 FCFA*\n💸 Commission : *+22 FCFA*\n🆔 Réf: ONEA-AGT-2024-33441\n\n_Reçu SMS envoyé à Kofi._", tag:"ONEA API — Payment ✓", OPDONE:true },
  ],
  fact_canal: [
    { from:"bot",  delay:700, text:"📺 *Paiement Canal+ / CanalBox*\n\nNuméro d'abonné du client :", tag:"WAKA NEXUS — Canal+ API" },
    { from:"user", delay:1600,text:"CAN-00481229" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Vérification abonnement...", tag:"Canal+ API — Account Lookup" },
    { from:"bot",  delay:1800,text:"📋 *Abonnement Canal+ :*\n\n📺 Oumarou Sawadogo · Offre Evasion\n💵 *5.000 FCFA* · Renouvellement mensuel\n\nRenouveler ?", choices:["✅ Payer 5.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000,text:"✅ *Canal+ renouvelé !*\n\n📺 Oumarou Sawadogo · Offre Evasion\n💵 *5.000 FCFA*\n💸 Commission : *+50 FCFA*\n🆔 Réf: CAN-AGT-2024-88312", tag:"Canal+ API — Payment ✓", OPDONE:true },
  ],
  fact_fibre: [
    { from:"bot",  delay:700, text:"📡 *Paiement Moov Fibre*\n\nNuméro de contrat fibre du client :", tag:"WAKA NEXUS — Moov Fibre API" },
    { from:"user", delay:1600,text:"FIBRE-OUA-1182" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Vérification abonnement fibre...", tag:"Moov Fibre API — Account Lookup" },
    { from:"bot",  delay:1800,text:"📋 *Abonnement Moov Fibre :*\n\n🌐 Oumarou Sawadogo · Fibre 200 Mbps\n💵 *30.000 FCFA* · Renouvellement mensuel\n\nRenouveler ?", choices:["✅ Payer 30.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain — Fraud Check" },
    { from:"bot",  delay:2000,text:"✅ *Abonnement Fibre renouvelé !*\n\n📡 Oumarou Sawadogo · Fibre 200 Mbps\n💵 *30.000 FCFA*\n💸 Commission : *+300 FCFA*\n🆔 Réf: FIB-AGT-2024-00881\n📅 Valide jusqu'au 01/05/2024", tag:"Moov Fibre API — Payment ✓", OPDONE:true },
  ],
  paiement_marchands: [
    { from:"bot",  delay:0,   text:"🏪 *Paiement Marchands Moov Money*\n\nType d'établissement ?", tag:"WAKA CORE — Merchant Payment",
      choices:["💊 Pharmacie","📚 Librairie / Papeterie","🍽️ Alimentation / Restaurant","🏥 Clinique / Hôpital"],
      branch:{"💊 Pharmacie":"mch_pharmacie","📚 Librairie / Papeterie":"mch_librairie","🍽️ Alimentation / Restaurant":"mch_alim","🏥 Clinique / Hôpital":"mch_clinique"} },
  ],
  mch_pharmacie: [
    { from:"bot",  delay:700, text:"💊 *Paiement Pharmacie*\n\nCode ou numéro Moov du marchand :", tag:"Moov API — Merchant Lookup" },
    { from:"user", delay:1600,text:"PHM-OUA-3312" },
    { from:"bot",  delay:900, text:"✅ *Pharmacie Yennenga*\n📍 Secteur 8, OUA · 🟢 Actif Moov Money\n\nMontant ?", tag:"Moov Core — Merchant Verified" },
    { from:"user", delay:1500,text:"12.500 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Paiement Pharmacie Yennenga :*\n\n💊 *12.500 FCFA* · Commission : *+62 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement...", tag:"Moov Core — Merchant Pay API" },
    { from:"bot",  delay:1800,text:"✅ *Paiement effectué !*\n\n💊 Pharmacie Yennenga · *12.500 FCFA*\n💸 Commission : *+62 FCFA*\n🆔 Réf: MCH-PHM-OUA-20240315-4401\n💰 Solde : *47.874 FCFA*", tag:"Moov Core — Merchant Pay ✓", OPDONE:true },
  ],
  mch_librairie: [
    { from:"bot",  delay:700, text:"📚 *Paiement Librairie / Papeterie*\n\nCode ou numéro Moov du marchand :", tag:"Moov API — Merchant Lookup" },
    { from:"user", delay:1600,text:"LIB-OUA-1144" },
    { from:"bot",  delay:900, text:"✅ *Librairie Diacfa*\n📍 Avenue Kwame Nkrumah, OUA · 🟢 Actif Moov Money\n\nMontant ?", tag:"Moov Core — Merchant Verified" },
    { from:"user", delay:1500,text:"7.800 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Paiement Librairie Diacfa :*\n\n📚 *7.800 FCFA* · Commission : *+39 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement...", tag:"Moov Core — Merchant Pay API" },
    { from:"bot",  delay:1800,text:"✅ *Paiement effectué !*\n\n📚 Librairie Diacfa · *7.800 FCFA*\n💸 Commission : *+39 FCFA*\n🆔 Réf: MCH-LIB-OUA-20240315-3301\n💰 Solde : *47.913 FCFA*", tag:"Moov Core — Merchant Pay ✓", OPDONE:true },
  ],
  mch_alim: [
    { from:"bot",  delay:700, text:"🍽️ *Paiement Alimentation / Restaurant*\n\nCode ou numéro Moov du marchand :", tag:"Moov API — Merchant Lookup" },
    { from:"user", delay:1600,text:"REST-OUA-2241" },
    { from:"bot",  delay:900, text:"✅ *Restaurant Le Verdoyant*\n📍 Secteur 4, OUA · 🟢 Actif Moov Money\n\nMontant ?", tag:"Moov Core — Merchant Verified" },
    { from:"user", delay:1500,text:"9.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Paiement Le Verdoyant :*\n\n🍽️ *9.000 FCFA* · Commission : *+45 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement...", tag:"Moov Core — Merchant Pay API" },
    { from:"bot",  delay:1800,text:"✅ *Paiement effectué !*\n\n🍽️ Le Verdoyant · *9.000 FCFA*\n💸 Commission : *+45 FCFA*\n🆔 Réf: MCH-REST-OUA-20240315-5512\n💰 Solde : *47.919 FCFA*", tag:"Moov Core — Merchant Pay ✓", OPDONE:true },
  ],
  mch_clinique: [
    { from:"bot",  delay:700, text:"🏥 *Paiement Clinique / Hôpital*\n\nCode ou numéro Moov de l'établissement :", tag:"Moov API — Merchant Lookup" },
    { from:"user", delay:1600,text:"CLN-OUA-0881" },
    { from:"bot",  delay:900, text:"✅ *Clinique Dafra*\n📍 Secteur 12, OUA · 🟢 Actif Moov Money\n\nMontant ?", tag:"Moov Core — Merchant Verified" },
    { from:"user", delay:1500,text:"25.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Paiement Clinique Dafra :*\n\n🏥 *25.000 FCFA* · Commission : *+125 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Traitement...", tag:"Moov Core — Merchant Pay API" },
    { from:"bot",  delay:1800,text:"✅ *Paiement effectué !*\n\n🏥 Clinique Dafra · *25.000 FCFA*\n💸 Commission : *+125 FCFA*\n🆔 Réf: MCH-CLN-OUA-20240315-7712\n💰 Solde : *47.999 FCFA*", tag:"Moov Core — Merchant Pay ✓", OPDONE:true },
  ],
  recharge_forfait: [
    { from:"bot",  delay:0,   text:"📱 *Recharge Forfait Mobile*\n\nNuméro Moov du client ?", tag:"WAKA CORE — Forfait Module" },
    { from:"user", delay:1600,text:"+226 70 334 891" },
    { from:"bot",  delay:800, text:"💰 *Choisissez le forfait :*", tag:"Moov IN — Forfait Catalog",
      choices:["📦 200F · Voix 30min","📦 500F · Mix 1Go+appels","📦 1.000F · 3Go","📦 2.000F · 7Go + illimité nuit"],
      branch:{"📦 200F · Voix 30min":"for_200","📦 500F · Mix 1Go+appels":"for_500","📦 1.000F · 3Go":"for_1000","📦 2.000F · 7Go + illimité nuit":"for_2000"} },
  ],
  for_200: [
    { from:"bot",  delay:600, text:"📋 *Confirmation — Forfait Voix 200F :*\n\n📱 +226 70 334 891 · *200F · 30 min voix*\n💸 Commission : *+10 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Activation forfait...", tag:"Moov IN — Forfait API" },
    { from:"bot",  delay:1500,text:"✅ *Forfait activé !*\n\n📱 +226 70 334 891 → *200F · 30 min voix*\n💸 Commission : *+10 FCFA*\n🆔 Réf: FOR-OUA-20240315-1001\n💰 Solde : *47.410 FCFA*\n\n_Client notifié par SMS._", tag:"Moov IN — Forfait ✓", OPDONE:true },
  ],
  for_500: [
    { from:"bot",  delay:600, text:"📋 *Confirmation — Forfait Mix 500F :*\n\n📱 +226 70 334 891 · *500F · 1Go + appels illimités Moov*\n💸 Commission : *+25 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Activation forfait...", tag:"Moov IN — Forfait API" },
    { from:"bot",  delay:1500,text:"✅ *Forfait activé !*\n\n📱 +226 70 334 891 → *500F · 1Go + appels Moov*\n💸 Commission : *+25 FCFA*\n🆔 Réf: FOR-OUA-20240315-5001\n💰 Solde : *47.925 FCFA*\n\n_Client notifié par SMS._", tag:"Moov IN — Forfait ✓", OPDONE:true },
  ],
  for_1000: [
    { from:"bot",  delay:600, text:"📋 *Confirmation — Forfait 3Go 1.000F :*\n\n📱 +226 70 334 891 · *1.000F · 3Go*\n💸 Commission : *+50 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Activation forfait...", tag:"Moov IN — Forfait API" },
    { from:"bot",  delay:1500,text:"✅ *Forfait activé !*\n\n📱 +226 70 334 891 → *1.000F · 3Go*\n💸 Commission : *+50 FCFA*\n🆔 Réf: FOR-OUA-20240315-6612\n💰 Solde : *47.924 FCFA*\n\n_Client notifié par SMS._", tag:"Moov IN — Forfait ✓", OPDONE:true },
  ],
  for_2000: [
    { from:"bot",  delay:600, text:"📋 *Confirmation — Forfait 7Go 2.000F :*\n\n📱 +226 70 334 891 · *2.000F · 7Go + nuit illimitée*\n💸 Commission : *+100 FCFA*\n\nConfirmez ?", choices:["✅ Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Activation forfait...", tag:"Moov IN — Forfait API" },
    { from:"bot",  delay:1500,text:"✅ *Forfait activé !*\n\n📱 +226 70 334 891 → *2.000F · 7Go + illimité nuit*\n💸 Commission : *+100 FCFA*\n🆔 Réf: FOR-OUA-20240315-2001\n💰 Solde : *47.974 FCFA*\n\n_Client notifié par SMS._", tag:"Moov IN — Forfait ✓", OPDONE:true },
  ],
  nanan_express: [
    { from:"bot",  delay:0,   text:"🛵 *Nanan Express — Livraison rapide*\n\nType de commande ?", tag:"WAKA NEXUS — Nanan Express API",
      choices:["🍽️ Repas / Restaurant","🛒 Courses / Épicerie","💊 Médicaments","📦 Colis / Documents"],
      branch:{"🍽️ Repas / Restaurant":"nan_repas","🛒 Courses / Épicerie":"nan_courses","💊 Médicaments":"nan_medic","📦 Colis / Documents":"nan_colis"} },
  ],
  nan_repas: [
    { from:"bot",  delay:700, text:"🍽️ *Livraison Repas*\n\nAdresse de livraison du client :", tag:"Nanan Express — Delivery Init" },
    { from:"user", delay:1600,text:"Secteur 15, Rue 15.44, Ouagadougou" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche restaurants disponibles...", tag:"Nanan Express — Restaurant Search" },
    { from:"bot",  delay:2000,text:"🍽️ *Restaurants disponibles près du client :*\n\n1️⃣ Le Verdoyant · 2,1 km · ~25 min\n2️⃣ Chez Fatou · 1,4 km · ~18 min\n3️⃣ Saveurs du Sahel · 3,0 km · ~30 min\n\nMontant total (repas + livraison) ?", tag:"Nanan Express — Options" },
    { from:"user", delay:1600,text:"8.500 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Commande repas Nanan Express :*\n\n🍽️ Secteur 15, OUA · *8.500 FCFA* · Délai ~25 min\n💸 Commission : *+85 FCFA*\n\nConfirmez ?", choices:["✅ Commander","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Confirmation commande...", tag:"Nanan Express — Order API" },
    { from:"bot",  delay:2000,text:"🎉 *Commande confirmée !*\n\n🛵 Nanan Express en route\n💵 *8.500 FCFA* · Commission : *+85 FCFA*\n🆔 Réf: NAN-REST-OUA-20240315-1188\n⏱️ *~25 min*\n\n_Suivi en temps réel envoyé au client par SMS._", tag:"Nanan Express — Order ✓", OPDONE:true },
  ],
  nan_courses: [
    { from:"bot",  delay:700, text:"🛒 *Livraison Courses / Épicerie*\n\nAdresse de livraison du client :", tag:"Nanan Express — Delivery Init" },
    { from:"user", delay:1600,text:"Secteur 8, Avenue Bassawarga, OUA" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche épiceries disponibles...", tag:"Nanan Express — Shop Search" },
    { from:"bot",  delay:2000,text:"🛒 *Épiceries disponibles :*\n\n1️⃣ Super Wend · 0,8 km · ~15 min\n2️⃣ Marché Tampouy Express · 1,3 km · ~20 min\n\nMontant total des courses ?", tag:"Nanan Express — Options" },
    { from:"user", delay:1600,text:"12.000 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Commande courses Nanan Express :*\n\n🛒 Secteur 8, OUA · *12.000 FCFA* · Délai ~15 min\n💸 Commission : *+120 FCFA*\n\nConfirmez ?", choices:["✅ Commander","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Confirmation commande...", tag:"Nanan Express — Order API" },
    { from:"bot",  delay:2000,text:"🎉 *Commande confirmée !*\n\n🛵 Nanan Express en route\n💵 *12.000 FCFA* · Commission : *+120 FCFA*\n🆔 Réf: NAN-SHOP-OUA-20240315-2233\n⏱️ *~15 min*\n\n_Suivi en temps réel envoyé au client._", tag:"Nanan Express — Order ✓", OPDONE:true },
  ],
  nan_medic: [
    { from:"bot",  delay:700, text:"💊 *Livraison Médicaments*\n\nAdresse de livraison du client :", tag:"Nanan Express — Delivery Init" },
    { from:"user", delay:1600,text:"Secteur 22, OUA" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche pharmacies disponibles...", tag:"Nanan Express — Pharmacy Search" },
    { from:"bot",  delay:2000,text:"💊 *Pharmacies disponibles :*\n\n1️⃣ Pharmacie Yennenga · 1,2 km · ~20 min\n2️⃣ Pharmacie Burkina · 2,0 km · ~28 min\n\nMontant total des médicaments ?", tag:"Nanan Express — Options" },
    { from:"user", delay:1600,text:"6.500 FCFA" },
    { from:"bot",  delay:700, text:"📋 *Livraison médicaments Nanan Express :*\n\n💊 Secteur 22, OUA · *6.500 FCFA* · Délai ~20 min\n💸 Commission : *+65 FCFA*\n\nConfirmez ?", choices:["✅ Commander","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Confirmation commande...", tag:"Nanan Express — Order API" },
    { from:"bot",  delay:2000,text:"🎉 *Commande confirmée !*\n\n🛵 Nanan Express · Médicaments en route\n💵 *6.500 FCFA* · Commission : *+65 FCFA*\n🆔 Réf: NAN-MED-OUA-20240315-3344\n⏱️ *~20 min*\n\n_Suivi en temps réel envoyé au client._", tag:"Nanan Express — Order ✓", OPDONE:true },
  ],
  nan_colis: [
    { from:"bot",  delay:700, text:"📦 *Livraison Colis / Documents*\n\nAdresse d'enlèvement du colis :", tag:"Nanan Express — Delivery Init" },
    { from:"user", delay:1600,text:"Avenue Bassawarga, Secteur 4, OUA" },
    { from:"bot",  delay:700, text:"📍 Adresse de livraison destination :", tag:"Nanan Express — Destination" },
    { from:"user", delay:1600,text:"Secteur 28, Rue 28.11, OUA" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Calcul du tarif de livraison...", tag:"Nanan Express — Pricing API" },
    { from:"bot",  delay:1800,text:"📋 *Livraison colis Nanan Express :*\n\n📦 Secteur 4 → Secteur 28 · *2.500 FCFA*\n⏱️ Délai estimé : *~35 min*\n💸 Commission : *+25 FCFA*\n\nConfirmez ?", choices:["✅ Commander","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Confirmation commande...", tag:"Nanan Express — Order API" },
    { from:"bot",  delay:2000,text:"🎉 *Livraison confirmée !*\n\n🛵 Nanan Express · Coursier en route\n💵 *2.500 FCFA* · Commission : *+25 FCFA*\n🆔 Réf: NAN-COL-OUA-20240315-4455\n⏱️ *~35 min*\n\n_Suivi en temps réel envoyé au client._", tag:"Nanan Express — Order ✓", OPDONE:true },
  ],
  frais_scolarite: [
    { from:"bot",  delay:0,   text:"🎓 *Frais de Scolarité*\n\nType d'établissement ?", tag:"WAKA CORE — EduPay BF",
      choices:["🏫 École primaire / Secondaire","🎓 Université / Grande école","📚 Formation professionnelle"],
      branch:{"🏫 École primaire / Secondaire":"edu_primaire","🎓 Université / Grande école":"edu_universite","📚 Formation professionnelle":"edu_formation"} },
  ],
  edu_primaire: [
    { from:"bot",  delay:700, text:"🏫 *École primaire / Secondaire*\n\nNom ou code de l'établissement :", tag:"WAKA NEXUS — EduPay API" },
    { from:"user", delay:1600,text:"Lycée Zinda — Ouagadougou" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche établissement...", tag:"EduPay BF — Institution Lookup" },
    { from:"bot",  delay:1800,text:"✅ *Lycée Zinda*\n📍 Ouagadougou · Partenaire Moov Money\n\nNuméro matricule de l'élève :", tag:"EduPay BF — Institution Found" },
    { from:"user", delay:1600,text:"LYC-ZIN-2024-3312" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Récupération du dossier...", tag:"EduPay BF — Student Lookup" },
    { from:"bot",  delay:1800,text:"📋 *Frais scolaires Lycée Zinda :*\n\n👤 Aminata Sawadogo · Terminale A\n📅 Année 2023–2024\n💵 Montant dû : *22.500 FCFA*\n📆 Échéance : 31/03/2024\n\nPayer ?", choices:["✅ Payer 22.500 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain + EduPay BF — Payment" },
    { from:"bot",  delay:2000,text:"✅ *Frais scolaires payés !*\n\n🏫 Lycée Zinda · Aminata Sawadogo\n💵 *22.500 FCFA* · Commission : *+225 FCFA*\n🆔 Réf: EDU-LYC-OUA-2024-3312\n\n_Quittance envoyée à l'élève et à l'établissement._", tag:"EduPay BF — Payment ✓", OPDONE:true },
  ],
  edu_universite: [
    { from:"bot",  delay:700, text:"🎓 *Université / Grande école*\n\nNom ou code de l'université :", tag:"WAKA NEXUS — EduPay API" },
    { from:"user", delay:1600,text:"UJKZ — Université J. Ki-Zerbo" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche établissement...", tag:"EduPay BF — Institution Lookup" },
    { from:"bot",  delay:1800,text:"✅ *Université Joseph Ki-Zerbo*\n📍 Ouagadougou · Partenaire Moov Money\n\nNuméro étudiant / référence dossier :", tag:"EduPay BF — Institution Found" },
    { from:"user", delay:1600,text:"UJKZ-2024-ETU-08821" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Récupération du dossier...", tag:"EduPay BF — Student Lookup" },
    { from:"bot",  delay:1800,text:"📋 *Frais de scolarité UJKZ :*\n\n👤 Fatou Traoré · L2 Sciences Éco\n📅 Année 2023–2024\n💵 Montant dû : *45.000 FCFA*\n📆 Échéance : 31/03/2024\n\nPayer ?", choices:["✅ Payer 45.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain + EduPay BF — Payment" },
    { from:"bot",  delay:2000,text:"✅ *Frais universitaires payés !*\n\n🎓 Fatou Traoré · UJKZ L2\n💵 *45.000 FCFA* · Commission : *+450 FCFA*\n🆔 Réf: EDU-OUA-2024-UJKZ-8821\n\n_Quittance officielle générée et envoyée._", tag:"EduPay BF — Payment ✓", OPDONE:true },
  ],
  edu_formation: [
    { from:"bot",  delay:700, text:"📚 *Formation professionnelle*\n\nNom du centre de formation :", tag:"WAKA NEXUS — EduPay API" },
    { from:"user", delay:1600,text:"CFPR — Centre Formation Prof. Ouaga" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Recherche établissement...", tag:"EduPay BF — Institution Lookup" },
    { from:"bot",  delay:1800,text:"✅ *CFPR Ouagadougou*\n📍 Ouagadougou · Partenaire Moov Money\n\nNuméro stagiaire / référence dossier :", tag:"EduPay BF — Institution Found" },
    { from:"user", delay:1600,text:"CFPR-2024-STG-1144" },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Récupération du dossier...", tag:"EduPay BF — Student Lookup" },
    { from:"bot",  delay:1800,text:"📋 *Frais formation CFPR :*\n\n👤 Ibrahim Kaboré · BTP Niveau 3\n📅 Session 2024\n💵 Montant dû : *35.000 FCFA*\n\nPayer ?", choices:["✅ Payer 35.000 FCFA","❌ Annuler"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Paiement en cours...", tag:"AXIOM Brain + EduPay BF — Payment" },
    { from:"bot",  delay:2000,text:"✅ *Frais de formation payés !*\n\n📚 Ibrahim Kaboré · CFPR BTP N3\n💵 *35.000 FCFA* · Commission : *+350 FCFA*\n🆔 Réf: EDU-CFPR-OUA-2024-1144\n\n_Attestation de paiement envoyée._", tag:"EduPay BF — Payment ✓", OPDONE:true },
  ],
  microcredit: [
    { from:"bot",  delay:0,   text:"🏦 *Microcrédit Commercial BCEAO*\n\nMontant souhaité ?", tag:"AXIOM Brain — Agent Credit Scoring",
      choices:["💰 50.000 FCFA · 1 mois","💰 100.000 FCFA · 2 mois","💰 250.000 FCFA · 3 mois"],
      branch:{"💰 50.000 FCFA · 1 mois":"micro_50k","💰 100.000 FCFA · 2 mois":"micro_100k","💰 250.000 FCFA · 3 mois":"micro_250k"} },
  ],
  micro_50k: [
    { from:"bot",  delay:400, type:"processing", text:"⏳ Analyse profil agent...", tag:"AXIOM Brain — Credit Scoring" },
    { from:"bot",  delay:2200,text:"📊 *Scoring AXIOM Brain :*\n\n🏪 Épicerie Wend-Kuni · Score : *87/100* ✅\n\n🎁 *Offre approuvée :*\n💰 *50.000 FCFA* · 1 mois (4 semaines)\n💸 Taux : *3,5%* BCEAO · *1.750 FCFA/semaine*\n\nAcceptez-vous ?", tag:"WAKA CREDIT — Loan Offer 50k", choices:["✅ J'accepte","❌ Refuser"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Déblocage en cours...", tag:"WAKA CREDIT + BCEAO — Disbursement" },
    { from:"bot",  delay:2000,text:"🎉 *Microcrédit débloqué !*\n\n✅ *50.000 FCFA* versés sur votre compte agent\n💰 Nouveau solde : *97.924 FCFA*\n📅 1er remboursement : dans 7 jours\n🆔 Réf: CRED-OUA-2024-AGT-0050\n\n_Calendrier SMS envoyé._", tag:"WAKA CREDIT — Disbursement ✓", OPDONE:true },
  ],
  micro_100k: [
    { from:"bot",  delay:400, type:"processing", text:"⏳ Analyse profil agent...", tag:"AXIOM Brain — Credit Scoring" },
    { from:"bot",  delay:2200,text:"📊 *Scoring AXIOM Brain :*\n\n🏪 Épicerie Wend-Kuni · Score : *87/100* ✅\n\n🎁 *Offre approuvée :*\n💰 *100.000 FCFA* · 2 mois (8 semaines)\n💸 Taux : *3,5%* BCEAO · *3.500 FCFA/semaine*\n\nAcceptez-vous ?", tag:"WAKA CREDIT — Loan Offer 100k", choices:["✅ J'accepte","❌ Refuser"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Déblocage en cours...", tag:"WAKA CREDIT + BCEAO — Disbursement" },
    { from:"bot",  delay:2000,text:"🎉 *Microcrédit débloqué !*\n\n✅ *100.000 FCFA* versés sur votre compte agent\n💰 Nouveau solde : *147.924 FCFA*\n📅 1er remboursement : dans 7 jours\n🆔 Réf: CRED-OUA-2024-AGT-0091\n\n_Calendrier SMS envoyé._", tag:"WAKA CREDIT — Disbursement ✓", OPDONE:true },
  ],
  micro_250k: [
    { from:"bot",  delay:400, type:"processing", text:"⏳ Analyse profil agent — vérification limite BCEAO...", tag:"AXIOM Brain — Credit Scoring Premium" },
    { from:"bot",  delay:2200,text:"📊 *Scoring AXIOM Brain :*\n\n🏪 Épicerie Wend-Kuni · Score : *87/100* ✅\n📋 Volume/mois : 1.247.000 FCFA → *Limite 250k approuvée*\n\n🎁 *Offre approuvée :*\n💰 *250.000 FCFA* · 3 mois (12 semaines)\n💸 Taux : *3,5%* BCEAO · *7.291 FCFA/semaine*\n\nAcceptez-vous ?", tag:"WAKA CREDIT — Loan Offer 250k", choices:["✅ J'accepte","❌ Refuser"] },
    { from:"bot",  delay:400, type:"processing", text:"⏳ Déblocage en cours...", tag:"WAKA CREDIT + BCEAO — Disbursement" },
    { from:"bot",  delay:2000,text:"🎉 *Microcrédit débloqué !*\n\n✅ *250.000 FCFA* versés sur votre compte agent\n💰 Nouveau solde : *297.924 FCFA*\n📅 1er remboursement : dans 7 jours\n🆔 Réf: CRED-OUA-2024-AGT-0250\n\n_Calendrier SMS envoyé._", tag:"WAKA CREDIT — Disbursement ✓", OPDONE:true },
  ],
  merchant_balance: [
    { from:"bot", delay:0,    type:"processing", text:"⏳ Chargement tableau de bord...", tag:"Moov Core — Agent Dashboard" },
    { from:"bot", delay:1400, text:"📊 *Tableau de bord Agent Moov*\n\n🏪 *Épicerie Wend-Kuni* · AGT-OUA-2281\n🖥️ *TPE* : Actif · Secteur 22 OUA\n━━━━━━━━━━━━━━━━━━━━━━\n💰 *Solde agent :* 147.924 FCFA\n📅 *Aujourd'hui :*\n   💵 Dépôts/Retraits QR : 3 ops\n   🌍 Transferts : 2 ops\n   🧾 Factures payées : 1 op\n   💸 *Commissions : +1.267 FCFA*\n━━━━━━━━━━━━━━━━━━━━━━\n🏦 *Microcrédit en cours :* 100.000 FCFA\n📆 Prochain remboursement : dans 7j\n━━━━━━━━━━━━━━━━━━━━━━\n📈 *Volume ce mois :* 1.247.000 FCFA", tag:"Moov Core — Agent Dashboard ✓", OPDONE:true },
  ],
  agent: [
    { from:"bot",  delay:0,    text:"🏦 *Opération Agent Moov Money*\n\nChoisissez :", tag:"WAKA NEXUS — Agent Network", choices:["📥 Dépôt cash","📤 Retrait cash"] },
    { from:"bot",  delay:800,  text:"📥 *Dépôt via agent*\n\nEntrez le *code de l'agent* :", tag:"Moov API — Agent Lookup" },
    { from:"user", delay:1800, text:"AGT-OUA-2281" },
    { from:"bot",  delay:900,  text:"✅ *Agent trouvé :*\nBoutique Télé Express\n📍 Marché Rood Woko, Ouagadougou\n🟢 Agent actif · Stock disponible\n\nMontant à déposer ?", tag:"Moov Core — Agent Verified" },
    { from:"user", delay:1600, text:"10.000 FCFA" },
    { from:"bot",  delay:600,  text:"📋 *Confirmation dépôt :*\n\n🏪 Agent : Télé Express\n💵 Montant : *10.000 FCFA*\n💳 Commission : gratuit\n\n⚠️ Remettez le cash à l'agent puis confirmez :", choices:["✅ Cash remis — Confirmer","❌ Annuler"] },
    { from:"bot",  delay:400,  type:"processing", text:"⏳ Validation du dépôt...", tag:"Moov Core — Cash Deposit API" },
    { from:"bot",  delay:1800, text:"🎉 *Dépôt confirmé !*\n\n💵 *10.000 FCFA* ajoutés\n🆔 Réf: DEP-AGT-OUA-20240315-0882\n💰 Nouveau solde : *10.500 FCFA*\n\n_Télé Express a validé le dépôt._", tag:"Moov Core — Deposit Committed ✓", OPDONE:true },
  ],
};

/* ══════════════════════════════════════════════════════════════
   SCENARIOS META
══════════════════════════════════════════════════════════════ */
const SCENARIOS_META: Record<string, any> = {
  gsm2money: {
    label:"GSM → Activation Moov Money", icon:"📱", color:C.moovCyan,
    description:"Convertir un abonné GSM en client Moov Money",
    hasWallet: true,
    sub:{ name:"Oumarou Sawadogo", msisdn:"+226 70 123 456", type:"GSM sans Moov Money", status:"Active", tenure:"2 ans", arpu:"3.800 FCFA/mois" },
    kpis:[
      { label:"Abonnés GSM sans Moov Money", value:"312.440", color:C.moovCyan },
      { label:"Taux conversion estimé",       value:"16–22%",  color:C.amber },
      { label:"Activations potentiel",        value:"~58.000", color:C.ok },
      { label:"Revenue potentiel/mois",       value:"+22M FCFA", color:C.wakaGold },
    ],
  },
  reactivation: {
    label:"Réactivation Compte Dormant", icon:"💤", color:C.red,
    description:"Détecter et réactiver les comptes inactifs",
    hasWallet: true,
    sub:{ name:"Aminata Traoré", msisdn:"+226 65 789 012", type:"Moov Money Dormant", status:"Dormant", tenure:"3 ans", arpu:"0 FCFA", lastTx:"il y a 203 jours" },
    kpis:[
      { label:"Comptes dormants",        value:"89.210",    color:C.red },
      { label:"Solde retenu total",      value:"1,1Md FCFA",color:C.amber },
      { label:"Réactivation estimée",    value:"25–33%",    color:C.ok },
      { label:"Revenue récupérable",     value:"+14M FCFA", color:C.wakaGold },
    ],
  },
  fibre_product: {
    label:"Vente Fibre + Cross-sell Moov Money", icon:"🌐", color:C.teal,
    description:"Intérêt fibre optique → capture données → cross-sell Moov Money",
    hasWallet: false,
    sub:{ name:"Seydou Compaoré", msisdn:"+226 76 458 912", type:"Prospect Fibre", status:"Prospect", tenure:"Nouveau", arpu:"N/A", extra:"Zone: Secteur 30 OUA" },
    kpis:[
      { label:"Leads Fibre/mois",            value:"1.240",    color:C.teal },
      { label:"Taux cross-sell Moov Money",  value:"38%",      color:C.amber },
      { label:"Revenue Fibre/mois",          value:"37M FCFA", color:C.ok },
      { label:"Moov Money via Fibre",        value:"+470",     color:C.wakaGold },
    ],
  },
  merchant: {
    label:"Agent / Marchand Moov", icon:"🏪", color:"#F0932B",
    description:"KYC entreprise → compte agent → TPE + QR + 8 services clients",
    hasWallet: false,
    isMerchant: true,
    sub:{ name:"Idrissa Ouédraogo", msisdn:"+226 74 881 203", type:"Commerce Général", status:"Prospect", tenure:"5 ans activité", arpu:"N/A", extra:"Secteur 22, OUA" },
    kpis:[
      { label:"Marchands potentiels BF",       value:"127.000",   color:"#F0932B" },
      { label:"Volume moyen/marchand/mois",    value:"847K FCFA", color:C.moovCyan },
      { label:"Commission Moov/marchand/mois", value:"+4.235F",   color:C.ok },
      { label:"Revenue réseau marchands/mois", value:"+538M FCFA",color:C.wakaGold },
    ],
  },
  new_gsm_lead: {
    label:"Capture Lead Non-Client Moov", icon:"🎯", color:C.orange,
    description:"Prospecter et pré-qualifier les clients Orange/Telecel",
    hasWallet: false,
    sub:{ name:"Ibrahim Kaboré", msisdn:"+226 65 234 789", type:"Client Orange BF", status:"Prospect", tenure:"+3 ans", arpu:"~15.000F/mois", extra:"Portabilité" },
    kpis:[
      { label:"Prospects captés/mois",        value:"4.100",    color:C.orange },
      { label:"Score moyen qualification",     value:"81/100",   color:C.amber },
      { label:"Taux conversion lead",          value:"21%",      color:C.ok },
      { label:"Revenue GSM potentiel",         value:"+38M FCFA",color:C.wakaGold },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════
   WALLET OPS META
══════════════════════════════════════════════════════════════ */
const WALLET_OPS_META = [
  { key:"send_money",  icon:"💸", label:"Envoyer argent",       color:C.blue      },
  { key:"pay_bill",    icon:"🧾", label:"Payer facture",         color:C.amber     },
  { key:"credit",      icon:"📱", label:"Crédit Moov",           color:C.purple    },
  { key:"balance",     icon:"💰", label:"Consulter solde",       color:C.ok        },
  { key:"history",     icon:"📊", label:"Historique",            color:C.amber },
  { key:"agent",       icon:"🏦", label:"Agent dépôt/retrait",   color:C.moovMoney },
];

/* ══════════════════════════════════════════════════════════════
   BUBBLE COMPONENT
══════════════════════════════════════════════════════════════ */
function Bubble({ msg, onChoice, choiceDone }: { msg: any; onChoice: (choice: string, branch?: any) => void; choiceDone?: string }) {
  const b = txt => txt
    .replace(/\*(.*?)\*/g, (_, m) => `<strong>${m}</strong>`)
    .replace(/\n/g, "<br/>");

  if (msg.from === "system") return (
    <div style={{ textAlign:"center", margin:"8px 4px" }}>
      <div style={{ display:"inline-block", background:"rgba(0,61,165,0.1)", border:"1px solid #003DA530", borderRadius:9, padding:"6px 14px", fontSize:10, color:C.moovCyan, maxWidth:"92%", textAlign:"left" }}>
        <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>⚡ {msg.tag}</div>
        <div style={{ color:"#64748b", whiteSpace:"pre-line" }}>{msg.text}</div>
      </div>
    </div>
  );

  const isUser = msg.from === "user";
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:5, animation:"fadeIn .25s ease" }}>
      <div style={{ maxWidth:"82%" }}>
        {msg.type === "processing" ? (
          <div style={{ background:C.waBubbleBot, borderRadius:"12px 12px 12px 2px", padding:"9px 13px", boxShadow:"0 1px 3px #0001" }}>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:C.moovBlue,animation:`bop 1.2s ${i*.2}s infinite` }}/>)}
              <span style={{ marginLeft:8, fontSize:11.5, color:"#888" }}>{msg.text}</span>
            </div>
            {msg.tag && <div style={{ fontSize:8, color:"#b0c4d8", marginTop:4, fontFamily:"monospace" }}>{msg.tag}</div>}
          </div>
        ) : msg.type === "image" ? (
          <div style={{ background:isUser?C.waBubbleUser:C.waBubbleBot, borderRadius:isUser?"12px 2px 12px 12px":"2px 12px 12px 12px", padding:"8px 11px", boxShadow:"0 1px 3px #0001" }}>
            <div style={{ background:"#f0f0f0", borderRadius:7, padding:"10px 16px", textAlign:"center", fontSize:22, marginBottom:4 }}>{msg.icon||"📎"}</div>
            <div style={{ fontSize:10.5, color:"#555" }}>{msg.text}</div>
          </div>
        ) : (
          <div>
            <div style={{ background:isUser?C.waBubbleUser:C.waBubbleBot, borderRadius:isUser?"12px 2px 12px 12px":"2px 12px 12px 12px", padding:"8px 11px", boxShadow:"0 1px 3px #0001" }}>
              <div style={{ fontSize:14, color:"#1a1a1a", lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html:b(msg.text) }}/>
              {msg.tag && <div style={{ fontSize:9, color:"#a0b8cf", marginTop:4, fontFamily:"monospace" }}>{msg.tag}</div>}
            </div>
            {msg.choices && !choiceDone && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:5 }}>
                {msg.choices.map(c => (
                  <button key={c} onClick={() => onChoice(c, msg.branch)}
                    style={{ background:"#fff", border:"1.5px solid #003DA5", borderRadius:18, padding:"5px 10px", fontSize:12, color:"#003DA5", cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all .15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#e8f0ff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="#fff"; }}
                  >{c}</button>
                ))}
              </div>
            )}
            {choiceDone && msg.choices && (
              <div style={{ marginTop:4, fontSize:9.5, color:"#999" }}>✓ {choiceDone}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   API LOG
══════════════════════════════════════════════════════════════ */
function ApiLog({ events }: { events: any[] }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [events]);
  const col = t => t==="success"?C.ok:t==="wallet"?C.moovCyan:t==="info"?"#94a3b8":C.moovMoney;
  return (
    <div ref={ref} style={{ background:"#020709", borderRadius:8, padding:"7px 9px", height:130, overflowY:"auto", fontFamily:"monospace" }}>
      {events.length===0 && <div style={{ color:"#4a6fa5", fontSize:9.5 }}>— En attente —</div>}
      {events.map((e,i) => (
        <div key={i} style={{ fontSize:9, marginBottom:2, display:"flex", gap:6 }}>
          <span style={{ color:"#4a6fa5" }}>{e.t}</span>
          <span style={{ color:col(e.type) }}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WALLET PANEL
══════════════════════════════════════════════════════════════ */
function WalletPanel({ onSelect, completedOps, disabled }: { onSelect: (key: string) => void; completedOps: string[]; disabled: boolean }) {
  return (
    <div style={{ animation:"fadeIn .4s ease" }}>
      <div style={{ fontSize:8.5, color:C.ok, letterSpacing:2, fontWeight:700, marginBottom:10, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:C.ok,animation:"pulse 2s infinite" }}/>
        Moov Money Active — Opérations
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
        {WALLET_OPS_META.map(op => {
          const done = completedOps.includes(op.key);
          return (
            <button key={op.key} onClick={() => !disabled && onSelect(op.key)}
              style={{ background:done?op.color+"20":op.color+"0d", border:`1px solid ${done?op.color+"80":op.color+"35"}`, borderRadius:9, padding:"10px 5px", cursor:disabled?"not-allowed":"pointer", textAlign:"center", fontFamily:"inherit", transition:"all .2s", position:"relative", opacity:disabled?.5:1 }}
              onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}>
              {done && <div style={{ position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.ok }}/>}
              <div style={{ fontSize:19 }}>{op.icon}</div>
              <div style={{ fontSize:8.5, fontWeight:700, color:op.color, marginTop:4, lineHeight:1.2 }}>{op.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PHASE BAR
══════════════════════════════════════════════════════════════ */
function PhaseBar({ phase, hasWallet, isMerchant }: { phase: string; hasWallet: boolean; isMerchant?: boolean }) {
  const phases = isMerchant
    ? [{key:"onboarding",label:"① KYB Marchand",color:"#F0932B"},{key:"wallet",label:"② Services Agent/Marchand ✓",color:C.ok}]
    : hasWallet
    ? [{key:"onboarding",label:"① Onboarding / KYC",color:C.moovBlue},{key:"wallet",label:"② Moov Money Ops",color:C.ok}]
    : [{key:"onboarding",label:"① Conversation IA",color:C.teal},{key:"done",label:"② Lead/Commande ✓",color:C.ok}];
  return (
    <div style={{ display:"flex", gap:5, marginBottom:10 }}>
      {phases.map(p=>(
        <div key={p.key} style={{ flex:1, textAlign:"center", padding:"6px 6px", borderRadius:8, background:phase===p.key?`${p.color}18`:"rgba(255,255,255,0.01)", border:`1px solid ${phase===p.key?p.color+"70":"#1d3660"}`, fontSize:9.5, fontWeight:700, color:phase===p.key?p.color:"#4a6fa5", transition:"all .4s" }}>
          {p.label}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUBSCRIBER CARD
══════════════════════════════════════════════════════════════ */
function SubCard({ sub, accent }: { sub: any; accent: string }) {
  const statusColor = sub.status==="Active"?C.ok:sub.status==="Dormant"?C.red:C.amber;
  return (
    <div style={{ background:"linear-gradient(135deg,#0D1B4B,#162350)", borderRadius:12, padding:"12px 14px", marginBottom:12, border:`1px solid ${accent}30` }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
        <div style={{ width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.moovBlue},${C.moovCyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0 }}>
          {sub.name.split(" ").map(n=>n[0]).join("")}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff",fontWeight:700,fontSize:12 }}>{sub.name}</div>
          <div style={{ color:"#8ab0cc",fontSize:10.5 }}>{sub.msisdn}</div>
        </div>
        <span style={{ background:statusColor+"20", color:statusColor, border:`1px solid ${statusColor}`, borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:700 }}>{sub.status}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
        {[["Type",sub.type],["Ancienneté",sub.tenure],["ARPU",sub.arpu],[sub.lastTx?"Dernière TX":sub.extra?"Info":null, sub.lastTx||sub.extra||"Bonus 500 FCFA 🎁"]].filter(([k])=>k).map(([k,v])=>(
          <div key={k} style={{ background:"rgba(255,255,255,0.07)",borderRadius:6,padding:"5px 8px" }}>
            <div style={{ color:"#7a9bbf",fontSize:8.5,textTransform:"uppercase",letterSpacing:.8 }}>{k}</div>
            <div style={{ color:"#cbd5e1",fontSize:10.5,fontWeight:600,marginTop:1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LEAD / ORDER RESULT PANEL
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   MERCHANT PANEL
══════════════════════════════════════════════════════════════ */
const MERCHANT_OPS_META = [
  { key:"depot_retrait",      icon:"💵", label:"Dépôt / Retrait QR",       color:C.moovCyan  },
  { key:"transfert_national", icon:"🇧🇫", label:"Transfert National",       color:C.blue      },
  { key:"transfert_intl",     icon:"🌍", label:"Transfert International",   color:C.teal      },
  { key:"paiement_factures",  icon:"🧾", label:"Paiement Factures",         color:C.amber     },
  { key:"paiement_marchands", icon:"🏪", label:"Paiement Marchands",        color:"#F0932B"   },
  { key:"recharge_forfait",   icon:"📱", label:"Recharges Forfaits",        color:C.purple    },
  { key:"nanan_express",      icon:"🛵", label:"Nanan Express",             color:C.red       },
  { key:"frais_scolarite",    icon:"🎓", label:"Frais de Scolarité",        color:C.ok        },
  { key:"microcredit",        icon:"🏦", label:"Microcrédit BCEAO",         color:C.moovMoney },
  { key:"merchant_balance",   icon:"📊", label:"Tableau de bord",           color:"#818cf8"   },
];

function MerchantPanel({ onSelect, completedOps, disabled }: { onSelect: (key: string) => void; completedOps: string[]; disabled: boolean }) {
  return (
    <div style={{ animation:"fadeIn .4s ease" }}>
      <div style={{ fontSize:8.5, color:"#F0932B", letterSpacing:2, fontWeight:700, marginBottom:8, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:"#F0932B",animation:"pulse 2s infinite" }}/>
        Agent / Marchand — Services Moov Money
      </div>
      <div style={{ background:"rgba(240,147,43,0.06)", border:"1px solid rgba(240,147,43,0.2)", borderRadius:9, padding:"8px 10px", marginBottom:9, fontSize:9.5, color:"#F0932B" }}>
        🏪 *Épicerie Wend-Kuni* · AGT-OUA-2281 · TPE actif 🖥️<br/>
        <span style={{ color:"#8ab0cc", fontSize:9 }}>Commission jour : +237 FCFA · Solde : 147.237 FCFA</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        {MERCHANT_OPS_META.map(op => {
          const done = completedOps.includes(op.key);
          return (
            <button key={op.key} onClick={() => !disabled && onSelect(op.key)}
              style={{ background:done?op.color+"20":op.color+"0d", border:`1px solid ${done?op.color+"80":op.color+"35"}`, borderRadius:9, padding:"10px 7px", cursor:disabled?"not-allowed":"pointer", textAlign:"center", fontFamily:"inherit", transition:"all .2s", position:"relative", opacity:disabled?.5:1, gridColumn: (op.key==="merchant_balance"||op.key==="microcredit")?"span 2":"auto" }}
              onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}>
              {done && <div style={{ position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.ok }}/>}
              <div style={{ fontSize:(op.key==="merchant_balance"||op.key==="microcredit")?17:19 }}>{op.icon}</div>
              <div style={{ fontSize:8.5, fontWeight:700, color:op.color, marginTop:4, lineHeight:1.2 }}>{op.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LeadResultPanel({ scenario, phase }: { scenario: string; phase: string }) {
  if (phase !== "wallet") return (
    <div style={{ border:"1px dashed #0d1c38", borderRadius:8, padding:10, textAlign:"center" }}>
      <div style={{ fontSize:9.5, color:"#4a6fa5" }}>
        {scenario==="fibre_product" ? "🌐 Commande fibre + cross-sell Moov Money en cours..." : "🎯 Qualification lead en cours..."}
      </div>
    </div>
  );

  if (scenario === "fibre_product") return (
    <div style={{ background:"rgba(20,184,166,0.07)", border:`1px solid ${C.teal}40`, borderRadius:10, padding:12, animation:"fadeIn .5s ease" }}>
      <div style={{ fontSize:9.5, fontWeight:700, color:C.teal, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>🌐 Commande Fibre Confirmée</div>
      {[["Offre","Fibre 200 Mbps / 30J"],["Tarif","28.000 FCFA/mois (-2.000F 🎁)"],["Installation","Secteur 30, Ouaga — 48h"],["Moov Money","Ouvert ✓"],["Bonus","1Go data/mois inclus"],["Statut","Technicien programmé 🔧"]].map(([k,v])=>(
        <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10 }}>
          <span style={{ color:"#8ab0cc" }}>{k}</span><span style={{ color:"#e2e8f0",fontWeight:600 }}>{v}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background:"rgba(234,88,12,0.07)", border:`1px solid ${C.orange}40`, borderRadius:10, padding:12, animation:"fadeIn .5s ease" }}>
      <div style={{ fontSize:9.5, fontWeight:700, color:C.orange, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>🎯 Lead Pré-qualifié</div>
      {[["Profil","Premium — Mobile Money"],["Opérateur","Orange → Moov BF"],["Dépense","~15.000 FCFA/mois"],["Score","81/100 ⭐"],["Rappel","< 2h ouvrables"],["Offre","Bundle Bienvenue Moov"]].map(([k,v])=>(
        <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10 }}>
          <span style={{ color:"#8ab0cc" }}>{k}</span><span style={{ color:"#e2e8f0",fontWeight:600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
const WAKA_LOGO_B64 = "data:image/png;base64,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";

export default function MoovWakaDemo() {
  const [lang, setLang]               = useState("fr");
  const [scenario, setScenario]       = useState("gsm2money");
  const [phase, setPhase]             = useState("onboarding");
  const [msgs, setMsgs]               = useState([]);
  const [choicesDone, setChoicesDone] = useState({});
  const [logs, setLogs]               = useState([]);
  const [typing, setTyping]           = useState(false);
  const [engineBusy, setEngineBusy]   = useState(false);
  const [completedOps, setCompletedOps] = useState([]);
  const [activeOp, setActiveOp]       = useState(null);
  const chatEnd    = useRef(null);
  const msgCounter = useRef(0);
  const remainderRef    = useRef(null);
  const remainderIdxRef = useRef(0);
  const waitingOpKey    = useRef(null);

  // ── Code-switching: resolve __LS_KEY__ tokens in sequences ──
  const resolveSeq = useCallback((seq) => {
    const t = LS[lang];
    return seq.map(msg => {
      let m = { ...msg };
      if (typeof m.text === "string") {
        m.text = m.text.replace(/__LS_(\w+)__/g, (_, k) => t[k] ?? "");
      }
      if (Array.isArray(m.choices)) {
        m.choices = m.choices.map(c =>
          typeof c === "string" ? c.replace(/__LS_(\w+)__/g, (_, k) => t[k] ?? "") : c
        );
      }
      return m;
    });
  }, [lang]);

  const getSeq = useCallback((key) => {
    const raw = RAW_WALLET_FLOWS[key] || RAW_ONBOARDING[key];
    return raw ? resolveSeq(raw) : null;
  }, [resolveSeq]);


  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  const addLog = useCallback((msg, type="info") => {
    const ts = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    setLogs(prev => [...prev.slice(-60), { t:ts, msg, type }]);
  }, []);

  const runSeqWithChoices = useCallback(async (seq, startIdx) => {
    setEngineBusy(true);
    for (let i = startIdx; i < seq.length; i++) {
      const msg = seq[i];
      // Skip scripted plain user text — only real clicks generate user bubbles
      // But keep user image/document uploads (type:"image") for narrative realism
      if (msg.from === "user" && msg.type !== "image") continue;
      const delay = i === startIdx ? (i === 0 ? 400 : 200) : (msg.delay ?? 900);
      if (msg.from === "bot" || msg.from === "system") {
        setTyping(true);
        await new Promise(r => setTimeout(r, Math.max(delay, 600)));
        setTyping(false);
      }
      const id = msgCounter.current++;
      setMsgs(prev => [...prev, { ...msg, _id: id }]);
      if (msg.tag) addLog(`→ ${msg.tag}`, msg.tag.includes("✓") ? "success" : "api");
      if (msg.DONE) {
        addLog("✅ Flux terminé — Résultat disponible", "wallet");
        setEngineBusy(false);
        setPhase("wallet");
        return;
      }
      if (msg.OPDONE) { setEngineBusy(false); setActiveOp(null); return; }
      if (msg.choices) {
        remainderRef.current = seq;
        remainderIdxRef.current = i + 1;
        setEngineBusy(false);
        return;
      }
    }
    setEngineBusy(false);
  }, [addLog]);

  const handleBubbleChoice = useCallback((msgId, choice, branchMap) => {
    setChoicesDone(prev => {
      if (prev[msgId] !== undefined) return prev;
      addLog(`👤 "${choice}"`, "info");
      const id = msgCounter.current++;
      setMsgs(m => [...m, { from:"user", text:choice, _id:id }]);
      if (branchMap && branchMap[choice]) {
        remainderRef.current = null;
        const subSeq = getSeq(branchMap[choice]);
        if (subSeq) {
          const opKey = waitingOpKey.current;
          const tagged = subSeq.map(m => ({ ...m, _opKey: opKey }));
          setTimeout(() => runSeqWithChoices(tagged, 0).then(() => {
            if (opKey) setCompletedOps(p => [...new Set([...p, opKey])]);
            setActiveOp(null);
          }), 300);
        }
      } else if (remainderRef.current) {
        const seq = remainderRef.current;
        const idx = remainderIdxRef.current;
        remainderRef.current = null;
        setTimeout(() => runSeqWithChoices(seq, idx), 300);
      }
      return { ...prev, [msgId]: choice };
    });
  }, [addLog, runSeqWithChoices, getSeq]);

  const handleWalletOp = useCallback((opKey) => {
    if (engineBusy) return;
    setActiveOp(opKey);
    waitingOpKey.current = opKey;
    addLog(`💳 Opération: ${opKey.replace(/_/g," ").toUpperCase()}`, "wallet");
    const seq = getSeq(opKey);
    const tagged = seq.map(m => ({ ...m, _opKey: opKey }));
    remainderRef.current = null;
    runSeqWithChoices(tagged, 0).then(() => {
      setCompletedOps(prev => [...new Set([...prev, opKey])]);
      setActiveOp(null);
    });
  }, [engineBusy, addLog, runSeqWithChoices, getSeq]);

  const startDemo = () => {
    setMsgs([]); setChoicesDone({}); setLogs([]); setTyping(false);
    setEngineBusy(false); setPhase("onboarding"); setCompletedOps([]); setActiveOp(null);
    msgCounter.current = 0; remainderRef.current = null;
    addLog(`🚀 ${SCENARIOS_META[scenario].label}`, "info");
    addLog("📡 WAKA NEXUS → Moov Africa Burkina Faso", "api");
    runSeqWithChoices(resolveSeq(RAW_ONBOARDING[scenario]), 0);
  };

  const meta = SCENARIOS_META[scenario];
  const hasWallet = meta.hasWallet;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"linear-gradient(155deg,#04070f 0%,#001a5c 55%,#060b18 100%)", fontFamily:"'Outfit','Segoe UI',sans-serif", color:"#e2e8f0", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bop{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"rgba(0,5,25,.97)", borderBottom:"1px solid rgba(0,174,239,.18)", padding:"9px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          {/* Moov Africa logo */}
          <div style={{ background:C.moovBlue, borderRadius:8, padding:"5px 10px", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontWeight:900, fontSize:13, color:C.moovCyan, letterSpacing:.5 }}>MOOV</span>
            <span style={{ fontWeight:700, fontSize:10, color:"#fff" }}>AFRICA</span>
            <span style={{ fontWeight:900, fontSize:11, color:C.moovMoney, marginLeft:2 }}>BF</span>
          </div>
          <div style={{ width:1, height:26, background:"#4a6fa5" }}/>
          {/* WAKA logo */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:27,height:27,borderRadius:7,background:`linear-gradient(135deg,${C.wakaGold},#f5a623)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:C.wakaNavy }}>W</div>
            <div>
              <div style={{ fontWeight:800,fontSize:12.5,color:"#fff",lineHeight:1 }}>WAKA</div>
              <div style={{ fontSize:7.5,color:"#7a9bbf",letterSpacing:2 }}>INTELLIGENCE OS</div>
            </div>
          </div>
          <span style={{ color:"#4a6fa5",fontSize:11 }}>✕</span>
          <span style={{ fontSize:13 }}>🇧🇫</span>
          <span style={{ fontSize:11,color:"#4a6fa5",fontWeight:600 }}>Burkina Faso · Simulation Démo</span>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          {phase==="wallet" && hasWallet && (
            <div style={{ background:"rgba(255,107,0,.08)", border:`1px solid ${C.moovMoney}45`, borderRadius:20, padding:"3px 12px", fontSize:10.5, color:C.moovMoney }}>
              💙 Moov Money Active · {scenario==="reactivation"?"9.050":"500"} FCFA
            </div>
          )}
          {phase==="wallet" && !hasWallet && (
            <div style={{ background:`rgba(37,211,102,.08)`, border:`1px solid ${C.ok}40`, borderRadius:20, padding:"3px 12px", fontSize:10.5, color:C.ok }}>
              {scenario==="fibre_product" ? "🌐 Commande fibre confirmée ✓" : "🎯 Lead qualifié ✓"}
            </div>
          )}
          <div style={{ background:"rgba(37,211,102,.08)", border:"1px solid rgba(37,211,102,.25)", borderRadius:20, padding:"3px 12px", fontSize:10.5, color:C.ok, display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5,height:5,borderRadius:"50%",background:C.ok,animation:"pulse 2s infinite" }}/>
            WhatsApp API · Simulation
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[["fr","🇧🇫 FR"],["moore","🫅 Mooré"],["dyula","🫅 Dioula"]].map(([l,label])=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{ background:lang===l?`linear-gradient(135deg,${C.wakaGold},#e07b1a)`:`linear-gradient(135deg,${C.wakaNavy},#162350)`, border:`1px solid ${lang===l?C.wakaGold:C.wakaGold+"40"}`, borderRadius:20, padding:"3px 10px", fontSize:9.5, fontWeight:700, color:lang===l?"#fff":C.wakaGold, cursor:"pointer", fontFamily:"inherit", letterSpacing:.5, transition:"all .2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display:"grid", gridTemplateColumns:"282px 1fr 268px", flex:1, overflow:"hidden" }}>

        {/* ── LEFT ── */}
        <div style={{ borderRight:"1px solid #0d1c38", padding:14, overflowY:"auto", background:"rgba(0,0,0,.22)", display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <div style={{ fontSize:8.5, color:"#4a6fa5", letterSpacing:2, fontWeight:700, marginBottom:9, textTransform:"uppercase" }}>Scénarios Démo</div>
            {Object.entries(SCENARIOS_META).map(([id,s])=>(
              <button key={id} onClick={()=>{ if(!engineBusy){ setScenario(id); setMsgs([]); setPhase("onboarding"); setLogs([]); setChoicesDone({}); setCompletedOps([]); setActiveOp(null); msgCounter.current=0; remainderRef.current=null; }}}
                style={{ width:"100%", background:scenario===id?`${s.color}12`:"rgba(255,255,255,0.04)", border:`1px solid ${scenario===id?s.color+"55":"#1a3356"}`, borderRadius:9, padding:"9px 11px", cursor:"pointer", textAlign:"left", marginBottom:7, color:"#e2e8f0", fontFamily:"inherit", transition:"all .2s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                  <span style={{ fontSize:14 }}>{s.icon}</span>
                  <span style={{ fontWeight:700, fontSize:10.5, color:scenario===id?s.color:"#4a6fa5", lineHeight:1.2 }}>{s.label}</span>
                </div>
                <div style={{ fontSize:9, color:"#7a9bbf" }}>{s.description}</div>
                {!s.hasWallet && (
                  <div style={{ marginTop:4, fontSize:8, background:`${s.color}15`, color:s.color, borderRadius:4, padding:"2px 6px", display:"inline-block" }}>
                    {id==="fibre_product"?"🌐 Fibre + Cross-sell":"🎯 Lead Capture"}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:9,textTransform:"uppercase" }}>Profil Détecté</div>
            <SubCard sub={meta.sub} accent={meta.color}/>
          </div>

          <div>
            <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:8,textTransform:"uppercase" }}>Stack WAKA Active</div>
            {[
              {name:"WAKA NEXUS",   desc:"Moov Africa API Integration",   color:C.wakaGold,   on:true},
              {name:"AXIOM Brain",  desc:"KYC · CNIB · AML · Scoring",    color:"#818cf8",    on:phase==="onboarding"&&engineBusy},
              {name:"WAKA VOICE",   desc:"WhatsApp Channel",               color:C.ok,         on:true},
              {name:"WAKA CORE",    desc:"Moov Money & Transactions",      color:"#38bdf8",    on:phase==="wallet"&&hasWallet},
              {name:"WAKA CRM",     desc:"Lead Capture & Scoring",         color:C.orange,     on:scenario==="new_gsm_lead"},
              {name:"GPS + Fibre",  desc:"Géoloc & Couverture réseau",     color:C.teal,       on:scenario==="fibre_product"},
              {name:"WAKA CREDIT",  desc:"Microcrédit BCEAO Agents",    color:"#F0932B",    on:scenario==="merchant"},
            ].map(it=>(
              <div key={it.name} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 9px",borderRadius:7,background:it.on?`${it.color}08`:"rgba(255,255,255,0.04)",border:`1px solid ${it.on?it.color+"28":"#1a3356"}`,marginBottom:4,transition:"all .4s" }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:it.on?it.color:"#2d4a6e",animation:it.on&&engineBusy?"pulse 1.5s infinite":"none",flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:10.5,fontWeight:700,color:it.on?it.color:"#4a6fa5" }}>{it.name}</div>
                  <div style={{ fontSize:8.5,color:"#4a6fa5" }}>{it.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {completedOps.length>0 && (
            <div>
              <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:7,textTransform:"uppercase" }}>Ops Complétées</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {completedOps.map(op=>(
                  <span key={op} style={{ background:C.ok+"12",border:`1px solid ${C.ok}35`,borderRadius:20,padding:"2px 8px",fontSize:9.5,color:C.ok }}>
                    ✓ {op.replace(/_/g," ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER — PHONE ── */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0",overflow:"hidden",gap:8 }}>
          <div style={{ width:"calc((100vh - 150px) * 0.47)",marginBottom:0 }}>
            <PhaseBar phase={phase} hasWallet={hasWallet} isMerchant={meta.isMerchant}/>
          </div>

          <div style={{ width:"calc((100vh - 150px) * 0.47)", height:"calc(100vh - 150px)", background:"#0b0b0b", borderRadius:42, padding:8, boxShadow:"0 40px 80px rgba(0,0,0,.85),0 0 0 1px #252525,inset 0 0 0 1px #353535", display:"flex", flexDirection:"column", position:"relative", flexShrink:0 }}>
            <div style={{ position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:78,height:5,background:"#252525",borderRadius:10,zIndex:10 }}/>
            <div style={{ flex:1,background:"#fff",borderRadius:35,overflow:"hidden",display:"flex",flexDirection:"column" }}>

              {/* WA header — Moov Blue */}
              <div style={{ background:C.moovBlue,padding:"28px 16px 12px",display:"flex",alignItems:"center",gap:9 }}>
                <div style={{ width:42,height:42,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#fff" }}>
                  <img src={WAKA_LOGO_B64} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="WAKA"/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:15 }}>Moov Money BF 🇧🇫</div>
                  <div style={{ color:"rgba(255,255,255,.6)",fontSize:11.5 }}>
                    {typing?"⌨️ en train d'écrire...":phase==="wallet"&&hasWallet?"🟢 Compte Moov Money actif":phase==="wallet"&&!hasWallet?"✅ Flux complété":"Business Account · Moov Africa"}
                  </div>
                </div>
                <div style={{ fontSize:13,color:"rgba(255,255,255,.75)",display:"flex",gap:8 }}>📹 📞</div>
              </div>

              {/* Chat */}
              <div style={{ flex:1,background:C.waBg,backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",overflowY:"auto",padding:"9px 7px" }}>
                <div style={{ textAlign:"center",marginBottom:9 }}>
                  <span style={{ background:"rgba(255,255,255,.72)",borderRadius:20,padding:"2px 12px",fontSize:11,color:"#666" }}>Aujourd'hui · Ouagadougou 🇧🇫</span>
                </div>
                {msgs.length===0 && !typing && (
                  <div style={{ textAlign:"center",color:"#bbb",fontSize:14,marginTop:90,padding:"0 22px" }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>💬</div>
                    Appuyez sur <strong>Lancer la Démo</strong> pour démarrer la simulation
                  </div>
                )}
                {msgs.map(msg => (
                  <Bubble key={msg._id} msg={msg}
                    onChoice={(c, branch) => handleBubbleChoice(msg._id, c, branch)}
                    choiceDone={choicesDone[msg._id]}
                  />
                ))}
                {typing && (
                  <div style={{ display:"flex",marginBottom:5 }}>
                    <div style={{ background:C.waBubbleBot,borderRadius:"12px 12px 12px 2px",padding:"9px 13px",boxShadow:"0 1px 2px #0001" }}>
                      <div style={{ display:"flex",gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#c0c0c0",animation:`bop 1.2s ${i*.2}s infinite` }}/>)}</div>
                    </div>
                  </div>
                )}
                <div ref={chatEnd}/>
              </div>

              {/* Input bar */}
              <div style={{ background:"#f2f2f2",padding:"6px 7px",display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ fontSize:20 }}>😊</div>
                <div style={{ flex:1,background:"#fff",borderRadius:18,padding:"8px 13px",fontSize:13,color:engineBusy?C.moovBlue:phase==="wallet"?"#94a3b8":"#aaa",fontStyle:engineBusy?"italic":"normal" }}>
                  {engineBusy?"Conversation en cours...":phase==="wallet"&&hasWallet?"Choisir une opération →":"Appuyer sur Lancer Démo"}
                </div>
                <div style={{ width:40,height:40,borderRadius:"50%",background:C.moovBlue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>🎙️</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ borderLeft:"1px solid #0d1c38",padding:14,overflowY:"auto",background:"rgba(0,0,0,.22)",display:"flex",flexDirection:"column",gap:13 }}>

          <div>
            <button onClick={startDemo} disabled={engineBusy} style={{ width:"100%", background:engineBusy?"rgba(0,174,239,.07)":`linear-gradient(135deg,${C.moovBlue},${C.moovCyan})`, border:`1px solid ${C.moovCyan}`, borderRadius:10, padding:"12px", fontSize:13.5, fontWeight:800, color:engineBusy?C.moovCyan:"#fff", cursor:engineBusy?"not-allowed":"pointer", fontFamily:"inherit", marginBottom:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {engineBusy ? <><div style={{ width:7,height:7,borderRadius:"50%",background:C.moovCyan,animation:"pulse 1s infinite" }}/>En cours...</> : "▶  Lancer la Démo Complète"}
            </button>
            <button onClick={startDemo} style={{ width:"100%",background:"transparent",border:"1px solid #0d1c38",borderRadius:10,padding:"7px",fontSize:11,color:"#7a9bbf",cursor:"pointer",fontFamily:"inherit" }}>↺ Recommencer</button>
          </div>

          {/* Progress */}
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:8.5,color:"#7a9bbf",fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>Progression</span>
              <span style={{ fontSize:9.5,color:C.moovCyan }}>
                {phase==="wallet"?(hasWallet?"Moov Money active ✓":"Flux terminé ✓"):`${Math.min(msgs.length,RAW_ONBOARDING[scenario].length)}/${RAW_ONBOARDING[scenario].length} étapes`}
              </span>
            </div>
            <div style={{ background:"#08111e",borderRadius:4,height:5 }}>
              <div style={{ width:phase==="wallet"?"100%":`${Math.min((msgs.length/RAW_ONBOARDING[scenario].length)*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${C.moovBlue},${C.moovCyan})`,borderRadius:4,transition:"width .6s ease" }}/>
            </div>
          </div>

          {/* Wallet or lead panel */}
          {meta.isMerchant ? (
            phase === "wallet" ? (
              <MerchantPanel onSelect={handleWalletOp} completedOps={completedOps} disabled={engineBusy}/>
            ) : (
              <div style={{ border:"1px dashed #1a3356", borderRadius:8, padding:10, textAlign:"center" }}>
                <div style={{ fontSize:9.5, color:"#4a6fa5" }}>🏪 KYB Agent en cours — 8 services disponibles après validation BCEAO</div>
              </div>
            )
          ) : hasWallet ? (
            phase === "wallet" ? (
              <WalletPanel onSelect={handleWalletOp} completedOps={completedOps} disabled={engineBusy}/>
            ) : (
              <div>
                <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:9,textTransform:"uppercase" }}>② Moov Money Operations</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7 }}>
                  {WALLET_OPS_META.map(op=>(
                    <div key={op.key} style={{ background:op.color+"06",border:`1px solid ${op.color}20`,borderRadius:9,padding:"10px 5px",textAlign:"center",opacity:.35 }}>
                      <div style={{ fontSize:19 }}>{op.icon}</div>
                      <div style={{ fontSize:8.5,fontWeight:700,color:op.color,marginTop:4,lineHeight:1.2 }}>{op.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign:"center",fontSize:9.5,color:"#4a6fa5",marginTop:9,padding:"7px",border:"1px dashed #0d1c38",borderRadius:8 }}>
                  🔒 Disponible après l'Onboarding KYC
                </div>
              </div>
            )
          ) : (
            <LeadResultPanel scenario={scenario} phase={phase}/>
          )}

          {/* API Log */}
          <div>
            <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:7,textTransform:"uppercase" }}>WAKA NEXUS · Journal API</div>
            <ApiLog events={logs}/>
          </div>

          {/* KPIs */}
          <div>
            <div style={{ fontSize:8.5,color:"#4a6fa5",letterSpacing:2,fontWeight:700,marginBottom:8,textTransform:"uppercase" }}>Métriques Campagne</div>
            {meta.kpis.map(k=>(
              <div key={k.label} style={{ padding:"8px 11px",background:"rgba(255,255,255,0.05)",border:"1px solid #0d1c38",borderRadius:8,marginBottom:5 }}>
                <div style={{ fontSize:9.5,color:"#7a9bbf",marginBottom:1 }}>{k.label}</div>
                <div style={{ fontSize:16,fontWeight:800,color:k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Victory */}
          {((meta.isMerchant && completedOps.length>=2) || (hasWallet && completedOps.length>=3) || (!hasWallet && !meta.isMerchant && phase==="wallet")) && (
            <div style={{ background:"linear-gradient(135deg,rgba(0,174,239,.1),rgba(255,107,0,.06))",border:"1px solid rgba(0,174,239,.25)",borderRadius:10,padding:11,textAlign:"center",animation:"fadeIn .5s ease" }}>
              <div style={{ fontSize:20 }}>{meta.isMerchant?"🏪":hasWallet?"🏆":scenario==="fibre_product"?"🌐":"🎯"}</div>
              <div style={{ fontWeight:800,color:C.moovCyan,fontSize:12.5,marginTop:4 }}>Démo Complète ✓</div>
              <div style={{ fontSize:9.5,color:"#7a9bbf",marginTop:3 }}>
                {meta.isMerchant?`${completedOps.length} services agents activés — Point Moov Money opérationnel`:hasWallet?`${completedOps.length} opérations Moov Money réussies`:scenario==="fibre_product"?"Fibre + Moov Money cross-sell réussis":"Lead qualifié & enregistré en CRM"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
