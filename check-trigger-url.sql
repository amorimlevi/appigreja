-- Ver código completo das funções de trigger
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('notify_new_aviso', 'notify_new_evento', 'notify_new_escala')
ORDER BY routine_name;
