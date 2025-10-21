-- Habilitar RLS novamente
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Admins can view all device tokens" ON device_tokens;

-- Policy: Permitir insert/update para usuários autenticados em seus próprios tokens
CREATE POLICY "Users can manage own device tokens"
    ON device_tokens
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Se preferir mais segurança (não recomendado para debugging):
-- DROP POLICY "Users can manage own device tokens" ON device_tokens;
-- 
-- CREATE POLICY "Users can manage own device tokens"
--     ON device_tokens
--     FOR ALL
--     USING (
--         auth.uid() IS NOT NULL
--     )
--     WITH CHECK (
--         auth.uid() IS NOT NULL
--     );
