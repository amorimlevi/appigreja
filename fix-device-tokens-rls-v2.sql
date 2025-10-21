-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Admins can view all device tokens" ON device_tokens;

-- Criar policies corretas usando auth.email()
-- Usuários autenticados podem ver seus próprios tokens
CREATE POLICY "Users can view own device tokens"
    ON device_tokens FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE email = auth.email()
        )
    );

-- Usuários autenticados podem inserir seus próprios tokens
CREATE POLICY "Users can insert own device tokens"
    ON device_tokens FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM members WHERE email = auth.email()
        )
    );

-- Usuários autenticados podem atualizar seus próprios tokens
CREATE POLICY "Users can update own device tokens"
    ON device_tokens FOR UPDATE
    USING (
        member_id IN (
            SELECT id FROM members WHERE email = auth.email()
        )
    );

-- Usuários autenticados podem deletar seus próprios tokens
CREATE POLICY "Users can delete own device tokens"
    ON device_tokens FOR DELETE
    USING (
        member_id IN (
            SELECT id FROM members WHERE email = auth.email()
        )
    );

-- Admins podem ver todos os tokens
CREATE POLICY "Admins can view all device tokens"
    ON device_tokens FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE email = auth.email()
            AND 'admin' = ANY(funcoes)
        )
    );
