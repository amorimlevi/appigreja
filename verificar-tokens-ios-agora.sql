-- Ver tokens iOS recentes
SELECT 
    id,
    member_id,
    platform,
    bundle_id,
    LENGTH(token) as token_length,
    LEFT(token, 30) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC
LIMIT 10;

-- Token FCM iOS: ~150+ caracteres com letras, números, hífens, underscores
-- Token APNs: 64 caracteres hexadecimais (0-9a-f)
