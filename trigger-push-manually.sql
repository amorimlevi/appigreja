-- Script para chamar manualmente a Edge Function de push notifications
-- usando pg_net (HTTP request do PostgreSQL)

-- 1. Primeiro, habilite a extensão pg_net (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Chamar a Edge Function manualmente
SELECT
  net.http_post(
    url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;

-- 3. Aguarde 10 segundos e depois verifique se foi enviado
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at,
    (sent_at - created_at) as tempo_processamento
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;
