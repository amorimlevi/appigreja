-- Verificar todos os tokens registrados e identificar qual é seu member_id
SELECT 
  dt.id,
  dt.member_id,
  m.nome as member_nome,
  m.email as member_email,
  dt.platform,
  LEFT(dt.token, 30) || '...' as token_preview,
  dt.created_at,
  dt.updated_at,
  CASE 
    WHEN dt.updated_at > NOW() - INTERVAL '5 minutes' THEN '🟢 Recente'
    WHEN dt.updated_at > NOW() - INTERVAL '1 hour' THEN '🟡 < 1h'
    ELSE '🔴 Antigo'
  END as status
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
ORDER BY dt.updated_at DESC;

-- Ver total de tokens por plataforma
SELECT 
  platform,
  COUNT(*) as total_tokens
FROM device_tokens
GROUP BY platform;
