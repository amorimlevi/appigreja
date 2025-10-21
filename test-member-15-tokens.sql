-- Ver status detalhado dos 2 tokens do member_id 15
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 50) || '...' as token_preview,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > NOW() - INTERVAL '1 hour' THEN '🟢 Muito recente'
        WHEN updated_at > NOW() - INTERVAL '1 day' THEN '🟡 Hoje'
        WHEN updated_at > NOW() - INTERVAL '7 days' THEN '🟠 Esta semana'
        ELSE '🔴 Antigo'
    END as status,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as horas_desde_atualizacao
FROM device_tokens
WHERE member_id = 15
ORDER BY updated_at DESC;
