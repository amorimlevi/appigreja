-- 1. Ver tokens salvos
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 20) || '...' as token_preview,
    created_at
FROM device_tokens
ORDER BY created_at DESC;

-- 2. Ver últimas requisições HTTP (pg_net)
SELECT 
    id,
    status_code,
    content,
    created
FROM net._http_response 
ORDER BY id DESC 
LIMIT 5;

-- 3. Verificar se há erros nas últimas horas
SELECT 
    id,
    status_code,
    LEFT(content::text, 200) as error_preview
FROM net._http_response 
WHERE status_code != 200
ORDER BY id DESC 
LIMIT 10;
