/**
 * db.js - Motor de Base de Datos en Nube con Supabase
 * Fuente ÚNICA de verdad: todas las materias y documentos se leen y escriben
 * directamente en las tablas 'materias' y 'documentos' de Supabase en tiempo real.
 * No se usan arrays estáticos, localStorage ni IndexedDB como fuentes de datos.
 */

import { getSupabase, STORAGE_BUCKET, TABLE_DOCUMENTS, TABLE_SUBJECTS } from './supabase-config.js';

class LegalDatabase {
  constructor() {
    this.isReady = false;
    this.realtimeChannel = null;
    this.initPromise = this.init();
  }

  async init() {
    // Limpiar cualquier residuo estático obsoleto del localStorage e IndexedDB
    this.clearStaleLocalData();
    this.isReady = true;
    return this;
  }

  /**
   * Limpia del localStorage y de IndexedDB todos los datos estáticos de materias
   * y documentos sembrados en versiones anteriores, para forzar la lectura desde Supabase.
   */
  clearStaleLocalData() {
    const staleKeys = [
      'bju_documents',
      'bju_subjects',
      'bju_db_seeded'
    ];
    staleKeys.forEach(key => {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Ignorar en entornos restrictivos
      }
    });

    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const req = indexedDB.deleteDatabase('BibliotecaJuridicaUniversitariaDB');
        req.onerror = () => {};
        req.onsuccess = () => {};
      } catch (e) {
        // Ignorar
      }
    }
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

    console.log(`[Supabase Storage] Subiendo PDF a bucket '${STORAGE_BUCKET}': ${filePath}`);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      });

    if (error) {
      console.error('[Supabase Storage] Error al subir archivo:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl || '';
    console.log('[Supabase Storage] PDF subido con éxito. URL Pública:', publicUrl);

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
     CONSULTA DE DOCUMENTOS (EXCLUSIVAMENTE SUPABASE)
     ========================================================================== */

  /**
   * Obtiene la lista completa de documentos EXCLUSIVAMENTE desde la tabla
   * 'documentos' de Supabase.
   */
  async getAllDocuments() {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      console.warn('[Supabase DB] Supabase no disponible. No se pueden cargar documentos.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_DOCUMENTS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase DB] Error consultando tabla documentos:', error.message);
        return [];
      }

      return Array.isArray(data) ? data.map(row => this.mapSupabaseDoc(row)) : [];
    } catch (err) {
      console.warn('[Supabase DB] Fallo al conectar con Supabase para listar documentos:', err);
      return [];
    }
  }

  /**
   * Obtener documento por ID EXCLUSIVAMENTE desde Supabase
   */
  async getDocumentById(id) {
    await this.initPromise;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from(TABLE_DOCUMENTS)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        // Si no se encuentra por select directo, buscar en lista general
        const all = await this.getAllDocuments();
        return all.find(d => String(d.id) === String(id)) || null;
      }

      return data ? this.mapSupabaseDoc(data) : null;
    } catch (err) {
      const all = await this.getAllDocuments();
      return all.find(d => String(d.id) === String(id)) || null;
    }
  }

  /* ==========================================================================
     AGREGAR DOCUMENTO (SUBE PDF A STORAGE Y GUARDA EN TABLA 'DOCUMENTOS')
     ========================================================================== */
  async addDocument(documentData, file = null) {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('No hay conexión con Supabase. Verifica tu red.');
    }

    let publicUrl = documentData.downloadUrl || '#';
    let uploadedFileName = file ? file.name : (documentData.fileName || 'documento.pdf');
    let fileSizeStr = file ? this.formatBytes(file.size) : (documentData.fileSize || 'N/A');

    // 1. Subida a Supabase Storage
    if (file) {
      try {
        const uploadResult = await this.uploadPdfToStorage(file);
        publicUrl = uploadResult.publicUrl;
      } catch (uploadErr) {
        console.error('[Supabase Storage] Error al subir PDF:', uploadErr);
        throw new Error(`Error en el almacenamiento de Supabase: ${uploadErr.message || 'Verifica que el bucket "documentos-pdf" exista y sea público.'}`);
      }
    }

    const docType = documentData.docType || 'PDF Compartido por Administrador';
    const status = documentData.verificationStatus || 'Material verificado';

    // 2. Inserción en la tabla 'documentos' de Supabase
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

    const { data, error } = await supabase
      .from(TABLE_DOCUMENTS)
      .insert([payload])
      .select();

    if (error) {
      console.error('[Supabase DB] Error al insertar documento en Supabase:', error.message);
      throw new Error(`Error al registrar documento en Supabase: ${error.message}`);
    }

    const savedRecord = data && data[0] ? data[0] : payload;
    return this.mapSupabaseDoc(savedRecord);
  }

  /* ==========================================================================
     ACTUALIZAR Y ELIMINAR DOCUMENTOS EN SUPABASE
     ========================================================================== */
  async updateDocument(id, updates) {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('Supabase no disponible para actualizar');
    }

    const payload = {};
    if (updates.title !== undefined) payload.titulo = updates.title;
    if (updates.subject !== undefined) payload.materia = updates.subject;
    if (updates.docType !== undefined) payload.categoria = updates.docType;
    if (updates.author !== undefined) payload.autor = updates.author;
    if (updates.description !== undefined) payload.descripcion = updates.description;
    if (updates.source !== undefined) payload.fuente = updates.source;
    if (updates.verificationStatus !== undefined) payload.estado = updates.verificationStatus;
    if (updates.downloadUrl !== undefined) payload.url = updates.downloadUrl;

    if (Object.keys(payload).length > 0) {
      const { data, error } = await supabase
        .from(TABLE_DOCUMENTS)
        .update(payload)
        .eq('id', id)
        .select();

      if (error) {
        console.error('[Supabase DB] Error actualizando documento en Supabase:', error);
        throw error;
      }

      return data && data[0] ? this.mapSupabaseDoc(data[0]) : null;
    }

    return await this.getDocumentById(id);
  }

  async deleteDocument(id) {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('Supabase no disponible para eliminar');
    }

    const { error } = await supabase
      .from(TABLE_DOCUMENTS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Error eliminando documento en Supabase:', error);
      throw error;
    }

    return true;
  }

  /* ==========================================================================
     MATERIAS / CATEGORÍAS JURÍDICAS (EXCLUSIVAMENTE SUPABASE)
     ========================================================================== */

  /**
   * Obtiene la lista de materias EXCLUSIVAMENTE desde la tabla 'materias' de Supabase
   * ordenada por 'nombre' ascendentemente.
   * Los conteos de documentos asociados se calculan dinámicamente.
   */
  async getAllSubjects() {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      console.warn('[Supabase DB] Supabase no disponible. No se pueden cargar materias.');
      return [];
    }

    let subjects = [];
    try {
      // 1. Consultar directamente la tabla 'materias' ordenada por 'nombre'
      let { data, error } = await supabase
        .from(TABLE_SUBJECTS)
        .select('*')
        .order('nombre', { ascending: true });

      // Compatibilidad si la tabla usa la columna 'name'
      if (error && error.message && (error.message.includes('nombre') || error.message.includes('column'))) {
        const retry = await supabase
          .from(TABLE_SUBJECTS)
          .select('*')
          .order('name', { ascending: true });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.warn('[Supabase DB] Error consultando tabla materias en Supabase:', error.message);
        return [];
      }

      subjects = Array.isArray(data) ? data.map(row => {
        const nom = row.nombre || row.name || 'Sin nombre';
        const id = row.id !== undefined && row.id !== null 
          ? String(row.id) 
          : (row.slug || nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_'));
        return {
          id: id,
          name: nom,
          nombre: nom,
          icon: row.icono || row.icon || 'book-open',
          desc: row.descripcion || row.desc || '',
          count: 0
        };
      }) : [];
    } catch (err) {
      console.warn('[Supabase DB] Fallo al conectar con Supabase para listar materias:', err);
      return [];
    }

    // Calcular conteo dinámico de documentos desde Supabase
    const allDocs = await this.getAllDocuments();
    const normalize = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    return subjects.map(sub => {
      const subIdNorm = normalize(sub.id);
      const subNameNorm = normalize(sub.name || sub.nombre);

      const count = allDocs.filter(d => {
        if (d.verificationStatus === 'Rechazado') return false;
        const docSubIdNorm = normalize(d.subjectId);
        const docSubNorm = normalize(d.subject);

        return (
          docSubIdNorm === subIdNorm ||
          docSubNorm === subNameNorm ||
          (subIdNorm && docSubNorm.includes(subIdNorm)) ||
          (subNameNorm && (docSubNorm.includes(subNameNorm) || subNameNorm.includes(docSubNorm)))
        );
      }).length;

      return { ...sub, count };
    });
  }

  /**
   * Inserta una nueva materia en Supabase en la tabla 'materias'.
   * Usa: await supabase.from('materias').insert([{ nombre: valorDelInput }]);
   */
  async addSubject(subjectData) {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      const errorMsg = 'No hay conexión con Supabase. Verifica tu red.';
      console.error('Error al insertar materia:', errorMsg);
      alert('No se pudo agregar la materia: ' + errorMsg);
      return null;
    }

    const rawName = typeof subjectData === 'string' ? subjectData : (subjectData.nombre || subjectData.name || '');
    const nombreLimpio = rawName.trim();

    if (!nombreLimpio) {
      const errorMsg = 'El nombre de la materia no puede estar vacío.';
      console.error('Error al insertar materia:', errorMsg);
      alert('No se pudo agregar la materia: ' + errorMsg);
      return null;
    }

    try {
      // Inserción asíncrona en Supabase
      const { data, error } = await supabase
        .from('materias')
        .insert([{ nombre: nombreLimpio }])
        .select();

      if (error) {
        console.error('Error al insertar materia en Supabase:', error);
        alert('No se pudo agregar la materia: ' + (error.message || error.details || 'Error desconocido'));
        return null;
      }

      console.log('✅ Materia agregada con éxito en Supabase:', nombreLimpio);
      return data && data[0] ? data[0] : { nombre: nombreLimpio };
    } catch (err) {
      console.error('Excepción al insertar materia en Supabase:', err);
      alert('Error al agregar materia: ' + (err.message || err));
      return null;
    }
  }

  /**
   * Elimina una materia de la tabla 'materias' en Supabase por su ID.
   * Usa: await supabase.from('materias').delete().eq('id', materiaId);
   */
  async deleteSubject(id) {
    await this.initPromise;
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('No hay conexión con Supabase. Verifica tu conexión a internet.');
    }

    try {
      const { error } = await supabase
        .from('materias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Supabase DB] Error al eliminar materia en Supabase:', error);
        throw new Error(error.message || error.details || 'No se pudo eliminar la materia de Supabase.');
      }

      console.log(`✅ Materia con ID "${id}" eliminada exitosamente de Supabase.`);
      return true;
    } catch (err) {
      console.error('[Supabase DB] Excepción al eliminar materia:', err);
      throw err;
    }
  }

  /* ==========================================================================
     SUPABASE REALTIME: ESCUCHA DE CAMBIOS EN VIVO ('schema-db-changes')
     ========================================================================== */

  /**
   * Activa Supabase Realtime usando supabase.channel('schema-db-changes')
   * para escuchar los eventos 'INSERT', 'UPDATE' y 'DELETE' en las tablas
   * 'documentos' y 'materias'.
   * @param {Function} onRealtimeChange Callback que se ejecuta ante cualquier cambio
   * @returns {RealtimeChannel|null}
   */
  subscribeToRealtime(onRealtimeChange) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[Realtime] Supabase no disponible para canal Realtime.');
      return null;
    }

    // Si ya existe un canal previo, limpiarlo para evitar oyentes duplicados
    if (this.realtimeChannel) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch (e) {
        console.warn('[Realtime] Error al remover canal previo:', e);
      }
    }

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escucha INSERT, UPDATE, DELETE
          schema: 'public',
          table: TABLE_DOCUMENTS // 'documentos'
        },
        (payload) => {
          console.log(`📡 [Realtime] Cambio detectado en tabla '${TABLE_DOCUMENTS}': ${payload.eventType}`, payload);
          if (typeof onRealtimeChange === 'function') {
            onRealtimeChange({ table: TABLE_DOCUMENTS, eventType: payload.eventType, payload });
          }
          window.dispatchEvent(new CustomEvent('databaseChanged', {
            detail: { table: TABLE_DOCUMENTS, eventType: payload.eventType, payload }
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Escucha INSERT, UPDATE, DELETE
          schema: 'public',
          table: TABLE_SUBJECTS // 'materias'
        },
        (payload) => {
          console.log(`📡 [Realtime] Cambio detectado en tabla '${TABLE_SUBJECTS}': ${payload.eventType}`, payload);
          if (typeof onRealtimeChange === 'function') {
            onRealtimeChange({ table: TABLE_SUBJECTS, eventType: payload.eventType, payload });
          }
          window.dispatchEvent(new CustomEvent('databaseChanged', {
            detail: { table: TABLE_SUBJECTS, eventType: payload.eventType, payload }
          }));
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 [Supabase Realtime] Canal "schema-db-changes" conectado y activo. Sincronización en vivo habilitada para "documentos" y "materias".');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ [Supabase Realtime] Error en canal "schema-db-changes":', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ [Supabase Realtime] Tiempo de espera agotado al conectar canal.');
        } else if (status === 'CLOSED') {
          console.log('⚪ [Supabase Realtime] Canal cerrado.');
        }
      });

    this.realtimeChannel = channel;
    return channel;
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

  async exportDatabaseJSON() {
    const docs = await this.getAllDocuments();
    const subjects = await this.getAllSubjects();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '2.0-supabase',
      subjects,
      documents: docs
    }, null, 2);
  }

  async importDatabaseJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase no disponible');

    if (Array.isArray(data.subjects)) {
      for (const sub of data.subjects) {
        await this.addSubject(sub);
      }
    }
    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        await this.addDocument(doc);
      }
    }
    return true;
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

