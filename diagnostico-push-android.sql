-- 1. Verificar tokens Android ativos
SELECT 
  id, 
  member_id,
  platform,
  LEFT(token, 20) || '...' as token_preview,
  LENGTH(token) as token_length,
  created_at,
  updated_at
FROM device_tokens
WHERE platform = 'android'
ORDER BY updated_at DESC;

-- 2. Verificar últimos avisos criados
SELECT 
  id,
  titulo,
  mensagem,
  created_at
FROM avisos
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar logs de notificações (se a tabela existir)
SELECT * FROM aviso_notifications
ORDER BY created_at DESC
LIMIT 10;
