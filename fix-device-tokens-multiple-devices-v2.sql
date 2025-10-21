-- Permitir múltiplos dispositivos por membro
-- Remove constraint UNIQUE(member_id, platform) e adiciona UNIQUE(token)

-- 1. Remover constraint único de member_id + platform
ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_member_id_platform_key;

-- 2. Remover constraint antigo de token se existir
ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_token_key;

-- 3. Adicionar constraint único para o token (evitar duplicatas de tokens)
ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_token_key UNIQUE (token);

-- 4. Adicionar index para buscar todos os tokens de um membro (otimização)
CREATE INDEX IF NOT EXISTS idx_device_tokens_member_platform ON device_tokens(member_id, platform);

-- Verificar a estrutura final
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'device_tokens'::regclass
ORDER BY conname;
