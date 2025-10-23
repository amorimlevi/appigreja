-- Inserir notificação de teste AGORA

INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test',
    '🎉 Teste Push - iOS e Android',
    'Esta notificação deve chegar em todos os dispositivos!',
    '{"type": "test", "timestamp": "' || NOW()::text || '"}'::jsonb,
    false
);

-- Verificar se foi inserida
SELECT 
    id,
    type,
    title,
    body,
    sent,
    created_at
FROM push_notifications_queue
WHERE sent = false
ORDER BY created_at DESC;
