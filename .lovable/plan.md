## Objetivo
Hacer que el link público de demos se vea bien en pantallas desktop pequeñas como MacBook, sin romper la vista desktop grande ni el renderer actual.

## Plan
1. **Ajustar el contenedor del share público**
   - Cambiar el área del demo compartido para usar altura real de viewport y evitar que el footer/header reduzcan demasiado el contenido.
   - Mantener scroll solo cuando sea necesario, pero sin cortar elementos clave.

2. **Aplicar auto-fit al renderer JSX**
   - Sustituir el `minWidth: 1280` rígido por un comportamiento adaptativo.
   - En pantallas menores a ~1280px, escalar el demo completo proporcionalmente para que quepan las 3 columnas: panel izquierdo, teléfono y panel derecho.
   - En desktop grande, conservar escala 1:1 para que se vea como el original.

3. **Separar vista pública vs editor**
   - En `/share/:id`, priorizar presentación cliente: demo centrado y completo.
   - En `/demo/:id`, mantener el espacio de edición y paneles internos sin afectar el workflow de sandbox.

4. **Verificación visual**
   - Probar el link `/share/moov-waka-sandbox-mmi73xu3` en viewport tipo MacBook.
   - Confirmar que no vuelve el error de export default y que las columnas no quedan cortadas.

## Detalles técnicos
- El cambio principal irá en `RuntimeJSXRenderer` y, si hace falta, en `ShareDemo`.
- No tocaré la lógica interna del demo Moov ni los datos guardados.
- La solución será responsive por ancho disponible, no por navegador o sistema operativo.