UPDATE uploaded_demos 
SET jsx_source = replace(jsx_source, 'Azur (ex-Airtel)', 'Azur')
WHERE id = 'mtn-waka-demo-cg-v1';