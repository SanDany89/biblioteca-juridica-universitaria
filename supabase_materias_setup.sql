-- =============================================================================
-- SCRIPT DE CONFIGURACIÓN: Tabla 'materias' en Supabase
-- Biblioteca Jurídica Universitaria ICEP
--
-- INSTRUCCIONES:
--   1. Ir a https://supabase.com → tu proyecto → SQL Editor
--   2. Pegar este script completo y ejecutarlo (Run)
--   3. Una vez creada la tabla, la app cargará las materias desde Supabase
--      en tiempo real y todos los usuarios verán la misma lista.
-- =============================================================================

-- 1. Crear la tabla 'materias' si no existe
CREATE TABLE IF NOT EXISTS public.materias (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  name        TEXT,
  icono       TEXT DEFAULT 'book-open',
  icon        TEXT DEFAULT 'book-open',
  descripcion TEXT DEFAULT '',
  "desc"      TEXT DEFAULT ''
);

-- Si la tabla ya existía, asegurar que las columnas 'nombre' y 'name' existan
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='materias' AND column_name='nombre') THEN
    ALTER TABLE public.materias ADD COLUMN nombre TEXT;
    UPDATE public.materias SET nombre = name WHERE nombre IS NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='materias' AND column_name='name') THEN
    ALTER TABLE public.materias ADD COLUMN name TEXT;
    UPDATE public.materias SET name = nombre WHERE name IS NULL;
  END IF;
END $$;

-- 2. Habilitar Row Level Security (recomendado)
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;

-- 3. Política: cualquier usuario puede LEER materias (acceso público de lectura)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'materias'
      AND policyname = 'Lectura pública de materias'
  ) THEN
    EXECUTE '
      CREATE POLICY "Lectura pública de materias"
        ON public.materias
        FOR SELECT
        USING (true);
    ';
  END IF;
END $$;

-- 4. Política: solo usuarios autenticados (admins) pueden escribir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'materias'
      AND policyname = 'Solo admins pueden modificar materias'
  ) THEN
    EXECUTE '
      CREATE POLICY "Solo admins pueden modificar materias"
        ON public.materias
        FOR ALL
        USING (auth.role() = ''authenticated'')
        WITH CHECK (auth.role() = ''authenticated'');
    ';
  END IF;
END $$;

-- 5. Insertar las 13 materias jurídicas oficiales
--    (se usa ON CONFLICT DO NOTHING para evitar duplicados en re-ejecuciones)
INSERT INTO public.materias (id, nombre, name, icono, icon, descripcion, "desc") VALUES
  ('constitucional',  'Derecho Constitucional',  'Derecho Constitucional',  'scale',          'scale',          'Estructura del Estado, derechos fundamentales y garantías individuales.', 'Estructura del Estado, derechos fundamentales y garantías individuales.'),
  ('penal',           'Derecho Penal',            'Derecho Penal',            'shield-alert',   'shield-alert',   'Delitos, penas, medidas de seguridad y sistema acusatorio.', 'Delitos, penas, medidas de seguridad y sistema acusatorio.'),
  ('civil',           'Derecho Civil',            'Derecho Civil',            'users',          'users',          'Personas, familia, bienes, sucesiones, obligaciones y contratos.', 'Personas, familia, bienes, sucesiones, obligaciones y contratos.'),
  ('mercantil',       'Derecho Mercantil',        'Derecho Mercantil',        'briefcase',      'briefcase',      'Actos de comercio, sociedades mercantiles y títulos de crédito.', 'Actos de comercio, sociedades mercantiles y títulos de crédito.'),
  ('laboral',         'Derecho Laboral',          'Derecho Laboral',          'hammer',         'hammer',         'Relaciones individuales y colectivas de trabajo, seguridad social.', 'Relaciones individuales y colectivas de trabajo, seguridad social.'),
  ('administrativo',  'Derecho Administrativo',  'Derecho Administrativo',  'landmark',       'landmark',       'Organización de la administración pública y procedimiento administrativo.', 'Organización de la administración pública y procedimiento administrativo.'),
  ('procesal',        'Derecho Procesal',         'Derecho Procesal',         'file-text',      'file-text',      'Teoría general del proceso, juicio oral y derecho procesal civil y penal.', 'Teoría general del proceso, juicio oral y derecho procesal civil y penal.'),
  ('internacional',   'Derecho Internacional',   'Derecho Internacional',   'globe',          'globe',          'Derecho internacional público, privado y tratados internacionales.', 'Derecho internacional público, privado y tratados internacionales.'),
  ('fiscal',          'Derecho Fiscal',           'Derecho Fiscal',           'calculator',     'calculator',     'Contribuciones, Código Fiscal de la Federación y defensa fiscal.', 'Contribuciones, Código Fiscal de la Federación y defensa fiscal.'),
  ('derechos_humanos','Derechos Humanos',         'Derechos Humanos',         'heart-handshake','heart-handshake','Sistemas universal e interamericano de protección a derechos humanos.', 'Sistemas universal e interamericano de protección a derechos humanos.'),
  ('teoria_derecho',  'Teoría del Derecho',       'Derecho Teoría',           'book-open',      'book-open',      'Filosofía jurídica, epistemología, lógica y argumentación jurídica.', 'Filosofía jurídica, epistemología, lógica y argumentación jurídica.'),
  ('historia_derecho','Historia del Derecho',     'Historia del Derecho',     'hourglass',      'hourglass',      'Evolución histórica de las instituciones jurídicas en México.', 'Evolución histórica de las instituciones jurídicas en México.'),
  ('otras',           'Otras materias',           'Otras materias',           'folder-plus',    'folder-plus',    'Derecho ambiental, agrario, bancario, electoral y nuevas ramas.', 'Derecho ambiental, agrario, bancario, electoral y nuevas ramas.')
ON CONFLICT (id) DO NOTHING;

-- 6. Habilitar Supabase Realtime para las tablas 'documentos' y 'materias'
ALTER TABLE public.materias REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- Agregar 'materias' a la publicación de realtime si no está agregada
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.materias;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  -- Agregar 'documentos' a la publicación de realtime si no está agregada
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documentos;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 7. Verificar resultado
SELECT id, name FROM public.materias ORDER BY name;
