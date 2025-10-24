-- Ver TODOS os registros iOS, mesmo com token NULL/vazio
SELECT 
    id,
    member_id,
    token,
    platform,
    created_at,
    updated_at,
    CASE 
        WHEN token IS NULL THEN '❌ Token é NULL'
        WHEN token = '' THEN '❌ Token é vazio'
        WHEN LENGTH(token) > 100 THEN '✅ Token longo (APNs - 64 chars hex)'
        WHEN LENGTH(token) > 50 THEN '✅ Token FCM válido'
        ELSE '⚠️ Token muito curto'
    END as status_token,
    LENGTH(token) as tamanho
FROM device_tokens
WHERE platform = 'ios'
ORDER BY updated_at DESC;
