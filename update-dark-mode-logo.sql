-- Atualizar a logo para modo escuro
-- Execute este SQL DEPOIS de fazer upload da logo CAMAÇARI no Supabase Storage (bucket: church-logos)
-- Substitua 'camacari-logo-dark.png' pelo nome real do arquivo que você fez upload

-- Exemplo de URL do Supabase Storage:
-- https://seu-projeto.supabase.co/storage/v1/object/public/church-logos/camacari-logo-dark.png

UPDATE church_settings
SET setting_value = 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/novo%20logo%20zoeBRANCO.png.png',
    updated_at = NOW()
WHERE setting_key = 'church_logo_url_dark';

-- Verificar se foi atualizado corretamente
SELECT setting_key, setting_value, updated_at
FROM church_settings
WHERE setting_key IN ('church_logo_url', 'church_logo_url_dark');
