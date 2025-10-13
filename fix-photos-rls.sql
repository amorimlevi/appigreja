-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem ver fotos" ON photos;
DROP POLICY IF EXISTS "Autenticados podem criar fotos" ON photos;
DROP POLICY IF EXISTS "Autenticados podem atualizar fotos" ON photos;
DROP POLICY IF EXISTS "Autenticados podem deletar fotos" ON photos;

-- Desabilitar RLS temporariamente para testes
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- OU se quiser manter RLS, use políticas simples:
-- ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Permitir tudo para autenticados"
-- ON photos
-- FOR ALL
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);
