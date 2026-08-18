/**
 * pdf-viewer.js - Visor de Documentos y Lector Jurídico Integrado
 * Permite visualizar PDFs reales, leer artículos constitucionales, consultar machotes y descargar.
 */

export class DocumentViewer {
  static init() {
    this.createModalDOM();
    this.bindEvents();
    this.currentDoc = null;
    this.fontSize = 16;
  }

  static createModalDOM() {
    if (document.getElementById('doc-viewer-modal')) return;

    const modalHTML = `
      <div id="doc-viewer-modal" class="viewer-modal-backdrop" aria-hidden="true">
        <div class="viewer-modal-dialog">
          <!-- Header del Visor -->
          <div class="viewer-modal-header">
            <div class="viewer-header-info">
              <span id="viewer-badge" class="badge badge-verified">Material verificado</span>
              <h2 id="viewer-title" class="viewer-title">Título del Documento</h2>
              <div class="viewer-meta-row">
                <span id="viewer-materia" class="viewer-meta-item">📁 Materia</span>
                <span id="viewer-author" class="viewer-meta-item">✍️ Autor</span>
                <span id="viewer-date" class="viewer-meta-item">📅 Fecha</span>
                <span id="viewer-source" class="viewer-meta-item">🏛️ Fuente</span>
              </div>
            </div>
            <div class="viewer-header-actions">
              <button id="viewer-btn-font-dec" class="btn-icon" title="Disminuir tamaño de letra">A-</button>
              <button id="viewer-btn-font-inc" class="btn-icon" title="Aumentar tamaño de letra">A+</button>
              <button id="viewer-btn-download" class="btn btn-gold btn-sm">
                <span>⬇️ Descargar</span>
              </button>
              <button id="viewer-btn-close" class="btn-close-modal" title="Cerrar visor">✕</button>
            </div>
          </div>

          <!-- Cuerpo del Visor -->
          <div class="viewer-modal-body" id="viewer-body">
            <!-- Contenido dinámico -->
          </div>

          <!-- Footer del Visor -->
          <div class="viewer-modal-footer">
            <div id="viewer-keywords" class="viewer-keywords-container"></div>
            <div class="viewer-footer-actions">
              <button id="viewer-btn-copy" class="btn btn-outline btn-sm">📋 Copiar texto</button>
              <button id="viewer-btn-close-bottom" class="btn btn-secondary btn-sm">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  static bindEvents() {
    const modal = document.getElementById('doc-viewer-modal');
    const closeBtn = document.getElementById('viewer-btn-close');
    const closeBottomBtn = document.getElementById('viewer-btn-close-bottom');
    const incFontBtn = document.getElementById('viewer-btn-font-inc');
    const decFontBtn = document.getElementById('viewer-btn-font-dec');
    const copyBtn = document.getElementById('viewer-btn-copy');
    const downloadBtn = document.getElementById('viewer-btn-download');

    const closeModal = () => this.close();

    closeBtn?.addEventListener('click', closeModal);
    closeBottomBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
      }
    });

    incFontBtn?.addEventListener('click', () => {
      if (this.fontSize < 24) {
        this.fontSize += 2;
        this.applyFontSize();
      }
    });

    decFontBtn?.addEventListener('click', () => {
      if (this.fontSize > 12) {
        this.fontSize -= 2;
        this.applyFontSize();
      }
    });

    copyBtn?.addEventListener('click', () => {
      this.copyDocumentContent();
    });

    downloadBtn?.addEventListener('click', () => {
      this.triggerDownload();
    });
  }

  static applyFontSize() {
    const contentEl = document.querySelector('.viewer-content-reader');
    if (contentEl) {
      contentEl.style.fontSize = `${this.fontSize}px`;
    }
  }

  static open(documentData) {
    this.currentDoc = documentData;
    const modal = document.getElementById('doc-viewer-modal');
    if (!modal) return;

    // Poblar metadata
    const titleEl = document.getElementById('viewer-title');
    const badgeEl = document.getElementById('viewer-badge');
    const materiaEl = document.getElementById('viewer-materia');
    const authorEl = document.getElementById('viewer-author');
    const dateEl = document.getElementById('viewer-date');
    const sourceEl = document.getElementById('viewer-source');
    const keywordsEl = document.getElementById('viewer-keywords');
    const bodyEl = document.getElementById('viewer-body');

    titleEl.textContent = documentData.title;
    materiaEl.innerHTML = `<strong>Materia:</strong> ${documentData.subject}`;
    authorEl.innerHTML = `<strong>Autor:</strong> ${documentData.author}`;
    dateEl.innerHTML = `<strong>Fecha:</strong> ${documentData.publishDate || 'Reciente'}`;
    sourceEl.innerHTML = `<strong>Fuente:</strong> ${documentData.source}`;

    // Estado de verificación
    if (documentData.verificationStatus === 'Material verificado' || documentData.isVerified) {
      badgeEl.className = 'badge badge-verified';
      badgeEl.innerHTML = '🛡️ Material verificado';
    } else if (documentData.verificationStatus === 'Pendiente de revisión') {
      badgeEl.className = 'badge badge-pending';
      badgeEl.innerHTML = '🟡 Pendiente de revisión';
    } else if (documentData.verificationStatus === 'Rechazado') {
      badgeEl.className = 'badge badge-rejected';
      badgeEl.innerHTML = '🔴 Rechazado';
    } else {
      badgeEl.className = 'badge badge-approved';
      badgeEl.innerHTML = '🟢 Aprobado';
    }

    // Palabras clave
    keywordsEl.innerHTML = '';
    const keywords = Array.isArray(documentData.keywords) 
      ? documentData.keywords 
      : (documentData.keywords || '').split(',').map(k => k.trim()).filter(Boolean);

    keywords.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag';
      tag.textContent = `#${kw}`;
      keywordsEl.appendChild(tag);
    });

    // Renderizar Contenido
    this.renderDocumentBody(documentData, bodyEl);

    // Mostrar modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  static renderDocumentBody(doc, container) {
    container.innerHTML = '';

    const pdfSrc = doc.fileBlobData || 
      (doc.downloadUrl && doc.downloadUrl !== '#' ? doc.downloadUrl : null) ||
      (doc.url && doc.url !== '#' ? doc.url : null);

    // Caso 1: Archivo PDF subido (Supabase Storage o Base64 local)
    if (pdfSrc) {
      container.innerHTML = `
        <div class="pdf-embed-wrapper">
          <div class="pdf-toolbar-info">
            <span>📄 Archivo PDF: <strong>${doc.fileName || doc.title}</strong> (${doc.fileSize || 'PDF'})</span>
            <a href="${pdfSrc}" target="_blank" rel="noopener noreferrer" class="link-official" style="margin-left: auto;">🔗 Abrir en pestaña nueva ↗</a>
          </div>
          <iframe src="${pdfSrc}" class="pdf-iframe-view" title="${doc.title}"></iframe>
        </div>
      `;
      return;
    }

    // Caso 2: Ley o Constitución con artículos estructurados
    if (doc.summaryArticles && doc.summaryArticles.length > 0) {
      let articlesHTML = `
        <div class="viewer-content-reader">
          <div class="doc-official-banner">
            <div class="banner-icon">⚖️</div>
            <div class="banner-text">
              <h4>${doc.level || 'Ordenamiento Jurídico'}</h4>
              <p>${doc.description}</p>
              ${doc.officialUrl ? `<a href="${doc.officialUrl}" target="_blank" rel="noopener" class="link-official">🔗 Consultar publicación oficial completa (${doc.source}) ↗</a>` : ''}
            </div>
          </div>
          <h3 class="articles-section-title">Artículos y Criterios Destacados:</h3>
          <div class="articles-list">
      `;

      doc.summaryArticles.forEach(art => {
        articlesHTML += `
          <div class="article-card">
            <div class="article-header">
              <span class="article-num">${art.num}</span>
              <span class="article-title">${art.title}</span>
            </div>
            <p class="article-body">${art.text}</p>
          </div>
        `;
      });

      articlesHTML += `
          </div>
        </div>
      `;
      container.innerHTML = articlesHTML;
      return;
    }

    // Caso 3: Formato / Machote con vista previa de texto
    if (doc.contentPreview) {
      container.innerHTML = `
        <div class="viewer-content-reader">
          <div class="doc-official-banner format-banner">
            <div class="banner-icon">📝</div>
            <div class="banner-text">
              <h4>Formato / Machote Jurídico de Práctica</h4>
              <p>${doc.description}</p>
              <small class="text-muted">Puedes copiar el texto completo o adaptarlo a tu caso concreto con los datos requeridos entre corchetes [ ].</small>
            </div>
          </div>
          <div class="format-text-box">
            <pre class="format-pre"><code>${doc.contentPreview}</code></pre>
          </div>
        </div>
      `;
      return;
    }

    // Caso 4: Documento general / Jurisprudencia / Apuntes
    container.innerHTML = `
      <div class="viewer-content-reader">
        <div class="doc-official-banner">
          <div class="banner-icon">📚</div>
          <div class="banner-text">
            <h4>${doc.docType}</h4>
            <p>${doc.description}</p>
            ${doc.officialUrl ? `<a href="${doc.officialUrl}" target="_blank" rel="noopener" class="link-official">🔗 Acceder a la fuente oficial (${doc.source}) ↗</a>` : ''}
          </div>
        </div>
        <div class="generic-doc-details">
          <h3>Información Detallada del Documento</h3>
          <table class="details-table">
            <tr><th>Título Oficial</th><td>${doc.title}</td></tr>
            <tr><th>Materia Jurídica</th><td>${doc.subject}</td></tr>
            <tr><th>Autor / Emisor</th><td>${doc.author}</td></tr>
            <tr><th>Ámbito de Aplicación</th><td>${doc.level || 'Estudiantil / Nacional'}</td></tr>
            <tr><th>Fecha de Publicación</th><td>${doc.publishDate || 'N/A'}</td></tr>
            <tr><th>Última Actualización</th><td>${doc.lastUpdate || 'Vigente'}</td></tr>
            <tr><th>Fuente / Registro</th><td>${doc.source}</td></tr>
            <tr><th>Estado en la Biblioteca</th><td><strong>${doc.verificationStatus}</strong></td></tr>
          </table>
        </div>
      </div>
    `;
  }

  static copyDocumentContent() {
    if (!this.currentDoc) return;
    let textToCopy = `BIBLIOTECA JURÍDICA UNIVERSITARIA\n${this.currentDoc.title}\nMateria: ${this.currentDoc.subject}\nAutor: ${this.currentDoc.author}\nFuente: ${this.currentDoc.source}\n\n`;

    if (this.currentDoc.contentPreview) {
      textToCopy += this.currentDoc.contentPreview;
    } else if (this.currentDoc.summaryArticles) {
      this.currentDoc.summaryArticles.forEach(a => {
        textToCopy += `${a.num} - ${a.title}\n${a.text}\n\n`;
      });
    } else {
      textToCopy += this.currentDoc.description;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      window.showToast?.('Texto copiado al portapapeles con éxito', 'success');
    }).catch(err => {
      console.error('Error al copiar:', err);
      window.showToast?.('No se pudo copiar el texto automáticamente', 'error');
    });
  }

  static triggerDownload() {
    if (!this.currentDoc) return;

    const pdfUrl = this.currentDoc.fileBlobData || 
      (this.currentDoc.downloadUrl && this.currentDoc.downloadUrl !== '#' ? this.currentDoc.downloadUrl : null) ||
      (this.currentDoc.url && this.currentDoc.url !== '#' ? this.currentDoc.url : null) ||
      (this.currentDoc.officialUrl && this.currentDoc.officialUrl !== '#' ? this.currentDoc.officialUrl : null);

    // Si tiene archivo PDF real cargado o URL de descarga
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.target = '_blank';
      a.download = this.currentDoc.fileName || `${this.currentDoc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.showToast?.(`Iniciando descarga de ${this.currentDoc.fileName || 'documento.pdf'}...`, 'success');
      return;
    }

    // Generar archivo de texto estructurado descargable
    let content = `====================================================\n`;
    content += `BIBLIOTECA JURÍDICA UNIVERSITARIA\n`;
    content += `====================================================\n\n`;
    content += `DOCUMENTO: ${this.currentDoc.title}\n`;
    content += `MATERIA: ${this.currentDoc.subject}\n`;
    content += `AUTOR / EMISOR: ${this.currentDoc.author}\n`;
    content += `FECHA: ${this.currentDoc.publishDate}\n`;
    content += `FUENTE: ${this.currentDoc.source}\n`;
    content += `ESTADO: ${this.currentDoc.verificationStatus}\n\n`;
    content += `DESCRIPCIÓN:\n${this.currentDoc.description}\n\n`;

    if (this.currentDoc.contentPreview) {
      content += `CONTENIDO / MODELO:\n----------------------------------------------------\n`;
      content += this.currentDoc.contentPreview;
    } else if (this.currentDoc.summaryArticles) {
      content += `ARTÍCULOS CONSTITUCIONALES / NORMATIVOS:\n----------------------------------------------------\n`;
      this.currentDoc.summaryArticles.forEach(a => {
        content += `\n[${a.num}] ${a.title}\n${a.text}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast?.('Documento descargado con éxito', 'success');
  }

  static close() {
    const modal = document.getElementById('doc-viewer-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.currentDoc = null;
    }
  }
}
