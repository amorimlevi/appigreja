-- Script completo para criar tabela e inserir logos

-- 1. Criar tabela church_settings se não existir
CREATE TABLE IF NOT EXISTS church_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de leitura pública (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'church_settings' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users"
        ON church_settings FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- 4. Inserir ou atualizar logo do modo claro
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_logo_url', 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/Design%20sem%20nome-2.png')
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 5. Inserir ou atualizar logo do modo escuro
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_logo_url_dark', 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/novo%20logo%20zoeBRANCO.png.png')
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 6. Inserir nome da igreja se não existir
INSERT INTO church_settings (setting_key, setting_value)
VALUES ('church_name', 'Igreja')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Verificar resultado
SELECT 
    id,
    setting_key, 
    setting_value, 
    created_at,
    updated_at 
FROM church_settings 
ORDER BY setting_key;
