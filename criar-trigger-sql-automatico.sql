-- Criar Trigger SQL Automático para Push Notifications
-- Use este script se Database Webhooks não estiver funcionando

-- 1. Verificar se pg_net está disponível
SELECT * FROM pg_available_extensions WHERE name = 'pg_net';

-- 2. Habilitar pg_net (se disponível)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Criar função que dispara a Edge Function
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    request_id bigint;
BEGIN
    -- Tentar chamar a Edge Function
    BEGIN
        SELECT net.http_post(
            url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
            ),
            body := '{}'::jsonb,
            timeout_milliseconds := 5000
        ) INTO request_id;
        
        RAISE LOG 'Push notification trigger called with request_id: %', request_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Failed to trigger push notification: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar o trigger
DROP TRIGGER IF EXISTS auto_send_push_notification ON push_notifications_queue;

CREATE TRIGGER auto_send_push_notification
    AFTER INSERT ON push_notifications_queue
    FOR EACH ROW
    WHEN (NEW.sent = false)
    EXECUTE FUNCTION trigger_push_notification();

-- 5. Adicionar comentário
COMMENT ON FUNCTION trigger_push_notification() IS 'Automatically calls Edge Function to send push notifications when a new notification is inserted';

-- 6. Testar o trigger
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-sql-trigger',
    '⚡ Teste SQL Trigger',
    'Se você recebeu esta notificação, o trigger SQL está funcionando!',
    ('{"type": "test-trigger", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 7. Aguardar 5 segundos
SELECT pg_sleep(5);

-- 8. Verificar se foi enviada
SELECT 
    id,
    type,
    title,
    sent,
    sent_at,
    created_at,
    CASE 
        WHEN sent THEN '✅ ENVIADA AUTOMATICAMENTE'
        ELSE '❌ NÃO ENVIADA'
    END as status,
    CASE 
        WHEN sent THEN EXTRACT(EPOCH FROM (sent_at - created_at)) || ' segundos'
        ELSE 'N/A'
    END as tempo_para_enviar
FROM push_notifications_queue
WHERE type = 'test-sql-trigger'
ORDER BY created_at DESC
LIMIT 1;
