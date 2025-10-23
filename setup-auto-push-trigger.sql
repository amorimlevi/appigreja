-- Script para configurar trigger automático de notificações push
-- Este trigger chama a Edge Function automaticamente quando uma notificação é inserida

-- 1. Habilitar extensão pg_net (para fazer HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Criar função que chama a Edge Function
-- Nota: As credenciais estão hardcoded na função por segurança
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    request_id bigint;
BEGIN
    -- Chamar a Edge Function via pg_net
    SELECT INTO request_id net.http_post(
        url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
        ),
        body := '{}'::jsonb
    );
    
    RAISE LOG 'Push notification trigger called with request_id: %', request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger na tabela push_notifications_queue
DROP TRIGGER IF EXISTS auto_send_push_notification ON push_notifications_queue;
CREATE TRIGGER auto_send_push_notification
    AFTER INSERT ON push_notifications_queue
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_push_notification();

-- 5. Comentários
COMMENT ON FUNCTION trigger_push_notification() IS 'Chama automaticamente a Edge Function send-push-notifications quando uma nova notificação é inserida na fila';

-- 6. Testar o trigger manualmente
SELECT net.http_post(
    url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
    ),
    body := '{}'::jsonb
) as request_id;

-- 7. Aguarde 10 segundos e verifique se as notificações foram enviadas
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
WHERE sent = false
ORDER BY created_at DESC
LIMIT 10;
