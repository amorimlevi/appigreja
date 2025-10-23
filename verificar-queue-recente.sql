-- Ver últimas notificações da fila
SELECT 
  id,
  type,
  title,
  body,
  sent,
  created_at,
  sent_at,
  CASE 
    WHEN sent THEN '✅ Enviada'
    ELSE '⏳ Pendente'
  END as status
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 10;
