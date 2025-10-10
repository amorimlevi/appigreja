-- Verificar políticas RLS criadas para escalas_louvor
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
WHERE tablename IN ('escalas_louvor', 'escalas_louvor_musicos')
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('escalas_louvor', 'escalas_louvor_musicos');
