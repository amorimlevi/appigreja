-- Testar Webhook Automático de Push Notifications

-- 1. Inserir notificação de teste
-- O webhook deve disparar automaticamente!
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-webhook-auto',
    '🤖 Teste Automático',
    'Se você recebeu esta notificação, o webhook está funcionando!',
    ('{"type": "test-webhook", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 2. Aguardar 5 segundos
SELECT pg_sleep(5);

-- 3. Verificar se foi enviada automaticamente
SELECT 
    id,
    title,
    sent,
    sent_at,
    created_at,
    CASE 
        WHEN sent THEN '✅ ENVIADA AUTOMATICAMENTE'
        ELSE '❌ NÃO ENVIADA (webhook não funcionou)'
    END as status,
    CASE 
        WHEN sent THEN EXTRACT(EPOCH FROM (sent_at - created_at)) || ' segundos'
        ELSE 'N/A'
    END as tempo_para_enviar
FROM push_notifications_queue
WHERE type = 'test-webhook-auto'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Ver últimas 5 notificações
SELECT 
    id,
    type,
    title,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;
