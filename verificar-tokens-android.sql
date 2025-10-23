-- Verificar tokens Android detalhados
SELECT 
  id,
  member_id,
  LEFT(token, 40) || '...' as token_preview,
  LENGTH(token) as token_length,
  created_at,
  updated_at,
  EXTRACT(HOUR FROM (NOW() - updated_at)) as horas_desde_update
FROM device_tokens
WHERE platform = 'android'
ORDER BY updated_at DESC;

-- Verificar membros com tokens
SELECT 
  dt.member_id,
  m.nome,
  COUNT(dt.id) as total_devices
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
WHERE dt.platform = 'android'
GROUP BY dt.member_id, m.nome;
