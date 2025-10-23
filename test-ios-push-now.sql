-- Testar notificação para iOS agora que o token existe

-- 1. Inserir nova notificação
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-ios',
    '📱 Teste iOS Push',
    'Esta notificação deve chegar no iPhone do Marcos!',
    ('{"type": "test-ios", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 2. Verificar se foi inserida
SELECT 
    id,
    title,
    body,
    sent,
    created_at
FROM push_notifications_queue
WHERE sent = false
ORDER BY created_at DESC
LIMIT 5;

-- PRÓXIMO PASSO: Ir para o Dashboard e clicar em "Send Request" novamente
-- Depois ver os Logs para confirmar que enviou para iOS
