-- Limpar notificações antigas antes de testar

-- 1. Ver quantas notificações pendentes existem
SELECT 
    COUNT(*) as total_pendentes,
    COUNT(*) FILTER (WHERE type = 'test') as testes,
    COUNT(*) FILTER (WHERE type = 'aviso') as avisos,
    COUNT(*) FILTER (WHERE type = 'evento') as eventos
FROM push_notifications_queue
WHERE sent = false;

-- 2. Marcar todas as notificações de teste como enviadas
UPDATE push_notifications_queue
SET 
    sent = true,
    sent_at = NOW()
WHERE sent = false 
AND type LIKE 'test%';

-- 3. Ver o que sobrou
SELECT 
    id,
    type,
    title,
    sent,
    created_at
FROM push_notifications_queue
WHERE sent = false
ORDER BY created_at DESC;

-- 4. (Opcional) Se quiser deletar todas as notificações antigas/testes
-- Descomente as linhas abaixo se quiser fazer uma limpeza completa:

-- DELETE FROM push_notifications_queue 
-- WHERE type LIKE 'test%' 
-- OR created_at < NOW() - INTERVAL '7 days';

SELECT 'Limpeza concluída! Agora teste criando um aviso ou evento no Admin.' as mensagem;
