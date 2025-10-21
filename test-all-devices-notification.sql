-- Verificar quantos tokens existem por membro
SELECT 
    member_id,
    COUNT(*) as num_devices,
    array_agg(
        json_build_object(
            'id', id,
            'platform', platform,
            'token_preview', LEFT(token, 30) || '...',
            'created', created_at,
            'updated', updated_at
        ) ORDER BY updated_at DESC
    ) as devices
FROM device_tokens
GROUP BY member_id
ORDER BY num_devices DESC;

-- Verificar se há tokens duplicados para o mesmo dispositivo
SELECT 
    member_id,
    token,
    COUNT(*) as count
FROM device_tokens
GROUP BY member_id, token
HAVING COUNT(*) > 1;

-- Ver os últimos 5 tokens registrados
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 40) || '...' as token_preview,
    created_at,
    updated_at
FROM device_tokens
ORDER BY updated_at DESC
LIMIT 5;
