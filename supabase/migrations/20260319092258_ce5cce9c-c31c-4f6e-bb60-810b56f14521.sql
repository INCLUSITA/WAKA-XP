UPDATE uploaded_demos 
SET jsx_source = replace(
  jsx_source, 
  E'{phase==="wallet"?"Wallet activa ✓":{t.pasos(msgs.length, ONBOARDING[scenario].length)}}',
  E'{phase==="wallet"?"Wallet activa ✓":t.pasos(msgs.length, ONBOARDING[scenario].length)}'
)
WHERE id IN ('mtn-waka-demo-momo-3', 'mtn-waka-demo-momo-3-sandbox-mmi74zjx')
AND jsx_source LIKE E'%{t.pasos(msgs.length, ONBOARDING[scenario].length)}}%';