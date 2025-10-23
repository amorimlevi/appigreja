-- Verificar se as notificações foram enviadas após o deploy

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
LIMIT 15;
