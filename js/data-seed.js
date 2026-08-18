/**
 * Base de Datos Inicial y Oficial de la Biblioteca Jurídica Universitaria
 * Contenido verídico: Constitución Política de los Estados Unidos Mexicanos (CPEUM),
 * Constitución Política del Estado de Durango, Códigos Federales y Estatales,
 * Jurisprudencia SCJN, Formatos Jurídicos Prácticos y Fuentes Oficiales.
 */

export const INITIAL_SUBJECTS = [
  { id: 'constitucional', name: 'Derecho Constitucional', icon: 'scale', count: 4, desc: 'Estructura del Estado, derechos fundamentales y garantías individuales.' },
  { id: 'penal', name: 'Derecho Penal', icon: 'shield-alert', count: 3, desc: 'Delitos, penas, medidas de seguridad y sistema acusatorio.' },
  { id: 'civil', name: 'Derecho Civil', icon: 'users', count: 3, desc: 'Personas, familia, bienes, sucesiones, obligaciones y contratos.' },
  { id: 'mercantil', name: 'Derecho Mercantil', icon: 'briefcase', count: 2, desc: 'Actos de comercio, sociedades mercantiles y títulos de crédito.' },
  { id: 'laboral', name: 'Derecho Laboral', icon: 'hammer', count: 2, desc: 'Relaciones individuales y colectivas de trabajo, seguridad social.' },
  { id: 'administrativo', name: 'Derecho Administrativo', icon: 'landmark', count: 2, desc: 'Organización de la administración pública y procedimiento administrativo.' },
  { id: 'procesal', name: 'Derecho Procesal', icon: 'file-text', count: 3, desc: 'Teoría general del proceso, juicio oral y derecho procesal civil y penal.' },
  { id: 'internacional', name: 'Derecho Internacional', icon: 'globe', count: 2, desc: 'Derecho internacional público, privado y tratados internacionales.' },
  { id: 'fiscal', name: 'Derecho Fiscal', icon: 'calculator', count: 2, desc: 'Contribuciones, Código Fiscal de la Federación y defensa fiscal.' },
  { id: 'derechos_humanos', name: 'Derechos Humanos', icon: 'heart-handshake', count: 3, desc: 'Sistemas universal e interamericano de protección a derechos humanos.' },
  { id: 'teoria_derecho', name: 'Teoría del Derecho', icon: 'book-open', count: 2, desc: 'Filosofía jurídica, epistemología, lógica y argumentación jurídica.' },
  { id: 'historia_derecho', name: 'Historia del Derecho', icon: 'hourglass', count: 2, desc: 'Evolución histórica de las instituciones jurídicas en México.' },
  { id: 'otras', name: 'Otras materias', icon: 'folder-plus', count: 1, desc: 'Derecho ambiental, agrario, bancario, electoral y nuevas ramas.' }
];

export const INITIAL_DOCUMENTS = [
  // LEYES Y CONSTITUCIONES
  {
    id: 'doc-cpeum-2024',
    title: 'Constitución Política de los Estados Unidos Mexicanos (CPEUM)',
    subject: 'Derecho Constitucional',
    subjectId: 'constitucional',
    author: 'Congreso Constituyente / H. Congreso de la Unión',
    publishDate: '1917-02-05',
    lastUpdate: '2024-03-22',
    docType: 'Constitución / Ley Federal',
    level: 'Nacional (Federal)',
    description: 'Norma suprema de todo el ordenamiento jurídico mexicano. Contiene 136 artículos organizados en 9 títulos que consagran los derechos humanos, las garantías individuales, la división de poderes (Ejecutivo, Legislativo y Judicial) y la soberanía nacional.',
    keywords: ['CPEUM', 'Constitución', 'Derechos Humanos', 'Garantías', 'México', 'Federal', 'Artículos', 'Suprema Corte'],
    source: 'Diario Oficial de la Federación (DOF) / H. Cámara de Diputados',
    officialUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf',
    verificationStatus: 'Material verificado', // "Material verificado", "Aprobado", "Pendiente de revisión", "Rechazado"
    isVerified: true,
    fileSize: '2.4 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf',
    featured: true,
    summaryArticles: [
      { num: 'Art. 1°', title: 'Derechos Humanos y Principio Pro Persona', text: 'En los Estados Unidos Mexicanos todas las personas gozarán de los derechos humanos reconocidos en esta Constitución y en los tratados internacionales de los que el Estado Mexicano sea parte...' },
      { num: 'Art. 3°', title: 'Derecho a la Educación', text: 'Toda persona tiene derecho a la educación. El Estado -Federación, Estados, Ciudad de México y Municipios- impartirá y garantizará la educación inicial, preescolar, primaria, secundaria, media superior y superior.' },
      { num: 'Art. 14°', title: 'Irretroactividad y Debido Proceso', text: 'A ninguna ley se dará efecto retroactivo en perjuicio de persona alguna. Nadie podrá ser privado de la libertad o de sus propiedades, posesiones o derechos, sino mediante juicio seguido ante los tribunales previamente establecidos...' },
      { num: 'Art. 16°', title: 'Garantía de Legalidad y Mandamiento Escrito', text: 'Nadie puede ser molestado en su persona, familia, domicilio, papeles o posesiones, sino en virtud de mandamiento escrito de la autoridad competente, que funde y motive la causa legal del procedimiento...' },
      { num: 'Art. 123°', title: 'Del Trabajo y de la Previsión Social', text: 'Toda persona tiene derecho al trabajo digno y socialmente útil; al efecto, se promoverán la creación de empleos y la organización social de trabajo, conforme a la ley...' },
      { num: 'Art. 133°', title: 'Supremacía Constitucional', text: 'Esta Constitución, las leyes del Congreso de la Unión que emanen de ella y todos los tratados que estén de acuerdo con la misma... serán la Ley Suprema de toda la Unión.' }
    ]
  },
  {
    id: 'doc-const-durango',
    title: 'Constitución Política del Estado Libre y Soberano de Durango',
    subject: 'Derecho Constitucional',
    subjectId: 'constitucional',
    author: 'H. Congreso del Estado de Durango',
    publishDate: '1917-10-05',
    lastUpdate: '2023-11-15',
    docType: 'Constitución Estatal',
    level: 'Estatal (Durango)',
    description: 'Carta magna del Estado de Durango. Regula la estructura política local, los derechos de los duranguenses, el régimen de los 39 municipios (incluyendo Victoria de Durango), el Poder Legislativo del Estado, el Poder Ejecutivo y el Poder Judicial del Estado de Durango.',
    keywords: ['Durango', 'Victoria de Durango', 'Constitución Durango', 'Estatal', 'Poder Judicial Durango', 'Municipios'],
    source: 'Periódico Oficial del Estado de Durango (POE) / H. Congreso del Estado de Durango',
    officialUrl: 'https://congresodurango.gob.mx/leyes/constitucion_politica_durango.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '1.8 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://congresodurango.gob.mx/leyes/constitucion_politica_durango.pdf',
    featured: true,
    summaryArticles: [
      { num: 'Art. 1°', title: 'De la Soberanía y el Territorio de Durango', text: 'El Estado de Durango es libre y soberano en todo lo concerniente a su régimen interior, pero unido a las demás partes integrantes de la Federación Mexicana conforme a las bases fijadas en la Constitución Federal.' },
      { num: 'Art. 10°', title: 'Derechos Fundamentales en el Estado', text: 'En el Estado de Durango todas las personas gozarán de los derechos humanos y garantías que reconoce la Constitución General de la República y los ordenamientos locales.' },
      { num: 'Art. 68°', title: 'Del Poder Judicial del Estado', text: 'El ejercicio del Poder Judicial del Estado de Durango se deposita en un Tribunal Superior de Justicia, en los Juzgados de Primera Instancia y demás órganos jurisdiccionales previstos por la Ley Orgánica correspondiente.' },
      { num: 'Art. 100°', title: 'De los Municipios del Estado', text: 'El Estado adopta, para su régimen interior, la forma de gobierno republicano, representativo, democrático y popular, teniendo como base de su división territorial y de su organización política y administrativa, el Municipio Libre.' }
    ]
  },
  {
    id: 'doc-codigo-penal-durango',
    title: 'Código Penal para el Estado Libre y Soberano de Durango',
    subject: 'Derecho Penal',
    subjectId: 'penal',
    author: 'H. Congreso del Estado de Durango',
    publishDate: '2010-06-17',
    lastUpdate: '2023-08-30',
    docType: 'Código Estatal',
    level: 'Estatal (Durango)',
    description: 'Cuerpo normativo aplicable en el fuero común del Estado de Durango. Define las conductas constitutivas de delito, los tipos penales, agravantes, atenuantes y el catálogo de sanciones corporales y pecuniarias en la entidad.',
    keywords: ['Código Penal', 'Durango', 'Fuero Común', 'Delitos', 'Penas', 'Tipicidad', 'Justicia Penal'],
    source: 'Periódico Oficial del Estado de Durango (POE)',
    officialUrl: 'https://congresodurango.gob.mx/leyes/codigo_penal_durango.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '1.5 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://congresodurango.gob.mx/leyes/codigo_penal_durango.pdf',
    featured: true
  },
  {
    id: 'doc-codigo-civil-durango',
    title: 'Código Civil para el Estado de Durango',
    subject: 'Derecho Civil',
    subjectId: 'civil',
    author: 'H. Congreso del Estado de Durango',
    publishDate: '1948-03-01',
    lastUpdate: '2023-05-18',
    docType: 'Código Estatal',
    level: 'Estatal (Durango)',
    description: 'Regula las instituciones civiles fundamentales en Durango: personalidad jurídica, matrimonio, divorcio, patria potestad, alimentos, tutela, bienes, posesión, propiedad, usufructo, servidumbres, sucesiones testadas e intestadas y contratos.',
    keywords: ['Código Civil', 'Durango', 'Contratos', 'Familia', 'Sucesiones', 'Bienes', 'Obligaciones'],
    source: 'Periódico Oficial del Estado de Durango (POE)',
    officialUrl: 'https://congresodurango.gob.mx/leyes/codigo_civil_durango.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '2.1 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://congresodurango.gob.mx/leyes/codigo_civil_durango.pdf',
    featured: false
  },
  {
    id: 'doc-cnpcyf-2023',
    title: 'Código Nacional de Procedimientos Civiles y Familiares (CNPCyF)',
    subject: 'Derecho Procesal',
    subjectId: 'procesal',
    author: 'H. Congreso de la Unión',
    publishDate: '2023-06-07',
    lastUpdate: '2023-06-07',
    docType: 'Código Nacional',
    level: 'Nacional (Federal)',
    description: 'Nuevo ordenamiento adjetivo de observancia general en toda la República Mexicana. Unifica los procedimientos civiles y familiares bajo el principio de oralidad, justicia digital y celeridad procesal.',
    keywords: ['CNPCyF', 'Juicio Oral Civil', 'Familiar', 'Procesal', 'Oralidad', 'Justicia Digital'],
    source: 'Diario Oficial de la Federación (DOF)',
    officialUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CNPCyF.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '3.2 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CNPCyF.pdf',
    featured: true
  },
  {
    id: 'doc-ley-amparo',
    title: 'Ley de Amparo, Reglamentaria de los Artículos 103 y 107 de la CPEUM',
    subject: 'Derecho Procesal',
    subjectId: 'procesal',
    author: 'H. Congreso de la Unión',
    publishDate: '2013-04-02',
    lastUpdate: '2024-06-14',
    docType: 'Ley Federal / Reglamentaria',
    level: 'Nacional (Federal)',
    description: 'Regula el juicio de amparo directo e indirecto como mecanismo supremo de control constitucional y convencional para la protección de los derechos humanos frente a actos u omisiones de autoridades.',
    keywords: ['Amparo', 'Juicio de Amparo', 'Control Constitucional', 'Suspensión', 'Derechos Humanos'],
    source: 'Diario Oficial de la Federación (DOF)',
    officialUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LAmp.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '1.6 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LAmp.pdf',
    featured: true
  },
  {
    id: 'doc-ley-organica-pj-durango',
    title: 'Ley Orgánica del Poder Judicial del Estado de Durango',
    subject: 'Derecho Administrativo',
    subjectId: 'administrativo',
    author: 'H. Congreso del Estado de Durango',
    publishDate: '2014-12-10',
    lastUpdate: '2023-10-01',
    docType: 'Ley Estatal',
    level: 'Estatal (Durango)',
    description: 'Establece la integración, funcionamiento, atribuciones y competencias del Tribunal Superior de Justicia, Consejo de la Judicatura, Juzgados de Primera Instancia, Juzgados de Control y Tribunales Laborales del Estado de Durango.',
    keywords: ['Poder Judicial Durango', 'Tribunal Superior', 'Juzgados', 'Durango', 'Carrera Judicial'],
    source: 'Poder Judicial del Estado de Durango / POE',
    officialUrl: 'https://pjdgo.gob.mx/marco_juridico/ley_organica.pdf',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '1.2 MB',
    fileType: 'PDF / Texto Normativo',
    downloadUrl: 'https://pjdgo.gob.mx/marco_juridico/ley_organica.pdf',
    featured: false
  },

  // FORMATOS Y EJEMPLOS (MACHOTES JURÍDICOS)
  {
    id: 'fmt-amparo-indirecto',
    title: 'Modelo de Demanda de Juicio de Amparo Indirecto',
    subject: 'Derecho Procesal',
    subjectId: 'procesal',
    author: 'Academia de Práctica Forense Universitaria',
    publishDate: '2024-01-15',
    lastUpdate: '2024-01-15',
    docType: 'Formato / Machote Jurídico',
    level: 'Práctica Profesional',
    description: 'Estructura formal para la formulación de una demanda de amparo indirecto ante Juzgado de Distrito. Contiene rubro, autoridad responsable, acto reclamado, antecedentes bajo protesta de decir verdad, conceptos de violación y solicitud de suspensión provisional.',
    keywords: ['Formato', 'Machote', 'Amparo Indirecto', 'Conceptos de Violación', 'Suspensión'],
    source: 'Clínica de Litigio Estratégico Universitario',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '180 KB',
    fileType: 'Documento / Formato Editable',
    downloadUrl: '#',
    featured: true,
    contentPreview: `QUEJOSO: [NOMBRE DEL PROMOVENTE]
AUTORIDAD RESPONSABLE: [AUTORIDAD EMISORA DEL ACTO]
JUICIO DE AMPARO INDIRECTO

C. JUEZ DE DISTRITO EN EL ESTADO DE DURANGO EN TURNO
PRESENTE.

[NOMBRE DEL QUEJOSO], por mi propio derecho, señalando como domicilio para oír y recibir toda clase de notificaciones el ubicado en [DOMICILIO PROCESAL], y autorizando en los términos del artículo 12 de la Ley de Amparo al Licenciado en Derecho [NOMBRE DEL ABOGADO], comparezco ante Usted con el debido respeto a exponer:

Que por medio del presente escrito y con fundamento en los artículos 103, fracción I, y 107 de la Constitución Política de los Estados Unidos Mexicanos, así como en los artículos 1°, 107, 108 y demás relativos de la Ley de Amparo, vengo a solicitar el AMPARO Y PROTECCIÓN DE LA JUSTICIA FEDERAL en contra de los actos y autoridades que a continuación se precisan...`
  },
  {
    id: 'fmt-demanda-civil',
    title: 'Formato de Demanda Ordinaria Civil (Incumplimiento de Contrato)',
    subject: 'Derecho Civil',
    subjectId: 'civil',
    author: 'Seminario de Derecho Civil y Procesal',
    publishDate: '2024-02-10',
    lastUpdate: '2024-02-10',
    docType: 'Formato / Machote Jurídico',
    level: 'Práctica Forense',
    description: 'Plantilla estructurada de demanda ordinaria civil ante juzgados del fuero común de Durango. Incluye prestaciones, hechos circunstanciados, capítulo de derecho, pruebas y petitorios conformes al Código de Procedimientos Civiles.',
    keywords: ['Demanda Civil', 'Ordinario Civil', 'Incumplimiento', 'Contratos', 'Durango', 'Formato'],
    source: 'Seminario de Práctica Jurídica',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '145 KB',
    fileType: 'Documento / Formato Editable',
    downloadUrl: '#',
    featured: false,
    contentPreview: `ACTOR: [NOMBRE DEL ACTOR]
DEMANDADO: [NOMBRE DEL DEMANDADO]
JUICIO: ORDINARIO CIVIL
EXPEDIENTE: [NÚMERO DE EXPEDIENTE]

C. JUEZ DE PRIMERA INSTANCIA EN MATERIA CIVIL EN TURNO
DEL PRIMER DISTRITO JUDICIAL CON RESIDENCIA EN VICTORIA DE DURANGO, DGO.

[NOMBRE DEL ACTOR], por mi propio derecho, señalando como domicilio para oír y recibir notificaciones el ubicado en [DOMICILIO EN VICTORIA DE DURANGO], autorizando para tales efectos a los CC. Licenciados [NOMBRES], respetuosamente expongo:

Que por medio del presente ocurso y en la vía ORDINARIA CIVIL, vengo a demandar a [NOMBRE DEL DEMANDADO], con domicilio en [DOMICILIO DEL DEMANDADO], las siguientes:

PRESTACIONES:
A) La rescisión judicial del contrato de fecha [...], celebrado entre las partes.
B) El pago de la cantidad de $ [...] por concepto de suerte principal.
C) El pago de intereses moratorios al tipo legal.
D) El pago de gastos y costas que el presente juicio origine...`
  },
  {
    id: 'fmt-contrato-arrendamiento',
    title: 'Modelo de Contrato de Arrendamiento para Inmueble Habitacional',
    subject: 'Derecho Civil',
    subjectId: 'civil',
    author: 'Colegio de Abogados',
    publishDate: '2024-01-20',
    lastUpdate: '2024-01-20',
    docType: 'Formato / Machote Jurídico',
    level: 'Práctica Notarial y Contractual',
    description: 'Contrato privado de arrendamiento de casa habitación conforme a los artículos aplicables del Código Civil del Estado de Durango. Incluye cláusulas de renta, depósito en garantía, fiador/aval, obligaciones de mantenimiento y causales de rescisión.',
    keywords: ['Contrato', 'Arrendamiento', 'Inmueble', 'Durango', 'Fiador', 'Cláusulas', 'Civil'],
    source: 'Colegio de Abogados de Durango A.C.',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '120 KB',
    fileType: 'Documento / Formato Editable',
    downloadUrl: '#',
    featured: false,
    contentPreview: `CONTRATO DE ARRENDAMIENTO QUE CELEBRAN POR UNA PARTE [NOMBRE DEL ARRENDADOR] EN CALIDAD DE "ARRENDADOR", Y POR LA OTRA PARTE [NOMBRE DEL ARRENDATARIO] EN CALIDAD DE "ARRENDATARIO", AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:

DECLARACIONES:
I. Declara el ARRENDADOR ser legítimo propietario del inmueble ubicado en [DIRECCIÓN COMPLETA EN VICTORIA DE DURANGO, DGO.]...
II. Declara el ARRENDATARIO tener la capacidad legal y solvencia económica para obligarse en los términos de este instrumento...

CLÁUSULAS:
PRIMERA. OBJETO: El ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble antes descrito, exclusivamente para uso HABITACIONAL.
SEGUNDA. RENTA: El ARRENDATARIO se obliga a pagar mensualmente la cantidad de $[...] (M.N.)...`
  },
  {
    id: 'fmt-denuncia-penal',
    title: 'Escrito Inicial de Denuncia o Querella Penal',
    subject: 'Derecho Penal',
    subjectId: 'penal',
    author: 'Academia de Derecho Penal y Criminología',
    publishDate: '2024-02-28',
    lastUpdate: '2024-02-28',
    docType: 'Formato / Machote Jurídico',
    level: 'Práctica Penal',
    description: 'Modelo formal para la presentación de denuncia de hechos con apariencia de delito ante la Fiscalía General del Estado de Durango (FGED) o FGR. Contiene relatoría fáctica pormenorizada, señalamiento de presuntos responsables y ofrecimiento de datos de prueba iniciales.',
    keywords: ['Denuncia', 'Querella', 'Fiscalía Durango', 'FGED', 'Ministerio Público', 'Penal'],
    source: 'Fiscalía General del Estado de Durango (Referencia)',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '160 KB',
    fileType: 'Documento / Formato Editable',
    downloadUrl: '#',
    featured: false
  },

  // JURISPRUDENCIA
  {
    id: 'jur-pro-persona',
    title: 'Jurisprudencia: Principio Pro Persona y Control de Convencionalidad Ex Officio',
    subject: 'Derechos Humanos',
    subjectId: 'derechos_humanos',
    author: 'Suprema Corte de Justicia de la Nación (Pleno)',
    publishDate: '2011-09-10',
    lastUpdate: '2023-01-10',
    docType: 'Jurisprudencia SCJN',
    level: 'Nacional',
    description: 'Criterio obligatorio de la SCJN derivado de la reforma constitucional de junio de 2011 y el caso Radilla Pacheco. Establece que todos los jueces mexicanos deben preferir la norma que otorgue la protección más amplia a la persona humana.',
    keywords: ['Jurisprudencia', 'SCJN', 'Principio Pro Persona', 'Control Difuso', 'Convencionalidad', 'Derechos Humanos'],
    source: 'Semanario Judicial de la Federación (SJF) / SCJN',
    officialUrl: 'https://sjf2.scjn.gob.mx/',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '450 KB',
    fileType: 'Tesis Jurisprudencial',
    downloadUrl: 'https://sjf2.scjn.gob.mx/',
    featured: true
  },
  {
    id: 'jur-presuncion-inocencia',
    title: 'Jurisprudencia: Presunción de Inocencia en sus Tres Vertientes',
    subject: 'Derecho Penal',
    subjectId: 'penal',
    author: 'Suprema Corte de Justicia de la Nación (Primera Sala)',
    publishDate: '2014-04-15',
    lastUpdate: '2022-08-11',
    docType: 'Jurisprudencia SCJN',
    level: 'Nacional',
    description: 'Tesis jurisprudencial 1a./J. 24/2014 que desglosa la presunción de inocencia como regla de trato procesal, como regla probatoria (estándar de prueba más allá de toda duda razonable) y como estándar de juicio.',
    keywords: ['Presunción de Inocencia', 'SCJN', 'Primera Sala', 'Debido Proceso', 'Carga de la Prueba'],
    source: 'Semanario Judicial de la Federación (Registro digital: 2006334)',
    officialUrl: 'https://sjf2.scjn.gob.mx/',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '380 KB',
    fileType: 'Tesis Jurisprudencial',
    downloadUrl: 'https://sjf2.scjn.gob.mx/',
    featured: false
  },

  // APUNTES Y MATERIALES DE ESTUDIO
  {
    id: 'mat-resumen-constitucional',
    title: 'Guía de Estudio: Teoría Constitucional y División de Poderes',
    subject: 'Derecho Constitucional',
    subjectId: 'constitucional',
    author: 'Cátedra de Derecho Constitucional Mexicano',
    publishDate: '2024-03-01',
    lastUpdate: '2024-03-01',
    docType: 'Guía de Estudio',
    level: 'Licenciatura en Derecho',
    description: 'Síntesis doctrinal estructurada sobre la historia del constitucionalismo en México (1824, 1857, 1917), el poder revisor de la Constitución (Art. 135) y las facultades concurrentes entre Federación y Estados.',
    keywords: ['Guía', 'Resumen', 'Constitucional', 'Poder Revisor', 'División de Poderes', 'Estudiantes'],
    source: 'Facultad de Derecho y Ciencias Políticas',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '890 KB',
    fileType: 'PDF Académico',
    downloadUrl: '#',
    featured: false
  },
  {
    id: 'mat-cuadro-teoria-delito',
    title: 'Cuadro Sinóptico: Elementos Positivos y Negativos del Delito',
    subject: 'Derecho Penal',
    subjectId: 'penal',
    author: 'Seminario de Teoría del Delito',
    publishDate: '2024-02-14',
    lastUpdate: '2024-02-14',
    docType: 'Cuadro Sinóptico / Material Didáctico',
    level: 'Licenciatura en Derecho',
    description: 'Esquema comparativo de la teoría heptatómica y pentatómica del delito: Conducta vs Ausencia de conducta, Tipicidad vs Atipicidad, Antijuridicidad vs Causas de Justificación, Culpabilidad vs Inculpabilidad, Punibilidad vs Excusas Absolutorias.',
    keywords: ['Teoría del Delito', 'Cuadro Sinóptico', 'Tipicidad', 'Antijuridicidad', 'Culpabilidad'],
    source: 'Academia Universitaria de Derecho Penal',
    verificationStatus: 'Material verificado',
    isVerified: true,
    fileSize: '650 KB',
    fileType: 'PDF Académico',
    downloadUrl: '#',
    featured: true
  },

  // PDFS COMPARTIDOS POR ESTUDIANTES (DEMO INICIAL CON DIFERENTES ESTADOS)
  {
    id: 'stu-resumen-obligaciones',
    title: 'Resumen Completo: Teoría General de las Obligaciones Civiles',
    subject: 'Derecho Civil',
    subjectId: 'civil',
    author: 'Ana Karen Rodríguez (Estudiante 4° Semestre)',
    publishDate: '2024-04-10',
    lastUpdate: '2024-04-10',
    docType: 'PDF Compartido por Estudiante',
    level: 'Apunte Estudiantil',
    description: 'Apuntes detallados de las fuentes de las obligaciones: contratos, declaración unilateral de voluntad, enriquecimiento ilegítimo, gestión de negocios y hechos ilícitos, con ejemplos prácticos según el Código Civil.',
    keywords: ['Obligaciones', 'Civil', 'Contratos', 'Apuntes', 'Estudiante', 'Durango'],
    source: 'Cátedra de Obligaciones Civiles / Notas de Clase',
    verificationStatus: 'Material verificado',
    isVerified: true,
    studentSubmitter: 'Ana Karen Rodríguez',
    studentEmail: 'karen.rodriguez@alumnos.edu.mx',
    fileSize: '1.1 MB',
    fileType: 'PDF',
    downloadUrl: '#',
    featured: false
  },
  {
    id: 'stu-esquema-juicio-oral-penal',
    title: 'Diagrama de Flujo: Etapas del Sistema de Justicia Penal Acusatorio',
    subject: 'Derecho Procesal',
    subjectId: 'procesal',
    author: 'Carlos Eduardo Mendoza (Estudiante 6° Semestre)',
    publishDate: '2024-04-18',
    lastUpdate: '2024-04-18',
    docType: 'PDF Compartido por Estudiante',
    level: 'Diagrama de Estudio',
    description: 'Diagrama con las tres etapas del CNPP: 1) Etapa de Investigación (Inicial y Complementaria), 2) Etapa Intermedia (Fase escrita y oral), 3) Etapa de Juicio Oral. Incluye audiencias clave y recursos.',
    keywords: ['Sistema Acusatorio', 'CNPP', 'Etapas del Juicio', 'Juicio Oral', 'Penal', 'Procesal'],
    source: 'Elaboración propia con base en el Código Nacional de Procedimientos Penales',
    verificationStatus: 'Pendiente de revisión',
    isVerified: false,
    studentSubmitter: 'Carlos Eduardo Mendoza',
    studentEmail: 'carlos.mendoza@alumnos.edu.mx',
    fileSize: '780 KB',
    fileType: 'PDF',
    downloadUrl: '#',
    featured: false
  },
  {
    id: 'stu-guia-derecho-laboral-reforma',
    title: 'Cuadro Comparativo: Reforma a la Ley Federal del Trabajo y Tribunales Laborales',
    subject: 'Derecho Laboral',
    subjectId: 'laboral',
    author: 'Mariana Gómez S. (Estudiante 7° Semestre)',
    publishDate: '2024-04-20',
    lastUpdate: '2024-04-20',
    docType: 'PDF Compartido por Estudiante',
    level: 'Apunte Estudiantil',
    description: 'Análisis de la desaparición de las Juntas de Conciliación y Arbitraje y la creación de los Centros de Conciliación Laboral y Juzgados Laborales del Poder Judicial en el Estado de Durango.',
    keywords: ['Laboral', 'Reforma Laboral', 'Centros de Conciliación', 'Durango', 'LFT'],
    source: 'Ley Federal del Trabajo y Ley Orgánica del Poder Judicial de Durango',
    verificationStatus: 'Pendiente de revisión',
    isVerified: false,
    studentSubmitter: 'Mariana Gómez S.',
    studentEmail: 'mariana.gomez@alumnos.edu.mx',
    fileSize: '1.3 MB',
    fileType: 'PDF',
    downloadUrl: '#',
    featured: false
  }
];

export const OFFICIAL_SOURCES = [
  {
    name: 'Diario Oficial de la Federación (DOF)',
    jurisdiction: 'Nacional (México)',
    category: 'Publicación Oficial Federal',
    description: 'Órgano del Gobierno Constitucional de los Estados Unidos Mexicanos que tiene la función de publicar leyes, decretos, reglamentos, acuerdos y demás actos expedidos por los Poderes de la Federación.',
    url: 'https://www.dof.gob.mx/',
    badge: 'Federal'
  },
  {
    name: 'Periódico Oficial del Estado de Durango (POE)',
    jurisdiction: 'Estatal (Durango)',
    category: 'Publicación Oficial del Estado',
    description: 'Órgano oficial del Gobierno del Estado Libre y Soberano de Durango donde se publican las leyes, decretos y reglamentos vigentes en el territorio estatal y municipios.',
    url: 'https://periodicooficial.durango.gob.mx/',
    badge: 'Durango'
  },
  {
    name: 'Suprema Corte de Justicia de la Nación (SCJN)',
    jurisdiction: 'Nacional (Poder Judicial)',
    category: 'Jurisprudencia y Sentencias',
    description: 'Máximo tribunal constitucional del país y cabeza del Poder Judicial de la Federación. Acceso al Semanario Judicial de la Federación (SJF) para consulta de tesis y jurisprudencias.',
    url: 'https://www.scjn.gob.mx/',
    badge: 'Federal'
  },
  {
    name: 'H. Cámara de Diputados del Congreso de la Unión',
    jurisdiction: 'Nacional (Poder Legislativo)',
    category: 'Leyes Federales Vigentes',
    description: 'Repositorio oficial de leyes federales de México en texto completo y actualizado, iniciativas legislativas y Diario de los Debates.',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/',
    badge: 'Federal'
  },
  {
    name: 'H. Congreso del Estado de Durango',
    jurisdiction: 'Estatal (Durango)',
    category: 'Legislación Estatal de Durango',
    description: 'Portal legislativo del Estado de Durango con el catálogo completo de leyes vigentes, códigos locales, reglamentos y gaceta parlamentaria.',
    url: 'https://congresodurango.gob.mx/',
    badge: 'Durango'
  },
  {
    name: 'Poder Judicial del Estado de Durango (PJED)',
    jurisdiction: 'Estatal (Durango)',
    category: 'Tribunales y Órganos Locales',
    description: 'Portal oficial del Tribunal Superior de Justicia y Consejo de la Judicatura del Estado de Durango. Consulta de acuerdos, juzgados de distrito judicial y normatividad orgánica.',
    url: 'https://pjdgo.gob.mx/',
    badge: 'Durango'
  },
  {
    name: 'Comisión Nacional de los Derechos Humanos (CNDH)',
    jurisdiction: 'Nacional',
    category: 'Derechos Humanos',
    description: 'Organismo público autónomo del Estado Mexicano que protege y defiende los derechos humanos. Recomendaciones, informes y legislación.',
    url: 'https://www.cndh.org.mx/',
    badge: 'Nacional'
  },
  {
    name: 'Comisión Estatal de Derechos Humanos de Durango (CEDHD)',
    jurisdiction: 'Estatal (Durango)',
    category: 'Derechos Humanos Local',
    description: 'Organismo garante de la protección y divulgación de los derechos humanos en el Estado de Durango y sus 39 municipios.',
    url: 'https://cedh-durango.org.mx/',
    badge: 'Durango'
  }
];
