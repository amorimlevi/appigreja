-- 1. Verificar TODOS os tokens (iOS e Android)
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    LEFT(dt.token, 30) || '...' as token_preview,
    LENGTH(dt.token) as token_length,
    m.nome,
    m.email,
    dt.created_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
ORDER BY dt.platform, dt.created_at DESC;

-- 2. Contar tokens por plataforma
SELECT 
    platform,
    COUNT(*) as total_tokens
FROM device_tokens
GROUP BY platform;

-- 3. Ver a última resposta HTTP da pg_net
SELECT 
    id,
    status_code,
    content::text as response,
    error_msg,
    created
FROM net._http_response
WHERE id = (SELECT MAX(id) FROM net._http_response)
ORDER BY created DESC;

-- 4. Testar inserção de nova notificação
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-final',
    '🔥 Teste Final Push Notifications',
    'Esta é uma notificação de teste para iOS e Android simultaneamente!',
    ('{"type": "test-final", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 5. Chamar a Edge Function (SINGULAR - sem S)
SELECT net.http_post(
    url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
    ),
    body := '{}'::jsonb
) as request_id;

-- 6. AGUARDE 15 SEGUNDOS e veja a resposta HTTP
SELECT 
    id,
    status_code,
    content::text as response,
    error_msg,
    created
FROM net._http_response
ORDER BY created DESC
LIMIT 3;
