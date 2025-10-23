-- Ver todos os tokens Android com detalhes do membro
SELECT 
  dt.id,
  dt.member_id,
  m.nome as membro_nome,
  LEFT(dt.token, 40) || '...' as token_preview,
  LENGTH(dt.token) as token_length,
  dt.created_at,
  dt.updated_at
FROM device_tokens dt
LEFT JOIN members m ON m.id = dt.member_id
WHERE dt.platform = 'android'
ORDER BY dt.updated_at DESC;
