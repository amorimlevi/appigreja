-- Diagnosticar por que o trigger não dispara quando aviso é criado

-- 1. Verificar se o trigger existe e está habilitado
SELECT 
    tgname as trigger_name,
    tgenabled as habilitado,
    CASE tgenabled
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESABILITADO'
        WHEN 'R' THEN '⚠️ APENAS REPLICA'
        WHEN 'A' THEN '⚠️ APENAS ALWAYS'
        ELSE '❓ DESCONHECIDO'
    END as status
FROM pg_trigger
WHERE tgname LIKE '%aviso%'
ORDER BY tgname;

-- 2. Verificar triggers na tabela avisos especificamente
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status_code,
    p.proname as function_name,
    CASE 
        WHEN t.tgtype & 2 > 0 THEN 'BEFORE'
        WHEN t.tgtype & 64 > 0 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN t.tgtype & 4 > 0 THEN 'INSERT'
        WHEN t.tgtype & 8 > 0 THEN 'DELETE'
        WHEN t.tgtype & 16 > 0 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END as event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'avisos'
ORDER BY t.tgname;

-- 3. Ver últimos avisos criados (para confirmar que estão sendo inseridos)
SELECT 
    id,
    titulo,
    descricao,
    igreja_id,
    created_at,
    updated_at
FROM avisos
ORDER BY created_at DESC
LIMIT 5;

-- 4. Ver se há notificações na fila correspondentes aos avisos
SELECT 
    a.id as aviso_id,
    a.titulo as aviso_titulo,
    a.created_at as aviso_criado_em,
    pnq.id as notificacao_id,
    pnq.title as notificacao_titulo,
    pnq.sent as foi_enviada,
    pnq.created_at as notificacao_criada_em
FROM avisos a
LEFT JOIN push_notifications_queue pnq ON pnq.created_at >= a.created_at - INTERVAL '5 seconds'
    AND pnq.created_at <= a.created_at + INTERVAL '5 seconds'
WHERE a.created_at > NOW() - INTERVAL '1 hour'
ORDER BY a.created_at DESC;

-- 5. Verificar se a função do trigger existe e está correta
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname LIKE '%notify_new_aviso%';

-- 6. Verificar logs de erro (se disponível)
-- SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction (aborted)';

-- 7. TESTE MANUAL: Inserir aviso e verificar se trigger dispara
-- Descomente para testar:
/*
BEGIN;
INSERT INTO avisos (titulo, descricao, igreja_id)
VALUES ('[TESTE TRIGGER]', 'Este é um teste para verificar se o trigger está funcionando. Deve gerar log!', 1)
RETURNING id, titulo, created_at;

-- Aguarde 2 segundos e verifique se apareceu na fila:
SELECT * FROM push_notifications_queue 
WHERE title LIKE '%TESTE TRIGGER%' 
ORDER BY created_at DESC 
LIMIT 1;

ROLLBACK; -- Desfaz o teste
*/
