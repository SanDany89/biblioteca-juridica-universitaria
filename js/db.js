/**
 * db.js - Motor de Base de Datos Persistente con IndexedDB y Respaldo JSON
 * Almacena documentos, materias y PDFs en el navegador del usuario de forma permanente.
 */

import { INITIAL_SUBJECTS, INITIAL_DOCUMENTS } from './data-seed.js';

const DB_NAME = 'BibliotecaJuridicaUniversitariaDB';
const DB_VERSION = 1;

class LegalDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      // Fallback a localStorage si IndexedDB no está disponible
      if (!window.indexedDB) {
        console.warn('IndexedDB no soportado, usando almacenamiento local');
        this.useLocalStorage = true;
        this.initLocalStorage();
        this.isReady = true;
        resolve(this);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store de Documentos
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('subjectId', 'subjectId', { unique: false });
          docStore.createIndex('verificationStatus', 'verificationStatus', { unique: false });
          docStore.createIndex('docType', 'docType', { unique: false });
          docStore.createIndex('publishDate', 'publishDate', { unique: false });
        }

        // Store de Materias
        if (!db.objectStoreNames.contains('subjects')) {
          db.createObjectStore('subjects', { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;
        await this.seedInitialDataIfEmpty();
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        this.useLocalStorage = true;
        this.initLocalStorage();
        this.isReady = true;
        resolve(this);
      };
    });
  }

  async seedInitialDataIfEmpty() {
    const docCount = await this.count('documents');
    if (docCount === 0) {
      console.log('Sembrando datos iniciales en IndexedDB...');
      const tx = this.db.transaction(['documents', 'subjects'], 'readwrite');
      const docStore = tx.objectStore('documents');
      const subStore = tx.objectStore('subjects');

      for (const doc of INITIAL_DOCUMENTS) {
        docStore.put(doc);
      }
      for (const sub of INITIAL_SUBJECTS) {
        subStore.put(sub);
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
      });
    }
  }

  initLocalStorage() {
    if (!localStorage.getItem('bju_documents')) {
      localStorage.setItem('bju_documents', JSON.stringify(INITIAL_DOCUMENTS));
    }
    if (!localStorage.getItem('bju_subjects')) {
      localStorage.setItem('bju_subjects', JSON.stringify(INITIAL_SUBJECTS));
    }
  }

  async count(storeName) {
    if (this.useLocalStorage) {
      const items = JSON.parse(localStorage.getItem(`bju_${storeName}`) || '[]');
      return items.length;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // OBTENER TODOS LOS DOCUMENTOS
  async getAllDocuments() {
    await this.initPromise;
    if (this.useLocalStorage) {
      return JSON.parse(localStorage.getItem('bju_documents') || '[]');
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // OBTENER DOCUMENTO POR ID
  async getDocumentById(id) {
    await this.initPromise;
    if (this.useLocalStorage) {
      const docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      return docs.find(d => d.id === id) || null;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // AGREGAR NUEVO DOCUMENTO (Estudiante o Admin)
  async addDocument(documentData) {
    await this.initPromise;
    const doc = {
      id: documentData.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: documentData.title || 'Documento sin título',
      subject: documentData.subject || 'Otras materias',
      subjectId: documentData.subjectId || 'otras',
      author: documentData.author || 'Anónimo',
      publishDate: documentData.publishDate || new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      docType: documentData.docType || 'PDF Compartido por Estudiante',
      level: documentData.level || 'Estudiantil / Académico',
      description: documentData.description || '',
      keywords: Array.isArray(documentData.keywords) 
        ? documentData.keywords 
        : (documentData.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      source: documentData.source || 'Aporte Universitario',
      verificationStatus: documentData.verificationStatus || 'Pendiente de revisión',
      isVerified: documentData.verificationStatus === 'Material verificado',
      fileSize: documentData.fileSize || 'N/A',
      fileType: documentData.fileType || 'PDF',
      downloadUrl: documentData.downloadUrl || '#',
      fileBlobData: documentData.fileBlobData || null, // Base64 del archivo PDF
      fileName: documentData.fileName || 'documento.pdf',
      studentSubmitter: documentData.studentSubmitter || null,
      studentEmail: documentData.studentEmail || null,
      featured: Boolean(documentData.featured)
    };

    if (this.useLocalStorage) {
      const docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      docs.unshift(doc);
      localStorage.setItem('bju_documents', JSON.stringify(docs));
      return doc;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.put(doc);
      req.onsuccess = () => resolve(doc);
      req.onerror = () => reject(req.error);
    });
  }

  // ACTUALIZAR DOCUMENTO (Aprobar, Rechazar, Editar, Verificar)
  async updateDocument(id, updates) {
    await this.initPromise;
    const currentDoc = await this.getDocumentById(id);
    if (!currentDoc) throw new Error(`Documento con ID ${id} no encontrado`);

    const updatedDoc = {
      ...currentDoc,
      ...updates,
      lastUpdate: new Date().toISOString().split('T')[0],
      isVerified: (updates.verificationStatus === 'Material verificado' || 
                   (currentDoc.verificationStatus === 'Material verificado' && updates.verificationStatus === undefined))
    };

    if (this.useLocalStorage) {
      const docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      const index = docs.findIndex(d => d.id === id);
      if (index !== -1) {
        docs[index] = updatedDoc;
        localStorage.setItem('bju_documents', JSON.stringify(docs));
      }
      return updatedDoc;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.put(updatedDoc);
      req.onsuccess = () => resolve(updatedDoc);
      req.onerror = () => reject(req.error);
    });
  }

  // ELIMINAR DOCUMENTO
  async deleteDocument(id) {
    await this.initPromise;
    if (this.useLocalStorage) {
      let docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      docs = docs.filter(d => d.id !== id);
      localStorage.setItem('bju_documents', JSON.stringify(docs));
      return true;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // MATERIAS / CATEGORÍAS
  async getAllSubjects() {
    await this.initPromise;
    let subjects = [];
    if (this.useLocalStorage) {
      subjects = JSON.parse(localStorage.getItem('bju_subjects') || '[]');
    } else {
      subjects = await new Promise((resolve, reject) => {
        const tx = this.db.transaction('subjects', 'readonly');
        const store = tx.objectStore('subjects');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    }

    // Calcular conteo dinámico de documentos por materia
    const allDocs = await this.getAllDocuments();
    return subjects.map(sub => {
      const count = allDocs.filter(d => 
        (d.subjectId === sub.id || d.subject.toLowerCase() === sub.name.toLowerCase()) &&
        d.verificationStatus !== 'Rechazado'
      ).length;
      return { ...sub, count };
    });
  }

  async addSubject(subjectData) {
    await this.initPromise;
    const sub = {
      id: subjectData.id || subjectData.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: subjectData.name,
      icon: subjectData.icon || 'book-open',
      desc: subjectData.desc || 'Documentos y doctrina de la materia.',
      count: 0
    };

    if (this.useLocalStorage) {
      const subs = JSON.parse(localStorage.getItem('bju_subjects') || '[]');
      subs.push(sub);
      localStorage.setItem('bju_subjects', JSON.stringify(subs));
      return sub;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('subjects', 'readwrite');
      const store = tx.objectStore('subjects');
      const req = store.put(sub);
      req.onsuccess = () => resolve(sub);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSubject(id) {
    await this.initPromise;
    if (this.useLocalStorage) {
      let subs = JSON.parse(localStorage.getItem('bju_subjects') || '[]');
      subs = subs.filter(s => s.id !== id);
      localStorage.setItem('bju_subjects', JSON.stringify(subs));
      return true;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('subjects', 'readwrite');
      const store = tx.objectStore('subjects');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // ESTADÍSTICAS GENERALES DE LA BIBLIOTECA
  async getStats() {
    const docs = await this.getAllDocuments();
    const subjects = await this.getAllSubjects();
    return {
      totalDocs: docs.length,
      verifiedDocs: docs.filter(d => d.verificationStatus === 'Material verificado').length,
      approvedDocs: docs.filter(d => d.verificationStatus === 'Aprobado').length,
      pendingDocs: docs.filter(d => d.verificationStatus === 'Pendiente de revisión').length,
      rejectedDocs: docs.filter(d => d.verificationStatus === 'Rechazado').length,
      totalSubjects: subjects.length,
      studentUploads: docs.filter(d => d.docType.includes('Estudiante') || d.studentSubmitter).length
    };
  }

  // EXPORTAR BASE DE DATOS A JSON (Respaldo)
  async exportDatabaseJSON() {
    const docs = await this.getAllDocuments();
    const subs = await this.getAllSubjects();
    const backup = {
      exportDate: new Date().toISOString(),
      appName: 'Biblioteca Jurídica Universitaria',
      version: '1.0',
      documents: docs,
      subjects: subs
    };
    return JSON.stringify(backup, null, 2);
  }

  // IMPORTAR BASE DE DATOS DESDE JSON (Restauración)
  async importDatabaseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error('Estructura de respaldo inválida');
      }

      if (this.useLocalStorage) {
        localStorage.setItem('bju_documents', JSON.stringify(data.documents));
        if (data.subjects) localStorage.setItem('bju_subjects', JSON.stringify(data.subjects));
        return true;
      }

      const tx = this.db.transaction(['documents', 'subjects'], 'readwrite');
      const docStore = tx.objectStore('documents');
      const subStore = tx.objectStore('subjects');

      await new Promise((res) => {
        docStore.clear().onsuccess = () => res();
      });
      await new Promise((res) => {
        subStore.clear().onsuccess = () => res();
      });

      for (const doc of data.documents) {
        docStore.put(doc);
      }
      if (data.subjects) {
        for (const sub of data.subjects) {
          subStore.put(sub);
        }
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      console.error('Error importando base de datos:', e);
      throw e;
    }
  }

  // RESTABLECER BASE DE DATOS A ESTADO INICIAL
  async resetToSeed() {
    if (this.useLocalStorage) {
      localStorage.setItem('bju_documents', JSON.stringify(INITIAL_DOCUMENTS));
      localStorage.setItem('bju_subjects', JSON.stringify(INITIAL_SUBJECTS));
      return true;
    }
    const tx = this.db.transaction(['documents', 'subjects'], 'readwrite');
    const docStore = tx.objectStore('documents');
    const subStore = tx.objectStore('subjects');

    await new Promise(res => { docStore.clear().onsuccess = () => res(); });
    await new Promise(res => { subStore.clear().onsuccess = () => res(); });

    for (const doc of INITIAL_DOCUMENTS) docStore.put(doc);
    for (const sub of INITIAL_SUBJECTS) subStore.put(sub);

    return new Promise(resolve => {
      tx.oncomplete = () => resolve(true);
    });
  }
}

export const db = new LegalDatabase();
