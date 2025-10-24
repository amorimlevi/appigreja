-- 1. Verificar RLS policies na tabela avisos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'avisos'
ORDER BY cmd, policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'avisos';

-- 3. Buscar funções/RPCs customizadas relacionadas a avisos
SELECT 
    p.proname as nome_funcao,
    pg_get_function_arguments(p.oid) as argumentos,
    pg_get_functiondef(p.oid) as definicao_completa
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname ILIKE '%aviso%'
AND p.prokind = 'f' -- Apenas funções normais (não triggers)
ORDER BY p.proname;

-- 4. Verificar grants/permissões na tabela avisos
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'avisos'
ORDER BY grantee, privilege_type;
