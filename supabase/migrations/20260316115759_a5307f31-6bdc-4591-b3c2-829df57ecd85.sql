UPDATE public.player_saved_flows 
SET scenario_config = jsonb_build_object(
  'sourceData', jsonb_build_object(
    'secretValues', jsonb_build_object(
      'X_API_KEY', 'waka_test_xhayuOfTYuoKUAw9LE63Lo3C63OImX9M'
    )
  )
)
WHERE id = '325c3d74-b39c-4f6f-abd8-4d16acc09816';