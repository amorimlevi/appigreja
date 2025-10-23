-- Diagnosticar por que Android parou de receber notificações

-- 1. Verificar se ainda existem tokens Android
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    LEFT(dt.token, 50) || '...' as token,
    m.nome,
    dt.created_at,
    dt.updated_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
ORDER BY dt.platform, dt.created_at DESC;

-- 2. Inserir nova notificação de teste
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-android-debug',
    '🔧 Debug Android',
    'Testando se Android voltou a funcionar',
    ('{"type": "test-debug", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 3. Ver últimas notificações (enviadas e pendentes)
SELECT 
    id,
    type,
    title,
    sent,
    sent_at,
    created_at,
    CASE 
        WHEN sent THEN '✅ ENVIADA'
        ELSE '⏳ PENDENTE'
    END as status
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 10;

-- PRÓXIMO PASSO: 
-- Ir ao Dashboard e clicar "Send Request"
-- Depois voltar aqui e verificar os logs
