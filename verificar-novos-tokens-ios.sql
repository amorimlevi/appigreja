-- Verificar se novos tokens iOS foram registrados
SELECT 
    id,
    member_id,
    LEFT(token, 20) as token_inicio,
    platform,
    created_at,
    AGE(NOW(), created_at) as tempo_desde_criacao
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;

-- Ver total por plataforma
SELECT 
    platform,
    COUNT(*) as total
FROM device_tokens
GROUP BY platform;
