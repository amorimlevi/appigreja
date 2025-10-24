-- Atualizar a logo para modo claro (logo preta)
-- Execute este SQL DEPOIS de fazer upload da logo preta no Supabase Storage (bucket: church-logos)
-- Exemplo: logo-zoe-preta.png

-- Exemplo de URL do Supabase Storage:
-- https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/logo-zoe-preta.png

UPDATE church_settings
SET setting_value = 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/WhatsApp%20Image%202025-10-21%20at%2007.30.14.jpeg',
    updated_at = NOW()
WHERE setting_key = 'church_logo_url';

-- Verificar se foi atualizado corretamente
SELECT setting_key, setting_value, updated_at
FROM church_settings
WHERE setting_key IN ('church_logo_url', 'church_logo_url_dark');
