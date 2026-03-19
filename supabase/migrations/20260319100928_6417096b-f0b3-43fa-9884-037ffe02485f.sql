UPDATE uploaded_demos 
SET jsx_source = replace(
  jsx_source,
  'fontSize: 18, animation: guideTarget === ''wallet_op'' || guideTarget === ''launch'' ? "guideFloat 1.5s ease-in-out infinite" : "none"',
  'fontSize: 28, filter: "drop-shadow(0 0 8px rgba(255,203,5,0.7))", animation: "guideFloat 1s ease-in-out infinite"'
)
WHERE id = 'mtn-waka-demo-cg-v1';