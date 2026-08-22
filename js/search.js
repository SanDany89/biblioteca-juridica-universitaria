/**
 * search.js - Motor de Búsqueda y Filtrado Jurídico Multicriterio
 */

export class LegalSearchEngine {
  static filterDocuments(documents, filters = {}) {
    const {
      query = '',
      subjectId = 'all',
      docType = 'all',
      verificationStatus = 'all',
      level = 'all',
      sortBy = 'recent'
    } = filters;

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = documents.filter(doc => {
      // 1. Filtro de Texto (Nombre, Autor, Materia, Descripción, Palabras Clave, Fuente)
      if (normalizedQuery) {
        const titleMatch = (doc.title || '').toLowerCase().includes(normalizedQuery);
        const authorMatch = (doc.author || '').toLowerCase().includes(normalizedQuery);
        const subjectMatch = (doc.subject || '').toLowerCase().includes(normalizedQuery);
        const descMatch = (doc.description || '').toLowerCase().includes(normalizedQuery);
        const sourceMatch = (doc.source || '').toLowerCase().includes(normalizedQuery);
        const keywordsMatch = Array.isArray(doc.keywords) 
          ? doc.keywords.some(k => k.toLowerCase().includes(normalizedQuery))
          : (doc.keywords || '').toLowerCase().includes(normalizedQuery);
        const articlesMatch = Array.isArray(doc.summaryArticles)
          ? doc.summaryArticles.some(a => (a.title + ' ' + a.text + ' ' + a.num).toLowerCase().includes(normalizedQuery))
          : false;

        const matchesAny = titleMatch || authorMatch || subjectMatch || descMatch || sourceMatch || keywordsMatch || articlesMatch;
        if (!matchesAny) return false;
      }

      // 2. Filtro por Materia
      if (subjectId && subjectId !== 'all') {
        const normalize = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const targetSubNorm = normalize(subjectId);
        const docSubIdNorm = normalize(doc.subjectId);
        const docSubNorm = normalize(doc.subject);

        const matchesSubject = 
          docSubIdNorm === targetSubNorm ||
          docSubNorm === targetSubNorm ||
          (targetSubNorm && docSubNorm.includes(targetSubNorm)) ||
          (targetSubNorm && docSubIdNorm.includes(targetSubNorm));

        if (!matchesSubject) {
          return false;
        }
      }

      // 3. Filtro por Tipo de Documento
      if (docType && docType !== 'all') {
        if (!doc.docType.toLowerCase().includes(docType.toLowerCase())) {
          return false;
        }
      }

      // 4. Filtro por Estado de Verificación
      if (verificationStatus && verificationStatus !== 'all') {
        if (doc.verificationStatus !== verificationStatus) {
          return false;
        }
      }

      // 5. Filtro por Ámbito / Nivel (Local / Durango, Federal / Nacional, Internacional)
      if (level && level !== 'all') {
        const lvl = level.toLowerCase();
        const docLvl = (doc.level || '').toLowerCase();
        const docTitle = (doc.title || '').toLowerCase();
        const docSub = (doc.subject || '').toLowerCase();

        if (lvl === 'durango' || lvl === 'local') {
          const isDurango = docLvl.includes('durango') || docLvl.includes('local') || docLvl.includes('estatal') || docTitle.includes('durango');
          if (!isDurango) return false;
        } else if (lvl === 'federal' || lvl === 'nacional') {
          const isFederal = docLvl.includes('federal') || docLvl.includes('nacional') || docTitle.includes('cpeum') || docTitle.includes('general de') || docTitle.includes('código nacional');
          if (!isFederal) return false;
        } else if (lvl === 'internacional') {
          const isInternacional = docLvl.includes('internacional') || docLvl.includes('tratado') || docLvl.includes('convencion') || docTitle.includes('tratado') || docTitle.includes('convención') || docTitle.includes('declaración') || docTitle.includes('pacto') || docSub.includes('internacional') || doc.subjectId === 'internacional';
          if (!isInternacional) return false;
        }
      }

      return true;
    });

    // Ordenamiento
    return filtered.sort((a, b) => {
      if (sortBy === 'verified-first') {
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
      }
      if (sortBy === 'recent') {
        return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.publishDate || 0) - new Date(b.publishDate || 0);
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }
}
