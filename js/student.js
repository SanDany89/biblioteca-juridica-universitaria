/**
 * student.js - Módulo de Subida y Gestión de Documentos PDF
 * Protegido: Solo administradores y docentes autenticados pueden subir archivos PDF.
 * Los archivos se suben a Supabase Storage y se registran en la tabla 'documentos'.
 */

import { db } from './db.js';
import { auth } from './auth.js';

export class StudentManager {
  static init() {
    this.createUploadModalDOM();
    this.bindEvents();
    this.selectedFile = null;
  }

  static createUploadModalDOM() {
    if (document.getElementById('student-upload-modal')) return;

    const modalHTML = `
      <div id="student-upload-modal" class="viewer-modal-backdrop" aria-hidden="true">
        <div class="viewer-modal-dialog modal-form-dialog">
          <!-- Header -->
          <div class="viewer-modal-header">
            <div class="viewer-header-info">
              <span class="badge badge-admin">⚖️ Repositorio Oficial Supabase</span>
              <h2 class="viewer-title">Subir Documento PDF a la Biblioteca</h2>
              <p class="modal-subtitle">Publica leyes, tesis, apuntes o formatos para toda la comunidad académica de Derecho.</p>
            </div>
            <button id="upload-modal-close" class="btn-close-modal">✕</button>
          </div>

          <!-- Formulario -->
          <form id="student-upload-form" class="modal-form-body">
            <div class="alert alert-info">
              <span class="alert-icon">☁️</span>
              <div class="alert-content">
                <strong>Almacenamiento en la Nube (Supabase):</strong>
                <p>El archivo PDF se subirá directamente a <code>Supabase Storage (documentos-pdf)</code> y los metadatos quedarán registrados en la tabla <code>documentos</code>.</p>
              </div>
            </div>

            <div class="form-grid">
              <!-- Título -->
              <div class="form-group full-width">
                <label for="upload-title" class="form-label">Título del Documento <span class="req">*</span></label>
                <input type="text" id="upload-title" class="form-input" placeholder="Ej: Código Penal del Estado de Durango o Guía de Juicio de Amparo" required>
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
                <label for="upload-author" class="form-label">Autor(es) o Emisor <span class="req">*</span></label>
                <input type="text" id="upload-author" class="form-input" placeholder="Ej: H. Congreso de Durango / Dr. García" required>
              </div>

              <!-- Categoría / Tipo -->
              <div class="form-group">
                <label for="upload-doctype" class="form-label">Categoría / Tipo de Documento <span class="req">*</span></label>
                <select id="upload-doctype" class="form-select" required>
                  <option value="Leyes y Códigos">📜 Leyes y Códigos</option>
                  <option value="Jurisprudencia">🏛️ Jurisprudencia y Tesis</option>
                  <option value="Apuntes y Guías">📚 Apuntes y Guías Académicas</option>
                  <option value="Formatos y Machotes">📝 Formatos y Machotes</option>
                  <option value="PDF Compartido" selected>📑 Documento / PDF General</option>
                </select>
              </div>

              <!-- Estado de Verificación -->
              <div class="form-group">
                <label for="upload-status" class="form-label">Estado de Publicación</label>
                <select id="upload-status" class="form-select">
                  <option value="Material verificado" selected>🛡️ Material verificado (Publicar de inmediato con sello)</option>
                  <option value="Aprobado">🟢 Aprobado (Público)</option>
                  <option value="Pendiente de revisión">🟡 Pendiente de revisión</option>
                </select>
              </div>

              <!-- Fuente / Referencia -->
              <div class="form-group full-width">
                <label for="upload-source" class="form-label">Fuente o Referencia Oficial <span class="req">*</span></label>
                <input type="text" id="upload-source" class="form-input" placeholder="Ej: Periódico Oficial de Durango, DOF, SCJN o Cátedra Universitaria" required>
              </div>

              <!-- Palabras Clave -->
              <div class="form-group full-width">
                <label for="upload-keywords" class="form-label">Palabras Clave (separadas por comas)</label>
                <input type="text" id="upload-keywords" class="form-input" placeholder="Ej: Durango, Penal, Amparo, Artículos, Procedimientos">
              </div>

              <!-- Descripción -->
              <div class="form-group full-width">
                <label for="upload-desc" class="form-label">Descripción del Contenido <span class="req">*</span></label>
                <textarea id="upload-desc" class="form-textarea" rows="3" placeholder="Describe brevemente el contenido de este documento..." required></textarea>
              </div>

              <!-- Subida de Archivo PDF -->
              <div class="form-group full-width">
                <label class="form-label">Archivo PDF <span class="req">*</span></label>
                <div class="file-drop-zone" id="file-drop-zone">
                  <input type="file" id="upload-file-input" accept=".pdf,application/pdf" class="file-input-hidden" required>
                  <div class="drop-zone-content" id="drop-zone-content">
                    <span class="drop-icon">📄</span>
                    <p class="drop-text"><strong>Haz clic para seleccionar</strong> o arrastra tu archivo PDF aquí</p>
                    <small class="drop-hint">Formato PDF (Máx. 50 MB) • Subida directa a Supabase Storage</small>
                  </div>
                  <div class="file-preview-card hidden" id="file-preview-card">
                    <span class="file-preview-icon">📑</span>
                    <div class="file-preview-details">
                      <strong id="preview-file-name">documento.pdf</strong>
                      <span id="preview-file-size" class="text-muted">0 KB</span>
                    </div>
                    <button type="button" id="btn-remove-file" class="btn-remove-file" title="Quitar archivo">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer con Botones -->
            <div class="modal-form-footer">
              <button type="button" id="upload-btn-cancel" class="btn btn-secondary">Cancelar</button>
              <button type="submit" id="upload-btn-submit" class="btn btn-gold">
                <span>🚀 Subir a Supabase</span>
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

    if (file.size > 50 * 1024 * 1024) {
      window.showToast?.('El archivo excede el límite recomendado de 50MB', 'warning');
      return;
    }

    this.selectedFile = file;

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
    const fileInput = document.getElementById('upload-file-input');
    if (fileInput) fileInput.value = '';

    const dropContent = document.getElementById('drop-zone-content');
    const previewCard = document.getElementById('file-preview-card');
    dropContent?.classList.remove('hidden');
    previewCard?.classList.add('hidden');
  }

  static async open(preselectedSubject = '') {
    // Protección estricta: Solo administradores autenticados
    if (!auth.isAdmin()) {
      window.showToast?.('Debes iniciar sesión como Administrador para subir documentos PDF.', 'warning');
      window.dispatchEvent(new CustomEvent('openAdminLoginModal'));
      return;
    }

    const modal = document.getElementById('student-upload-modal');
    if (!modal) return;

    // Cargar materias en el select directamente desde Supabase
    await this.refreshSubjects(preselectedSubject);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Recarga las opciones del selector de materias consultando Supabase en tiempo real.
   */
  static async refreshSubjects(preselectedSubject = null) {
    const materiaSelect = document.getElementById('upload-materia');
    if (!materiaSelect) return;

    const currentSelected = preselectedSubject || materiaSelect.value;
    try {
      const subjects = await db.getAllSubjects();
      materiaSelect.innerHTML = '<option value="">Selecciona una materia...</option>';
      subjects.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.textContent = sub.name || sub.nombre;
        opt.dataset.name = sub.name || sub.nombre;
        if (currentSelected && (sub.id === currentSelected || (sub.name || '').toLowerCase() === currentSelected.toLowerCase())) {
          opt.selected = true;
        }
        materiaSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('[StudentManager] Error al refrescar selector de materias:', e);
    }
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
    if (!auth.isAdmin()) {
      window.showToast?.('Acceso denegado. Se requiere sesión de Administrador.', 'error');
      return;
    }

    const title = document.getElementById('upload-title')?.value.trim();
    const materiaSelect = document.getElementById('upload-materia');
    const author = document.getElementById('upload-author')?.value.trim();
    const docType = document.getElementById('upload-doctype')?.value || 'PDF Compartido';
    const status = document.getElementById('upload-status')?.value || 'Material verificado';
    const source = document.getElementById('upload-source')?.value.trim();
    const keywords = document.getElementById('upload-keywords')?.value.trim();
    const desc = document.getElementById('upload-desc')?.value.trim();

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
      docType: docType,
      verificationStatus: status,
      description: desc,
      keywords: keywords,
      source: source,
      level: 'Oficial / Académico',
      fileName: this.selectedFile.name
    };

    const submitBtn = document.getElementById('upload-btn-submit');

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Subiendo PDF a Supabase...</span>';
      }

      const savedDoc = await db.addDocument(newDoc, this.selectedFile);

      this.close();
      window.showToast?.('🎉 ¡Documento subido y registrado exitosamente en Supabase!', 'success');

      // Notificar a la app para refrescar vistas en vivo
      window.dispatchEvent(new CustomEvent('documentAdded', { detail: savedDoc }));
      window.dispatchEvent(new CustomEvent('databaseChanged'));
    } catch (e) {
      console.error('Error al guardar documento en Supabase:', e);
      window.showToast?.(`Error: ${e.message || 'No se pudo subir a Supabase. Verifica el bucket documentos-pdf.'}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀 Subir a Supabase</span>';
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
