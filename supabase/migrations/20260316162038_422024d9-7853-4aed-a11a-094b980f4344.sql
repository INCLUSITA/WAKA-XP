
UPDATE public.player_saved_flows 
SET scenario_config = jsonb_set(
  scenario_config,
  '{displayMap}',
  '{
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
    "acquire_service": {
      "type": "service_plans",
      "title": "Plans disponibles",
      "items_from": "available_variants",
      "item_template": {
        "sku": "{sku}",
        "label": "{name}",
        "price": "{price}",
        "description": "{description_short}"
      }
    },
    "simulate_credit": {
      "type": "credit_simulation",
      "title": "Simulation de crédit",
      "payload": {
        "product_name": "{simulation.product_name}",
        "amount": "{simulation.amount}",
        "term": "{simulation.term}",
        "monthly_payment": "{simulation.installment_amount}",
        "interest_rate": "{simulation.interest_rate}",
        "total_cost": "{simulation.total_cost}",
        "frequency": "{simulation.frequency}"
      }
    },
    "create_credit": {
      "type": "credit_contract",
      "title": "Contrat de crédit",
      "payload": {
        "credit_voice_id": "{credit.voice_id}",
        "credit_type": "{credit.credit_type}",
        "amount": "{credit.amount}",
        "status": "{credit.status}",
        "product_name": "{credit.product_name}"
      }
    },
    "quick_status": {
      "type": "status_card",
      "title": "Statut client",
      "payload": {
        "client_name": "{data.client.full_name}",
        "phone": "{data.client.phone}",
        "voice_id": "{data.client.voice_id}",
        "active_credits": "{data.credits_count}",
        "total_balance": "{data.total_balance}",
        "next_payment_date": "{data.next_payment_date}",
        "next_payment_amount": "{data.next_payment_amount}"
      }
    },
    "pay_by_client": {
      "type": "confirmation_card",
      "title": "Paiement confirmé",
      "payload": {
        "status": "success",
        "amount_paid": "{amount_paid}",
        "remaining_balance": "{remaining_balance}",
        "message": "{message}"
      }
    },
    "register_payment": {
      "type": "confirmation_card",
      "title": "Paiement confirmé",
      "payload": {
        "status": "success",
        "amount_paid": "{amount_paid}",
        "remaining_balance": "{remaining_balance}",
        "message": "{message}"
      }
    },
    "open_momo_account": {
      "type": "momo_card",
      "title": "Compte MoMo",
      "payload": {
        "account_number": "{account_number}",
        "account_type": "{account_type}",
        "status": "{status}",
        "message": "{message}"
      }
    }
  }'::jsonb
)
WHERE id = '9c52ece4-3706-489c-ae67-7bf43b915596';
