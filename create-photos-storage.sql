-- Criar tabela para metadados das fotos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    autor_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    categoria TEXT DEFAULT 'geral' CHECK (categoria IN ('evento', 'culto', 'kids', 'jovens', 'geral')),
    data_foto DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Política de leitura: todos podem ver
CREATE POLICY "Todos podem ver fotos"
    ON photos FOR SELECT
    TO authenticated
    USING (true);

-- Política de criação: todos autenticados podem criar (validação no app)
CREATE POLICY "Autenticados podem criar fotos"
    ON photos FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política de atualização: todos autenticados podem atualizar (validação no app)
CREATE POLICY "Autenticados podem atualizar fotos"
    ON photos FOR UPDATE
    TO authenticated
    USING (true);

-- Política de exclusão: todos autenticados podem deletar (validação no app)
CREATE POLICY "Autenticados podem deletar fotos"
    ON photos FOR DELETE
    TO authenticated
    USING (true);

-- Criar índices
CREATE INDEX idx_photos_categoria ON photos(categoria);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_photos_autor_id ON photos(autor_id);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- IMPORTANTE: Após executar este SQL, você precisa:
-- 1. Ir em Storage no painel do Supabase
-- 2. Criar um novo bucket chamado "church-photos"
-- 3. Configurar como público (ou privado com políticas de acesso)
-- 4. Adicionar políticas de Storage:

-- Storage Policies (executar após criar o bucket "church-photos"):
-- 
-- Política de leitura (todos podem ver):
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'church-photos');
-- 
-- Política de upload (apenas líderes):
-- CREATE POLICY "Leaders can upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'church-photos' AND
--   EXISTS (
--     SELECT 1 FROM members
--     WHERE members.id = auth.uid()
--     AND (
--       'pastor' = ANY(members.funcoes)
--       OR 'admin' = ANY(members.funcoes)
--       OR 'líder de louvor' = ANY(members.funcoes)
--       OR 'lider da diaconia' = ANY(members.funcoes)
--       OR 'lider kids' = ANY(members.funcoes)
--       OR 'lider jovens' = ANY(members.funcoes)
--     )
--   )
-- );
-- 
-- Política de delete (autor ou admin):
-- CREATE POLICY "Owner or admin can delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'church-photos' AND
--   (
--     auth.uid()::text = (storage.foldername(name))[1]
--     OR EXISTS (
--       SELECT 1 FROM members
--       WHERE members.id = auth.uid()
--       AND ('pastor' = ANY(members.funcoes) OR 'admin' = ANY(members.funcoes))
--     )
--   )
-- );
