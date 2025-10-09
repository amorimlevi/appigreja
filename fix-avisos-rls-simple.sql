-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins podem gerenciar avisos" ON avisos;
DROP POLICY IF EXISTS "Membros podem ver avisos" ON avisos;
DROP POLICY IF EXISTS "Todos podem ver avisos" ON avisos;

-- OPÇÃO 1: Desabilitar RLS completamente (mais simples)
ALTER TABLE avisos DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2 (comentada): Se quiser manter RLS mas permitir tudo
-- ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir tudo" ON avisos FOR ALL USING (true) WITH CHECK (true);
