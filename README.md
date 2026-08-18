# ⚖️ Biblioteca Jurídica Universitaria
### *Plataforma y Repositorio Digital para Estudiantes de la Carrera de Derecho*

Bienvenido a la **Biblioteca Jurídica Universitaria**, una aplicación web moderna, elegante y funcional creada especialmente para estudiantes y docentes de la carrera de Derecho, con acceso a la legislación federal de México, la normatividad del **Estado Libre y Soberano de Durango** (incluyendo Victoria de Durango), jurisprudencia de la Suprema Corte de Justicia de la Nación (SCJN), formatos jurídicos y un sistema de aportes estudiantiles con moderación y verificación administrativa.

---

## 🚀 ¿Cómo Abrir y Usar la Página Web? (Sin conocimientos de programación)

La aplicación fue desarrollada para funcionar de inmediato en cualquier computadora, tablet o teléfono celular:

### Opción 1: Apertura Directa (Recomendada y más sencilla)
1. Abre la carpeta del proyecto en tu explorador de archivos:
   `C:\Users\jeyou\.gemini\antigravity-ide\scratch\biblioteca-juridica-universitaria`
2. Haz **doble clic** sobre el archivo **`index.html`**.
3. Se abrirá automáticamente en tu navegador web preferido (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Opción 2: Servidor Local (Opcional)
Si cuentas con Python en tu sistema, puedes ejecutar en la terminal:
```bash
python -m http.server 8000
```
Y abrir `http://localhost:8000` en tu navegador.

---

## 🧭 Estructura de las 10 Secciones Principales

1. **Inicio (`#inicio`)**:
   - Resumen del repositorio con métricas en tiempo real.
   - Buscador rápido con filtros inmediatos.
   - Accesos directos a materias destacadas y materiales verificados.
   - Botón de llamado a la acción para compartir PDFs.

2. **Biblioteca por materias (`#materias`)**:
   - Clasificación por 13 materias jurídicas fundamentales:
     * *Derecho Constitucional*
     * *Derecho Penal*
     * *Derecho Civil*
     * *Derecho Mercantil*
     * *Derecho Laboral*
     * *Derecho Administrativo*
     * *Derecho Procesal*
     * *Derecho Internacional*
     * *Derecho Fiscal*
     * *Derechos Humanos*
     * *Teoría del Derecho*
     * *Historia del Derecho*
     * *Otras materias*
   - Permite filtrar documentos de cada materia con un solo clic.
   - Permite a los administradores crear nuevas materias dinámicamente.

3. **Buscador (`#buscador`)**:
   - Buscador multicriterio en tiempo real por:
     * Nombre / Título
     * Materia jurídica
     * Autor o emisor
     * Tipo de documento (Constitución, Código, Ley, Formato, Jurisprudencia, Apuntes)
     * Estado de verificación (Material verificado, Aprobado, Pendiente)
     * Ámbito territorial (Nacional / Federal o Estatal Durango)

4. **Leyes y Códigos (`#leyes`)**:
   - **Nacional (Federal)**: Constitución Política de los Estados Unidos Mexicanos (CPEUM), Código Nacional de Procedimientos Civiles y Familiares (CNPCyF), Código Penal Federal, Ley de Amparo.
   - **Estatal (Durango)**: Constitución Política del Estado Libre y Soberano de Durango, Código Penal del Estado de Durango, Código Civil del Estado de Durango, Ley Orgánica del Poder Judicial de Durango.

5. **Jurisprudencia (`#jurisprudencia`)**:
   - Criterios vinculantes y tesis de la SCJN (Principio Pro Persona, Presunción de Inocencia, Control Difuso). Enlace directo al Semanario Judicial de la Federación (SJF).

6. **Apuntes y Materiales (`#apuntes`)**:
   - Cuadros sinópticos de teoría del delito, resúmenes de derecho procesal y guías temáticas de estudio.

7. **Formatos y Ejemplos (`#formatos`)**:
   - Machotes prácticos listos para consultar, copiar y descargar:
     * Demanda de Juicio de Amparo Indirecto
     * Demanda Ordinaria Civil
     * Contrato de Arrendamiento de Inmueble (según Código Civil de Durango)
     * Denuncia o Querella Penal ante Ministerio Público / Fiscalía

8. **PDFs compartidos por estudiantes (`#estudiantes`)**:
   - Portal de envío de documentos con formulario completo y subida de archivos PDF.
   - Todos los envíos inician con el estado **🟡 Pendiente de revisión**.

9. **Fuentes Oficiales (`#fuentes`)**:
   - Enlaces directos verificados al Diario Oficial de la Federación (DOF), Periódico Oficial del Estado de Durango (POE), SCJN, H. Cámara de Diputados, H. Congreso del Estado de Durango y Poder Judicial de Durango.

10. **Acerca del proyecto (`#acerca`)**:
    - Misión institucional, aviso de ética jurídica y guía de administración.

---

## 🛠️ Guía Paso a Paso para Administrar la Página y Agregar Contenido

Como administrador de la biblioteca, no necesitas programar nada. Todo se gestiona visualmente a través de la interfaz:

### Paso 1: Alternar entre Modo Estudiante y Administrador
* En la parte superior derecha de la pantalla verás un botón que dice **[🎓 Estudiante]**.
* Haz clic sobre él y cambiará a **[⚖️ Administrador]**.
* Inmediatamente aparecerá la pestaña **"⚖️ Panel Admin"** en el menú de navegación superior y se habilitarán botones especiales de administración en las tarjetas.

### Paso 2: Revisar y Moderar los PDFs enviados por Estudiantes
1. Entra a **"⚖️ Panel Admin"**.
2. En la pestaña **"📋 Cola de Revisión"** verás todos los documentos enviados que están *Pendientes de revisión*.
3. Tendrás a tu disposición las siguientes acciones:
   - **👁️ Ver**: Abre el visor para leer el documento o previsualizar el PDF.
   - **🛡️ Verificar**: Certifica el documento con la insignia dorada **"Material verificado"** y lo publica en la biblioteca principal.
   - **🟢 Aprobar**: Publica el documento en la biblioteca sin la certificación dorada.
   - **✏️ Editar**: Permite corregir el título, materia, autor, fuente, descripción o palabras clave.
   - **🔴 Rechazar / 🗑️ Eliminar**: Rechaza o borra definitivamente el documento si contiene errores o material no apropiado.

### Paso 3: Agregar una Nueva Materia Jurídica
1. En el **Panel Admin**, selecciona la pestaña **"📁 Gestión de Materias"** (o en la sección *Biblioteca por Materias* pulsa el botón *"➕ Nueva Materia"*).
2. Escribe el nombre de la nueva materia (por ejemplo: *Derecho Ambiental*, *Derecho Notarial*, *Derecho Financiero*).
3. Escribe una breve descripción y presiona **"Guardar Materia"**.
4. ¡Listo! La materia estará disponible de inmediato en todos los selectores, formularios de subida y filtros de búsqueda.

### Paso 4: Respaldar y Restaurar la Base de Datos (Seguridad de tu Información)
Toda la información, PDFs subidos, cambios de estado y materias se guardan de forma persistente en el almacenamiento de tu navegador (IndexedDB).
* **Para hacer un respaldo**: Entra a **Panel Admin** > **"💾 Respaldo y Base de Datos"** y haz clic en **"⬇️ Descargar Respaldo JSON"**. Se guardará un archivo en tu computadora con toda tu biblioteca.
* **Para restaurar en otra máquina**: Selecciona el archivo con el botón **"Restaurar desde Respaldo JSON"**.

---

## 🛡️ Niveles de Seguridad y Roles

| Función | Estudiante 🎓 | Administrador ⚖️ |
| :--- | :---: | :---: |
| Consultar y buscar documentos | ✅ | ✅ |
| Leer artículos y machotes en visor | ✅ | ✅ |
| Descargar PDFs y textos legales | ✅ | ✅ |
| Enviar nuevos PDFs a revisión | ✅ | ✅ |
| Ver estado de sus propios envíos | ✅ | ✅ |
| Aprobar / Rechazar documentos | ❌ | ✅ |
| Otorgar insignia "Material verificado" | ❌ | ✅ |
| Editar metadatos de cualquier documento | ❌ | ✅ |
| Eliminar documentos | ❌ | ✅ |
| Crear y eliminar materias | ❌ | ✅ |
| Exportar / Importar base de datos | ❌ | ✅ |

---

## 🏛️ Normatividad y Contenido Jurídico Incluido

* **Nacional**:
  - *Constitución Política de los Estados Unidos Mexicanos (CPEUM)* con desglose de artículos 1°, 3°, 14°, 16°, 123° y 133°.
  - *Código Nacional de Procedimientos Civiles y Familiares (CNPCyF)*.
  - *Código Penal Federal*.
  - *Ley de Amparo*.
  - Jurisprudencias de la SCJN (Principio Pro Persona y Presunción de Inocencia).
* **Estatal de Durango**:
  - *Constitución Política del Estado Libre y Soberano de Durango* (con enfoque en la soberanía estatal, derechos y municipios como Victoria de Durango).
  - *Código Penal para el Estado de Durango*.
  - *Código Civil para el Estado de Durango*.
  - *Ley Orgánica del Poder Judicial del Estado de Durango*.
* **Formatos Prácticos**:
  - Amparo Indirecto, Demanda Civil Ordinaria, Contrato de Arrendamiento Habitacional, Denuncia Penal ante la Fiscalía General de Durango (FGED).

---

*Desarrollado para la comunidad universitaria de la carrera de Derecho.*
