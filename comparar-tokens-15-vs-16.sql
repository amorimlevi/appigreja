-- Comparar tokens do member_id 15 (não recebe) vs 16 (recebe)
SELECT 
    id,
    member_id,
    platform,
    LENGTH(token) as token_length,
    LEFT(token, 50) || '...' as token_preview,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > NOW() - INTERVAL '1 day' THEN '🟢 Recente'
        WHEN updated_at > NOW() - INTERVAL '7 days' THEN '🟡 Esta semana'
        ELSE '🔴 Antigo'
    END as status,
    -- Verificar se o token tem formato válido (hex)
    CASE 
        WHEN token ~ '^[A-Fa-f0-9]+$' THEN '✅ Formato válido'
        ELSE '❌ Formato inválido'
    END as formato_token
FROM device_tokens
WHERE member_id IN (15, 16)
ORDER BY member_id, updated_at DESC;

-- Ver último aviso criado
SELECT 
    id,
    titulo,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_atras
FROM avisos
ORDER BY created_at DESC
LIMIT 1;
