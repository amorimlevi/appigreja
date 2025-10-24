-- Verificar tokens iOS salvos
SELECT 
    id,
    member_id,
    platform,
    token,
    created_at,
    updated_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY updated_at DESC
LIMIT 10;

-- Verificar se há membros com tokens iOS
SELECT 
    COUNT(*) as total_ios_tokens,
    COUNT(DISTINCT member_id) as unique_members
FROM device_tokens
WHERE platform = 'ios';

-- Verificar tokens Android também para comparar
SELECT 
    COUNT(*) as total_android_tokens,
    COUNT(DISTINCT member_id) as unique_members
FROM device_tokens
WHERE platform = 'android';
