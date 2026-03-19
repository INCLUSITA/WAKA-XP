UPDATE uploaded_demos 
SET jsx_source = replace(
  replace(
    replace(
      replace(
        replace(
          replace(jsx_source,
            '🫅 Lingala', '🥁 Lingala'),
          '🫅 Kituba', '🌍 Kituba'),
        '🫅 FR', '🇨🇬 FR'),
      '👆', '👉🏿'),
    '👋', '👋🏿'),
  '☝️', '☝🏿')
WHERE id = 'mtn-waka-demo-cg-v1';