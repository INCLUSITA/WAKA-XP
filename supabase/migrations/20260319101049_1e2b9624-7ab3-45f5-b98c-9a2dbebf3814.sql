UPDATE uploaded_demos 
SET jsx_source = replace(
  jsx_source,
  '<span>Scénarios Démo</span>',
  '<span style={{ color:"#FFFFFF" }}>Scénarios Démo</span>'
)
WHERE id = 'mtn-waka-demo-cg-v1';