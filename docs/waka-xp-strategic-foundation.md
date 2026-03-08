# Waka XP — Documento base estratégico

> **Nota sobre naming:** A partir de este documento, el nombre de referencia del producto pasa a ser **Waka XP**. Este cambio no es cosmético: refleja una evolución estratégica del concepto, alejándolo de la idea limitada de "constructor de flujos" y acercándolo a su verdadera naturaleza como plataforma AI-native para diseñar, simular, validar y llevar a producción experiencias conversacionales omnicanal, multimodales y profundamente integradas con el ecosistema WAKA.

---

## 1. Propósito del documento

Este documento establece la base conceptual, estratégica y funcional de Waka XP como pieza central del ecosistema WAKA.

Su objetivo es servir como fundamento para:

- orientar la evolución del producto,
- alinear diseño, arquitectura y visión comercial,
- evitar que Waka XP se limite a ser un clon mejorado de TextIt,
- y construir una plataforma propia capaz de diseñar, simular, validar y llevar a producción journeys conversacionales avanzados, omnicanal, multimodales y nativamente integrados con IA.

Waka XP debe entenderse no como una simple herramienta de diagramación de flujos, sino como una capa estratégica de diseño, simulación, orquestación e industrialización de experiencias conversacionales dentro del ecosistema WAKA.

---

## 2. Punto de partida: la oportunidad real

El origen de Waka XP parte de una observación práctica:

TextIt ofrece una gran libertad para construir flujos complejos en entornos multi-tenant y con múltiples canales e integraciones semi-nativas. Cuando se conoce bien su lógica, permite desplegar journeys muy potentes sin necesidad de construir toda la infraestructura desde cero.

Sin embargo, también presenta limitaciones estructurales importantes:

- reutilización deficiente de partes de flujo,
- dificultad para copiar, modularizar o versionar subflujos,
- traducción no integrada de forma nativa,
- control insuficiente sobre residencia, gobierno y soberanía del dato,
- dependencia de una plataforma externa,
- dificultad para trabajar con clientes regulados,
- crecimiento desordenado del mural,
- fuerte dependencia del flow como contenedor de memoria y continuidad,
- y una lógica de producto nacida antes de la explosión de la IA conversacional moderna.

Estas limitaciones no invalidan el valor de TextIt como inspiración. Al contrario: muestran con claridad qué debe conservarse, qué debe superarse y qué debe reinventarse.

La oportunidad de Waka XP no consiste en copiar TextIt con mejor interfaz, sino en construir el sistema conversacional del siglo XXI: modular, soberano, AI-native, omnicanal y conectado de forma profunda al ecosistema WAKA.

---

## 3. Definición estratégica de Waka XP

### 3.1. Definición corta

Waka XP es la plataforma AI-native de WAKA para diseñar, simular, validar y convertir en producción journeys conversacionales omnicanal, multimodales y profundamente integrados con herramientas, datos y sistemas reales.

### 3.2. Definición ampliada

Waka XP debe convertirse en una mezcla de:

- AI-native conversation builder,
- experience simulator,
- integration studio,
- journey design system,
- orchestration engine,
- y operating layer de transición entre demo y producción.

No debe limitarse a ser un editor visual de nodos, sino una plataforma que permita:

- construir journeys sin fricción,
- visualizar cómo se comportarán en distintos canales,
- probarlos con mockups de alta calidad,
- generar blueprints de ejecución futura,
- reorganizar y recomponer activos existentes,
- y transformarlos en experiencias productivas reales una vez aprobados por cliente y equipo.

---

## 4. Qué no debe ser Waka XP

Para proteger la visión, conviene dejar claro desde el inicio lo que Waka XP no debe convertirse en:

### 4.1. No debe ser un clon de TextIt

Aunque debe aprender de TextIt y aprovechar compatibilidad cuando convenga, no debe heredar como identidad principal su lógica block-first, webhook-first ni rule-tree-first.

### 4.2. No debe ser solo un canvas bonito

Una interfaz visual atractiva no basta. El valor real debe estar en el modelo interno, la simulación, la IA, la reutilización, el puente a producción, la coherencia contextual, el versionado y la integración soberana.

### 4.3. No debe ser un conjunto de demos aisladas

Los mockups no pueden depender permanentemente de archivos JSX artesanales generados externamente. Deben evolucionar hacia una capacidad nativa, basada en datos, reusable y conectada al journey real.

### 4.4. No debe ser un producto encerrado en un solo canal

Waka XP debe pensar desde el principio en omnicanalidad y multimodalidad, aunque la implementación se priorice por fases.

### 4.5. No debe depender del mural como única verdad

El canvas clásico puede seguir existiendo, pero no debe seguir siendo el único contenedor de lógica, memoria, continuidad y comprensión del sistema.

---

## 5. Tesis central: del flujo al journey vivo

La tesis más importante detrás de Waka XP es la siguiente:

> El futuro no está en diseñar solamente flujos, sino en diseñar **journeys vivos** que puedan expresarse en distintos canales, con distintos grados de autonomía y con una capa de ejecución cada vez más cercana a producción.

Esto implica cambiar la unidad mental del producto.

**Modelo antiguo:**

- construir nodos,
- conectarlos,
- añadir reglas,
- usar el mismo mural para toda la continuidad,
- y usar la IA como un bloque más.

**Modelo nuevo:**

- definir objetivo,
- journey,
- contexto,
- datos,
- reglas,
- herramientas,
- modalidad,
- canal,
- validación,
- simulación,
- versión,
- y despliegue progresivo.

En Waka XP, la IA no debe insertarse en el flujo como un simple paso. Debe vivir dentro del sistema como una capacidad transversal que ayuda a construir, adaptar, simular, ordenar, conectar, versionar y llevar a producción.

---

## 6. Pilares conceptuales de Waka XP

La estructura conceptual de Waka XP debe apoyarse sobre seis entidades principales.

### 6.1. Journey / Experience

El Journey o Experience es la unidad central.

Representa el problema de negocio o de experiencia que se quiere resolver.

Ejemplos:

- activar Moov Money a un cliente GSM,
- reactivar una cuenta dormida,
- captar un lead no cliente,
- guiar un onboarding KYC,
- cobrar un préstamo,
- atender soporte,
- simular una oferta,
- o derivar a humano.

El journey debe contener:

- objetivo,
- etapas,
- decisiones,
- resultados esperados,
- restricciones,
- datos necesarios,
- herramientas implicadas,
- puntos de validación,
- y outputs de negocio.

### 6.2. Channel

El Channel define dónde vive la experiencia.

Ejemplos:

- WhatsApp,
- Telegram,
- Instagram,
- Facebook Messenger,
- voz,
- avatar,
- webchat,
- agente escrito,
- app wallet,
- dashboard interno.

Cada canal tiene capacidades, límites, ritmo, semántica y UX propias. El mismo journey no debe diseñarse exactamente igual en todos los canales.

### 6.3. Modality

La Modality define cómo se comporta la experiencia dentro del canal.

Ejemplos:

- flujo guiado tipo TextIt,
- híbrido flujo + IA conversacional,
- IA conversacional completa,
- voz guiada,
- voz híbrida,
- avatar asistido,
- agente humano asistido por IA.

Esto es especialmente relevante en WhatsApp, donde puede haber al menos tres estrategias muy distintas:

- modelo guiado,
- modelo híbrido,
- modelo conversacional completo.

Waka XP debe poder diseñar, comparar y simular estas modalidades sin obligar a duplicar journeys enteros.

### 6.4. Context Layer

La Context Layer mantiene la coherencia de datos, entidades y estado compartido sin obligar a permanecer físicamente dentro del mismo mural o flow.

Aquí viven:

- entidades,
- fields clave,
- contexto de sesión,
- resultados estructurados,
- datos normalizados,
- objetos recuperados o creados,
- y estado compartido entre módulos o flows del mismo árbol.

### 6.5. Execution Layer

La Execution Layer representa cómo el journey podría ejecutarse técnica y operativamente.

- conectores,
- endpoints,
- webhooks,
- tools,
- contratos de datos,
- inputs y outputs,
- mapeos,
- integraciones mock o live,
- observabilidad,
- fallbacks,
- seguridad,
- permisos,
- y readiness para producción.

### 6.6. Governance Layer

La Governance Layer asegura que el sistema sea gobernable, auditable y empresarial.

- multi-tenant,
- roles,
- aislamiento,
- auditoría,
- versionado,
- compliance,
- residencia del dato,
- branding,
- permisos,
- y control operativo.

---

## 7. Compatibilidad heredada versus identidad propia

Antes de seguir avanzando, debe quedar fijado un principio de continuidad esencial para Waka XP.

### 7.1. Lo ya construido no se tira

La evolución del producto no debe partir de una lógica de reemplazo brusco, sino de una lógica de absorción, preservación y elevación de los activos ya construidos.

Waka XP debe mantener y aprovechar dos activos estratégicos que ya existen:

- la copia funcional de TextIt, que aporta velocidad operativa, familiaridad, compatibilidad heredada y capacidad inmediata de diseño de flujos reales,
- y los mockups/demo en JSX externos, que aportan calidad visual, capacidad comercial, validación con cliente y exploración rápida de journeys.

Ninguno de estos dos activos debe considerarse temporal o descartable en el corto plazo. Ambos forman parte del puente de evolución hacia la visión completa de Waka XP.

### 7.2. Principio de no ruptura

Toda evolución de Waka XP debe respetar el siguiente criterio:

- no romper la base funcional tipo TextIt que ya permite diseñar y operar flujos,
- no invalidar los mockups JSX que ya sirven para demos y venta,
- y construir nuevas capas encima de ellos hasta que el sistema nativo pueda absorber progresivamente sus funciones con igual o mayor calidad.

### 7.3. Estrategia correcta

La estrategia correcta no es sustituir lo existente de golpe, sino:

- conservar,
- encapsular,
- reutilizar,
- estandarizar,
- y convertir gradualmente.

Esto significa que la visión de futuro de Waka XP debe construirse como una superestructura sobre esos activos, no como una ruptura que obligue a rehacer valor ya creado.

### 7.4. Compatibilidad sin dependencia

Waka XP debe poder aprovechar TextIt sin quedar prisionero de él.

**Debe sobrevivir como puente:**

- importación de JSON,
- ciertos patrones de flow design,
- reutilización de journeys ya construidos,
- inspiración operativa del canvas visual.

**Debe morir como núcleo conceptual:**

- mentalidad exclusivamente basada en bloques,
- lógica centrada en waits y splits como unidad principal,
- dependencia excesiva de webhooks manuales,
- ausencia de una IA transversal,
- dependencia del mural único.

---

## 8. Experience Studio: la segunda gran capa

Una vez identificado el valor de los mockups JSX externos y su utilidad comercial y de validación, aparece una conclusión estratégica adicional: Waka XP debe incorporar un motor nativo de simulación y experiencia que permita absorber ese valor sin depender permanentemente de piezas artesanales.

### 8.1. El problema a resolver: dos mundos que hoy conviven

En el estado actual conviven dos realidades con mucho valor, pero todavía insuficientemente unidas:

- el mundo builder/flow, donde vive la lógica de flujos, nodos, condiciones e importación/exportación,
- y el mundo demo/mockup JSX, donde viven las experiencias visuales de alta calidad utilizadas para venta, validación, storytelling y diseño de journeys.

El riesgo estratégico de mantener ambos mundos demasiado separados es claro:

- duplicación de trabajo,
- dificultad para pasar de demo a producción,
- inconsistencia entre lo que se vende y lo que realmente se implementa,
- y dependencia excesiva de procesos artesanales para cada mockup.

### 8.2. Separación correcta de capas dentro del mockup

El análisis táctico del sistema actual confirma que muchos demos JSX mezclan en una sola pieza tres niveles distintos:

- Scenario Data,
- Simulator Shell,
- Simulation Logic.

Esta mezcla es útil para demos puntuales generadas con IA, pero limita la escalabilidad del producto.

La evolución correcta es desacoplar estas tres capas para convertirlas en artefactos reutilizables y convertibles.

### 8.3. Qué debe ser Experience Studio

Experience Studio debe permitir:

- crear una demo desde cero,
- crear una demo a partir de un journey,
- crear una demo a partir de un flow existente,
- crear una demo a partir de un JSON importado,
- crear una demo inspirándose en JSX externos,
- editar la experiencia sin código,
- visualizar cómo se ve en distintos canales,
- y convertirla en candidato a producción.

### 8.4. Tesis clave

> Toda experiencia en Waka XP debería poder diseñarse, probarse, venderse y prepararse para producción dentro del mismo sistema.

### 8.5. Simulator Shell

Como evolución directa de los mockups externos, Waka XP debe incorporar un componente nativo equivalente a un Simulator Shell.

Este shell debe representar la capa visual reusable que renderiza una experiencia concreta de canal a partir de datos estructurados, sin necesidad de reescribir cada demo como JSX completo.

### 8.6. Scenario Editor

Sobre el Simulator Shell debe vivir un Scenario Editor o editor de escenarios.

Este editor permitirá definir de forma estructurada:

- secuencias conversacionales,
- mensajes,
- elecciones,
- ramas,
- etiquetas operativas,
- pasos de procesamiento,
- paneles de contexto,
- métricas,
- perfiles,
- branding,
- idioma,
- y otros elementos de simulación.

Este editor podrá estar asistido por IA para generar escenarios a partir de lenguaje natural, briefs comerciales o ejemplos previos.

---

## 9. Del mockup a la producción: el gran diferencial

Una aportación clave del análisis reciente es que el paso de demo a producción no debe entenderse solo como un deseo estratégico general, sino como una capacidad explícita del sistema.

### 9.1. El puente estructural

Waka XP debe incorporar un mecanismo capaz de tomar experiencias simuladas y transformarlas progresivamente en flows reales o candidatos serios a producción.

### 9.2. Scenario-to-Flow Bridge

Una de las primeras expresiones concretas de este puente es la idea de un **Scenario-to-Flow Bridge**.

Su función es traducir estructuras de simulación o secuencias conversacionales a componentes del modelo de flow real.

Esto no significa reducir todo Waka XP a una simple traducción lineal de secuencias a nodos, pero sí reconocer que existe una parte importante del problema que puede resolverse con un compilador o conversor inicial.

### 9.3. Promote to Production

Waka XP debe contemplar explícitamente una acción o estado llamado conceptualmente **Promote to Production**.

Esto significa que una demo validada por cliente o equipo no se considera un artefacto muerto, sino un activo vivo que puede:

- compilarse parcialmente a flow,
- convertirse en candidato a producción,
- enlazarse con conectores reales,
- revisarse y endurecerse,
- y pasar a despliegue progresivo.

### 9.4. Del mockup estático al blueprint ejecutable

Cada demo debería generar no solo una experiencia visual, sino también un **blueprint de ejecución futura**.

Ese blueprint puede incluir:

- qué sistemas intervienen,
- qué datos son necesarios,
- qué operaciones deberían existir,
- qué entradas y salidas se esperan,
- qué conectores reales o mock serían necesarios,
- qué partes están listas para producción,
- y qué dependencias faltan.

### 9.5. El mockup como pre-runtime

La mejor forma de entenderlo es esta:

> El mockup deja de ser un artefacto visual y pasa a ser un **pre-runtime de producción**.

### 9.6. Límites y matices

Aunque el bridge entre scenario y flow es muy valioso, no debe confundirse con la totalidad del modelo de producto.

No todo journey complejo podrá representarse de forma suficiente como una simple secuencia lineal. Por eso, el Scenario-to-Flow Bridge debe ser una capacidad muy útil, pero enmarcada dentro de un modelo canónico más rico que también contemple:

- canal,
- modalidad,
- herramientas,
- contexto,
- memoria,
- blueprint de integración,
- y readiness para producción.

---

## 10. Omnicanalidad y multimodalidad

La omnicanalidad no debe verse como un añadido accesorio. Debe ser una capa fundacional del modelo.

### 10.1. Por qué es necesaria

Un mismo journey no se experimenta igual en:

- WhatsApp,
- Telegram,
- Instagram,
- Facebook,
- voz,
- avatar,
- chat escrito,
- agente asistido,
- o app propia.

### 10.2. Qué debe evitarse

No conviene crear un flow completamente distinto para cada canal y modalidad, porque eso genera complejidad inmanejable.

### 10.3. Qué debe hacerse

Debe existir:

- un journey central,
- con variantes por canal,
- y con variantes por modalidad.

### 10.4. Prioridad realista

Aunque la visión debe ser omnicanal desde el inicio, la implementación debe priorizar por fases. La primera prioridad natural es:

1. WhatsApp,
2. voz,
3. web/agent written,
4. luego otros canales sociales.

---

## 11. Las tres modalidades clave en WhatsApp

WhatsApp merece un tratamiento especial porque es uno de los entornos más importantes para WAKA.

Dentro de WhatsApp, Waka XP debe poder trabajar al menos con tres modelos:

### 11.1. Modo guiado tipo TextIt

- quick replies,
- botones,
- rutas cerradas,
- alto control,
- experiencia muy predecible.

### 11.2. Modo híbrido

- flow estructurado,
- puntos concretos donde entra la IA,
- mezcla de control y naturalidad,
- buen equilibrio entre UX y gobernanza.

### 11.3. Modo conversacional completo

- experiencia libre en formato WhatsApp,
- IA conversacional como interfaz principal,
- reglas y herramientas por detrás,
- sensación de conversación natural.

Waka XP debería ser capaz de mostrar y comparar estas tres variantes del mismo journey.

---

## 12. Integración con el ecosistema WAKA

Waka XP no es una herramienta aislada. Debe integrarse orgánicamente con el ecosistema WAKA.

### 12.1. Integración funcional

Debe poder conectarse, representar o preparar conexión con capas como:

- **WAKA NEXUS** para integraciones API,
- **WAKA AXIOM** para inteligencia contextual operativa,
- **WAKA VOICE** para voz y canales conversacionales,
- **WAKA CORE** para operaciones, scoring, compliance y journeys productivos,
- **WAKA CRM** para leads, estados, campañas y seguimiento,
- y otras capas futuras del ecosistema.

### 12.2. Integración conceptual

Waka XP debe actuar como la capa donde se diseña cómo vive la inteligencia del ecosistema WAKA frente al usuario final.

### 12.3. Integración técnica progresiva

En prototipado, puede simular llamadas. En fase intermedia, puede producir blueprints. En fase madura, puede enlazar conectores reales y promover journeys a producción.

---

## 13. El papel de la IA dentro de Waka XP

La IA debe ser transversal, no periférica.

### 13.1. Lo incorrecto

Usar la IA simplemente como:

- un nodo más,
- un bloque aparte,
- una integración opcional aislada.

### 13.2. Lo correcto

La IA debe ayudar a:

- generar journeys iniciales,
- convertir un briefing comercial en un diseño funcional,
- sugerir ramas,
- proponer herramientas,
- detectar huecos lógicos,
- generar mockups,
- producir blueprints de integración,
- traducir y localizar,
- adaptar mensajes,
- proponer modalidades por canal,
- detectar deuda estructural,
- sugerir modularización,
- y acercar el journey a producción.

### 13.3. Conclusión

> La IA en Waka XP no es un bloque. Es el tejido del sistema.

---

## 14. Soberanía del dato y valor enterprise

Este punto es crítico y diferencia profundamente a Waka XP de plataformas como TextIt.

### 14.1. Problema de origen

Cuando los datos de clientes, journeys, logs y configuraciones viven en plataformas externas, aparece una fragilidad estratégica clara:

- pérdida de control,
- dificultades regulatorias,
- problemas de residencia del dato,
- vendor lock-in,
- límites para sectores sensibles,
- y menor capacidad de personalización profunda.

### 14.2. Oportunidad de Waka XP

Al apoyarse en infraestructura propia, primero en Supabase y después en Azure, Waka XP puede ofrecer:

- soberanía del dato,
- control multi-tenant,
- compliance reforzado,
- integraciones empresariales,
- auditoría,
- permisos por cliente/rol/entidad,
- y arquitectura preparada para banca, telco, IMF, gobierno y seguros.

### 14.3. Posicionamiento resultante

TextIt sirve para operar flujos. Waka XP puede servir para operar experiencias críticas en entornos regulados.

---

## 15. Usuarios, tenants, workspaces, environments y tipos de activo

Para que Waka XP no se convierta en una herramienta monolítica o confusa, es necesario fijar desde esta etapa una estructura mínima de usuarios, aislamiento y organización.

### 15.1. Usuarios iniciales

_(Definidos en fase de construcción y validación.)_

### 15.2. Roles iniciales

En la fase actual de construcción y validación, bastan dos roles iniciales:

- superadmin,
- admin por tenant.

### 15.3. Tenant

El tenant es la unidad principal de aislamiento dentro de Waka XP.

Un tenant representa una entidad independiente, ya sea un cliente o un ambiente propio de WAKA, y debe concebirse desde el inicio con:

- independencia de datos,
- independencia de accesos,
- independencia operativa,
- y futuro despliegue independiente dentro de Azure y del ecosistema WAKA.

### 15.4. Workspace

El workspace puede entenderse como un espacio de trabajo dentro de un tenant para organizar activos, equipos o áreas funcionales.

### 15.5. Environment

El environment representa el estado operativo en el que vive un activo o conjunto de trabajo.

Definición inicial:

- Draft,
- Sandbox,
- Production.

### 15.6. Tipos de activo

Desde ahora, conviene distinguir al menos estos tipos principales:

- Experience,
- Demo,
- Flow,
- Production Candidate.

### 15.7. Relación entre activos

Una misma experience puede tener asociadas:

- una o varias demos,
- uno o varios flows,
- uno o varios production candidates,
- y eventualmente un live asset.

### 15.8. Implicación para la home y navegación

La home y la navegación de Waka XP deben reflejar desde ahora esta estructura mínima:

- contexto de tenant,
- contexto de workspace,
- contexto de environment,
- rol activo,
- y separación visible entre Experiences, Demos, Flows y Production.

---

## 16. Principios de producto

Waka XP debe construirse bajo los siguientes principios:

### 16.1. Separación entre datos, shell y simulación

Las experiencias no deben quedar encapsuladas en archivos visuales monolíticos. Debe separarse claramente:

- datos de escenario,
- shell de experiencia,
- lógica de simulación.

### 16.2. Reutilización del shell visual

La calidad visual de los mockups debe estandarizarse a través de shells nativos reutilizables y no depender de duplicación artesanal de JSX.

### 16.3. Continuidad demo → candidate production

Toda demo aprobada debe poder aspirar a transformarse en un candidato serio a producción mediante mecanismos explícitos del sistema.

### 16.4. Evolución sin destruir activos existentes

_(Los activos existentes deben preservarse y elevarse, no descartarse.)_

### 16.5. Compatibilidad sin dependencia

Aprovechar TextIt como puente, no como cárcel.

### 16.6. Journey-first, no block-first

El journey y el objetivo de negocio son más importantes que la mera conexión visual de nodos.

### 16.7. AI-native por diseño

La IA debe vivir dentro del sistema desde la concepción.

### 16.8. Visual y técnico a la vez

La capa visual debe convivir con una capa declarativa estructurada y portable.

### 16.9. De demo a producción

Todo mockup debe poder evolucionar hacia ejecución real.

### 16.10. Omnicanal y multimodal

La arquitectura debe soportar múltiples canales y modalidades sin duplicar journeys innecesariamente.

### 16.11. Multi-tenant enterprise

Debe poder servir a telcos, bancos, IMF, gobiernos, aseguradoras y partners con branding, permisos y gobernanza adecuados.

### 16.12. Soberanía y compliance

Los datos, logs, contratos y configuraciones deben estar bajo control de WAKA y sus clientes.

### 16.13. Versionado transversal

El versionado no debe ser una feature secundaria ni limitarse a flows.

Debe ser una capacidad transversal aplicable, como mínimo, a:

- Experiences,
- Demos,
- Flows,
- Production Candidates.

Cada activo debe soportar snapshots completos, historial visible, restore, duplicate, compare básico, nombre editable de versión y nota explicativa opcional.

### 16.14. Prevención de entropía estructural

Waka XP debe ayudar a mantener los flows comprensibles, modulares, reutilizables y trazables conforme crecen.

---

## 17. Arquitectura operativa y roadmap de transición

Además de la visión estratégica general, Waka XP necesita una lectura operativa clara que ordene el camino desde lo ya construido hasta la plataforma objetivo.

### 17.1. Journey versus Flow

El **Journey** es la unidad conceptual y de experiencia.

El **Flow** es la implementación operativa o técnica de una parte del journey.

Esta separación es fundamental porque permite que Waka XP no quede atrapado en la lógica de un constructor de nodos, sin perder por ello la capacidad de aterrizar todo en ejecución real.

### 17.2. Arquitectura operativa por capas

#### 17.2.1. Experience Studio

Capa donde se diseñan, visualizan y simulan experiencias.

#### 17.2.2. Bridge Layer

Capa responsable de conectar experiencia y producción.

Incluye:

- Scenario-to-Flow Bridge,
- compiladores iniciales,
- conversión parcial de simulaciones a flows,
- promote to production,
- y generación de candidatos a producción.

#### 17.2.3. Flow Builder

Capa de implementación de flows reales.

Aquí vive la copia funcional inspirada en TextIt, que debe mantenerse como activo estable de primer nivel.

#### 17.2.4. Execution Layer

_(Capa de ejecución técnica y conectores.)_

#### 17.2.5. Governance Layer

Capa transversal de:

- multi-tenant,
- permisos,
- auditoría,
- compliance,
- versionado,
- residencia del dato,
- branding,
- y control operativo.

### 17.3. Componentes de mayor leverage

Para acelerar el valor real de Waka XP, hay cinco componentes especialmente importantes:

- Simulator Shell,
- Scenario Editor,
- AI Journey Generator,
- Scenario-to-Flow Bridge,
- Blueprint Generator.

### 17.4. Flujo operativo objetivo

Waka XP debe aspirar a un flujo de trabajo como este:

1. se describe el caso de uso o brief,
2. la IA ayuda a generar un journey o una demo inicial,
3. Experience Studio renderiza y simula la experiencia,
4. cliente y equipo iteran hasta validarla,
5. se genera un blueprint de integración y readiness,
6. el bridge convierte total o parcialmente esa experiencia en flow,
7. el equipo técnico ajusta tools, mappings e integraciones reales,
8. se promueve a candidato de producción,
9. se valida,
10. y se despliega en ejecución real.

### 17.5. Modelo de persistencia orientativo

Sin fijar todavía el diseño definitivo, Waka XP debe ir preparándose para un modelo de persistencia que soporte como mínimo:

- journeys,
- journey_versions,
- flows,
- flow_versions,
- scenarios,
- scenario_versions,
- tenants,
- profiles y roles,
- integrations,
- webhook_logs,
- runtime_events,
- y artefactos de producción o deployment candidates.

### 17.6. Principio de absorción progresiva

Toda esta arquitectura debe desplegarse respetando un principio esencial:

- mantener lo que ya funciona,
- absorber progresivamente sus capacidades,
- y construir los nuevos componentes sin obligar a romper el builder actual ni los mockups JSX existentes.

---

## 18. Coexistencia entre Classic Builder y XP Studio

Para proteger el valor ya construido y, al mismo tiempo, abrir el espacio necesario para la innovación real de Waka XP, es necesario establecer un principio de coexistencia explícito entre dos capas complementarias del producto.

### 18.1. Dos niveles simultáneos de evolución

Waka XP no debe evolucionar a través de una sustitución brusca del builder actual, sino mediante dos niveles simultáneos:

- una capa clásica y estable de edición y operación de flows,
- y una capa avanzada de experiencia, recomposición y construcción futura.

### 18.2. Classic Builder / Classic Mode

La capa clásica representa la continuidad operativa y la seguridad funcional.

Aquí vive la copia funcional inspirada en TextIt, junto con todas las capacidades que hoy ya generan valor inmediato:

- edición directa de flows,
- mural clásico,
- import/export JSON,
- compatibilidad heredada,
- simulación tradicional,
- y operación estable.

### 18.3. XP Studio / Experience Mode

La capa XP representa el espacio de evolución estructural del producto.

Aquí deben poder vivir:

- la recomposición de flows existentes,
- la construcción de nuevos journeys con mayor libertad,
- árboles y bosques de experiencia,
- contexto compartido,
- modularización avanzada,
- vistas no murales,
- simulación enriquecida,
- omnicanalidad,
- multimodalidad,
- y la transición más inteligente hacia producción.

### 18.4. Puentes entre ambos modos

Waka XP debe permitir progresivamente acciones como:

- abrir un flow clásico en XP Studio,
- reinterpretarlo estructuralmente,
- reorganizarlo en módulos, árboles o contexto compartido,
- compararlo con su forma clásica,
- guardar una versión optimizada,
- y, cuando convenga, derivar o promover esa reinterpretación hacia ejecución real.

### 18.5. Principio resultante

Waka XP debe mantener una capa clásica de edición y operación de flows para continuidad y seguridad, mientras desarrolla en paralelo una capa avanzada de experiencia, recomposición y construcción futura que permita optimizar flows existentes y crear nuevos journeys con mayor libertad, modularidad y coherencia. Ambas capas deben convivir mediante puentes explícitos que permitan abrir, transformar, comparar y promover activos entre el modo clásico y el modo XP.

---

## 19. Arquitectura de árboles, bosques, contexto compartido y visualización avanzada

Uno de los saltos cualitativos más importantes de Waka XP consiste en superar una limitación estructural de las herramientas clásicas de flow building: la dependencia excesiva del mural único como contenedor simultáneo de lógica, contexto, continuidad y visualización.

### 19.1. El problema de origen: el mural como cárcel

En la arquitectura clásica, el flow termina cumpliendo demasiadas funciones a la vez:

- expresa la lógica,
- contiene el contexto,
- define la continuidad,
- y es la única vista disponible.

### 19.2. Principio rector

El mural debe dejar de ser el único lugar donde vive la verdad del sistema.

Debe pasar a ser una de las vistas posibles del trabajo, útil y poderosa, pero no la cárcel conceptual del producto.

### 19.3. Del flow aislado al Experience Tree

La unidad superior propuesta para Waka XP no debe ser únicamente el flow aislado, sino el **Experience Tree**.

El Experience Tree representa el conjunto coherente de módulos, flows, subflows, contextos, ramas y relaciones que forman una misma experiencia de negocio o de usuario.

No equivale a "call another flow" en el sentido clásico.

### 19.4. Del árbol al bosque

Cuando varias experiencias o árboles relacionados interactúan entre sí, Waka XP debe poder representar una estructura todavía mayor: el **Experience Forest**.

Un bosque es el conjunto de árboles o experiencias relacionadas dentro de un tenant, workspace o dominio funcional.

### 19.5. Capas de la nueva arquitectura

Para sostener este modelo, Waka XP debe articular varias capas complementarias:

- Flow Logic Layer,
- Context Layer,
- Visualization Layer,
- Integration Layer.

### 19.6. Context Board

Para evitar que la Context Layer se vuelva invisible o demasiado abstracta, Waka XP debe introducir una superficie visual explícita llamada provisionalmente **Context Board**.

Su objetivo es mostrar y gestionar los datos clave de una experiencia o árbol de forma clara y manipulable.

**Tipos de cards recomendados:**

- Entity Cards
- Key Field Cards
- Session / Shared State Cards
- External Data / API Output Cards

**Interacción deseada:**

- arrastrar outputs de nodos a una card
- crear una nueva card a partir de un dato importante
- mapear un campo a una entidad
- actualizar una entidad existente
- marcar qué cards son obligatorias
- y ver qué módulos leen o actualizan cada pieza de contexto

### 19.7. Orden estructural del mural

Además de la capa de contexto, Waka XP debe mejorar profundamente la organización del mural.

Debe permitir:

- agrupar por fases o módulos
- colapsar y expandir módulos
- auto-layout semántico
- destacar caminos principales y secundarios
- y etiquetar secciones claramente

### 19.8. Copy/paste semántico y reutilización

Waka XP debe permitir:

- seleccionar un conjunto de nodos
- copiarlo
- pegarlo en el mismo flow
- pegarlo en otro flow
- pegarlo en otro módulo
- pegarlo en otro árbol
- y eventualmente guardarlo como módulo reusable o template.

El copy/paste no debe ser solo visual. Debe ser **semántico**.

### 19.9. Vistas alternativas al mural tradicional

La propuesta de Waka XP debe liberar al usuario de la idea de que solo existe una manera de entender un flow.

Debe ofrecer múltiples vistas:

- Canvas View,
- Structured View,
- Context View,
- Tree View,
- Forest View,
- Path View,
- Exception View,
- Data Flow View.

### 19.10. Construcción metódica y sin límite práctico

El objetivo no es hacer murales infinitos, sino permitir que la complejidad crezca de forma ordenada:

- de nodos a módulos,
- de módulos a árboles,
- de árboles a bosques,
- y de bosques a ecosistemas conversacionales coherentes.

### 19.11. Omnicanalidad y multimodalidad dentro de esta arquitectura

Un mismo árbol o experiencia puede expresarse a través de distintos canales y modalidades sin necesidad de duplicar toda la estructura visual o lógica en un único canvas gigante.

### 19.12. Papel de la IA en esta nueva dimensión

La IA debe poder ayudar a:

- detectar saves redundantes,
- identificar nodos que solo existen para transportar contexto,
- sugerir extracción a entidades o cards del Context Board,
- proponer modularización,
- resumir qué hace cada módulo,
- detectar deuda estructural,
- recomendar reorganización visual,
- identificar fragmentos candidatos a template.

### 19.13. Principio de diseño resultante

Waka XP debe combinar un mural estructurado con una Context Layer visible y reutilizable, de modo que la coherencia de datos, entidades y estado compartido no dependa de permanecer físicamente dentro del mismo flow, sino de Experience Trees formados por módulos interconectados que comparten un Context Board común y pueden convivir dentro de Experience Forests más amplios.

---

## 20. Roadmap estratégico de madurez

### Fase 1 — Builder + compatibilidad heredada

Esta fase no debe entenderse solo como punto de partida técnico, sino como un activo estable que Waka XP debe conservar mientras construye capas superiores.

- editor tipo TextIt mejorado,
- import/export JSON,
- simulación básica,
- primeros conectores,
- primer valor inmediato.

### Fase 2 — Experience Studio

- demos nativas de alta calidad,
- renderer interno,
- edición sin código,
- branding por tenant,
- escenarios y mockups reutilizables,
- primer Simulator Shell reusable,
- primer Scenario Editor asistido por IA.

### Fase 3 — Blueprint Layer

- generación de intenciones de integración,
- contratos de datos,
- readiness para producción,
- modos fake/mock/live,
- primer puente técnico real,
- Scenario-to-Flow Bridge inicial,
- estado o acción Promote to Production.

### Fase 4 — Structure & Context Layer

- Context Board,
- módulos colapsables,
- Experience Trees,
- primeras vistas alternativas.

### Fase 5 — Omnichannel & Modality Layer

- journey central,
- variantes por canal,
- variantes por modalidad,
- comparación entre experiencias,
- configuración de agentes de voz/escritos/avatar.

### Fase 6 — Production Promotion

- binding con conectores reales,
- tools de ejecución,
- validaciones,
- despliegue real,
- observabilidad y operación.

### Fase 7 — Integración profunda en WAKA

- acoplamiento orgánico con AXIOM, NEXUS, VOICE, CORE y CRM,
- gobernanza enterprise,
- industrialización y despliegue multi-cliente.

---

## 21. Posicionamiento final

Waka XP no debe presentarse como "un reemplazo de TextIt".

Debe presentarse como:

> La plataforma de WAKA para diseñar, simular, validar y operacionalizar journeys conversacionales omnicanal y AI-native, desde la idea inicial hasta la producción real.

O, en una formulación más potente:

> **Waka XP es el sistema donde una experiencia conversacional se imagina, se diseña, se prueba, se enamora al cliente y se convierte en realidad operativa.**

---

## 22. Conclusión

La riqueza estratégica de Waka XP está en combinar capacidades que normalmente aparecen separadas:

- builder de journeys,
- simulador visual de alta calidad,
- asistente de IA,
- capa de diseño omnicanal,
- puente entre mockup y producción,
- control soberano de datos e integraciones,
- versionado transversal,
- modularidad estructural,
- y separación inteligente entre mural, contexto, árbol y bosque.

Si se construye correctamente, Waka XP no competirá solo con herramientas de flow building. Competirá en una categoría más alta:

> **El diseño y la industrialización de inteligencias conversacionales reales para entornos complejos, regulados y multi-tenant.**

Ese es el fundamento estratégico sobre el que debe crecer.
