-- Script para atualizar as logos da igreja (modo claro e escuro)
-- 
-- INSTRUÇÕES:
-- 1. Faça upload das suas logos no Storage do Supabase (bucket: church-logos)
-- 2. Copie as URLs públicas das imagens
-- 3. Substitua as URLs abaixo pelas suas URLs
-- 4. Execute este script no SQL Editor do Supabase

-- Atualizar logo do modo claro
UPDATE church_settings 
SET setting_value = 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/Design%20sem%20nome-2.png' 
WHERE setting_key = 'church_logo_url';

-- Atualizar logo do modo escuro
UPDATE church_settings 
SET setting_value = 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/novo%20logo%20zoeBRANCO.png.png' 
WHERE setting_key = 'church_logo_url_dark';

-- Verificar se as logos foram atualizadas corretamente
SELECT setting_key, setting_value, updated_at 
FROM church_settings 
WHERE setting_key IN ('church_logo_url', 'church_logo_url_dark')
ORDER BY setting_key;
