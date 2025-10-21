-- Criar tabela de configurações da igreja
CREATE TABLE IF NOT EXISTS church_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial da logo (modo claro)
-- NOTA: Atualize a URL da logo usando o script atualizar-logos.sql
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_logo_url', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Inserir configuração da logo para modo escuro
-- NOTA: Atualize a URL da logo usando o script atualizar-logos.sql
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_logo_url_dark', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Inserir configuração do nome da igreja
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_name', 'Igreja')
ON CONFLICT (setting_key) DO NOTHING;

-- Criar bucket de storage para logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('church-logos', 'church-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de acesso ao bucket
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public Access for church logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload church logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update church logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete church logos" ON storage.objects;

-- Permitir visualização pública
CREATE POLICY "Public Access for church logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'church-logos');

-- Permitir upload apenas para usuários autenticados (admins)
CREATE POLICY "Allow authenticated users to upload church logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'church-logos');

-- Permitir update apenas para usuários autenticados
CREATE POLICY "Allow authenticated users to update church logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'church-logos');

-- Permitir delete apenas para usuários autenticados
CREATE POLICY "Allow authenticated users to delete church logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'church-logos');

-- RLS para a tabela church_settings
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Enable read access for all users" ON church_settings;
DROP POLICY IF EXISTS "Enable write access for service role" ON church_settings;

-- Política de leitura pública
CREATE POLICY "Enable read access for all users"
ON church_settings FOR SELECT
TO public
USING (true);

-- Política de escrita apenas para role service_role (admin)
CREATE POLICY "Enable write access for service role"
ON church_settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_church_settings_updated_at ON church_settings;
CREATE TRIGGER update_church_settings_updated_at
BEFORE UPDATE ON church_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE church_settings IS 'Configurações gerais da igreja';
COMMENT ON COLUMN church_settings.setting_key IS 'Chave única da configuração';
COMMENT ON COLUMN church_settings.setting_value IS 'Valor da configuração (pode ser URL, texto, JSON, etc)';
