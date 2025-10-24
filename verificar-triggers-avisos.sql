-- Verificar todos os triggers na tabela avisos
SELECT 
    trigger_name,
    event_manipulation as evento,
    action_statement as acao
FROM information_schema.triggers
WHERE event_object_table = 'avisos'
ORDER BY trigger_name;

-- Ver as funções que esses triggers chamam
SELECT 
    proname as nome_funcao,
    prosrc as codigo_funcao
FROM pg_proc
WHERE proname LIKE '%aviso%' OR proname LIKE '%notif%'
ORDER BY proname;
