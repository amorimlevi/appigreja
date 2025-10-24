-- Ver código completo da função notify_new_aviso
SELECT 
    proname as nome,
    pg_get_functiondef(oid) as definicao_completa
FROM pg_proc
WHERE proname = 'notify_new_aviso';
