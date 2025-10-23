-- Verificar se a tabela push_notifications_queue existe e seu conteúdo
SELECT * FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 10;
