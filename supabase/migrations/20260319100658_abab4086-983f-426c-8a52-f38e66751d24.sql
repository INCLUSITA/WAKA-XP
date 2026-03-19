UPDATE uploaded_demos 
SET jsx_source = replace(
  replace(
    replace(jsx_source,
      '👇', '👇🏿'),
    '👈', '👈🏿'),
  '☝', '☝🏿')
WHERE id = 'mtn-waka-demo-cg-v1';