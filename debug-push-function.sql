-- Debug: Verificar o que está impedindo as notificações de serem enviadas

-- 1. Verificar se há tokens Android válidos
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    dt.token,
    LENGTH(dt.token) as token_length,
    dt.created_at,
    m.nome,
    m.email
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
WHERE dt.platform = 'android'
ORDER BY dt.created_at DESC;

-- 2. Verificar a estrutura da tabela device_tokens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'device_tokens'
ORDER BY ordinal_position;

-- 3. Verificar se a Edge Function está configurada corretamente
-- Você precisa ir manualmente para: 
-- https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/functions/send-push-notifications
-- E verificar:
-- a) Se a função está deployada
-- b) Se o Secret FIREBASE_SERVICE_ACCOUNT existe
-- c) Ver os LOGS clicando em "Logs"

-- 4. Ver histórico de requests da pg_net
SELECT 
    id,
    status_code,
    content,
    error_msg,
    created
FROM net._http_response
ORDER BY created DESC
LIMIT 10;

-- 5. Verificar se pg_net está funcionando (teste simples)
SELECT net.http_get(
    url := 'https://httpbin.org/get'
) as test_request_id;
