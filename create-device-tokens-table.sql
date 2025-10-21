-- Criar tabela para armazenar tokens de dispositivos
CREATE TABLE IF NOT EXISTS device_tokens (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, platform)
);

-- Index para buscar tokens por membro
CREATE INDEX IF NOT EXISTS idx_device_tokens_member_id ON device_tokens(member_id);

-- Index para buscar todos os tokens de uma plataforma
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);

-- RLS Policies
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios tokens
CREATE POLICY "Users can view own device tokens"
    ON device_tokens FOR SELECT
    USING (auth.uid()::text = (SELECT email FROM members WHERE id = device_tokens.member_id));

-- Usuários podem inserir seus próprios tokens
CREATE POLICY "Users can insert own device tokens"
    ON device_tokens FOR INSERT
    WITH CHECK (auth.uid()::text = (SELECT email FROM members WHERE id = device_tokens.member_id));

-- Usuários podem atualizar seus próprios tokens
CREATE POLICY "Users can update own device tokens"
    ON device_tokens FOR UPDATE
    USING (auth.uid()::text = (SELECT email FROM members WHERE id = device_tokens.member_id));

-- Usuários podem deletar seus próprios tokens
CREATE POLICY "Users can delete own device tokens"
    ON device_tokens FOR DELETE
    USING (auth.uid()::text = (SELECT email FROM members WHERE id = device_tokens.member_id));

-- Admins podem ver todos os tokens
CREATE POLICY "Admins can view all device tokens"
    ON device_tokens FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE email = auth.uid()::text 
            AND 'admin' = ANY(funcoes)
        )
    );
