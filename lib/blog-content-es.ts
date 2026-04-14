export type BlogContent = {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tag: string;
  sections: { heading: string; body: string }[];
};

export const spanishBlogPosts: Record<string, BlogContent> = {
  'what-is-meta-analysis': {
    title: '¿Qué es un metaanálisis? Una guía para principiantes',
    description: 'Aprende qué es un metaanálisis, por qué es importante en la investigación médica y cómo las herramientas de IA como MetaLens lo hacen accesible.',
    date: '2026-03-15',
    readTime: '6 min de lectura',
    tag: 'Educación',
    sections: [
      {
        heading: '¿Qué es un metaanálisis?',
        body: 'Un metaanálisis es un método estadístico que combina los resultados de múltiples estudios científicos que abordan una pregunta de investigación relacionada. A diferencia de un estudio individual que puede tener un tamaño de muestra limitado o condiciones específicas, un metaanálisis agrupa datos de muchos estudios para producir una estimación más confiable de un efecto.\n\nPor ejemplo, si 20 ensayos clínicos diferentes han estudiado si el Fármaco A es más eficaz que el Fármaco B para tratar la hipertensión, un metaanálisis combinaría sistemáticamente esos hallazgos para llegar a una conclusión más sólida y generalizable.',
      },
      {
        heading: '¿Por qué importa el metaanálisis?',
        body: 'Los metaanálisis ocupan la cima de la jerarquía de evidencia en medicina. Proporcionan la forma más sólida de evidencia porque:\n\n- Aumentan el poder estadístico al combinar tamaños de muestra de varios estudios\n- Reducen el impacto de los sesgos individuales de cada estudio\n- Resuelven conflictos cuando diferentes estudios muestran resultados contradictorios\n- Identifican patrones y efectos que los estudios individuales pueden pasar por alto\n- Orientan las guías de práctica clínica y las decisiones de política sanitaria\n\nCuando un médico decide qué tratamiento recomendar, los metaanálisis son frecuentemente el estándar de oro al que recurre.',
      },
      {
        heading: 'El proceso tradicional del metaanálisis',
        body: 'Realizar un metaanálisis tradicional requiere mucho tiempo. Los investigadores deben:\n\n1. Definir una pregunta de investigación clara\n2. Buscar en múltiples bases de datos (PubMed, Cochrane, Embase) estudios relevantes\n3. Revisar miles de artículos según criterios de inclusión/exclusión\n4. Extraer datos de cada estudio calificado\n5. Evaluar la calidad y el riesgo de sesgo de cada estudio\n6. Aplicar métodos estadísticos (modelos de efectos fijos o de efectos aleatorios)\n7. Interpretar los resultados y redactar los hallazgos\n\nEste proceso puede llevar semanas o meses, incluso para investigadores con experiencia.',
      },
      {
        heading: 'Cómo la IA está cambiando el metaanálisis',
        body: 'Herramientas de IA como MetaLens AI están haciendo que el metaanálisis preliminar sea accesible para todos. Aunque no reemplazan las revisiones sistemáticas formales, pueden:\n\n- Buscar en los más de 40 millones de artículos de PubMed en segundos\n- Identificar estudios relevantes basándose en palabras clave\n- Leer y sintetizar resúmenes automáticamente\n- Generar resúmenes estructurados con hallazgos clave\n- Proporcionar citas de fuentes para verificación\n\nEsto es especialmente valioso para estudiantes de medicina que realizan revisiones bibliográficas preliminares, farmacéuticos que comparan opciones de tratamiento e investigadores que exploran un tema antes de comprometerse con una revisión sistemática completa.',
      },
      {
        heading: 'Limitaciones a tener en cuenta',
        body: 'Las herramientas de metaanálisis basadas en IA tienen limitaciones importantes:\n\n- Trabajan con resúmenes, no con el texto completo de los artículos\n- No pueden realizar agrupaciones estadísticas formales\n- Los resultados deben verificarse con las fuentes originales\n- Pueden omitir estudios relevantes o incluir estudios de baja calidad\n- No son sustituto del juicio clínico\n\nTrate siempre los resúmenes generados por IA como punto de partida para una investigación más profunda, no como evidencia médica definitiva.',
      },
    ],
  },

  'ai-in-medical-research': {
    title: 'Cómo la IA está transformando la investigación médica en 2026',
    description: 'Explora cómo la inteligencia artificial está redefiniendo la investigación médica, desde el descubrimiento de fármacos hasta las revisiones bibliográficas.',
    date: '2026-03-20',
    readTime: '8 min de lectura',
    tag: 'IA y Salud',
    sections: [
      {
        heading: 'La revolución de la IA en la atención médica',
        body: 'La inteligencia artificial ha pasado de ser un concepto futurista a una herramienta cotidiana en la investigación médica. En 2026, la IA asiste a los investigadores en prácticamente cada etapa del proceso científico: desde la generación de hipótesis hasta el análisis de resultados.\n\nLa convergencia de los grandes modelos de lenguaje, los enormes conjuntos de datos biomédicos y la computación en la nube a precios asequibles ha creado una aceleración sin precedentes en la velocidad con la que podemos procesar y comprender la evidencia médica.',
      },
      {
        heading: 'Revisión bibliográfica y síntesis de evidencia',
        body: 'Una de las aplicaciones más impactantes de la IA en medicina es la revisión bibliográfica automatizada. Las herramientas impulsadas por IA pueden:\n\n- Buscar en millones de artículos en segundos (frente a semanas de búsqueda manual)\n- Identificar estudios relevantes basándose en comprensión semántica, no solo en palabras clave\n- Resumir hallazgos de docenas de artículos en resúmenes estructurados\n- Detectar tendencias y consensos en grandes volúmenes de evidencia\n\nMetaLens AI forma parte de esta ola, haciendo accesibles los más de 40 millones de artículos de PubMed a través de búsquedas simples por palabras clave y síntesis impulsada por IA.',
      },
      {
        heading: 'Descubrimiento y desarrollo de fármacos',
        body: 'La IA está acelerando drásticamente el proceso de descubrimiento de fármacos:\n\n- Modelado molecular: la IA predice cómo los candidatos a fármacos interactuarán con los objetivos biológicos\n- Optimización de ensayos clínicos: el aprendizaje automático identifica las poblaciones de pacientes y los criterios de valoración ideales\n- Reposicionamiento: la IA encuentra nuevos usos para medicamentos existentes analizando patrones en los estudios\n- Predicción de seguridad: los modelos señalan posibles efectos secundarios antes de costosos ensayos clínicos\n\nLo que antes requería años de ensayo y error ahora puede acotarse en meses, ahorrando miles de millones en costos de desarrollo.',
      },
      {
        heading: 'IA diagnóstica',
        body: 'Los diagnósticos impulsados por IA ya están en uso clínico:\n\n- Imágenes médicas: la IA detecta cánceres, fracturas y enfermedades de la retina en imágenes de radiología y oftalmología con una precisión que iguala o supera a la de los especialistas\n- Patología: la patología digital con IA asiste en el análisis de muestras de tejidos\n- Genómica: la IA interpreta variantes genéticas y predice el riesgo de enfermedades\n- Wearables: monitorización continua con alertas impulsadas por IA para eventos cardíacos y otras afecciones\n\nEstas herramientas complementan a los médicos en lugar de reemplazarlos, brindando una segunda opinión y detectando hallazgos sutiles.',
      },
      {
        heading: 'Desafíos y consideraciones éticas',
        body: 'A pesar de las promesas, la IA en la investigación médica enfrenta desafíos importantes:\n\n- Sesgo: los modelos de IA pueden perpetuar sesgos presentes en los datos de entrenamiento, lo que puede perjudicar a poblaciones subrepresentadas\n- Transparencia: los modelos de "caja negra" pueden ser difíciles de interpretar en entornos clínicos\n- Validación: las herramientas de IA necesitan una validación clínica rigurosa antes de su implementación\n- Privacidad: los datos de pacientes utilizados para entrenar modelos deben estar protegidos\n- Desinformación: la IA puede generar información médica que suena plausible pero es incorrecta\n\nEl desarrollo responsable y la regulación son esenciales para garantizar que la IA beneficie a todos los pacientes de manera equitativa.',
      },
      {
        heading: 'Perspectivas de futuro',
        body: 'El futuro de la IA en la investigación médica es prometedor. Podemos esperar:\n\n- Medicina personalizada impulsada por el análisis de IA de los datos de pacientes individuales\n- Síntesis de evidencia en tiempo real a medida que se publican nuevos estudios\n- Soporte de decisiones clínicas asistido por IA integrado en los registros electrónicos de salud\n- Herramientas de IA colaborativas que ayuden a los equipos de investigación a trabajar de manera más eficiente a través de las fronteras\n\nHerramientas como MetaLens AI representan solo el comienzo de una transformación que hará que la evidencia médica sea más accesible, comprensible y accionable para todos.',
      },
    ],
  },

  'how-to-compare-drug-efficacy': {
    title: 'Cómo comparar la eficacia de los fármacos: una guía práctica',
    description: 'Un tutorial paso a paso para estudiantes de medicina y farmacéuticos sobre cómo comparar resultados de tratamientos utilizando evidencia publicada.',
    date: '2026-03-25',
    readTime: '7 min de lectura',
    tag: 'Tutorial',
    sections: [
      {
        heading: '¿Por qué comparar la eficacia de los fármacos?',
        body: 'Comparar la eficacia de los fármacos es una de las tareas más comunes en la práctica clínica y en farmacia. Ya sea que seas un estudiante de medicina estudiando farmacología, un farmacéutico asesorando a pacientes o un médico eligiendo entre opciones de tratamiento, entender cómo evaluar la efectividad comparativa es fundamental.\n\nEl desafío es que los datos de eficacia están dispersos en miles de estudios publicados, cada uno con diferentes metodologías, poblaciones de pacientes y variables de resultado. Esta guía te ayudará a navegar esa complejidad.',
      },
      {
        heading: 'Paso 1: Define tu comparación',
        body: 'Comienza definiendo claramente qué deseas comparar:\n\n- ¿Qué fármacos? (p. ej., pranlukast frente a montelukast)\n- ¿Para qué afección? (p. ej., control del asma)\n- ¿Qué resultados? (p. ej., tasas de exacerbación, puntuaciones de síntomas, mortalidad)\n- ¿En qué población? (p. ej., adultos, niños, ancianos)\n\nUna comparación bien definida te ayuda a encontrar estudios relevantes y a evitar comparar cosas que no son comparables.',
      },
      {
        heading: 'Paso 2: Busca en la bibliografía',
        body: 'PubMed es la base de datos principal para la investigación biomédica. Las estrategias de búsqueda eficaces incluyen:\n\n- Usar términos MeSH (Medical Subject Headings) para una búsqueda precisa\n- Combinar nombres de fármacos con términos de afecciones usando operadores AND/OR\n- Filtrar por tipo de estudio (los ensayos controlados aleatorizados ofrecen la evidencia más sólida)\n- Buscar primero revisiones sistemáticas y metaanálisis, ya que ya han realizado el trabajo de síntesis\n\nHerramientas como MetaLens AI pueden acelerar este paso buscando en PubMed y sintetizando los resultados automáticamente.',
      },
      {
        heading: 'Paso 3: Evalúa la calidad de los estudios',
        body: 'No todos los estudios son iguales. Al comparar fármacos, prioriza:\n\n- Ensayos controlados aleatorizados (ECA) sobre estudios observacionales\n- Comparaciones directas (cara a cara) sobre estudios controlados con placebo\n- Tamaños de muestra más grandes sobre tamaños más pequeños\n- Períodos de seguimiento más largos para las afecciones crónicas\n- Estudios con variables de resultado clínicamente relevantes (mortalidad, hospitalización) sobre marcadores sustitutos\n\nUsa herramientas como la herramienta Cochrane de Riesgo de Sesgo para evaluar la calidad de los estudios de forma sistemática.',
      },
      {
        heading: 'Paso 4: Compara los resultados',
        body: 'Al comparar la eficacia de los fármacos entre estudios, observa:\n\n- Tamaños del efecto: ¿Qué tan grande es la diferencia entre los tratamientos?\n- Intervalos de confianza: ¿Qué tan precisa es la estimación?\n- Significancia estadística: ¿Es probable que la diferencia sea real (p < 0,05)?\n- Significancia clínica: ¿Es la diferencia significativa para los pacientes?\n- Número necesario para tratar (NNT): ¿Cuántos pacientes necesitan tratamiento para que uno se beneficie?\n\nUna diferencia estadísticamente significativa puede no ser clínicamente relevante, y viceversa.',
      },
      {
        heading: 'Paso 5: Considera la seguridad y la tolerabilidad',
        body: 'La eficacia es solo la mitad del panorama. También compara:\n\n- Efectos secundarios comunes y su frecuencia\n- Eventos adversos graves\n- Interacciones farmacológicas\n- Contraindicaciones en poblaciones específicas\n- Adherencia del paciente y conveniencia (frecuencia de dosificación, vía de administración)\n\nEl mejor fármaco con frecuencia no es el más eficaz, sino el que tiene el mejor equilibrio entre eficacia, seguridad, costo y aceptación por parte del paciente.',
      },
      {
        heading: 'Uso de MetaLens AI para la comparación de fármacos',
        body: 'MetaLens AI simplifica la comparación de fármacos:\n\n1. Ingresa los nombres de ambos fármacos y la afección como palabras clave (p. ej., "pranlukast, montelukast, asma, eficacia")\n2. La herramienta busca en PubMed estudios relevantes\n3. La IA sintetiza los hallazgos en un resumen estructurado\n4. Obtienes los hallazgos comparativos clave con citas de fuentes\n\nAunque esto no reemplaza una revisión sistemática formal, te proporciona una visión general rápida de la evidencia en segundos en lugar de horas. Úsalo como punto de partida y luego profundiza en los artículos más relevantes.',
      },
    ],
  },

  'understanding-forest-plots': {
    title: 'Cómo interpretar los diagramas de bosque y los gráficos de embudo en el metaanálisis',
    description: 'Una guía visual para interpretar los diagramas de bosque y los gráficos de embudo, dos herramientas esenciales para comunicar los resultados de un metaanálisis.',
    date: '2026-04-01',
    readTime: '7 min de lectura',
    tag: 'Estadística',
    sections: [
      {
        heading: '¿Qué es un diagrama de bosque?',
        body: 'Un diagrama de bosque es la visualización característica de un metaanálisis. Muestra los resultados de los estudios individuales como líneas horizontales con cuadrados y los combina en un diamante único en la parte inferior que representa la estimación agrupada.\n\nCada componente cuenta una historia:\n- **El cuadrado**: la estimación puntual (p. ej., razón de probabilidades, diferencia de medias) para cada estudio individual\n- **La línea horizontal**: el intervalo de confianza del 95% — más ancho significa mayor incertidumbre\n- **El tamaño del cuadrado**: proporcional al peso estadístico del estudio (los estudios más grandes tienen cuadrados más grandes)\n- **La línea vertical**: la línea de ningún efecto (generalmente 0 para diferencias, 1 para cocientes)\n- **El diamante**: el efecto agrupado de todos los estudios (anchura = intervalo de confianza)',
      },
      {
        heading: 'Cómo leer un diagrama de bosque',
        body: 'Leer un diagrama de bosque de arriba hacia abajo:\n\n1. Observa la posición del cuadrado de cada estudio: ¿está a la izquierda o a la derecha de la línea nula?\n2. Comprueba el intervalo de confianza: ¿cruza la línea nula? Si es así, ese estudio no es estadísticamente significativo por sí solo\n3. Observa el diamante en la parte inferior: si no cruza la línea nula, el resultado agrupado es estadísticamente significativo\n4. Busca consistencia: ¿la mayoría de los estudios apuntan en la misma dirección?\n\nUn diagrama de bosque que muestra la mayoría de los cuadrados en un lado con un diamante que no cruza la línea nula indica evidencia sólida y consistente de un efecto.',
      },
      {
        heading: 'El estadístico I²: medición de la heterogeneidad',
        body: 'La heterogeneidad se refiere a la variabilidad entre los resultados de los estudios más allá de lo que se esperaría por azar. El estadístico I² cuantifica esto:\n\n- **I² 0–25%**: Heterogeneidad baja — los estudios son bastante consistentes\n- **I² 26–50%**: Heterogeneidad moderada\n- **I² 51–75%**: Heterogeneidad sustancial\n- **I² >75%**: Heterogeneidad alta — los resultados varían considerablemente\n\nUna heterogeneidad alta es una señal de alerta. Puede indicar que los estudios midieron cosas diferentes, incluyeron diferentes poblaciones de pacientes o utilizaron diferentes intervenciones. Cuando I² es alto, se prefiere un modelo de efectos aleatorios sobre un modelo de efectos fijos.',
      },
      {
        heading: '¿Qué es un gráfico de embudo?',
        body: 'Un gráfico de embudo se utiliza para detectar el sesgo de publicación, es decir, la tendencia de que los estudios con resultados positivos se publiquen con más frecuencia que los negativos.\n\nEn un gráfico de embudo:\n- Cada estudio se representa como un punto\n- El eje x muestra el tamaño del efecto\n- El eje y muestra la precisión del estudio (generalmente el error estándar o el tamaño de la muestra)\n- Los estudios grandes y precisos se agrupan en la parte superior; los estudios pequeños e imprecisos se dispersan en la parte inferior\n\nSi no hay sesgo de publicación, los puntos forman una forma de embudo invertido simétrico. La asimetría, especialmente las lagunas en las esquinas inferiores, sugiere que pueden faltar en la bibliografía estudios pequeños con resultados negativos.',
      },
      {
        heading: 'Errores comunes de interpretación que se deben evitar',
        body: 'Varios errores comunes al leer estos gráficos:\n\n- **Confundir la significancia estadística y la clínica**: un resultado agrupado estadísticamente significativo puede seguir representando un tamaño del efecto clínicamente trivial\n- **Ignorar la heterogeneidad**: una estimación agrupada es engañosa si I² es muy alto\n- **Sobreinterpretar la asimetría del gráfico de embudo**: las pequeñas asimetrías pueden deberse simplemente al azar, especialmente con menos de 10 estudios\n- **Ignorar la escala**: la escala del eje x importa — las razones de probabilidades de 0,95 frente a 0,50 son muy diferentes\n\nLee siempre el diagrama de bosque en contexto con la sección de métodos completa de la revisión.',
      },
      {
        heading: 'Cómo usa MetaLens AI estas visualizaciones',
        body: 'MetaLens AI genera automáticamente diagramas de bosque y gráficos de embudo cuando se pueden extraer suficientes datos cuantitativos de los resúmenes de los estudios.\n\nLa pestaña de Metaanálisis muestra:\n- Estimaciones de estudios individuales con intervalos de confianza\n- El diamante agrupado con IC del 95%\n- Estadístico de heterogeneidad I²\n- Gráfico de embudo de sesgo de publicación\n\nEstas visualizaciones te ayudan a captar rápidamente la dirección, la magnitud y la consistencia de la evidencia, todo a partir de una simple búsqueda por palabras clave.',
      },
    ],
  },

  'systematic-review-protocol': {
    title: 'Cómo escribir un protocolo de revisión sistemática',
    description: 'Orientación paso a paso para crear un protocolo de revisión sistemática conforme a PRISMA, desde el marco PICO hasta el prerregistro.',
    date: '2026-04-05',
    readTime: '8 min de lectura',
    tag: 'Tutorial',
    sections: [
      {
        heading: '¿Por qué redactar primero un protocolo?',
        body: 'Un protocolo de revisión sistemática es un plan preespecificado que se redacta antes de llevar a cabo la revisión. Es la base de una investigación rigurosa, transparente y reproducible.\n\nRedactar el protocolo primero:\n- Previene el "cambio de resultados" (modificar la pregunta de investigación después de ver los datos)\n- Obliga a pensar en los métodos antes de encontrar posibles sesgos\n- Permite la revisión por pares de los métodos antes de invertir semanas de trabajo\n- Crea responsabilidad cuando se registra en bases de datos como PROSPERO\n\nSin un protocolo, las revisiones sistemáticas son vulnerables a los mismos sesgos que están diseñadas para superar.',
      },
      {
        heading: 'Paso 1: Define tu pregunta PICO',
        body: 'Toda revisión sistemática comienza con una pregunta clínica bien estructurada usando el marco PICO:\n\n- **P**oblación: ¿A quién estás estudiando? (p. ej., adultos con diabetes tipo 2)\n- **I**ntervención: ¿Qué tratamiento o exposición? (p. ej., metformina)\n- **C**omparación: ¿Con qué lo comparas? (p. ej., placebo u otro fármaco)\n- **R**esultado (Outcome): ¿Qué estás midiendo? (p. ej., reducción de HbA1c a los 6 meses)\n\nUna pregunta PICO bien formulada podría ser: "En adultos con diabetes tipo 2 (P), ¿la metformina (I) comparada con placebo (C) reduce la HbA1c en ≥1% a los 6 meses (O)?"\n\nTu PICO determina todo lo demás: tu estrategia de búsqueda, los criterios de inclusión/exclusión y el formulario de extracción de datos.',
      },
      {
        heading: 'Paso 2: Especifica los criterios de inclusión y exclusión',
        body: 'Preespecifica exactamente qué estudios incluirás y excluirás:\n\n**Incluir:**\n- Tipos de estudio (p. ej., solo ECA, o también estudios de cohortes)\n- Características de la población (rango de edad, diagnóstico, contexto)\n- Duración mínima del seguimiento\n- Resultados reportados\n- Restricciones de idioma (si las hay)\n\n**Excluir:**\n- Casos clínicos y editoriales\n- Estudios con un tamaño de muestra mínimo inferior al requerido\n- Estudios con alto riesgo de sesgo (define cómo lo evaluarás)\n- Publicaciones duplicadas\n\nSé lo más específico posible. Los criterios vagos conducen a decisiones de cribado inconsistentes.',
      },
      {
        heading: 'Paso 3: Planifica tu estrategia de búsqueda',
        body: 'Una revisión sistemática exhaustiva busca en múltiples bases de datos:\n\n- **PubMed/MEDLINE**: Esencial para temas biomédicos\n- **Embase**: Especialmente útil para ensayos clínicos europeos\n- **Registro Central Cochrane**: Ensayos aleatorizados\n- **CINAHL**: Enfermería y profesiones sanitarias afines\n- **ClinicalTrials.gov**: Ensayos no publicados o en curso (reduce el sesgo de publicación)\n\nPara cada base de datos, desarrolla una cadena de búsqueda usando:\n- Términos MeSH (vocabulario controlado) Y palabras clave de texto libre\n- Operadores booleanos (AND, OR, NOT)\n- Truncamiento (*) y comodines\n\nDocumenta tu cadena de búsqueda exacta — debe ser reproducible. Herramientas como MetaLens AI pueden ayudar con el alcance inicial antes de comprometerte con una búsqueda completa.',
      },
      {
        heading: 'Paso 4: Formulario de extracción de datos',
        body: 'Antes de comenzar a extraer datos, diseña tu formulario de extracción. Para cada estudio incluido, normalmente registrarás:\n\n- ID del estudio, autor, año, país\n- Diseño del estudio y seguimiento\n- Características de la población (tamaño de la muestra, edad, sexo, gravedad basal)\n- Detalles de la intervención (dosis, duración, comparador)\n- Datos de resultados (medias, DE, tasas de eventos, estimaciones del efecto, IC, valores p)\n- Evaluación del riesgo de sesgo\n\nPilota tu formulario en 2-3 estudios antes de la extracción a gran escala. Dos revisores que extraigan de forma independiente con arbitraje reducen los errores.',
      },
      {
        heading: 'Paso 5: Registra tu protocolo',
        body: 'El prerregistro de tu protocolo aumenta la transparencia y la credibilidad:\n\n- **PROSPERO** (prospero.york.ac.uk): El registro más utilizado para revisiones sistemáticas\n- **Open Science Framework** (osf.io): Adecuado para cualquier tipo de investigación\n- **Cochrane**: Si realizas una revisión Cochrane\n\nEl registro te proporciona un historial con fecha y hora que demuestra que tus métodos se decidieron antes de ver los datos. La mayoría de las revistas de alto impacto ahora esperan o exigen el registro para revisiones sistemáticas.\n\nUna vez registrado, cualquier desviación de tu protocolo debe ser reportada y justificada en tu artículo.',
      },
      {
        heading: 'Uso de herramientas de IA en revisiones sistemáticas',
        body: 'Herramientas de IA como MetaLens AI son valiosas para la fase de alcance, antes de redactar tu protocolo formal:\n\n- Escanear rápidamente la bibliografía existente para evaluar si está justificada una revisión sistemática\n- Identificar los artículos y revistas clave en tu área\n- Comprender el estado actual de la evidencia y los tamaños del efecto probables\n- Refinar tu pregunta PICO basándose en lo que realmente se ha estudiado\n\nSin embargo, las herramientas de IA no reemplazan una revisión sistemática formal. Trabajan con resúmenes, pueden omitir estudios relevantes y no pueden realizar evaluaciones formales del riesgo de sesgo. Úsalas para informar y acelerar el desarrollo de tu protocolo, no para reemplazarlo.',
      },
    ],
  },

  'publication-bias-detection': {
    title: 'Sesgo de publicación: qué es y cómo detectarlo',
    description: 'Una explicación clara del sesgo de publicación en la investigación médica, su impacto en los metaanálisis y los métodos estadísticos para detectarlo y corregirlo.',
    date: '2026-04-08',
    readTime: '6 min de lectura',
    tag: 'Estadística',
    sections: [
      {
        heading: '¿Qué es el sesgo de publicación?',
        body: 'El sesgo de publicación es la tendencia a que los resultados de estudios positivos o estadísticamente significativos se publiquen con más frecuencia que los resultados negativos o nulos. Cuando un fármaco funciona, el estudio se publica. Cuando no funciona, a menudo queda en un cajón.\n\nEsto crea una imagen distorsionada de la evidencia. Si solo lees la bibliografía publicada, puedes concluir que un tratamiento es más eficaz de lo que realmente es, simplemente porque los estudios que muestran que no funciona nunca se publicaron.',
      },
      {
        heading: 'Por qué importa el sesgo de publicación para los metaanálisis',
        body: 'Los metaanálisis agrupan datos de estudios publicados. Si existe sesgo de publicación, la estimación agrupada estará inflada y sobreestimará el efecto del tratamiento.\n\nEsto tiene consecuencias reales:\n- Las guías clínicas pueden recomendar tratamientos menos eficaces de lo que sugiere la evidencia\n- Los pacientes reciben tratamientos con perfiles beneficio-riesgo peores de lo esperado\n- Los estudios de replicación fracasan, lo que lleva a "crisis de reproducibilidad"\n\nEl ejemplo más famoso es la revisión Cochrane de antidepresivos. Cuando se incluyeron datos de ensayos no publicados en poder de la FDA, los tamaños del efecto reales eran sustancialmente menores de lo que sugería la bibliografía publicada sola.',
      },
      {
        heading: 'El gráfico de embudo: detección visual',
        body: 'El gráfico de embudo es la herramienta más utilizada para detectar visualmente el sesgo de publicación.\n\nEn un embudo simétrico, los estudios pequeños se dispersan ampliamente alrededor del efecto verdadero, mientras que los estudios grandes se agrupan estrechamente alrededor de él, formando un embudo invertido.\n\nLa asimetría en la esquina inferior izquierda del embudo sugiere la ausencia de estudios pequeños con resultados negativos. Esta laguna implica sesgo de publicación.\n\nSin embargo, la asimetría del gráfico de embudo también puede deberse a:\n- Heterogeneidad (diferentes efectos verdaderos en diferentes poblaciones)\n- Azar (especialmente con menos de 10 estudios)\n- Sesgo en el reporte de resultados (reporte selectivo de resultados)\n\nLos gráficos de embudo requieren al menos 10 estudios para ser interpretados de forma fiable.',
      },
      {
        heading: 'Pruebas estadísticas para el sesgo de publicación',
        body: 'Varias pruebas estadísticas cuantifican la asimetría del gráfico de embudo:\n\n- **Prueba de Egger**: una regresión lineal ponderada de la desviación normal estándar frente a la precisión. p < 0,05 sugiere asimetría\n- **Prueba de Begg**: una prueba de correlación de rangos; menos potente que la de Egger\n- **Trim and Fill (recortar y rellenar)**: estima el número de estudios faltantes, agrega valores imputados y recalcula la estimación agrupada\n\nEstas pruebas tienen potencia limitada con pocos estudios (<10) y pueden pasar por alto el sesgo de publicación cuando existe o señalarlo cuando no existe. Son complementos de, y no sustitutos de, las búsquedas exhaustivas en la bibliografía gris.',
      },
      {
        heading: 'Estrategias para minimizar el sesgo de publicación',
        body: 'La mejor defensa contra el sesgo de publicación es prevenirlo:\n\n1. **Buscar en registros de ensayos clínicos** (ClinicalTrials.gov, WHO ICTRP) ensayos registrados pero no publicados\n2. **Buscar en resúmenes de congresos** resultados preliminares que nunca se publicaron\n3. **Contactar a los autores** de los estudios incluidos para preguntar sobre trabajos no publicados\n4. **Buscar en bibliografía gris**: tesis doctorales, informes gubernamentales, documentos regulatorios\n5. **Prerregistrar tu revisión** en PROSPERO para comprometerte a publicar independientemente de los resultados\n\nLas agencias reguladoras como la FDA ahora exigen el registro de ensayos antes del reclutamiento de pacientes, lo que ha mejorado la situación pero no la ha eliminado.',
      },
      {
        heading: 'Cómo aborda esto MetaLens AI',
        body: 'MetaLens AI genera gráficos de embudo en la pestaña de Metaanálisis para ayudarte a evaluar visualmente el sesgo de publicación en tu área temática. La herramienta también:\n\n- Busca en PubMed de forma exhaustiva para tu combinación de palabras clave\n- Incluye estudios más antiguos (no solo los recientes de alto impacto)\n- Proporciona citas de fuentes para que puedas verificar tú mismo el estado de registro de los ensayos\n\nRecuerda que todas las herramientas de bibliografía asistidas por IA se enfrentan a la misma limitación fundamental: trabajan con bibliografía publicada. Para una revisión sistemática definitiva, sigue siendo esencial complementar PubMed con fuentes de datos no publicados.',
      },
    ],
  },

  'p-values-statistical-significance': {
    title: 'Valores p y significancia estadística en la investigación médica',
    description: 'Qué significan realmente los valores p, por qué p < 0,05 se malinterpreta con frecuencia y cómo interpretar los resultados estadísticos en los estudios clínicos.',
    date: '2026-04-10',
    readTime: '7 min de lectura',
    tag: 'Educación',
    sections: [
      {
        heading: '¿Qué es un valor p?',
        body: 'El valor p es uno de los estadísticos más utilizados y más malinterpretados en la investigación médica.\n\nLa definición formal: el valor p es la probabilidad de observar resultados al menos tan extremos como los encontrados, asumiendo que la hipótesis nula es verdadera.\n\nLa hipótesis nula suele ser "no hay ningún efecto" o "los dos tratamientos son iguales". Un valor p pequeño significa: si realmente no hubiera ningún efecto, sería muy poco probable observar resultados tan extremos por azar.\n\nUn valor p de 0,03 significa: si la hipótesis nula fuera verdadera, verías resultados tan extremos o más extremos solo el 3% de las veces por azar.',
      },
      {
        heading: 'Lo que p < 0,05 NO significa',
        body: 'El umbral p < 0,05 está profundamente arraigado en la investigación médica, pero a menudo se interpreta incorrectamente:\n\n**p < 0,05 NO significa:**\n- Hay un 95% de probabilidad de que el resultado sea correcto\n- El tratamiento definitivamente funciona\n- El efecto es clínicamente significativo\n- El estudio se replicará\n- La hipótesis nula es falsa\n\n**p < 0,05 SÍ significa:**\n- Si la hipótesis nula fuera verdadera, resultados tan extremos ocurrirían menos del 5% de las veces por azar\n- El hallazgo cumple un umbral arbitrario de "significancia estadística"\n\nEl umbral 0,05 fue elegido por Ronald Fisher en la década de 1920 como regla empírica, no como una ley fundamental de la naturaleza.',
      },
      {
        heading: 'Significancia estadística frente a significancia clínica',
        body: 'Un resultado estadísticamente significativo no es necesariamente clínicamente relevante.\n\n**Ejemplo:** Un gran ensayo con 50.000 pacientes encuentra que un nuevo fármaco reduce la presión arterial en 1 mmHg (p = 0,0001). Esto es altamente significativo estadísticamente pero clínicamente sin importancia: una diferencia de 1 mmHg no tiene impacto en los resultados cardiovasculares.\n\nPor el contrario, un ensayo pequeño con 30 pacientes encuentra que un fármaco reduce el tamaño del tumor en un 40% (p = 0,08). Esto no alcanza el umbral de 0,05 pero puede representar un efecto genuinamente importante que merece más investigación.\n\nSiempre pregunta: ¿Cuál es el tamaño del efecto? ¿Es clínicamente relevante? ¿Cuál es el intervalo de confianza? ¿Incluye la diferencia mínima clínicamente importante?',
      },
      {
        heading: 'Los intervalos de confianza son más informativos',
        body: 'Un intervalo de confianza (IC) del 95% te dice más que un valor p por sí solo.\n\nSi el IC del 95% para una razón de probabilidades es de 1,2 a 3,4:\n- La mejor estimación es el punto medio (aproximadamente 2,0)\n- Puedes estar un 95% seguro de que el efecto verdadero se encuentra entre 1,2 y 3,4\n- Dado que se excluye 1,0 (ningún efecto), el resultado es estadísticamente significativo\n\nLos intervalos de confianza comunican:\n- La dirección del efecto\n- La magnitud del efecto\n- La precisión de la estimación\n- Si el efecto es clínicamente relevante\n\nUn IC que va de 0,9 a 12,0 es técnicamente significativo si se excluye 1,0, pero el enorme rango te indica que la estimación es muy imprecisa.',
      },
      {
        heading: 'Comparaciones múltiples y el problema del p-hacking',
        body: 'Si realizas 20 pruebas estadísticas y usas p < 0,05 como umbral, esperarías 1 resultado "significativo" puramente por azar, incluso si realmente no ocurre nada.\n\nEsto se denomina el problema de las comparaciones múltiples y conduce al p-hacking: ejecutar muchos análisis y reportar selectivamente los que alcanzan p < 0,05.\n\nPara abordar esto:\n- **Corrección de Bonferroni**: divide el umbral por el número de comparaciones (p. ej., 0,05/10 = 0,005)\n- **Prerregistro**: comprométete con tu resultado primario antes de recopilar datos\n- **Tasa de descubrimiento falso (FDR)**: controla la proporción esperada de falsos positivos\n\nAl leer un estudio con múltiples resultados, comprueba si el resultado primario estaba preespecificado y si se aplicaron correcciones por comparaciones múltiples.',
      },
      {
        heading: 'Más allá de los valores p: tamaños del efecto',
        body: 'La Asociación Americana de Estadística y muchas revistas ahora recomiendan ir más allá de las decisiones binarias de p < 0,05 y reportar tamaños del efecto con intervalos de confianza.\n\nMedidas comunes del tamaño del efecto:\n- **d de Cohen**: diferencia de medias estandarizada (d = 0,2 pequeño, 0,5 mediano, 0,8 grande)\n- **Razón de probabilidades (OR)**: cociente de probabilidades de resultado en expuestos frente a no expuestos\n- **Riesgo relativo (RR)**: cociente del riesgo en el grupo tratado frente al grupo control\n- **Reducción absoluta del riesgo (RAR)**: diferencia en las tasas de eventos (clínicamente más intuitivo)\n- **Número necesario para tratar (NNT)**: 1/RAR — cuántos pacientes necesitan tratamiento para que uno se beneficie\n\nMetaLens AI extrae y muestra estos tamaños del efecto de los resúmenes publicados, ofreciéndote una imagen más rica que los valores p por sí solos.',
      },
    ],
  },

  'evidence-based-medicine-guide': {
    title: 'Medicina basada en la evidencia: una guía práctica para clínicos',
    description: 'Cómo integrar la mejor evidencia disponible con la experiencia clínica y los valores del paciente: los tres pilares de la medicina basada en la evidencia.',
    date: '2026-04-11',
    readTime: '8 min de lectura',
    tag: 'Clínica',
    sections: [
      {
        heading: '¿Qué es la medicina basada en la evidencia?',
        body: 'La medicina basada en la evidencia (MBE) es el uso consciente, explícito y juicioso de la mejor evidencia disponible actualmente para tomar decisiones sobre el cuidado de los pacientes individuales.\n\nEl término fue acuñado por Gordon Guyatt en la Universidad McMaster a principios de la década de 1990 y desde entonces ha transformado cómo se desarrollan la educación médica, las guías clínicas y la política sanitaria.\n\nLa MBE se sustenta en tres pilares:\n1. **Mejor evidencia disponible**: investigación de alta calidad, idealmente ECA y metaanálisis\n2. **Experiencia clínica**: el conocimiento, la experiencia y el juicio del clínico\n3. **Valores y preferencias del paciente**: lo que importa para este paciente específico\n\nLos tres deben integrarse. La evidencia sola no es suficiente: debe aplicarse en contexto.',
      },
      {
        heading: 'La jerarquía de evidencia',
        body: 'No toda la evidencia es igual. La jerarquía de más fuerte a más débil:\n\n1. **Revisiones sistemáticas y metaanálisis** — Agrupan resultados de múltiples estudios de alta calidad\n2. **Ensayos controlados aleatorizados (ECA)** — Estándar de oro para la causalidad\n3. **Estudios de cohortes** — Siguen a grupos a lo largo del tiempo; buenos para exposiciones raras\n4. **Estudios de casos y controles** — Comparan casos con controles; buenos para resultados raros\n5. **Estudios transversales** — Fotografía en el tiempo; muestra asociaciones, no causalidad\n6. **Casos clínicos y opinión de expertos** — Anecdóticos; la forma más débil de evidencia\n\nLa jerarquía Cochrane es útil, pero el contexto importa. Un estudio observacional bien diseñado puede superar a un ECA mal conducido. Los números en la cima no garantizan calidad.',
      },
      {
        heading: 'Formular preguntas clínicas respondibles',
        body: 'El primer paso en la práctica de la MBE es traducir un problema clínico en una pregunta respondible usando PICO:\n\n**Escenario clínico:** un hombre de 65 años con FA y ERC estadio 3 — ¿deberías prescribir un ACOD o warfarina?\n\n**Pregunta PICO:**\n- **P**: adultos con FA no valvular y ERC estadio 3\n- **I**: anticoagulantes orales directos (ACOD)\n- **C**: warfarina\n- **R**: ictus, embolia sistémica, hemorragia mayor a los 12 meses\n\nCon una pregunta bien formulada, herramientas como MetaLens AI pueden buscar en PubMed y sintetizar la evidencia en segundos, dándote un punto de partida para la bibliografía.',
      },
      {
        heading: 'Evaluación crítica de la evidencia',
        body: 'Encontrar evidencia es solo el primer paso: debes evaluarla críticamente:\n\n**Para los ECA, pregunta:**\n- ¿Fue la aleatorización verdaderamente aleatoria? ¿Se ocultó la asignación?\n- ¿Estaban cegados los participantes y los clínicos?\n- ¿Fue completo el seguimiento? ¿Se usaron análisis por intención de tratar?\n- ¿Es el grupo control clínicamente relevante?\n\n**Para los metaanálisis, pregunta:**\n- ¿Fue exhaustiva la búsqueda? ¿Se buscaron estudios no publicados?\n- ¿Fueron apropiados los criterios de inclusión?\n- ¿Se evaluó y explicó la heterogeneidad?\n- ¿Hay evidencia de sesgo de publicación?\n\nLa lista de verificación CONSORT (para ECA) y la lista PRISMA (para revisiones sistemáticas) proporcionan marcos estructurados para la evaluación.',
      },
      {
        heading: 'Aplicación de la evidencia a pacientes individuales',
        body: 'Incluso la mejor evidencia proviene de poblaciones, y tú estás tratando a un individuo.\n\nPreguntas clave al aplicar evidencia:\n- ¿Es mi paciente similar a los del ensayo? (edad, comorbilidades, gravedad)\n- ¿Fueron excluidos del ensayo pacientes como el mío?\n- ¿Cómo se traduce el NNT al riesgo basal de mi paciente?\n- ¿Hay contraindicaciones o interacciones en mi paciente?\n- ¿Qué valora mi paciente? ¿Aceptaría el equilibrio entre eficacia y efectos secundarios?\n\nUn tratamiento con NNT = 50 durante 5 años puede ser conveniente para un paciente de alto riesgo, pero no para uno de bajo riesgo, aunque la reducción relativa del riesgo sea la misma.',
      },
      {
        heading: 'La MBE en la era de la IA',
        body: 'La IA está cambiando la forma en que los clínicos acceden y aplican la evidencia:\n\n- **Herramientas bibliográficas** como MetaLens AI hacen que la síntesis sistemática de evidencia esté disponible en el punto de atención\n- Los sistemas de **soporte a la decisión clínica** integran la evidencia en los registros electrónicos de salud\n- Las **herramientas de diagnóstico con IA** están comenzando a igualar a los especialistas en radiología y patología\n\nSin embargo, la IA no puede reemplazar el juicio clínico y la empatía humana que caracterizan la buena medicina. Las herramientas de IA pueden pasar por alto matices, tener sesgos en los datos de entrenamiento o generar errores que suenan plausibles.\n\nEl papel del clínico está evolucionando: de memorizar evidencia a evaluar críticamente los resultados de la IA e integrarlos con el contexto del paciente. Los tres pilares de la MBE —evidencia, experiencia y valores del paciente— siguen siendo tan relevantes como siempre.',
      },
    ],
  },

  'research-grant-proposal': {
    title: 'Cómo escribir una propuesta de subvención de investigación ganadora',
    description: 'Una guía práctica y paso a paso para estructurar una propuesta de subvención de investigación convincente, desde los objetivos específicos hasta la justificación del presupuesto.',
    date: '2026-04-12',
    readTime: '9 min de lectura',
    tag: 'Investigación',
    sections: [
      {
        heading: 'La anatomía de una propuesta de subvención',
        body: 'Las subvenciones de investigación siguen una estructura estándar independientemente de la agencia financiadora. Comprender esta estructura te ayuda a redactar una propuesta que los revisores puedan evaluar eficientemente.\n\nLas secciones principales de la mayoría de las subvenciones biomédicas (como la R01 de los NIH):\n1. **Objetivos específicos** (1 página) — La sección más crítica\n2. **Estrategia de investigación**: Significancia, Innovación, Enfoque\n3. **Datos preliminares** — Tu historial y evidencia de viabilidad\n4. **Sujetos humanos / Animales** — Ética y cumplimiento\n5. **Presupuesto y justificación**\n6. **Currículum vítae**\n\nPara subvenciones más pequeñas (premios de carrera, subvenciones de fundaciones), la estructura es más simple, pero los principios son los mismos.',
      },
      {
        heading: 'La página de objetivos específicos: tu página más importante',
        body: 'La página de objetivos específicos es lo primero que leen los revisores y a menudo determina si leen el resto con detenimiento.\n\nEstructura de una sólida página de objetivos específicos:\n\n**Párrafo 1 — El gancho (2-3 oraciones):** Expone el problema clínico o científico. Deja claro por qué importa. Concluye con: "A pesar de X, no se sabe nada sobre Y."\n\n**Párrafo 2 — Tu solución (3-4 oraciones):** Presenta tu enfoque, tus datos preliminares que demuestran viabilidad y tu objetivo a largo plazo.\n\n**Párrafo 3 — Los objetivos:** Lista 2-3 objetivos específicos y comprobables. Cada uno debe ser respondible de forma independiente para que toda la subvención no fracase si un objetivo falla.\n\n**Párrafo de cierre:** Resume el impacto: ¿qué sabremos después de esta subvención que no sabemos ahora?\n\nPide a colegas que lean solo esta página y que te expliquen lo que estás proponiendo.',
      },
      {
        heading: 'Significancia e innovación',
        body: 'Los revisores califican las subvenciones según la significancia, la innovación y el enfoque.\n\n**La significancia** responde: ¿por qué importa esto?\n- Describe la carga de salud pública (prevalencia, mortalidad, costos)\n- Cita la brecha de conocimiento: qué es desconocido o incierto\n- Expone qué cambiará si se confirma tu hipótesis\n- Cita metaanálisis y revisiones sistemáticas para establecer la base de evidencia actual\n\n**La innovación** responde: ¿qué hay de nuevo en tu enfoque?\n- ¿Es esta una nueva hipótesis, método, población o tecnología?\n- ¿En qué se diferencia tu enfoque de lo que han hecho otros?\n- Sé específico: "novedoso" sin especificaciones es una señal de alerta para los revisores',
      },
      {
        heading: 'Datos preliminares: demostrar la viabilidad',
        body: 'Los datos preliminares son tu evidencia de que puedes ejecutar el trabajo propuesto.\n\nDatos preliminares sólidos:\n- Demuestran la viabilidad técnica (puedes realizar los experimentos)\n- Muestran prueba de concepto (la hipótesis tiene evidencia de apoyo)\n- Establecen la experiencia y el historial de tu equipo\n- Proporcionan cálculos de potencia para determinar el tamaño de la muestra\n\nSi no tienes datos preliminares:\n- Usa datos publicados de tu propio trabajo o del de otros para apoyar tus cálculos de potencia\n- Usa herramientas de IA como MetaLens AI para sintetizar rápidamente la evidencia existente y derivar los tamaños del efecto esperados\n- Realiza experimentos piloto pequeños y económicos antes de presentar subvenciones importantes\n\nLas agencias de financiamiento financian a personas tanto como a proyectos. Tu historial importa.',
      },
      {
        heading: 'El enfoque de investigación: diseño y rigor',
        body: 'La sección de Enfoque es el corazón de tu ciencia. Debe mostrar que tus métodos son rigurosos y que has anticipado posibles problemas.\n\nPara cada objetivo:\n1. **Justificación**: ¿Por qué este diseño experimental?\n2. **Métodos**: descripción detallada pero clara de participantes, intervenciones, mediciones\n3. **Plan de análisis estadístico**: preespecificado, con potencia adecuada, métodos apropiados\n4. **Posibles obstáculos y alternativas**: ¿qué podría salir mal y cómo lo manejarás?\n\nLos revisores buscan: ¿Es esto factible? ¿Es esto riguroso? ¿Ha pensado el equipo en lo que podría salir mal?\n\nEvita prometer demasiado. Los revisores respetan a los equipos que han pensado en las limitaciones y tienen planes de contingencia.',
      },
      {
        heading: 'Presupuesto y errores comunes',
        body: 'El presupuesto debe estar justificado, no simplemente enumerado.\n\n**Errores comunes en el presupuesto:**\n- Presupuestar de menos para parecer económico (los revisores conocen los costos reales)\n- Presupuestar de más sin justificación\n- Olvidar los costos indirectos (gastos generales, típicamente entre el 26% y el 60% de los costos directos)\n- No tener en cuenta los aumentos salariales en subvenciones plurianuales\n\n**La sección de justificación** debe explicar por qué cada costo es necesario para el trabajo propuesto. Sé específico.\n\n**Errores comunes en las propuestas en general:**\n- Intentar hacer demasiado (apunta a la profundidad, no a la amplitud)\n- No enunciar claramente tu hipótesis\n- Ignorar los comentarios de revisiones anteriores\n- Presentar sin que colegas la hayan leído\n- Página de objetivos específicos débil\n\nSolicita una revisión simulada a colegas antes de presentar. Revisa y vuelve a presentar si no obtienes financiamiento en el primer intento: la mayoría de las subvenciones exitosas se financian en el segundo o tercer envío.',
      },
    ],
  },

  'systematic-review-vs-meta-analysis': {
    title: 'Revisión sistemática frente a metaanálisis: diferencias clave explicadas',
    description: 'Una comparación clara de las revisiones sistemáticas y los metaanálisis: qué son, en qué se diferencian y cuándo es apropiado cada enfoque.',
    date: '2026-04-13',
    readTime: '6 min de lectura',
    tag: 'Educación',
    sections: [
      {
        heading: 'Conceptos básicos: definiciones',
        body: 'Estos dos términos se usan con frecuencia de forma intercambiable, pero describen cosas diferentes, y no todas las revisiones sistemáticas son metaanálisis.\n\n**Revisión sistemática**: una síntesis rigurosa y reproducible de toda la evidencia disponible sobre una pregunta de investigación específica. Utiliza una estrategia de búsqueda documentada y preespecificada, y criterios de inclusión/exclusión explícitos. Los resultados pueden presentarse de forma narrativa.\n\n**Metaanálisis**: una técnica estadística para combinar resultados cuantitativos de múltiples estudios en una estimación agrupada única. El metaanálisis a menudo se realiza dentro de una revisión sistemática, pero no siempre.\n\nEn pocas palabras: la revisión sistemática es el proceso; el metaanálisis es uno de los posibles resultados de ese proceso.',
      },
      {
        heading: '¿Cuándo se puede realizar un metaanálisis?',
        body: 'El metaanálisis requiere que los estudios sean lo suficientemente similares para combinarlos estadísticamente. Necesitas:\n\n- **PICO similar**: poblaciones, intervenciones, comparadores y resultados comparables\n- **Datos cuantitativos**: tamaños del efecto, intervalos de confianza o suficientes datos para calcularlos\n- **Número adecuado de estudios**: al menos 3-5 estudios (más es mejor para la potencia)\n- **Heterogeneidad aceptable**: si I² > 75%, la agrupación puede ser engañosa\n\nCuando los estudios son demasiado heterogéneos —midiendo cosas diferentes en diferentes poblaciones con diferentes métodos— una revisión sistemática narrativa (descriptiva) es más apropiada que forzar una agrupación estadística que carecería de sentido.',
      },
      {
        heading: 'Ventajas y desventajas de cada enfoque',
        body: '**Revisión sistemática sin metaanálisis:**\n✓ Puede incluir estudios cualitativos y heterogéneos\n✓ Evita la falsa precisión de una agrupación inapropiada\n✓ Mejor para intervenciones complejas con múltiples componentes\n✗ Más subjetivo: la síntesis narrativa puede introducir sesgo\n✗ Más difícil de resumir para la toma de decisiones clínicas\n\n**Metaanálisis:**\n✓ Proporciona una estimación resumen única con intervalo de confianza\n✓ Mayor potencia estadística que cualquier estudio individual\n✓ Informa directamente las guías de práctica clínica\n✗ Puede producir falsa precisión si los estudios son heterogéneos\n✗ Vulnerable al sesgo de publicación\n✗ "Basura entra, basura sale": solo tan bueno como los estudios incluidos',
      },
      {
        heading: 'Revisiones rápidas y revisiones de alcance',
        body: 'Entre las revisiones bibliográficas informales y las revisiones sistemáticas completas existen varios enfoques intermedios:\n\n**Revisión rápida**: agiliza los métodos de la revisión sistemática para responder una pregunta rápidamente (semanas frente a meses). Aceptable para preguntas urgentes de política. Reconoce explícitamente sus limitaciones.\n\n**Revisión de alcance**: mapea la bibliografía existente sobre un tema amplio para identificar lagunas, no para responder una pregunta específica. No requiere la evaluación de la calidad de los estudios incluidos. A menudo es un precursor de una revisión sistemática completa.\n\n**Revisión narrativa**: una síntesis de expertos sin métodos de búsqueda sistemáticos. Más rápida pero más propensa al sesgo. Menos reproducible. Sigue siendo valiosa con fines educativos.\n\nHerramientas como MetaLens AI se describen mejor como alcance rápido asistido por IA: proporcionan una síntesis rápida de la evidencia en PubMed para orientar tu pensamiento, sin el rigor de una revisión sistemática formal.',
      },
      {
        heading: 'Los estándares de reporte PRISMA y MOOSE',
        body: 'Las revisiones sistemáticas y los metaanálisis de alta calidad deben seguir estándares de reporte establecidos:\n\n- **PRISMA** (Preferred Reporting Items for Systematic Reviews and Meta-Analyses): lista de verificación de 27 ítems para el reporte de revisiones sistemáticas. Requiere un diagrama de flujo que muestre la selección de estudios.\n- **MOOSE** (Meta-analysis Of Observational Studies in Epidemiology): para metaanálisis de estudios observacionales.\n- **PRISMA-P**: lista de verificación para protocolos de revisión sistemática.\n- **Manual Cochrane**: la guía más completa para las revisiones Cochrane.\n\nLa mayoría de las principales revistas médicas requieren el cumplimiento de PRISMA para la presentación. Seguir estos estándares mejora la transparencia y la reproducibilidad.',
      },
      {
        heading: 'Cómo elegir el enfoque correcto',
        body: 'Usa este árbol de decisión:\n\n1. **¿Tu pregunta es lo suficientemente específica para PICO?**\n   - Sí → Revisión sistemática (con posible metaanálisis)\n   - No → Revisión de alcance o revisión narrativa\n\n2. **¿Hay suficientes estudios primarios?**\n   - < 3 buenos estudios → Revisión sistemática narrativa\n   - ≥ 3 estudios con PICO similar → Considera el metaanálisis\n\n3. **¿Es aceptable la heterogeneidad?**\n   - I² < 50% → El metaanálisis probablemente es apropiado\n   - I² > 75% → Síntesis narrativa; explora las fuentes de heterogeneidad\n\n4. **¿Tienes suficiente tiempo y recursos?**\n   - Una revisión sistemática completa requiere entre 6 y 12 meses con un equipo\n   - Considera empezar con una revisión de alcance usando herramientas como MetaLens AI',
      },
    ],
  },
};
