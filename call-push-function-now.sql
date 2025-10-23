-- Chamar a Edge Function AGORA para processar as notificações pendentes

-- 1. Verificar se há tokens Android registrados
SELECT COUNT(*) as total_tokens_android 
FROM device_tokens 
WHERE platform = 'android';

-- 2. Chamar a função manualmente
SELECT net.http_post(
    url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
    ),
    body := '{}'::jsonb
) as request_id;

-- 3. AGUARDE 15 SEGUNDOS e então execute este comando:
SELECT 
    id,
    type,
    title,
    body,
    sent,
    sent_at,
    created_at,
    CASE 
        WHEN sent THEN 'Enviada ✅'
        ELSE 'Pendente ⏳'
    END as status
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 10;
