-- Debug: Por que notificação iOS não chega mesmo com log "sent successfully"

-- 1. Ver quando os tokens iOS foram criados
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 60) as token_start,
    created_at,
    updated_at,
    -- Verificar se o token é novo (criado nos últimos 30 minutos)
    CASE 
        WHEN created_at > NOW() - INTERVAL '30 minutes' THEN '✅ NOVO'
        ELSE '⚠️ ANTIGO (precisa deletar e reinstalar app)'
    END as status
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;

-- 2. Verificar quantos tokens iOS existem
SELECT 
    COUNT(*) as total_tokens,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 minutes' THEN 1 END) as tokens_novos,
    COUNT(CASE WHEN created_at <= NOW() - INTERVAL '30 minutes' THEN 1 END) as tokens_antigos
FROM device_tokens
WHERE platform = 'ios';

-- 3. Ver últimas notificações enviadas
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at,
    AGE(NOW(), created_at) as tempo_desde_criacao
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;

-- 4. IMPORTANTE: Se os tokens forem antigos, delete-os:
-- DELETE FROM device_tokens WHERE platform = 'ios' AND created_at <= NOW() - INTERVAL '30 minutes';
