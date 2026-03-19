UPDATE uploaded_demos 
SET jsx_source = replace(
  jsx_source,
  'fontSize: 20,
                  display: "inline-block",
                  animation: "guideFloat 1.4s ease-in-out infinite",',
  'fontSize: 36,
                  display: "inline-block",
                  animation: "guideFloat 1s ease-in-out infinite",
                  marginBottom: 2,'
)
WHERE id = 'mtn-waka-demo-cg-v1';