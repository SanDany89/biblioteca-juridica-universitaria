/**
 * db.js - Motor de Base de Datos en Nube con Supabase
 * Fuente ÚNICA de verdad: todas las materias y documentos se leen y escriben
 * directamente en las tablas 'materias' y 'documentos' de Supabase.
 * No se usan arrays estáticos, localStorage ni IndexedDB como fuentes de datos.
 */

import { getSupabase, STORAGE_BUCKET, TABLE_DOCUMENTS, TABLE_SUBJECTS } from './supabase-config.js';

const DB_NAME = 'BibliotecaJuridicaUniversitariaDB';
const DB_VERSION = 1;

class LegalDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.useLocalStorage = false;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB no soportado, usando almacenamiento local');
        this.useLocalStorage = true;
        // Limpiar claves estáticas del localStorage sin sembrar nuevas
        const staleKeys = ['bju_documents', 'bju_subjects', 'bju_db_seeded'];
        staleKeys.forEach(key => localStorage.removeItem(key));
        this.isReady = true;
        resolve(this);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('subjectId', 'subjectId', { unique: false });
          docStore.createIndex('verificationStatus', 'verificationStatus', { unique: false });
          docStore.createIndex('docType', 'docType', { unique: false });
        }

        if (!db.objectStoreNames.contains('subjects')) {
          db.createObjectStore('subjects', { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;
        // Limpiar datos estáticos locales para evitar inconsistencias entre usuarios
        this.clearStaleLocalData();
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        this.useLocalStorage = true;
        // En caso de error tampoco sembrar datos estáticos
        const staleKeys = ['bju_documents', 'bju_subjects', 'bju_db_seeded'];
        staleKeys.forEach(key => localStorage.removeItem(key));
        this.isReady = true;
        resolve(this);
      };
    });
  }

  /**
   * Limpia del localStorage y de IndexedDB todos los datos estáticos de materias
   * y documentos sembrados en versiones anteriores, para forzar la lectura desde Supabase.
   */
  clearStaleLocalData() {
    // Borrar claves de localStorage usadas por versiones anteriores
    const staleKeys = [
      'bju_documents',
      'bju_subjects',
      'bju_db_seeded'
    ];
    staleKeys.forEach(key => localStorage.removeItem(key));

    // Borrar stores de IndexedDB si están disponibles
    if (this.db) {
      try {
        const tx = this.db.transaction(['documents', 'subjects'], 'readwrite');
        tx.objectStore('documents').clear();
        tx.objectStore('subjects').clear();
      } catch (e) {
        // Si falla no es crítico — Supabase es la fuente de verdad
        console.warn('No se pudo limpiar IndexedDB:', e);
      }
    }
  }

  async countLocal(storeName) {
    if (this.useLocalStorage) {
      const items = JSON.parse(localStorage.getItem(`bju_${storeName}`) || '[]');
      return items.length;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      } catch (e) {
        resolve(0);
      }
    });
  }

  /* ==========================================================================
     SUPABASE STORAGE: SUBIDA DE ARCHIVOS PDF DIRECTA
     ========================================================================== */

  /**
   * Sube un archivo PDF directamente al bucket 'documentos-pdf' en Supabase Storage
   * @param {File|Blob} file Archivo binario PDF
   * @returns {Promise<{ filePath: string, publicUrl: string }>}
   */
  async uploadPdfToStorage(file) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase no está configurado o el cliente no está disponible.');
    }

    const cleanName = (file.name || 'documento.pdf')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const timestamp = Date.now();
    const filePath = `${timestamp}_${cleanName}`;

    console.log(`Subiendo PDF a bucket '${STORAGE_BUCKET}': ${filePath}`);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      });

    if (error) {
      console.error('Error al subir archivo a Supabase Storage:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl || '';
    console.log('PDF subido con éxito a Supabase. URL Pública:', publicUrl);

    return {
      filePath,
      publicUrl
    };
  }

  /* ==========================================================================
     MAPEO DE REGISTROS SUPABASE -> MODELO UNIFICADO
     ========================================================================== */
  mapSupabaseDoc(row) {
    const title = row.titulo || row.title || 'Documento Jurídico';
    const subject = row.materia || row.subject || 'Otras materias';
    const category = row.categoria || row.category || row.docType || 'PDF Compartido';
    const url = row.url || row.download_url || row.file_url || row.downloadUrl || '#';
    const author = row.autor || row.author || 'Facultad de Derecho';
    const description = row.descripcion || row.description || 'Documento disponible para consulta y descarga académica.';
    const source = row.fuente || row.source || 'Repositorio Supabase';
    const status = row.estado || row.verification_status || row.verificationStatus || 'Aprobado';
    
    const publishDate = row.created_at 
      ? new Date(row.created_at).toISOString().split('T')[0] 
      : (row.fecha || row.publishDate || new Date().toISOString().split('T')[0]);

    let keywords = [];
    if (Array.isArray(row.palabras_clave)) keywords = row.palabras_clave;
    else if (Array.isArray(row.keywords)) keywords = row.keywords;
    else if (typeof row.palabras_clave === 'string') keywords = row.palabras_clave.split(',').map(k => k.trim()).filter(Boolean);
    else if (typeof row.keywords === 'string') keywords = row.keywords.split(',').map(k => k.trim()).filter(Boolean);

    const subjectId = row.subject_id || row.subjectId || subject.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');

    return {
      id: row.id !== undefined && row.id !== null ? String(row.id) : `supa-${Math.random().toString(36).substr(2, 9)}`,
      isSupabase: true,
      title,
      subject,
      subjectId,
      author,
      publishDate,
      lastUpdate: publishDate,
      docType: category,
      level: row.nivel || row.level || 'Aporte Académico',
      description,
      keywords,
      source,
      verificationStatus: status,
      isVerified: status === 'Material verificado' || status === 'Verificado',
      fileSize: row.tamano || row.file_size || row.fileSize || 'PDF',
      fileType: 'PDF',
      downloadUrl: url,
      officialUrl: url,
      fileBlobData: null,
      fileName: row.archivo_nombre || row.file_name || `${title}.pdf`,
      studentSubmitter: row.estudiante || row.student_submitter || author,
      featured: Boolean(row.destacado || row.featured)
    };
  }

  /* ==========================================================================
     CONSULTA DE DOCUMENTOS (SOLO SUPABASE)
     ========================================================================== */

  /**
   * Obtiene la lista completa de documentos EXCLUSIVAMENTE desde la tabla
   * 'documentos' de Supabase. No mezcla datos locales ni estáticos.
   */
  async getAllDocuments() {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      console.warn('Supabase no disponible. No se pueden cargar documentos.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_DOCUMENTS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error consultando tabla documentos en Supabase:', error.message);
        return [];
      }

      return Array.isArray(data) ? data.map(row => this.mapSupabaseDoc(row)) : [];
    } catch (err) {
      console.warn('Fallo al conectar con Supabase para listar documentos:', err);
      return [];
    }
  }

  /**
   * Obtener documento por ID (Supabase)
   */
  async getDocumentById(id) {
    const all = await this.getAllDocuments();
    return all.find(d => String(d.id) === String(id)) || null;
  }

  /* ==========================================================================
     AGREGAR DOCUMENTO (SUBE PDF A STORAGE Y GUARDA EN TABLA 'DOCUMENTOS')
     ========================================================================== */
  async addDocument(documentData, file = null) {
    await this.initPromise;
    const supabase = getSupabase();

    let publicUrl = documentData.downloadUrl || '#';
    let uploadedFileName = file ? file.name : (documentData.fileName || 'documento.pdf');
    let fileSizeStr = file ? this.formatBytes(file.size) : (documentData.fileSize || 'N/A');

    // 1. Subida a Supabase Storage
    if (file && supabase) {
      try {
        const uploadResult = await this.uploadPdfToStorage(file);
        publicUrl = uploadResult.publicUrl;
      } catch (uploadErr) {
        console.error('Error al subir a Supabase Storage:', uploadErr);
        throw new Error(`Error en el almacenamiento de Supabase: ${uploadErr.message || 'Verifica que el bucket "documentos-pdf" exista y sea público.'}`);
      }
    }

    const docType = documentData.docType || 'PDF Compartido por Administrador';
    const status = documentData.verificationStatus || 'Material verificado';

    // 2. Inserción en la tabla 'documentos' de Supabase
    let supabaseRecord = null;
    if (supabase) {
      const payload = {
        titulo: documentData.title,
        materia: documentData.subject,
        categoria: docType,
        url: publicUrl,
        autor: documentData.author,
        descripcion: documentData.description || '',
        fuente: documentData.source || 'Facultad de Derecho',
        estado: status
      };

      try {
        const { data, error } = await supabase
          .from(TABLE_DOCUMENTS)
          .insert([payload])
          .select();

        if (error) {
          console.warn('Aviso: Inserción en tabla Supabase devolvió error:', error.message);
        } else if (data && data[0]) {
          supabaseRecord = data[0];
          console.log('Registro guardado exitosamente en tabla Supabase documentos:', supabaseRecord);
        }
      } catch (dbErr) {
        console.warn('Error al insertar registro en Supabase:', dbErr);
      }
    }

    // 3. Crear documento formateado
    const newDoc = supabaseRecord ? this.mapSupabaseDoc(supabaseRecord) : {
      id: documentData.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: documentData.title || 'Documento sin título',
      subject: documentData.subject || 'Otras materias',
      subjectId: documentData.subjectId || 'otras',
      author: documentData.author || 'Anónimo',
      publishDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      docType: docType,
      level: documentData.level || 'Estudiantil / Académico',
      description: documentData.description || '',
      keywords: Array.isArray(documentData.keywords) 
        ? documentData.keywords 
        : (documentData.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      source: documentData.source || 'Aporte Universitario',
      verificationStatus: status,
      isVerified: status === 'Material verificado',
      fileSize: fileSizeStr,
      fileType: 'PDF',
      downloadUrl: publicUrl,
      officialUrl: publicUrl,
      fileBlobData: documentData.fileBlobData || null,
      fileName: uploadedFileName,
      studentSubmitter: documentData.studentSubmitter || null,
      studentEmail: documentData.studentEmail || null,
      featured: Boolean(documentData.featured)
    };

    // 4. Respaldar en almacenamiento local
    await this.saveLocalDoc(newDoc);

    return newDoc;
  }

  async saveLocalDoc(doc) {
    if (this.useLocalStorage) {
      const docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      docs.unshift(doc);
      localStorage.setItem('bju_documents', JSON.stringify(docs));
      return doc;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('documents', 'readwrite');
        const store = tx.objectStore('documents');
        store.put(doc);
        tx.oncomplete = () => resolve(doc);
        tx.onerror = () => resolve(doc);
      } catch (e) {
        resolve(doc);
      }
    });
  }

  /* ==========================================================================
     ACTUALIZAR Y ELIMINAR DOCUMENTOS
     ========================================================================== */
  async updateDocument(id, updates) {
    await this.initPromise;
    const supabase = getSupabase();

    // Si es un registro de Supabase (numérico o ID UUID/alfanumérico)
    if (supabase) {
      try {
        const payload = {};
        if (updates.title) payload.titulo = updates.title;
        if (updates.subject) payload.materia = updates.subject;
        if (updates.docType) payload.categoria = updates.docType;
        if (updates.author) payload.autor = updates.author;
        if (updates.description) payload.descripcion = updates.description;
        if (updates.source) payload.fuente = updates.source;
        if (updates.verificationStatus) payload.estado = updates.verificationStatus;
        if (updates.downloadUrl) payload.url = updates.downloadUrl;

        if (Object.keys(payload).length > 0) {
          await supabase
            .from(TABLE_DOCUMENTS)
            .update(payload)
            .eq('id', id);
        }
      } catch (err) {
        console.warn('Error actualizando en Supabase:', err);
      }
    }

    // Actualizar copia local
    const currentDoc = await this.getDocumentById(id);
    if (!currentDoc) return null;

    const updatedDoc = {
      ...currentDoc,
      ...updates,
      lastUpdate: new Date().toISOString().split('T')[0],
      isVerified: (updates.verificationStatus === 'Material verificado' || 
                   (currentDoc.verificationStatus === 'Material verificado' && updates.verificationStatus === undefined))
    };

    await this.saveLocalDoc(updatedDoc);
    return updatedDoc;
  }

  async deleteDocument(id) {
    await this.initPromise;
    const supabase = getSupabase();

    if (supabase) {
      try {
        await supabase
          .from(TABLE_DOCUMENTS)
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Error eliminando en Supabase:', err);
      }
    }

    // Eliminar de copia local
    if (this.useLocalStorage) {
      let docs = JSON.parse(localStorage.getItem('bju_documents') || '[]');
      docs = docs.filter(d => String(d.id) !== String(id));
      localStorage.setItem('bju_documents', JSON.stringify(docs));
      return true;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('documents', 'readwrite');
        const store = tx.objectStore('documents');
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(true);
      } catch (e) {
        resolve(true);
      }
    });
  }

  /* ==========================================================================
     MATERIAS / CATEGORÍAS JURÍDICAS (SOLO SUPABASE)
     ========================================================================== */

  /**
   * Obtiene la lista de materias EXCLUSIVAMENTE desde la tabla 'materias' de Supabase.
   * Los conteos de documentos se calculan dinámicamente.
   * Si la tabla no existe en Supabase, devuelve array vacío.
   */
  async getAllSubjects() {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      console.warn('Supabase no disponible. No se pueden cargar materias.');
      return [];
    }

    let subjects = [];
    try {
      const { data, error } = await supabase
        .from(TABLE_SUBJECTS)
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error consultando tabla materias en Supabase:', error.message);
        return [];
      }

      subjects = Array.isArray(data) ? data.map(row => ({
        id:   row.id   || row.slug || String(row.id),
        name: row.name || row.nombre || 'Sin nombre',
        icon: row.icon || row.icono || 'book-open',
        desc: row.desc || row.descripcion || '',
        count: 0
      })) : [];
    } catch (err) {
      console.warn('Fallo al conectar con Supabase para listar materias:', err);
      return [];
    }

    // Calcular conteo dinámico de documentos desde Supabase
    const allDocs = await this.getAllDocuments();
    return subjects.map(sub => {
      const count = allDocs.filter(d =>
        (d.subjectId === sub.id ||
         (d.subject && d.subject.toLowerCase() === sub.name.toLowerCase())) &&
        d.verificationStatus !== 'Rechazado'
      ).length;
      return { ...sub, count };
    });
  }

  async addSubject(subjectData) {
    await this.initPromise;
    const supabase = getSupabase();

    const sub = {
      id:   subjectData.id   || subjectData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_'),
      name: subjectData.name,
      icon: subjectData.icon || 'book-open',
      desc: subjectData.desc || 'Documentos y doctrina de la materia.',
      count: 0
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(TABLE_SUBJECTS)
          .insert([{ id: sub.id, name: sub.name, icon: sub.icon, desc: sub.desc }])
          .select();

        if (error) {
          console.warn('Error al insertar materia en Supabase:', error.message);
        } else if (data && data[0]) {
          return { ...sub, ...data[0] };
        }
      } catch (err) {
        console.warn('Error al guardar materia en Supabase:', err);
      }
    }

    return sub;
  }

  async deleteSubject(id) {
    await this.initPromise;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase
          .from(TABLE_SUBJECTS)
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Error al eliminar materia en Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Error al eliminar materia en Supabase:', err);
      }
    }

    return true;
  }

  /* ==========================================================================
     ESTADÍSTICAS Y UTILIDADES
     ========================================================================== */
  async getStats() {
    const docs = await this.getAllDocuments();
    const subjects = await this.getAllSubjects();
    return {
      totalDocs: docs.length,
      verifiedDocs: docs.filter(d => d.verificationStatus === 'Material verificado' || d.isVerified).length,
      approvedDocs: docs.filter(d => d.verificationStatus === 'Aprobado').length,
      pendingDocs: docs.filter(d => d.verificationStatus === 'Pendiente de revisión').length,
      rejectedDocs: docs.filter(d => d.verificationStatus === 'Rechazado').length,
      totalSubjects: subjects.length,
      studentUploads: docs.filter(d => d.docType.includes('Estudiante') || d.studentSubmitter || d.isSupabase).length
    };
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const db = new LegalDatabase();
