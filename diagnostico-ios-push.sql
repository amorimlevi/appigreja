-- Diagnóstico: Por que iOS não recebe notificações?

-- 1. Verificar tokens iOS registrados
SELECT 
    COUNT(*) as total_tokens_ios,
    COUNT(DISTINCT member_id) as usuarios_unicos
FROM device_tokens
WHERE platform = 'ios'
AND token IS NOT NULL
AND token != '';

-- 2. Ver detalhes dos tokens iOS
SELECT 
    id,
    member_id,
    token,
    platform,
    created_at,
    updated_at,
    AGE(NOW(), updated_at) as tempo_desde_update
FROM device_tokens
WHERE platform = 'ios'
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Ver último aviso e quantos dispositivos iOS deveriam receber
WITH ultimo_aviso AS (
    SELECT id, titulo, mensagem, created_at
    FROM avisos
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Último aviso' as info,
    ua.id,
    ua.titulo,
    (SELECT COUNT(*) FROM device_tokens WHERE platform = 'ios') as devices_ios_total
FROM ultimo_aviso ua;
