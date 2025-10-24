-- Adicionar coluna bundle_id na tabela device_tokens
ALTER TABLE device_tokens 
ADD COLUMN IF NOT EXISTS bundle_id TEXT;

-- Atualizar tokens existentes (assumindo que member_id 30 é do app member)
UPDATE device_tokens 
SET bundle_id = 'com.igreja.member' 
WHERE platform = 'ios' AND bundle_id IS NULL;

-- Ver resultado
SELECT id, member_id, platform, bundle_id, LEFT(token, 20) as token_preview
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;
