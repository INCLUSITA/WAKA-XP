UPDATE public.player_saved_flows 
SET scenario_config = jsonb_set(
  COALESCE(scenario_config, '{}'::jsonb),
  '{sourceData}',
  jsonb_build_object(
    'secretValues', jsonb_build_object(
      'X_API_KEY', 'waka_test_xhayuOfTYuoKUAw9LE63Lo3C63OImX9M'
    )
  )
)
WHERE id = '9c52ece4-3706-489c-ae67-7bf43b915596';