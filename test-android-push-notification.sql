-- Script para testar notificação push no Android
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar tokens Android disponíveis
SELECT 
    dt.id,
    dt.member_id,
    dt.platform,
    dt.token,
    m.nome,
    m.email,
    dt.created_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
WHERE dt.platform = 'android'
ORDER BY dt.created_at DESC;

-- 2. Inserir notificação de teste
-- IMPORTANTE: Aguarde 5-10 segundos após executar este INSERT
-- A Edge Function será chamada automaticamente pelo trigger

INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test',
    '🎉 Teste Android Push',
    'Se você recebeu esta notificação, o sistema está funcionando perfeitamente!',
    ('{"type": "test", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- 3. Verificar se a notificação foi enviada
-- Execute este comando 10 segundos após o INSERT acima
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at,
    (sent_at - created_at) as tempo_processamento
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar logs (se houver erros)
-- Este comando mostra as últimas chamadas da Edge Function
-- Nota: Você também pode ver os logs em: Functions > send-push-notifications > Logs
