/**
 * student.js - Módulo de Envío y Gestión de PDFs por Estudiantes
 * Permite a los estudiantes subir documentos, registrar metadatos y dar seguimiento a sus envíos.
 */

import { db } from './db.js';
import { auth } from './auth.js';

export class StudentManager {
  static init() {
    this.createUploadModalDOM();
    this.bindEvents();
    this.selectedFile = null;
    this.fileBase64 = null;
  }

  static createUploadModalDOM() {
    if (document.getElementById('student-upload-modal')) return;

    const modalHTML = `
      <div id="student-upload-modal" class="viewer-modal-backdrop" aria-hidden="true">
        <div class="viewer-modal-dialog modal-form-dialog">
          <!-- Header -->
          <div class="viewer-modal-header">
            <div class="viewer-header-info">
              <span class="badge badge-student">🎓 Aporte Universitario</span>
              <h2 class="viewer-title">Compartir Documento PDF con la Comunidad</h2>
              <p class="modal-subtitle">Contribuye con apuntes, esquemas, tesis o materiales para apoyar a tus compañeros de Derecho.</p>
            </div>
            <button id="upload-modal-close" class="btn-close-modal">✕</button>
          </div>

          <!-- Formulario -->
          <form id="student-upload-form" class="modal-form-body">
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div class="alert-content">
                <strong>Aviso de Moderación Académica:</strong>
                <p>Todos los documentos enviados inician con el estado <span class="badge-inline badge-pending">Pendiente de revisión</span>. El comité administrador verificará la calidad, pertinencia jurídica y derechos de autor antes de asignarle la insignia <span class="badge-inline badge-verified">Material verificado</span>.</p>
              </div>
            </div>

            <div class="form-grid">
              <!-- Título -->
              <div class="form-group full-width">
                <label for="upload-title" class="form-label">Título del Documento <span class="req">*</span></label>
                <input type="text" id="upload-title" class="form-input" placeholder="Ej: Resumen de Derecho Procesal Penal y Etapas del Juicio Oral" required>
              </div>

              <!-- Materia -->
              <div class="form-group">
                <label for="upload-materia" class="form-label">Materia Jurídica <span class="req">*</span></label>
                <select id="upload-materia" class="form-select" required>
                  <option value="">Selecciona una materia...</option>
                </select>
              </div>

              <!-- Autor -->
              <div class="form-group">
                <label for="upload-author" class="form-label">Autor(es) del Documento <span class="req">*</span></label>
                <input type="text" id="upload-author" class="form-input" placeholder="Ej: Juan Pérez / Cátedra de Derecho Civil" required>
              </div>

              <!-- Fuente / Referencia -->
              <div class="form-group full-width">
                <label for="upload-source" class="form-label">Fuente o Referencia de Dónde se Obtuvo <span class="req">*</span></label>
                <input type="text" id="upload-source" class="form-input" placeholder="Ej: Notas de clase Semestre 2024-A, Libro del Dr. García Maynez, o Código Penal de Durango" required>
              </div>

              <!-- Palabras Clave -->
              <div class="form-group full-width">
                <label for="upload-keywords" class="form-label">Palabras Clave (separadas por comas)</label>
                <input type="text" id="upload-keywords" class="form-input" placeholder="Ej: Amparo, Suspensión, Derechos Humanos, Durango, Artículos">
              </div>

              <!-- Descripción -->
              <div class="form-group full-width">
                <label for="upload-desc" class="form-label">Descripción del Contenido <span class="req">*</span></label>
                <textarea id="upload-desc" class="form-textarea" rows="3" placeholder="Describe brevemente qué temas abarca este documento, para qué materias sirve y cómo puede ayudar a otros estudiantes..." required></textarea>
              </div>

              <!-- Subida de Archivo PDF -->
              <div class="form-group full-width">
                <label class="form-label">Archivo PDF <span class="req">*</span></label>
                <div class="file-drop-zone" id="file-drop-zone">
                  <input type="file" id="upload-file-input" accept=".pdf,application/pdf" class="file-input-hidden" required>
                  <div class="drop-zone-content" id="drop-zone-content">
                    <span class="drop-icon">📄</span>
                    <p class="drop-text"><strong>Haz clic para seleccionar</strong> o arrastra tu archivo PDF aquí</p>
                    <small class="drop-hint">Formato PDF (Máx. 25 MB)</small>
                  </div>
                  <div class="file-preview-card hidden" id="file-preview-card">
                    <span class="file-preview-icon">📑</span>
                    <div class="file-preview-details">
                      <strong id="preview-file-name">documento.pdf</strong>
                      <span id="preview-file-size" class="text-muted">0 KB</span>
                    </div>
                    <button type="button" id="btn-remove-file" class="btn-remove-file" title="Eliminar archivo">✕</button>
                  </div>
                </div>
              </div>

              <!-- Datos del Estudiante -->
              <div class="form-group">
                <label for="upload-student-name" class="form-label">Tu Nombre o Seudónimo</label>
                <input type="text" id="upload-student-name" class="form-input" placeholder="Nombre del estudiante">
              </div>
              <div class="form-group">
                <label for="upload-student-email" class="form-label">Correo Institucional / Contacto</label>
                <input type="email" id="upload-student-email" class="form-input" placeholder="correo@alumnos.edu.mx">
              </div>
            </div>

            <!-- Footer con Botones -->
            <div class="modal-form-footer">
              <button type="button" id="upload-btn-cancel" class="btn btn-secondary">Cancelar</button>
              <button type="submit" id="upload-btn-submit" class="btn btn-gold">
                <span>🚀 Enviar a Revisión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  static async bindEvents() {
    const modal = document.getElementById('student-upload-modal');
    const closeBtn = document.getElementById('upload-modal-close');
    const cancelBtn = document.getElementById('upload-btn-cancel');
    const form = document.getElementById('student-upload-form');
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('upload-file-input');
    const removeFileBtn = document.getElementById('btn-remove-file');

    const closeModal = () => this.close();

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // File Drag & Drop
    dropZone?.addEventListener('click', (e) => {
      if (e.target !== removeFileBtn && !removeFileBtn?.contains(e.target)) {
        fileInput?.click();
      }
    });

    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });

    dropZone?.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-active');
    });

    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    removeFileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearSelectedFile();
    });

    // Form Submission
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  static handleFileSelected(file) {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      window.showToast?.('Por favor selecciona un archivo en formato PDF válido', 'warning');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      window.showToast?.('El archivo excede el límite recomendado de 30MB', 'warning');
      return;
    }

    this.selectedFile = file;

    // Convertir a Base64 / Blob para persistencia en IndexedDB
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fileBase64 = e.target.result;
    };
    reader.readAsDataURL(file);

    // Actualizar UI
    const dropContent = document.getElementById('drop-zone-content');
    const previewCard = document.getElementById('file-preview-card');
    const fileNameEl = document.getElementById('preview-file-name');
    const fileSizeEl = document.getElementById('preview-file-size');

    dropContent?.classList.add('hidden');
    previewCard?.classList.remove('hidden');

    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = this.formatBytes(file.size);
  }

  static clearSelectedFile() {
    this.selectedFile = null;
    this.fileBase64 = null;
    const fileInput = document.getElementById('upload-file-input');
    if (fileInput) fileInput.value = '';

    const dropContent = document.getElementById('drop-zone-content');
    const previewCard = document.getElementById('file-preview-card');
    dropContent?.classList.remove('hidden');
    previewCard?.classList.add('hidden');
  }

  static async open(preselectedSubject = '') {
    const modal = document.getElementById('student-upload-modal');
    if (!modal) return;

    // Cargar materias en el select
    const materiaSelect = document.getElementById('upload-materia');
    if (materiaSelect) {
      const subjects = await db.getAllSubjects();
      materiaSelect.innerHTML = '<option value="">Selecciona una materia...</option>';
      subjects.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.textContent = sub.name;
        opt.dataset.name = sub.name;
        if (preselectedSubject && (sub.id === preselectedSubject || sub.name.toLowerCase() === preselectedSubject.toLowerCase())) {
          opt.selected = true;
        }
        materiaSelect.appendChild(opt);
      });
    }

    // Prellenar datos de usuario si está logueado
    const currentUser = auth.getCurrentUser();
    const studentNameInput = document.getElementById('upload-student-name');
    const studentEmailInput = document.getElementById('upload-student-email');

    if (studentNameInput && !studentNameInput.value) {
      studentNameInput.value = currentUser.name || '';
    }
    if (studentEmailInput && !studentEmailInput.value) {
      studentEmailInput.value = currentUser.email || '';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  static close() {
    const modal = document.getElementById('student-upload-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.clearSelectedFile();
      document.getElementById('student-upload-form')?.reset();
    }
  }

  static async handleSubmit() {
    const title = document.getElementById('upload-title')?.value.trim();
    const materiaSelect = document.getElementById('upload-materia');
    const author = document.getElementById('upload-author')?.value.trim();
    const source = document.getElementById('upload-source')?.value.trim();
    const keywords = document.getElementById('upload-keywords')?.value.trim();
    const desc = document.getElementById('upload-desc')?.value.trim();
    const studentName = document.getElementById('upload-student-name')?.value.trim();
    const studentEmail = document.getElementById('upload-student-email')?.value.trim();

    if (!title || !materiaSelect?.value || !author || !source || !desc) {
      window.showToast?.('Por favor completa todos los campos obligatorios (*)', 'warning');
      return;
    }

    if (!this.selectedFile) {
      window.showToast?.('Por favor adjunta un archivo PDF', 'warning');
      return;
    }

    const selectedOption = materiaSelect.options[materiaSelect.selectedIndex];
    const subjectName = selectedOption.dataset.name || selectedOption.text;
    const subjectId = selectedOption.value;

    const newDoc = {
      title,
      subject: subjectName,
      subjectId: subjectId,
      author: author,
      description: desc,
      keywords: keywords,
      source: source,
      docType: 'PDF Compartido por Estudiante',
      level: 'Aporte Estudiantil Universitario',
      verificationStatus: 'Pendiente de revisión', // Inicialmente Pendiente como se requiere
      isVerified: false,
      fileSize: this.formatBytes(this.selectedFile.size),
      fileName: this.selectedFile.name,
      fileBlobData: this.fileBase64,
      studentSubmitter: studentName || 'Estudiante Anónimo',
      studentEmail: studentEmail || ''
    };

    try {
      const submitBtn = document.getElementById('upload-btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Guardando aporte...';
      }

      await db.addDocument(newDoc);

      this.close();
      window.showToast?.('¡Documento enviado con éxito! Quedó registrado como "Pendiente de revisión".', 'success');

      // Notificar a la app para refrescar vistas
      window.dispatchEvent(new CustomEvent('documentAdded', { detail: newDoc }));
    } catch (e) {
      console.error('Error al guardar documento:', e);
      window.showToast?.('Ocurrió un error al guardar el documento. Intenta nuevamente.', 'error');
    } finally {
      const submitBtn = document.getElementById('upload-btn-submit');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀 Enviar a Revisión</span>';
      }
    }
  }

  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
