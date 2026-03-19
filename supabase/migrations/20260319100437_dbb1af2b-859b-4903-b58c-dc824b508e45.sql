UPDATE uploaded_demos 
SET jsx_source = replace(jsx_source, 'WhatsApp API · Simulation', 'WAKA API · Simulation')
WHERE id = 'mtn-waka-demo-cg-v1';