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
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'book-open',
  desc TEXT DEFAULT ''
);

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
INSERT INTO public.materias (id, name, icon, desc) VALUES
  ('constitucional',  'Derecho Constitucional',  'scale',          'Estructura del Estado, derechos fundamentales y garantías individuales.'),
  ('penal',           'Derecho Penal',            'shield-alert',   'Delitos, penas, medidas de seguridad y sistema acusatorio.'),
  ('civil',           'Derecho Civil',            'users',          'Personas, familia, bienes, sucesiones, obligaciones y contratos.'),
  ('mercantil',       'Derecho Mercantil',        'briefcase',      'Actos de comercio, sociedades mercantiles y títulos de crédito.'),
  ('laboral',         'Derecho Laboral',          'hammer',         'Relaciones individuales y colectivas de trabajo, seguridad social.'),
  ('administrativo',  'Derecho Administrativo',  'landmark',       'Organización de la administración pública y procedimiento administrativo.'),
  ('procesal',        'Derecho Procesal',         'file-text',      'Teoría general del proceso, juicio oral y derecho procesal civil y penal.'),
  ('internacional',   'Derecho Internacional',   'globe',          'Derecho internacional público, privado y tratados internacionales.'),
  ('fiscal',          'Derecho Fiscal',           'calculator',     'Contribuciones, Código Fiscal de la Federación y defensa fiscal.'),
  ('derechos_humanos','Derechos Humanos',         'heart-handshake','Sistemas universal e interamericano de protección a derechos humanos.'),
  ('teoria_derecho',  'Teoría del Derecho',       'book-open',      'Filosofía jurídica, epistemología, lógica y argumentación jurídica.'),
  ('historia_derecho','Historia del Derecho',     'hourglass',      'Evolución histórica de las instituciones jurídicas en México.'),
  ('otras',           'Otras materias',           'folder-plus',    'Derecho ambiental, agrario, bancario, electoral y nuevas ramas.')
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar resultado
SELECT id, name FROM public.materias ORDER BY name;
