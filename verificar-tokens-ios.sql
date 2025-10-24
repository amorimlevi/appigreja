-- 1. Verificar se coluna bundle_id existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'device_tokens' AND column_name = 'bundle_id';

-- 2. Ver tokens iOS com tamanho e bundle_id
SELECT 
    id, 
    member_id, 
    platform, 
    bundle_id,
    LENGTH(token) as token_length,
    LEFT(token, 20) as token_preview
FROM device_tokens 
WHERE platform = 'ios' 
ORDER BY updated_at DESC;

-- 3. Ver especificamente member 29
SELECT 
    id, 
    member_id, 
    platform, 
    bundle_id,
    LENGTH(token) as token_length,
    token
FROM device_tokens 
WHERE member_id = 29 AND platform = 'ios';

-- Token APNs válido tem 64 caracteres hexadecimais
-- Token FCM tem ~142-160 caracteres misturados
