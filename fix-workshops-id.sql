-- Opção 1: Converter id para UUID (recomendado)
-- Primeiro, remover a foreign key da tabela workshop_registrations
ALTER TABLE workshop_registrations 
  DROP CONSTRAINT IF EXISTS workshop_registrations_workshop_id_fkey;

-- Converter id para UUID em ambas as tabelas
ALTER TABLE workshops 
  DROP CONSTRAINT IF EXISTS workshops_pkey,
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ADD PRIMARY KEY (id);

ALTER TABLE workshop_registrations
  ALTER COLUMN workshop_id TYPE UUID USING gen_random_uuid();

-- Recriar a foreign key
ALTER TABLE workshop_registrations 
  ADD CONSTRAINT workshop_registrations_workshop_id_fkey 
  FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE;

-- Opção 2: Usar SERIAL para auto-increment (se preferir manter integer)
-- ALTER TABLE workshops 
--   DROP CONSTRAINT IF EXISTS workshops_pkey,
--   ALTER COLUMN id DROP DEFAULT;
-- 
-- CREATE SEQUENCE IF NOT EXISTS workshops_id_seq;
-- ALTER TABLE workshops 
--   ALTER COLUMN id SET DEFAULT nextval('workshops_id_seq'),
--   ADD PRIMARY KEY (id);
-- 
-- SELECT setval('workshops_id_seq', COALESCE((SELECT MAX(id) FROM workshops), 0) + 1, false);
