-- Ver tokens do member 30
SELECT id, member_id, platform, LENGTH(token), LEFT(token, 30), created_at
FROM device_tokens
WHERE member_id = 30
ORDER BY created_at DESC;

-- Deletar todos os tokens iOS antigos (forçar re-registro)
-- DELETE FROM device_tokens WHERE platform = 'ios';

-- OU deletar apenas tokens do member 30
-- DELETE FROM device_tokens WHERE member_id = 30 AND platform = 'ios';
