-- Verificar se o trigger de avisos está ativo e funcionando

-- 1. Verificar se o trigger existe e está habilitado
SELECT 
    trigger_name,
    event_object_table as tabela,
    action_statement as funcao,
    action_timing as quando,
    event_manipulation as evento,
    action_orientation as tipo,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ ATIVO'
        ELSE '❌ NÃO ENCONTRADO'
    END as status
FROM information_schema.triggers
WHERE event_object_table = 'avisos'
ORDER BY trigger_name;

-- 2. Verificar se a função notify_new_aviso existe
SELECT 
    routine_name as funcao,
    routine_type as tipo,
    data_type as retorno,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM information_schema.routines
WHERE routine_name LIKE '%notify_new_aviso%'
ORDER BY routine_name;

-- 3. Ver o código da função notify_new_aviso
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname LIKE '%notify_new_aviso%';

-- 4. Ver últimos avisos criados
SELECT 
    id,
    titulo,
    descricao,
    igreja_id,
    created_at,
    AGE(NOW(), created_at) as tempo_desde_criacao
FROM avisos
ORDER BY created_at DESC
LIMIT 5;

-- 5. Testar trigger manualmente
-- Inserir um aviso de teste para ver se o trigger dispara
-- INSERT INTO avisos (titulo, descricao, igreja_id)
-- VALUES ('[TESTE TRIGGER]', 'Verificando se o trigger está funcionando', 1);

-- 6. Verificar se há avisos na fila de notificações
SELECT 
    pnq.id,
    pnq.title,
    pnq.body,
    pnq.sent,
    pnq.created_at,
    AGE(NOW(), pnq.created_at) as tempo_desde_criacao
FROM push_notifications_queue pnq
ORDER BY pnq.created_at DESC
LIMIT 10;
