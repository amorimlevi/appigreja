-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'avisos';

-- Verificar se a função de trigger existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%push%' OR routine_name LIKE '%notification%';

-- Ver o último aviso criado
SELECT * FROM avisos ORDER BY created_at DESC LIMIT 1;
