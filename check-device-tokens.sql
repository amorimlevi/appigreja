-- Verificar todos os device tokens registrados
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 40) || '...' as token_preview,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > NOW() - INTERVAL '1 hour' THEN '🟢 Recente'
        WHEN updated_at > NOW() - INTERVAL '1 day' THEN '🟡 Hoje'
        ELSE '🔴 Antigo'
    END as status
FROM device_tokens
ORDER BY updated_at DESC;

-- Contar tokens por plataforma
SELECT 
    platform,
    COUNT(*) as total_devices,
    COUNT(DISTINCT member_id) as unique_members
FROM device_tokens
GROUP BY platform;
