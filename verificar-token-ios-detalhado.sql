-- Ver todos os detalhes dos tokens iOS
SELECT 
    id,
    member_id,
    token,
    platform,
    created_at,
    updated_at,
    LENGTH(token) as tamanho_token,
    CASE 
        WHEN LENGTH(token) > 100 THEN 'Token longo (APNs)'
        WHEN LENGTH(token) < 100 THEN 'Token curto (FCM)'
        ELSE 'Token vazio'
    END as tipo_token
FROM device_tokens
WHERE platform = 'ios'
ORDER BY updated_at DESC;

-- Ver tokens Android para comparar
SELECT 
    id,
    member_id,
    platform,
    LENGTH(token) as tamanho_token,
    created_at
FROM device_tokens
WHERE platform = 'android'
ORDER BY updated_at DESC
LIMIT 3;
