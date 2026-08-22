/**
 * admin.js - Panel de Administración y Moderación Jurídica
 * Permite a los administradores revisar, aprobar, verificar, rechazar, editar, eliminar
 * documentos, gestionar materias y realizar respaldos de la base de datos.
 */

import { db } from './db.js';
import { auth } from './auth.js';
import { DocumentViewer } from './pdf-viewer.js';

export class AdminManager {
  static init() {
    this.createEditModalDOM();
    this.bindEvents();
    this.editingDocId = null;
  }

  static createEditModalDOM() {
    if (document.getElementById('admin-edit-modal')) return;

    const modalHTML = `
      <div id="admin-edit-modal" class="viewer-modal-backdrop" aria-hidden="true">
        <div class="viewer-modal-dialog modal-form-dialog">
          <div class="viewer-modal-header">
            <div class="viewer-header-info">
              <span class="badge badge-admin">⚖️ Panel de Edición Administrativa</span>
              <h2 class="viewer-title" id="edit-modal-title">Editar Información del Documento</h2>
            </div>
            <button id="edit-modal-close" class="btn-close-modal">✕</button>
          </div>

          <form id="admin-edit-form" class="modal-form-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="edit-title" class="form-label">Título Oficial</label>
                <input type="text" id="edit-title" class="form-input" required>
              </div>

              <div class="form-group">
                <label for="edit-materia" class="form-label">Materia Jurídica</label>
                <select id="edit-materia" class="form-select" required></select>
              </div>

              <div class="form-group">
                <label for="edit-author" class="form-label">Autor(es) / Emisor</label>
                <input type="text" id="edit-author" class="form-input" required>
              </div>

              <div class="form-group">
                <label for="edit-doctype" class="form-label">Tipo de Documento</label>
                <input type="text" id="edit-doctype" class="form-input" required>
              </div>

              <div class="form-group">
                <label for="edit-status" class="form-label">Estado de Moderación</label>
                <select id="edit-status" class="form-select" required>
                  <option value="Material verificado">🛡️ Material verificado (Público + Insignia Dorada)</option>
                  <option value="Aprobado">🟢 Aprobado (Público)</option>
                  <option value="Pendiente de revisión">🟡 Pendiente de revisión (Solo admin y autor)</option>
                  <option value="Rechazado">🔴 Rechazado (No visible públicamente)</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label for="edit-source" class="form-label">Fuente Oficial / Referencia</label>
                <input type="text" id="edit-source" class="form-input" required>
              </div>

              <div class="form-group full-width">
                <label for="edit-keywords" class="form-label">Palabras Clave (separadas por comas)</label>
                <input type="text" id="edit-keywords" class="form-input">
              </div>

              <div class="form-group full-width">
                <label for="edit-desc" class="form-label">Descripción Jurídica</label>
                <textarea id="edit-desc" class="form-textarea" rows="3" required></textarea>
              </div>
            </div>

            <div class="modal-form-footer">
              <button type="button" id="edit-btn-cancel" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-gold">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  static bindEvents() {
    const editModal = document.getElementById('admin-edit-modal');
    const closeBtn = document.getElementById('edit-modal-close');
    const cancelBtn = document.getElementById('edit-btn-cancel');
    const editForm = document.getElementById('admin-edit-form');

    const closeEdit = () => {
      editModal?.classList.remove('active');
      editModal?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.editingDocId = null;
    };

    closeBtn?.addEventListener('click', closeEdit);
    cancelBtn?.addEventListener('click', closeEdit);
    editModal?.addEventListener('click', (e) => {
      if (e.target === editModal) closeEdit();
    });

    editForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveEditChanges();
      closeEdit();
    });
  }

  // ABRIR MODAL DE EDICIÓN
  static async openEditModal(docId) {
    const doc = await db.getDocumentById(docId);
    if (!doc) return;

    this.editingDocId = docId;
    const modal = document.getElementById('admin-edit-modal');
    const materiaSelect = document.getElementById('edit-materia');

    // Cargar materias
    const subjects = await db.getAllSubjects();
    materiaSelect.innerHTML = '';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      opt.dataset.name = sub.name;
      if (sub.id === doc.subjectId || sub.name === doc.subject) {
        opt.selected = true;
      }
      materiaSelect.appendChild(opt);
    });

    // Poblar campos
    document.getElementById('edit-title').value = doc.title || '';
    document.getElementById('edit-author').value = doc.author || '';
    document.getElementById('edit-doctype').value = doc.docType || '';
    document.getElementById('edit-status').value = doc.verificationStatus || 'Pendiente de revisión';
    document.getElementById('edit-source').value = doc.source || '';
    document.getElementById('edit-keywords').value = Array.isArray(doc.keywords) ? doc.keywords.join(', ') : (doc.keywords || '');
    document.getElementById('edit-desc').value = doc.description || '';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  static async saveEditChanges() {
    if (!this.editingDocId) return;

    const materiaSelect = document.getElementById('edit-materia');
    const selectedOpt = materiaSelect.options[materiaSelect.selectedIndex];

    const updates = {
      title: document.getElementById('edit-title').value.trim(),
      subject: selectedOpt.dataset.name || selectedOpt.text,
      subjectId: selectedOpt.value,
      author: document.getElementById('edit-author').value.trim(),
      docType: document.getElementById('edit-doctype').value.trim(),
      verificationStatus: document.getElementById('edit-status').value,
      source: document.getElementById('edit-source').value.trim(),
      keywords: document.getElementById('edit-keywords').value.split(',').map(k => k.trim()).filter(Boolean),
      description: document.getElementById('edit-desc').value.trim()
    };

    await db.updateDocument(this.editingDocId, updates);
    window.showToast?.('Documento actualizado correctamente', 'success');
    window.dispatchEvent(new CustomEvent('databaseChanged'));
  }

  // ACCIONES RÁPIDAS DE MODERACIÓN
  static async verifyDocument(docId) {
    if (!auth.isAdmin()) return;
    await db.updateDocument(docId, { verificationStatus: 'Material verificado' });
    window.showToast?.('Documento certificado como "Material verificado" 🛡️', 'success');
    window.dispatchEvent(new CustomEvent('databaseChanged'));
  }

  static async approveDocument(docId) {
    if (!auth.isAdmin()) return;
    await db.updateDocument(docId, { verificationStatus: 'Aprobado' });
    window.showToast?.('Documento aprobado para publicación general', 'success');
    window.dispatchEvent(new CustomEvent('databaseChanged'));
  }

  static async rejectDocument(docId) {
    if (!auth.isAdmin()) return;
    if (confirm('¿Estás seguro de marcar este documento como "Rechazado"? Dejará de ser visible para los estudiantes.')) {
      await db.updateDocument(docId, { verificationStatus: 'Rechazado' });
      window.showToast?.('Documento marcado como Rechazado', 'info');
      window.dispatchEvent(new CustomEvent('databaseChanged'));
    }
  }

  static async deleteDocument(docId) {
    if (!auth.isAdmin()) return;
    if (confirm('⚠️ ¿Estás seguro de eliminar este documento permanentemente de la biblioteca? Esta acción no se puede deshacer.')) {
      await db.deleteDocument(docId);
      window.showToast?.('Documento eliminado de la base de datos', 'info');
      window.dispatchEvent(new CustomEvent('databaseChanged'));
    }
  }

  // AGREGAR NUEVA MATERIA
  static async createSubject(name) {
    const nombreLimpio = (name || '').trim();
    if (!nombreLimpio) {
      window.showToast?.('Por favor ingresa un nombre para la materia.', 'warning');
      return false;
    }

    const result = await db.addSubject(nombreLimpio);
    if (!result) {
      // El error ya fue capturado, loggeado y alertado en db.addSubject
      return false;
    }

    window.showToast?.(`Materia "${nombreLimpio}" agregada exitosamente a Supabase ✅`, 'success');
    window.dispatchEvent(new CustomEvent('databaseChanged'));
    return true;
  }

  // EXPORTAR RESPALDO JSON
  static async exportBackup() {
    try {
      const jsonString = await db.exportDatabaseJSON();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_biblioteca_juridica_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.showToast?.('Respaldo descargado exitosamente en formato JSON', 'success');
    } catch (e) {
      console.error(e);
      window.showToast?.('Error al generar respaldo', 'error');
    }
  }

  // IMPORTAR RESPALDO JSON
  static async importBackup(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await db.importDatabaseJSON(e.target.result);
        window.showToast?.('¡Base de datos restaurada con éxito desde el respaldo!', 'success');
        window.dispatchEvent(new CustomEvent('databaseChanged'));
      } catch (err) {
        console.error(err);
        window.showToast?.('El archivo no tiene una estructura de respaldo válida', 'error');
      }
    };
    reader.readAsText(file);
  }

  // RESTABLECER A VALORES INICIALES
  static async resetDatabase() {
    if (confirm('⚠️ ¿Deseas restablecer la biblioteca a sus datos iniciales de fábrica? Se conservarán las leyes oficiales y se eliminarán aportes no respaldados.')) {
      await db.resetToSeed();
      window.showToast?.('Biblioteca restablecida a su estado inicial', 'info');
      window.dispatchEvent(new CustomEvent('databaseChanged'));
    }
  }
}
