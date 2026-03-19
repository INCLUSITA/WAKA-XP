UPDATE uploaded_demos 
SET jsx_source = replace(
  replace(
    replace(
      replace(
        replace(jsx_source, 
          'MOOV AFRICA BF LOGO (SVG inline)', 'MTN CONGO CG LOGO (SVG inline)'),
        '>MOOV</span>', '>MTN</span>'),
      'num_moov:', 'num_mtn:'),
    'Moov Money', 'MTN MoMo'),
  'Moov Agent', 'MTN Agent')
WHERE id = 'mtn-waka-demo-cg-v1';