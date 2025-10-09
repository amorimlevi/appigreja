-- Verificar políticas existentes na tabela avisos
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'avisos';

-- Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins podem gerenciar avisos" ON avisos;
DROP POLICY IF EXISTS "Membros podem ver avisos" ON avisos;
DROP POLICY IF EXISTS "Todos podem ver avisos" ON avisos;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

-- Criar política para admins fazerem tudo (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins podem gerenciar avisos"
    ON avisos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE user_id = auth.uid() 
            AND 'admin' = ANY(funcoes)
        )
    );

-- Criar política para todos os membros verem avisos (não precisa estar autenticado)
CREATE POLICY "Todos podem ver avisos"
    ON avisos
    FOR SELECT
    USING (true);
