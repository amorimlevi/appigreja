-- Ver TODOS os tokens (iOS e Android)
SELECT 
    id, 
    member_id, 
    platform, 
    bundle_id,
    LENGTH(token) as token_length,
    LEFT(token, 20) as token_preview,
    created_at,
    updated_at
FROM device_tokens 
ORDER BY updated_at DESC
LIMIT 20;
