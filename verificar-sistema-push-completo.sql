-- 1. Verificar TODOS os tokens registrados (Android e iOS)
SELECT 
  id, 
  member_id,
  platform,
  LEFT(token, 30) || '...' as token_preview,
  LENGTH(token) as token_length,
  created_at,
  updated_at
FROM device_tokens
ORDER BY platform, updated_at DESC;

-- 2. Contar tokens por plataforma
SELECT 
  platform,
  COUNT(*) as total_devices
FROM device_tokens
GROUP BY platform;

-- 3. Verificar últimos avisos criados
SELECT 
  id,
  titulo,
  mensagem,
  created_at
FROM avisos
ORDER BY created_at DESC
LIMIT 3;

-- 4. Verificar últimas notificações na fila
SELECT 
  id,
  type,
  title,
  body,
  sent,
  created_at,
  sent_at
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;
