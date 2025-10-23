-- Verificar tokens iOS no banco de dados

-- 1. Ver todos os tokens por plataforma
SELECT 
    platform,
    COUNT(*) as total
FROM device_tokens
GROUP BY platform;

-- 2. Ver detalhes dos tokens iOS (se existirem)
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    LEFT(dt.token, 60) as token_preview,
    LENGTH(dt.token) as token_length,
    m.nome,
    m.email,
    dt.created_at,
    dt.updated_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
WHERE dt.platform = 'ios'
ORDER BY dt.created_at DESC;

-- 3. Ver TODOS os tokens
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    LEFT(dt.token, 40) || '...' as token,
    m.nome,
    dt.created_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
ORDER BY dt.platform, dt.created_at DESC;
