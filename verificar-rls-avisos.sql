-- Query simplificada: Verificar RLS e políticas de avisos

-- 1. RLS está habilitado?
SELECT tablename, rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'avisos';

-- 2. Quantas políticas existem?
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'avisos';

-- 3. Listar políticas de INSERT
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'avisos' AND cmd = 'INSERT';

-- 4. Se não houver resultados acima, listar TODAS as políticas
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'avisos';
