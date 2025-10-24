-- Verificar TODOS os tokens salvos
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 30) as token_preview,
    created_at,
    updated_at
FROM device_tokens
ORDER BY updated_at DESC;

-- Contar por plataforma
SELECT 
    platform,
    COUNT(*) as total
FROM device_tokens
GROUP BY platform;

-- Ver se member 28 tem token (é iOS baseado nos logs anteriores)
SELECT *
FROM device_tokens
WHERE member_id IN (26, 28)
ORDER BY updated_at DESC;
