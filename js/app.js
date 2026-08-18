/**
 * app.js - Coordinador Principal y Enrutador de la Biblioteca Jurídica Universitaria
 * Gestiona las 10 secciones principales, vistas dinámicas, autenticación y eventos.
 */

import { db } from './db.js';
import { auth } from './auth.js';
import { LegalSearchEngine } from './search.js';
import { DocumentViewer } from './pdf-viewer.js';
import { StudentManager } from './student.js';
import { AdminManager } from './admin.js';
import { OFFICIAL_SOURCES } from './data-seed.js';

class LegalLibraryApp {
  constructor() {
    this.currentView = 'inicio';
    this.currentSubjectFilter = 'all';
    this.searchFilters = {
      query: '',
      subjectId: 'all',
      docType: 'all',
      verificationStatus: 'all',
      level: 'all',
      sortBy: 'recent'
    };
  }

  async init() {
    // 1. Inicializar submódulos
    DocumentViewer.init();
    StudentManager.init();
    AdminManager.init();

    // 2. Sistema global de Toasts
    this.setupToastSystem();

    // 3. Vincular navegación y eventos
    this.bindNavigationEvents();
    this.bindAdminAuth();
    this.bindGlobalEvents();

    // 4. Cargar vista inicial
    const hash = window.location.hash.replace('#', '') || 'inicio';
    await this.navigate(hash);
  }

  setupToastSystem() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    window.showToast = (message, type = 'info') => {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      let icon = 'ℹ️';
      if (type === 'success') icon = '✅';
      if (type === 'error') icon = '❌';
      if (type === 'warning') icon = '⚠️';

      toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    };
  }

  bindNavigationEvents() {
    // Enlaces de navegación con atributo data-view
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        this.navigate(targetView);
      });
    });

    // Mobile Hamburger
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav-menu');
    mobileBtn?.addEventListener('click', () => {
      navMenu?.classList.toggle('mobile-open');
    });

    // Botón de Subir PDF en el header
    document.getElementById('btn-header-upload')?.addEventListener('click', () => {
      StudentManager.open();
    });

    // Hash change listener para historial del navegador
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'inicio';
      if (hash !== this.currentView) {
        this.navigate(hash);
      }
    });
  }

  bindAdminAuth() {
    this.createAdminLoginModalDOM();

    const loginTriggerBtn = document.getElementById('btn-admin-login-trigger');
    const logoutBtn = document.getElementById('btn-admin-logout');
    const adminSessionPill = document.getElementById('admin-session-pill');
    const adminUserEmail = document.getElementById('admin-user-email');
    const adminNavLi = document.getElementById('nav-item-admin');
    const uploadNavLi = document.getElementById('nav-item-upload');

    // Escuchar cambios de autenticación en Supabase Auth
    auth.onAuthStateChanged((user) => {
      const isAdmin = auth.isAdmin();

      if (loginTriggerBtn) loginTriggerBtn.classList.toggle('hidden', isAdmin);
      if (adminSessionPill) adminSessionPill.classList.toggle('hidden', !isAdmin);
      if (adminUserEmail) adminUserEmail.textContent = user.email ? `⚖️ ${user.email}` : '⚖️ Admin';
      if (adminNavLi) adminNavLi.style.display = isAdmin ? 'block' : 'none';
      if (uploadNavLi) uploadNavLi.style.display = isAdmin ? 'block' : 'none';

      // Refrescar vista actual para reflejar permisos
      this.renderCurrentView();
    });

    // Abrir modal de Login
    loginTriggerBtn?.addEventListener('click', () => {
      this.openAdminLoginModal();
    });

    window.addEventListener('openAdminLoginModal', () => {
      this.openAdminLoginModal();
    });

    // Cerrar Sesión
    logoutBtn?.addEventListener('click', async () => {
      await auth.logout();
      window.showToast('Sesión de administrador finalizada correctamente.', 'info');
      if (this.currentView === 'admin') {
        this.navigate('inicio');
      }
    });
  }

  createAdminLoginModalDOM() {
    if (document.getElementById('admin-login-modal')) return;

    const modalHTML = `
      <div id="admin-login-modal" class="viewer-modal-backdrop" aria-hidden="true">
        <div class="viewer-modal-dialog login-modal-dialog">
          <div class="viewer-modal-header">
            <div class="viewer-header-info">
              <span class="badge badge-admin">🔐 Autenticación Supabase</span>
              <h2 class="viewer-title">Acceso Administrativo</h2>
              <p class="modal-subtitle">Panel exclusivo para administradores y docentes autorizados.</p>
            </div>
            <button id="login-modal-close" class="btn-close-modal">✕</button>
          </div>

          <form id="admin-login-form" class="modal-form-body">
            <div class="login-error-msg" id="login-error-msg"></div>

            <div class="form-grid">
              <div class="form-group full-width">
                <label for="login-email" class="form-label">Correo Electrónico <span class="req">*</span></label>
                <input type="email" id="login-email" class="form-input" placeholder="admin@derecho.edu.mx" required autocomplete="username">
              </div>

              <div class="form-group full-width">
                <label for="login-password" class="form-label">Contraseña <span class="req">*</span></label>
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
              </div>
            </div>

            <div class="alert alert-info" style="margin-top: 1rem; font-size: 0.82rem;">
              <span class="alert-icon">ℹ️</span>
              <div class="alert-content">
                <strong>Estudiantes y Visitantes:</strong>
                <p>No necesitan iniciar sesión para consultar leyes, jurisprudencias, formatos o descargar archivos PDF.</p>
              </div>
            </div>

            <div class="modal-form-footer">
              <button type="button" id="login-btn-cancel" class="btn btn-secondary">Cancelar</button>
              <button type="submit" id="login-btn-submit" class="btn btn-gold">
                <span>🔓 Iniciar Sesión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Eventos del modal de login
    const modal = document.getElementById('admin-login-modal');
    const closeBtn = document.getElementById('login-modal-close');
    const cancelBtn = document.getElementById('login-btn-cancel');
    const form = document.getElementById('admin-login-form');

    const closeModal = () => this.closeAdminLoginModal();
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAdminLoginSubmit();
    });
  }

  openAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    const errorEl = document.getElementById('login-error-msg');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('login-email')?.focus(), 100);
    }
  }

  closeAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.getElementById('admin-login-form')?.reset();
    }
  }

  async handleAdminLoginSubmit() {
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const errorEl = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('login-btn-submit');

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Por favor ingresa tu correo y contraseña.';
        errorEl.classList.add('visible');
      }
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Autenticando...</span>';
      }
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }

      await auth.login(email, password);

      this.closeAdminLoginModal();
      window.showToast('¡Sesión de administrador iniciada con éxito!', 'success');
      this.navigate('admin');
    } catch (err) {
      console.error('Fallo de inicio de sesión:', err);
      if (errorEl) {
        errorEl.textContent = err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.';
        errorEl.classList.add('visible');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🔓 Iniciar Sesión</span>';
      }
    }
  }

  bindGlobalEvents() {
    window.addEventListener('databaseChanged', () => {
      this.renderCurrentView();
    });

    window.addEventListener('documentAdded', () => {
      this.renderCurrentView();
    });
  }

  async navigate(viewName, params = {}) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Cerrar menú móvil si está abierto
    document.getElementById('main-nav-menu')?.classList.remove('mobile-open');

    // Actualizar clase activa en enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
      const isTarget = link.getAttribute('data-view') === viewName;
      link.classList.toggle('active', isTarget);
    });

    // Renderizar la vista correspondiente
    await this.renderCurrentView(params);

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async renderCurrentView(params = {}) {
    const container = document.getElementById('app-main-content');
    if (!container) return;

    switch (this.currentView) {
      case 'inicio':
        await this.renderInicio(container);
        break;
      case 'materias':
        await this.renderMaterias(container, params.subjectId);
        break;
      case 'buscador':
        await this.renderBuscador(container);
        break;
      case 'leyes':
        await this.renderLeyes(container);
        break;
      case 'jurisprudencia':
        await this.renderJurisprudencia(container);
        break;
      case 'apuntes':
        await this.renderApuntes(container);
        break;
      case 'formatos':
        await this.renderFormatos(container);
        break;
      case 'estudiantes':
        await this.renderEstudiantes(container);
        break;
      case 'fuentes':
        await this.renderFuentes(container);
        break;
      case 'acerca':
        await this.renderAcerca(container);
        break;
      case 'admin':
        if (auth.isAdmin()) {
          await this.renderAdminDashboard(container);
        } else {
          this.navigate('inicio');
          window.showToast('Acceso restringido. Cambia al rol de Administrador para ver esta sección.', 'warning');
        }
        break;
      default:
        await this.renderInicio(container);
        break;
    }
  }

  /* ==========================================================================
     VISTA 1: INICIO
     ========================================================================== */
  async renderInicio(container) {
    const stats = await db.getStats();
    const allDocs = await db.getAllDocuments();
    const subjects = await db.getAllSubjects();

    // Documentos destacados y verificados
    const verifiedDocs = allDocs
      .filter(d => d.verificationStatus === 'Material verificado' || d.featured)
      .slice(0, 6);

    container.innerHTML = `
      <!-- HERO BANNER -->
      <section class="hero-section">
        <div class="container hero-grid">
          <div class="hero-badge">🏛️ Repositorio Académico y Normativo Oficial</div>
          <h1 class="hero-title">
            Biblioteca Jurídica Universitaria
            <span class="gold-accent">Facultad de Derecho</span>
          </h1>
          <p class="hero-subtitle">
            Plataforma moderna de consulta, normatividad federal y estatal de Durango, jurisprudencia de la SCJN, formatos prácticos y repositorio colaborativo para estudiantes de Derecho.
          </p>

          <div class="hero-actions" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-gold btn-lg" id="btn-hero-explore">
              <span>🔍 Explorar Biblioteca</span>
            </button>
            ${auth.isAdmin() ? `
              <button class="btn btn-outline btn-lg" style="color: white; border-color: rgba(255,255,255,0.4);" id="btn-hero-upload">
                <span>📤 Subir PDF a Supabase</span>
              </button>
            ` : `
              <button class="btn btn-outline btn-lg" style="color: white; border-color: rgba(255,255,255,0.4);" id="btn-hero-leyes">
                <span>📜 Leyes y Códigos</span>
              </button>
            `}
          </div>

          <!-- Métricas del Hero -->
          <div class="hero-quick-stats">
            <div class="stat-pill">
              <span class="stat-num">${stats.totalDocs}</span>
              <span class="stat-label">Documentos</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">${stats.verifiedDocs}</span>
              <span class="stat-label">🛡️ Verificados</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">${stats.totalSubjects}</span>
              <span class="stat-label">Materias</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">${stats.studentUploads}</span>
              <span class="stat-label">Aportes Supabase</span>
            </div>
          </div>
        </div>
      </section>

      <!-- BUSCADOR RÁPIDO INTERACTIVO -->
      <div class="container">
        <div class="search-widget-container">
          <div class="search-input-wrap">
            <span class="search-icon-inside">🔍</span>
            <input type="text" id="home-quick-search" class="main-search-input" placeholder="Buscar por nombre de ley, constitución, materia, autor o palabras clave (ej: CPEUM, Durango, Amparo, Obligaciones)...">
          </div>
          <div class="filter-chips-row">
            <span class="filter-chips-label">Accesos rápidos:</span>
            <button class="chip-btn" data-search="Constitución">📜 CPEUM y Durango</button>
            <button class="chip-btn" data-search="Código">⚖️ Códigos Penales y Civiles</button>
            <button class="chip-btn" data-search="Amparo">🛡️ Juicio de Amparo</button>
            <button class="chip-btn" data-search="Formato">📝 Machotes y Demandas</button>
            <button class="chip-btn" data-search="Jurisprudencia">🏛️ Jurisprudencia SCJN</button>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: MATERIAS DESTACADAS -->
      <section class="container" style="margin-top: 3.5rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">📁 Biblioteca por Materias</h2>
            <p class="section-subtitle">Organización curricular de todas las ramas jurídicas</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-view-all-subjects">Ver todas las materias →</button>
        </div>

        <div class="subjects-grid">
          ${subjects.slice(0, 6).map(sub => this.renderSubjectCardHTML(sub)).join('')}
        </div>
      </section>

      <!-- SECCIÓN: MATERIALES VERIFICADOS Y RECIENTES -->
      <section class="container" style="margin-top: 4rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">🛡️ Materiales Verificados y Normatividad</h2>
            <p class="section-subtitle">Textos revisados oficialmente, leyes federales y del Estado de Durango</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-view-all-docs">Ver todo el catálogo →</button>
        </div>

        <div class="documents-grid">
          ${verifiedDocs.map(doc => this.renderDocumentCardHTML(doc)).join('')}
        </div>
      </section>

      <!-- SECCIÓN CALL TO ACTION -->
      <section class="container" style="margin-top: 4.5rem;">
        <div class="about-card" style="background: linear-gradient(135deg, #1c2d5a, #0a1128); color: white; border: 2px solid var(--color-gold);">
          <div style="max-width: 750px;">
            <span class="badge badge-verified" style="margin-bottom: 0.75rem;">🏛️ Repositorio Académico Digital</span>
            <h3 style="color: white; font-size: 1.7rem; margin-bottom: 0.75rem;">
              ${auth.isAdmin() ? 'Panel de Administración y Publicación' : 'Consulta libre para estudiantes de Derecho'}
            </h3>
            <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem;">
              ${auth.isAdmin() 
                ? 'Como administrador puedes subir nuevos archivos PDF a Supabase Storage, moderar la cola de revisión y registrar nuevo material jurídico.' 
                : 'Accede a la legislación federal de México, leyes vigentes de Durango, criterios de la SCJN y machotes para tu formación académica.'}
            </p>
            ${auth.isAdmin() ? `
              <button class="btn btn-gold btn-lg" id="btn-cta-upload">
                <span>📤 Subir nuevo PDF a Supabase</span>
              </button>
            ` : `
              <button class="btn btn-gold btn-lg" id="btn-cta-explore">
                <span>🔍 Explorar Todo el Catálogo</span>
              </button>
            `}
          </div>
        </div>
      </section>
    `;

    // Eventos de la vista de Inicio
    document.getElementById('btn-hero-explore')?.addEventListener('click', () => this.navigate('buscador'));
    document.getElementById('btn-hero-leyes')?.addEventListener('click', () => this.navigate('leyes'));
    document.getElementById('btn-hero-upload')?.addEventListener('click', () => StudentManager.open());
    document.getElementById('btn-cta-upload')?.addEventListener('click', () => StudentManager.open());
    document.getElementById('btn-cta-explore')?.addEventListener('click', () => this.navigate('buscador'));
    document.getElementById('btn-view-all-subjects')?.addEventListener('click', () => this.navigate('materias'));
    document.getElementById('btn-view-all-docs')?.addEventListener('click', () => this.navigate('buscador'));

    const searchInput = document.getElementById('home-quick-search');
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchFilters.query = searchInput.value;
        this.navigate('buscador');
      }
    });

    document.querySelectorAll('.chip-btn[data-search]').forEach(chip => {
      chip.addEventListener('click', () => {
        this.searchFilters.query = chip.getAttribute('data-search') || '';
        this.navigate('buscador');
      });
    });

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 2: BIBLIOTECA POR MATERIAS
     ========================================================================== */
  async renderMaterias(container, selectedSubjectId = null) {
    const subjects = await db.getAllSubjects();
    const allDocs = await db.getAllDocuments();

    let activeSubId = selectedSubjectId || this.currentSubjectFilter;
    let filteredDocs = [];

    if (activeSubId && activeSubId !== 'all') {
      filteredDocs = allDocs.filter(d => 
        (d.subjectId === activeSubId || d.subject.toLowerCase() === activeSubId.toLowerCase()) &&
        (auth.isAdmin() || d.verificationStatus !== 'Rechazado')
      );
    }

    const currentSubjectObj = subjects.find(s => s.id === activeSubId);

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">📁 Biblioteca por Materias Jurídicas</h2>
            <p class="section-subtitle">Selecciona una rama del Derecho para consultar su legislación, doctrina y apuntes.</p>
          </div>
          ${auth.isAdmin() ? `<button class="btn btn-gold btn-sm" id="btn-admin-add-subject">➕ Nueva Materia</button>` : ''}
        </div>

        <!-- Categorías Grid -->
        <div class="subjects-grid" style="margin-bottom: 2.5rem;">
          <div class="subject-card ${activeSubId === 'all' ? 'active-category' : ''}" data-subject-filter="all" style="${activeSubId === 'all' ? 'border-color: var(--color-gold);' : ''}">
            <div class="subject-header">
              <div class="subject-icon-box">📚</div>
              <span class="subject-count-pill">${allDocs.length}</span>
            </div>
            <h3 class="subject-title">Todas las Materias</h3>
            <p class="subject-desc">Catálogo general con todo el contenido jurídico disponible.</p>
            <div class="subject-card-footer">
              <span>Ver todos los documentos →</span>
            </div>
          </div>
          ${subjects.map(sub => `
            <div class="subject-card ${activeSubId === sub.id ? 'active-category' : ''}" data-subject-filter="${sub.id}" style="${activeSubId === sub.id ? 'border-color: var(--color-gold); background: var(--color-gold-light);' : ''}">
              <div class="subject-header">
                <div class="subject-icon-box">🏛️</div>
                <span class="subject-count-pill">${sub.count}</span>
              </div>
              <h3 class="subject-title">${sub.name}</h3>
              <p class="subject-desc">${sub.desc || 'Materiales y legislación correspondiente.'}</p>
              <div class="subject-card-footer">
                <span>Explorar materia →</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Resultados de la materia seleccionada -->
        ${activeSubId && activeSubId !== 'all' ? `
          <div class="section-header">
            <div class="section-title-wrap">
              <h3 class="section-title">Documentos de: ${currentSubjectObj ? currentSubjectObj.name : activeSubId}</h3>
              <p class="section-subtitle">Mostrando ${filteredDocs.length} documentos disponibles</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-upload-for-subject">📤 Aportar PDF a esta materia</button>
          </div>
          <div class="documents-grid">
            ${filteredDocs.length > 0 
              ? filteredDocs.map(d => this.renderDocumentCardHTML(d)).join('')
              : '<div class="alert alert-info" style="grid-column: 1/-1;"><p>No hay documentos cargados en esta materia aún. ¡Sé el primero en compartir un PDF!</p></div>'
            }
          </div>
        ` : ''}
      </div>
    `;

    // Eventos de selección de materias
    document.querySelectorAll('[data-subject-filter]').forEach(card => {
      card.addEventListener('click', () => {
        const subId = card.getAttribute('data-subject-filter');
        this.currentSubjectFilter = subId;
        this.renderMaterias(container, subId);
      });
    });

    document.getElementById('btn-upload-for-subject')?.addEventListener('click', () => {
      StudentManager.open(activeSubId);
    });

    document.getElementById('btn-admin-add-subject')?.addEventListener('click', () => {
      const name = prompt('Ingresa el nombre de la nueva materia jurídica:');
      if (name) {
        const desc = prompt('Breve descripción de la materia:') || '';
        AdminManager.createSubject(name, desc);
      }
    });

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 3: BUSCADOR AVANZADO
     ========================================================================== */
  async renderBuscador(container) {
    const subjects = await db.getAllSubjects();
    const allDocs = await db.getAllDocuments();

    // Filtrar documentos iniciales según this.searchFilters
    const filteredDocs = LegalSearchEngine.filterDocuments(allDocs, this.searchFilters);

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">🔍 Buscador Jurídico Especializado</h2>
            <p class="section-subtitle">Encuentra leyes, artículos, tesis, apuntes o formatos con filtros multicriterio.</p>
          </div>
        </div>

        <!-- Barra de Búsqueda y Filtros -->
        <div class="search-widget-container" style="margin-top: 0; margin-bottom: 2rem;">
          <div class="search-input-wrap">
            <span class="search-icon-inside">🔍</span>
            <input type="text" id="search-query-input" class="main-search-input" value="${this.searchFilters.query}" placeholder="Buscar por título, autor, palabras clave, artículos (ej: Art. 14, Durango, CPEUM, Amparo)...">
          </div>

          <div class="search-filters-row">
            <!-- Materia -->
            <select id="filter-materia" class="filter-select">
              <option value="all">📁 Todas las Materias</option>
              ${subjects.map(s => `<option value="${s.id}" ${this.searchFilters.subjectId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>

            <!-- Tipo de Documento -->
            <select id="filter-doctype" class="filter-select">
              <option value="all" ${this.searchFilters.docType === 'all' ? 'selected' : ''}>📄 Todos los Tipos</option>
              <option value="Constitución" ${this.searchFilters.docType === 'Constitución' ? 'selected' : ''}>📜 Constituciones</option>
              <option value="Código" ${this.searchFilters.docType === 'Código' ? 'selected' : ''}>⚖️ Códigos</option>
              <option value="Ley" ${this.searchFilters.docType === 'Ley' ? 'selected' : ''}>📖 Leyes</option>
              <option value="Formato" ${this.searchFilters.docType === 'Formato' ? 'selected' : ''}>📝 Formatos / Machotes</option>
              <option value="Jurisprudencia" ${this.searchFilters.docType === 'Jurisprudencia' ? 'selected' : ''}>🏛️ Jurisprudencia SCJN</option>
              <option value="Estudiante" ${this.searchFilters.docType === 'Estudiante' ? 'selected' : ''}>🎓 PDFs de Estudiantes</option>
            </select>

            <!-- Estado de Verificación -->
            <select id="filter-status" class="filter-select">
              <option value="all" ${this.searchFilters.verificationStatus === 'all' ? 'selected' : ''}>🛡️ Todos los Estados</option>
              <option value="Material verificado" ${this.searchFilters.verificationStatus === 'Material verificado' ? 'selected' : ''}>🛡️ Material verificado</option>
              <option value="Aprobado" ${this.searchFilters.verificationStatus === 'Aprobado' ? 'selected' : ''}>🟢 Aprobado</option>
              ${auth.isAdmin() ? '<option value="Pendiente de revisión">🟡 Pendiente de revisión</option>' : ''}
            </select>

            <!-- Ámbito / Nivel -->
            <select id="filter-level" class="filter-select">
              <option value="all" ${this.searchFilters.level === 'all' ? 'selected' : ''}>🌐 Todos los Ámbitos</option>
              <option value="federal" ${this.searchFilters.level === 'federal' ? 'selected' : ''}>🇲🇽 Nacional (Federal)</option>
              <option value="durango" ${this.searchFilters.level === 'durango' ? 'selected' : ''}>🌲 Estatal (Durango)</option>
            </select>

            <!-- Ordenar -->
            <select id="filter-sort" class="filter-select">
              <option value="recent">📅 Más recientes primero</option>
              <option value="verified-first">🛡️ Verificados primero</option>
              <option value="title-asc">🔤 Título (A-Z)</option>
            </select>

            <button id="btn-reset-filters" class="btn btn-secondary btn-sm" title="Limpiar filtros">✕ Limpiar</button>
          </div>
        </div>

        <!-- Contador de Resultados -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <span style="font-size: 0.95rem; color: var(--color-text-muted);">
            Se encontraron <strong id="results-count" style="color: var(--color-primary);">${filteredDocs.length}</strong> documentos
          </span>
        </div>

        <!-- Grid de Resultados -->
        <div class="documents-grid" id="search-results-grid">
          ${filteredDocs.length > 0 
            ? filteredDocs.map(doc => this.renderDocumentCardHTML(doc)).join('')
            : '<div class="alert alert-info" style="grid-column: 1/-1;"><p>No se encontraron documentos con los criterios de búsqueda especificados.</p></div>'
          }
        </div>
      </div>
    `;

    // Eventos del buscador en tiempo real
    const queryInput = document.getElementById('search-query-input');
    const materiaSelect = document.getElementById('filter-materia');
    const doctypeSelect = document.getElementById('filter-doctype');
    const statusSelect = document.getElementById('filter-status');
    const levelSelect = document.getElementById('filter-level');
    const sortSelect = document.getElementById('filter-sort');
    const resetBtn = document.getElementById('btn-reset-filters');

    const triggerSearch = async () => {
      this.searchFilters = {
        query: queryInput.value,
        subjectId: materiaSelect.value,
        docType: doctypeSelect.value,
        verificationStatus: statusSelect.value,
        level: levelSelect.value,
        sortBy: sortSelect.value
      };

      const docs = await db.getAllDocuments();
      const results = LegalSearchEngine.filterDocuments(docs, this.searchFilters);

      const grid = document.getElementById('search-results-grid');
      const countEl = document.getElementById('results-count');

      if (countEl) countEl.textContent = results.length;
      if (grid) {
        grid.innerHTML = results.length > 0
          ? results.map(d => this.renderDocumentCardHTML(d)).join('')
          : '<div class="alert alert-info" style="grid-column: 1/-1;"><p>No se encontraron documentos con los criterios de búsqueda especificados.</p></div>';
        this.bindCardActions();
      }
    };

    queryInput?.addEventListener('input', triggerSearch);
    materiaSelect?.addEventListener('change', triggerSearch);
    doctypeSelect?.addEventListener('change', triggerSearch);
    statusSelect?.addEventListener('change', triggerSearch);
    levelSelect?.addEventListener('change', triggerSearch);
    sortSelect?.addEventListener('change', triggerSearch);

    resetBtn?.addEventListener('click', () => {
      queryInput.value = '';
      materiaSelect.value = 'all';
      doctypeSelect.value = 'all';
      statusSelect.value = 'all';
      levelSelect.value = 'all';
      sortSelect.value = 'recent';
      triggerSearch();
    });

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 4: LEYES Y CÓDIGOS (FEDERAL Y DURANGO)
     ========================================================================== */
  async renderLeyes(container) {
    const allDocs = await db.getAllDocuments();
    const federalDocs = allDocs.filter(d => 
      (d.level || '').toLowerCase().includes('nacional') || (d.level || '').toLowerCase().includes('federal') || d.title.includes('CPEUM')
    );
    const durangoDocs = allDocs.filter(d => 
      (d.level || '').toLowerCase().includes('durango') || d.title.toLowerCase().includes('durango')
    );

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">⚖️ Leyes, Códigos y Constituciones</h2>
            <p class="section-subtitle">Marco normativo nacional de los Estados Unidos Mexicanos y legislación de Victoria de Durango.</p>
          </div>
        </div>

        <!-- Bloque Federal -->
        <div style="margin-bottom: 3.5rem;">
          <div class="section-header" style="border-bottom-color: #1d4ed8;">
            <div class="section-title-wrap">
              <h3 class="section-title" style="font-size: 1.4rem;">🇲🇽 Ámbito Nacional (Leyes Federales y CPEUM)</h3>
              <p class="section-subtitle">Constitución Federal, códigos nacionales y leyes reglamentarias vigentes del Diario Oficial de la Federación (DOF)</p>
            </div>
          </div>
          <div class="documents-grid">
            ${federalDocs.map(d => this.renderDocumentCardHTML(d)).join('')}
          </div>
        </div>

        <!-- Bloque Estatal Durango -->
        <div style="margin-bottom: 3rem;">
          <div class="section-header" style="border-bottom-color: #059669;">
            <div class="section-title-wrap">
              <h3 class="section-title" style="font-size: 1.4rem;">🌲 Ámbito Estatal (Estado de Durango / Victoria de Durango)</h3>
              <p class="section-subtitle">Constitución de Durango, Códigos Estatales (Penal, Civil) y Ley Orgánica del Poder Judicial de Durango</p>
            </div>
          </div>
          <div class="documents-grid">
            ${durangoDocs.map(d => this.renderDocumentCardHTML(d)).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 5: JURISPRUDENCIA
     ========================================================================== */
  async renderJurisprudencia(container) {
    const allDocs = await db.getAllDocuments();
    const jurDocs = allDocs.filter(d => d.docType.toLowerCase().includes('jurisprudencia') || d.title.toLowerCase().includes('jurisprudencia'));

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">🏛️ Jurisprudencia y Criterios SCJN</h2>
            <p class="section-subtitle">Criterios obligatorios y tesis relevantes del Pleno y Salas de la Suprema Corte de Justicia de la Nación.</p>
          </div>
          <a href="https://sjf2.scjn.gob.mx/" target="_blank" rel="noopener" class="btn btn-gold btn-sm">🔗 Semanario Judicial (SJF) ↗</a>
        </div>

        <div class="documents-grid">
          ${jurDocs.map(d => this.renderDocumentCardHTML(d)).join('')}
        </div>
      </div>
    `;

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 6: APUNTES Y MATERIALES
     ========================================================================== */
  async renderApuntes(container) {
    const allDocs = await db.getAllDocuments();
    const matDocs = allDocs.filter(d => 
      d.docType.toLowerCase().includes('guía') || 
      d.docType.toLowerCase().includes('apunte') || 
      d.docType.toLowerCase().includes('cuadro')
    );

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">📚 Apuntes y Guías de Estudio</h2>
            <p class="section-subtitle">Materiales didácticos, cuadros sinópticos y resúmenes de cátedra para reforzar tu aprendizaje.</p>
          </div>
          ${auth.isAdmin() ? `
            <button class="btn btn-gold btn-sm" id="btn-share-notes">📤 Subir Guía o Apunte (Admin)</button>
          ` : ''}
        </div>

        <div class="documents-grid">
          ${matDocs.map(d => this.renderDocumentCardHTML(d)).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-share-notes')?.addEventListener('click', () => StudentManager.open());
    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 7: FORMATOS Y EJEMPLOS (MACHOTES JURÍDICOS)
     ========================================================================== */
  async renderFormatos(container) {
    const allDocs = await db.getAllDocuments();
    const fmtDocs = allDocs.filter(d => d.docType.toLowerCase().includes('formato') || d.docType.toLowerCase().includes('machote'));

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">📝 Formatos y Machotes Jurídicos Prácticos</h2>
            <p class="section-subtitle">Modelos de demandas, contratos, recursos y amparos listos para estudio y práctica forense.</p>
          </div>
        </div>

        <div class="alert alert-info">
          <span class="alert-icon">💡</span>
          <div class="alert-content">
            <strong>Instrucciones de Uso:</strong>
            <p>Haz clic en <strong>Visualizar</strong> en cualquier formato para ver la estructura, copiar el texto al portapapeles o descargarlo en formato editable.</p>
          </div>
        </div>

        <div class="documents-grid">
          ${fmtDocs.map(d => this.renderDocumentCardHTML(d)).join('')}
        </div>
      </div>
    `;

    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 8: REPOSITORIO DE DOCUMENTOS Y PDFS ACADÉMICOS
     ========================================================================== */
  async renderEstudiantes(container) {
    const allDocs = await db.getAllDocuments();
    const isAdmin = auth.isAdmin();

    // Documentos colaborativos / Supabase / Aportes
    const studentDocs = allDocs.filter(d => 
      d.docType.includes('Estudiante') || d.docType.includes('Compartido') || d.studentSubmitter || d.isSupabase
    );

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">🎓 Documentos y PDFs Académicos</h2>
            <p class="section-subtitle">Repositorio de consulta y descarga libre de tesis, compendios y materiales jurídicos en formato digital.</p>
          </div>
          ${isAdmin ? `
            <button class="btn btn-gold" id="btn-student-view-upload">
              <span>📤 Subir Nuevo PDF (Admin)</span>
            </button>
          ` : ''}
        </div>

        <!-- Información de Acceso Libre -->
        <div class="alert alert-info">
          <span class="alert-icon">📖</span>
          <div class="alert-content">
            <strong>Acceso Libre y Gratuito para Estudiantes:</strong>
            <p>Todos los documentos y archivos PDF están disponibles para lectura completa en el visor interactivo y descarga directa sin necesidad de registro ni restricciones.</p>
          </div>
        </div>

        <!-- Documentos -->
        <div class="documents-grid">
          ${studentDocs.length > 0 
            ? studentDocs.map(d => this.renderDocumentCardHTML(d)).join('')
            : '<div class="alert alert-info" style="grid-column: 1/-1;"><p>No hay PDFs adicionales actualmente en esta sección. Todo el cuerpo normativo, leyes, códigos y formatos están disponibles en sus respectivas secciones.</p></div>'
          }
        </div>
      </div>
    `;

    document.getElementById('btn-student-view-upload')?.addEventListener('click', () => StudentManager.open());
    this.bindCardActions();
  }

  /* ==========================================================================
     VISTA 9: FUENTES OFICIALES
     ========================================================================== */
  async renderFuentes(container) {
    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">🏛️ Fuentes Oficiales y Portales Jurídicos</h2>
            <p class="section-subtitle">Directorios directos a los órganos legislativos, ejecutivos y judiciales de México y el Estado de Durango.</p>
          </div>
        </div>

        <div class="sources-grid">
          ${OFFICIAL_SOURCES.map(source => `
            <div class="source-card">
              <div>
                <div class="source-header">
                  <h3 class="source-title">${source.name}</h3>
                  <span class="badge ${source.badge === 'Durango' ? 'badge-approved' : 'badge-admin'}">${source.badge}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--color-primary); font-weight: 600; margin-bottom: 0.6rem;">
                  📍 ${source.jurisdiction} • ${source.category}
                </div>
                <p class="source-desc">${source.description}</p>
              </div>
              <a href="${source.url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="width: 100%; justify-content: center;">
                <span>🔗 Visitar Portal Oficial ↗</span>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     VISTA 10: ACERCA DEL PROYECTO & MANUAL DE ADMINISTRACIÓN
     ========================================================================== */
  async renderAcerca(container) {
    container.innerHTML = `
      <div class="container" style="padding-top: 2rem; max-width: 950px;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">📖 Acerca de la Biblioteca Jurídica Universitaria</h2>
            <p class="section-subtitle">Objetivo académico, filosofía del proyecto y guía paso a paso para administrar la plataforma.</p>
          </div>
        </div>

        <!-- Tarjeta de Misión -->
        <div class="about-card">
          <h3>🏛️ Misión del Proyecto</h3>
          <p>
            La <strong>Biblioteca Jurídica Universitaria</strong> surge con el propósito de democratizar el acceso al conocimiento jurídico para todos los estudiantes de la carrera de Derecho, facilitando la consulta de la normatividad federal (CPEUM, Códigos Nacionales) y la legislación del <strong>Estado de Durango</strong> y su capital <strong>Victoria de Durango</strong>.
          </p>
          <p>
            Diseñada pensando en la máxima comodidad para usuarios sin conocimientos técnicos, la plataforma combina rigor académico con una experiencia visual moderna, intuitiva y rápida en computadoras, tablets y celulares.
          </p>
        </div>

        <!-- Guía Paso a Paso para Administrar -->
        <div class="about-card" style="border-left: 4px solid var(--color-gold);">
          <h3>📘 Guía Paso a Paso: Cómo Administrar la Biblioteca y Agregar Documentos</h3>
          <p style="color: var(--color-text-muted);">
            Esta plataforma está diseñada para que cualquier persona pueda gestionarla sin tocar código de programación. Sigue estos sencillos pasos:
          </p>

          <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md);">
              <h4 style="color: var(--color-primary-dark); margin-bottom: 0.4rem;">1. Cambiar al Modo Administrador</h4>
              <p style="font-size: 0.9rem; color: var(--color-text-main);">
                En la barra superior (esquina superior derecha), haz clic en el botón <strong>[🎓 Estudiante]</strong> para cambiarlo a <strong>[⚖️ Administrador]</strong>. Aparecerá inmediatamente la pestaña <strong>"Panel Admin"</strong> en el menú de navegación.
              </p>
            </div>

            <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md);">
              <h4 style="color: var(--color-primary-dark); margin-bottom: 0.4rem;">2. Revisar y Aprobar PDFs enviados por Estudiantes</h4>
              <p style="font-size: 0.9rem; color: var(--color-text-main);">
                Entra a la sección <strong>"Panel Admin"</strong>. En la pestaña <em>"Cola de Revisión"</em> verás los documentos con estado <strong>🟡 Pendiente de revisión</strong>. Puedes hacer clic en <strong>🛡️ Verificar</strong> para otorgarle la certificación de calidad, <strong>🟢 Aprobar</strong> para publicarlo normalmente, <strong>✏️ Editar</strong> para corregir datos o <strong>🗑️ Eliminar</strong> si no cumple con las políticas.
              </p>
            </div>

            <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md);">
              <h4 style="color: var(--color-primary-dark); margin-bottom: 0.4rem;">3. Agregar Nuevas Materias o Categorías</h4>
              <p style="font-size: 0.9rem; color: var(--color-text-main);">
                En el Panel Admin, ve a la pestaña <em>"Gestión de Materias"</em> o en la sección <em>"Biblioteca por Materias"</em> presiona el botón <strong>"➕ Nueva Materia"</strong>. Escribe el nombre de la materia (ej: <em>Derecho Ambiental</em>, <em>Derecho Agrario</em>) y quedará disponible de inmediato en todos los formularios y filtros.
              </p>
            </div>

            <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md);">
              <h4 style="color: var(--color-primary-dark); margin-bottom: 0.4rem;">4. Guardar Respaldos de la Base de Datos</h4>
              <p style="font-size: 0.9rem; color: var(--color-text-main);">
                En la pestaña <em>"Respaldo y Base de Datos"</em> del Panel Admin, puedes hacer clic en <strong>"⬇️ Exportar Respaldo JSON"</strong> para descargar un archivo con todos los documentos y materias. Si cambias de computadora o deseas restaurar tu información, simplemente selecciona el archivo con el botón de importar.
              </p>
            </div>
          </div>
        </div>

        <!-- Aviso de Responsabilidad Jurídica -->
        <div class="alert alert-info">
          <span class="alert-icon">⚖️</span>
          <div class="alert-content">
            <strong>Aviso de Responsabilidad Jurídica:</strong>
            <p>
              La plataforma funciona exclusivamente como una biblioteca académica y repositorio de consulta. No constituye asesoría jurídica formal ni sustituye el criterio de abogados titulados o las publicaciones oficiales de los diarios de gobierno.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     VISTA: PANEL DE ADMINISTRACIÓN
     ========================================================================== */
  async renderAdminDashboard(container) {
    const stats = await db.getStats();
    const allDocs = await db.getAllDocuments();
    const subjects = await db.getAllSubjects();

    container.innerHTML = `
      <div class="container" style="padding-top: 2rem;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">⚖️ Panel de Administración y Moderación</h2>
            <p class="section-subtitle">Gestión centralizada de documentos, verificación académica, categorías y base de datos.</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-admin-switch-student">Volver a modo Estudiante</button>
        </div>

        <!-- Tarjetas de Métricas -->
        <div class="admin-metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box metric-blue">📄</div>
            <div class="metric-data">
              <h4>${stats.totalDocs}</h4>
              <span>Total Documentos</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-box metric-gold">🛡️</div>
            <div class="metric-data">
              <h4>${stats.verifiedDocs}</h4>
              <span>Verificados</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-box metric-amber">🟡</div>
            <div class="metric-data">
              <h4>${stats.pendingDocs}</h4>
              <span>Pendientes</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon-box metric-green">📁</div>
            <div class="metric-data">
              <h4>${stats.totalSubjects}</h4>
              <span>Materias</span>
            </div>
          </div>
        </div>

        <!-- Tabs de Administración -->
        <div class="admin-tabs-nav">
          <button class="admin-tab-btn active" data-admin-tab="review-queue">📋 Cola de Revisión (${stats.pendingDocs})</button>
          <button class="admin-tab-btn" data-admin-tab="all-docs">📚 Todos los Documentos (${stats.totalDocs})</button>
          <button class="admin-tab-btn" data-admin-tab="subjects-mgr">📁 Gestión de Materias (${stats.totalSubjects})</button>
          <button class="admin-tab-btn" data-admin-tab="backup-mgr">💾 Respaldo y Base de Datos</button>
        </div>

        <!-- Contenido de Tabs -->
        <div id="admin-tab-content">
          ${this.renderAdminReviewQueueHTML(allDocs)}
        </div>
      </div>
    `;

    // Eventos de tabs
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-admin-tab');
        const tabContent = document.getElementById('admin-tab-content');

        if (tab === 'review-queue') {
          tabContent.innerHTML = this.renderAdminReviewQueueHTML(allDocs);
        } else if (tab === 'all-docs') {
          tabContent.innerHTML = this.renderAdminAllDocsTableHTML(allDocs);
        } else if (tab === 'subjects-mgr') {
          tabContent.innerHTML = this.renderAdminSubjectsManagerHTML(subjects);
        } else if (tab === 'backup-mgr') {
          tabContent.innerHTML = this.renderAdminBackupHTML();
        }

        this.bindAdminTableEvents();
      });
    });

    document.getElementById('btn-admin-switch-student')?.addEventListener('click', () => {
      auth.setRole('student');
      this.navigate('inicio');
    });

    this.bindAdminTableEvents();
  }

  renderAdminReviewQueueHTML(allDocs) {
    const pendingDocs = allDocs.filter(d => d.verificationStatus === 'Pendiente de revisión');

    if (pendingDocs.length === 0) {
      return `
        <div class="about-card" style="text-align: center; padding: 3rem;">
          <span style="font-size: 3rem;">🎉</span>
          <h3 style="margin-top: 0.75rem;">¡No hay documentos pendientes de revisión!</h3>
          <p style="color: var(--color-text-muted);">Todos los aportes estudiantiles han sido revisados y procesados.</p>
        </div>
      `;
    }

    return `
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título del Documento</th>
              <th>Materia</th>
              <th>Autor / Remitente</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th style="text-align: right;">Acciones de Moderación</th>
            </tr>
          </thead>
          <tbody>
            ${pendingDocs.map(doc => `
              <tr>
                <td>
                  <strong>${doc.title}</strong>
                  <br><small class="text-muted">${doc.docType}</small>
                </td>
                <td><span class="doc-subject-tag">${doc.subject}</span></td>
                <td>${doc.studentSubmitter || doc.author}</td>
                <td>${doc.publishDate}</td>
                <td><span class="badge badge-pending">🟡 Pendiente</span></td>
                <td style="text-align: right;">
                  <div class="admin-actions-cell" style="justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" data-action="view" data-id="${doc.id}" title="Revisar contenido">👁️ Ver</button>
                    <button class="btn btn-gold btn-sm" data-action="verify" data-id="${doc.id}" title="Marcar como Material Verificado">🛡️ Verificar</button>
                    <button class="btn btn-primary btn-sm" data-action="approve" data-id="${doc.id}" title="Aprobar sin verificar">🟢 Aprobar</button>
                    <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${doc.id}" title="Editar metadatos">✏️</button>
                    <button class="btn btn-danger btn-sm" data-action="reject" data-id="${doc.id}" title="Rechazar">🔴</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderAdminAllDocsTableHTML(allDocs) {
    return `
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Materia</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${allDocs.map(doc => `
              <tr>
                <td>
                  <strong>${doc.title}</strong>
                  <br><small class="text-muted">${doc.author} • ${doc.source}</small>
                </td>
                <td><span class="doc-subject-tag">${doc.subject}</span></td>
                <td><small>${doc.docType}</small></td>
                <td>
                  <span class="badge ${
                    doc.verificationStatus === 'Material verificado' ? 'badge-verified' :
                    doc.verificationStatus === 'Aprobado' ? 'badge-approved' :
                    doc.verificationStatus === 'Pendiente de revisión' ? 'badge-pending' : 'badge-rejected'
                  }">
                    ${doc.verificationStatus}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="admin-actions-cell" style="justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" data-action="view" data-id="${doc.id}">👁️</button>
                    <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${doc.id}">✏️</button>
                    ${doc.verificationStatus !== 'Material verificado' ? `<button class="btn btn-gold btn-sm" data-action="verify" data-id="${doc.id}">🛡️</button>` : ''}
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${doc.id}">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderAdminSubjectsManagerHTML(subjects) {
    return `
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
        <!-- Formulario Crear Materia -->
        <div class="about-card">
          <h3>➕ Agregar Nueva Materia</h3>
          <form id="form-create-subject" style="margin-top: 1rem;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label">Nombre de la Materia *</label>
              <input type="text" id="new-sub-name" class="form-input" placeholder="Ej: Derecho Ambiental" required>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label">Descripción</label>
              <textarea id="new-sub-desc" class="form-textarea" rows="3" placeholder="Descripción de los temas y legislación..."></textarea>
            </div>
            <button type="submit" class="btn btn-gold" style="width: 100%;">Guardar Materia</button>
          </form>
        </div>

        <!-- Lista de Materias Existentes -->
        <div class="about-card">
          <h3>📁 Materias Activas en la Biblioteca (${subjects.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
            ${subjects.map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--color-bg-alt); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                <div>
                  <strong style="color: var(--color-primary-dark);">${s.name}</strong>
                  <br><small class="text-muted">${s.count} documentos asociados</small>
                </div>
                <button class="btn btn-danger btn-sm" data-action="delete-subject" data-id="${s.id}" title="Eliminar materia">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderAdminBackupHTML() {
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="about-card">
          <h3>💾 Exportar Respaldo Completo</h3>
          <p>Descarga un archivo JSON seguro con todos los documentos, materias, configuraciones y PDFs almacenados en el navegador.</p>
          <button class="btn btn-gold btn-lg" id="btn-export-backup" style="margin-top: 1rem;">
            <span>⬇️ Descargar Respaldo JSON</span>
          </button>
        </div>

        <div class="about-card">
          <h3>📂 Restaurar desde Respaldo JSON</h3>
          <p>Restaura la biblioteca a partir de un archivo de respaldo previamente descargado.</p>
          <input type="file" id="input-import-backup" accept=".json,application/json" style="margin-top: 1rem; margin-bottom: 1rem; display: block;">
          <button class="btn btn-outline" id="btn-trigger-import">
            <span>⬆️ Restaurar Base de Datos</span>
          </button>
        </div>

        <div class="about-card" style="grid-column: 1/-1; border-color: #fca5a5; background: #fff5f5;">
          <h3 style="color: #991b1b;">⚠️ Restablecer Valores de Fábrica</h3>
          <p style="color: #7f1d1d;">Restaura la base de datos a los valores oficiales predeterminados (CPEUM, Constitución de Durango, Códigos y Formatos base).</p>
          <button class="btn btn-danger" id="btn-reset-seed" style="margin-top: 1rem;">Restablecer a Datos Iniciales</button>
        </div>
      </div>
    `;
  }

  bindAdminTableEvents() {
    // Ver documento
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const doc = await db.getDocumentById(id);
        if (doc) DocumentViewer.open(doc);
      });
    });

    // Verificar documento
    document.querySelectorAll('[data-action="verify"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        AdminManager.verifyDocument(id);
      });
    });

    // Aprobar documento
    document.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        AdminManager.approveDocument(id);
      });
    });

    // Rechazar documento
    document.querySelectorAll('[data-action="reject"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        AdminManager.rejectDocument(id);
      });
    });

    // Editar documento
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        AdminManager.openEditModal(id);
      });
    });

    // Eliminar documento
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        AdminManager.deleteDocument(id);
      });
    });

    // Crear Materia
    const createSubForm = document.getElementById('form-create-subject');
    createSubForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-sub-name')?.value;
      const desc = document.getElementById('new-sub-desc')?.value;
      AdminManager.createSubject(name, desc);
    });

    // Eliminar Materia
    document.querySelectorAll('[data-action="delete-subject"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Deseas eliminar esta materia del catálogo?')) {
          await db.deleteSubject(id);
          window.showToast?.('Materia eliminada', 'info');
          window.dispatchEvent(new CustomEvent('databaseChanged'));
        }
      });
    });

    // Exportar Respaldo
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      AdminManager.exportBackup();
    });

    // Importar Respaldo
    const importInput = document.getElementById('input-import-backup');
    document.getElementById('btn-trigger-import')?.addEventListener('click', () => {
      if (importInput && importInput.files && importInput.files[0]) {
        AdminManager.importBackup(importInput.files[0]);
      } else {
        window.showToast?.('Por favor selecciona un archivo JSON de respaldo', 'warning');
      }
    });

    // Reset Seed
    document.getElementById('btn-reset-seed')?.addEventListener('click', () => {
      AdminManager.resetDatabase();
    });
  }

  /* ==========================================================================
     HELPERS: GENERACIÓN DE TARJETAS HTML
     ========================================================================== */
  renderSubjectCardHTML(sub) {
    return `
      <div class="subject-card" data-subject-id="${sub.id}">
        <div>
          <div class="subject-header">
            <div class="subject-icon-box">🏛️</div>
            <span class="subject-count-pill">${sub.count} docs</span>
          </div>
          <h3 class="subject-title">${sub.name}</h3>
          <p class="subject-desc">${sub.desc || 'Legislación, doctrina y formatos aplicables.'}</p>
        </div>
        <div class="subject-card-footer">
          <span>Ver materiales →</span>
        </div>
      </div>
    `;
  }

  renderDocumentCardHTML(doc) {
    const isVerified = doc.verificationStatus === 'Material verificado' || doc.isVerified;
    const isPending = doc.verificationStatus === 'Pendiente de revisión';
    const isRejected = doc.verificationStatus === 'Rechazado';

    return `
      <div class="document-card ${isVerified ? 'card-verified' : ''} ${isPending ? 'card-pending' : ''}">
        <div>
          <div class="document-top-meta">
            <span class="doc-subject-tag">${doc.subject}</span>
            ${doc.level ? `<span class="doc-level-tag">${doc.level}</span>` : ''}
            <span class="badge ${
              isVerified ? 'badge-verified' : 
              isPending ? 'badge-pending' : 
              isRejected ? 'badge-rejected' : 'badge-approved'
            }">
              ${isVerified ? '🛡️ Material verificado' : doc.verificationStatus}
            </span>
          </div>

          <h3 class="document-title">${doc.title}</h3>
          <p class="document-desc">${doc.description || 'Sin descripción disponible.'}</p>

          <div class="document-meta-list">
            <div class="doc-meta-item">
              <strong>Autor:</strong> <span>${doc.author}</span>
            </div>
            <div class="doc-meta-item">
              <strong>Fuente:</strong> <span>${doc.source}</span>
            </div>
            <div class="doc-meta-item">
              <strong>Tipo:</strong> <span>${doc.docType}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="document-card-actions">
            <button class="btn btn-gold btn-sm" data-btn-view="${doc.id}">
              <span>👁️ Visualizar</span>
            </button>
            <button class="btn btn-secondary btn-sm" data-btn-download="${doc.id}">
              <span>⬇️ Descargar</span>
            </button>
          </div>

          <!-- Acciones de Administración si el rol es Admin -->
          ${auth.isAdmin() ? `
            <div class="admin-card-actions">
              <small style="font-weight: 700; color: var(--color-gold);">Admin:</small>
              ${!isVerified ? `<button class="btn btn-gold btn-sm" data-btn-admin-verify="${doc.id}" title="Verificar">🛡️</button>` : ''}
              <button class="btn btn-secondary btn-sm" data-btn-admin-edit="${doc.id}" title="Editar">✏️</button>
              <button class="btn btn-danger btn-sm" data-btn-admin-delete="${doc.id}" title="Eliminar">🗑️</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  bindCardActions() {
    // Visualizar Documento
    document.querySelectorAll('[data-btn-view]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-btn-view');
        const doc = await db.getDocumentById(id);
        if (doc) DocumentViewer.open(doc);
      });
    });

    // Descargar Documento
    document.querySelectorAll('[data-btn-download]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-btn-download');
        const doc = await db.getDocumentById(id);
        if (doc) {
          DocumentViewer.currentDoc = doc;
          DocumentViewer.triggerDownload();
        }
      });
    });

    // Clic en tarjeta de materia
    document.querySelectorAll('.subject-card[data-subject-id]').forEach(card => {
      card.addEventListener('click', () => {
        const subId = card.getAttribute('data-subject-id');
        this.currentSubjectFilter = subId;
        this.navigate('materias', { subjectId: subId });
      });
    });

    // Admin Quick Verify
    document.querySelectorAll('[data-btn-admin-verify]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-btn-admin-verify');
        AdminManager.verifyDocument(id);
      });
    });

    // Admin Quick Edit
    document.querySelectorAll('[data-btn-admin-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-btn-admin-edit');
        AdminManager.openEditModal(id);
      });
    });

    // Admin Quick Delete
    document.querySelectorAll('[data-btn-admin-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-btn-admin-delete');
        AdminManager.deleteDocument(id);
      });
    });
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new LegalLibraryApp();
  app.init();
});
