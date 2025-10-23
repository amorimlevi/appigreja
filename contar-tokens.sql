-- Contar tokens por plataforma
SELECT 
  platform,
  COUNT(*) as total_devices,
  MAX(updated_at) as ultimo_registro
FROM device_tokens
GROUP BY platform;
