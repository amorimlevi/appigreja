-- ============================================
-- Atualizar funções com service_role_key correta
-- ============================================
-- IMPORTANTE: Substitua 'SUA_SERVICE_ROLE_KEY_AQUI' pela chave real do Supabase
-- Dashboard → Project Settings → API → service_role key (secret)

CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2xzdHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1Njg0NiwiZXhwIjoyMDc1NTMyODQ2fQ.wyd5_VkLNe8aRhXw1lDUZLzDhsh0Kl6CJt1WBa2X7eA';
BEGIN
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'aviso',
            'title', 'Novo Aviso',
            'body', NEW.titulo,
            'data', jsonb_build_object('aviso_id', NEW.id, 'type', 'aviso')
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_evento()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := 'SUA_SERVICE_ROLE_KEY_AQUI';
BEGIN
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'evento',
            'title', 'Novo Evento',
            'body', NEW.nome,
            'data', jsonb_build_object('evento_id', NEW.id, 'type', 'evento')
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_escala()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := 'SUA_SERVICE_ROLE_KEY_AQUI';
    ministerio_nome text;
    notification_title text;
BEGIN
    ministerio_nome := COALESCE(NEW.ministerio, 'Ministério');
    
    CASE NEW.ministerio
        WHEN 'louvor' THEN
            notification_title := 'Nova Escala de Louvor';
        WHEN 'diaconia' THEN
            notification_title := 'Nova Escala de Diáconia';
        WHEN 'kids' THEN
            notification_title := 'Nova Escala de Professores Kids';
        WHEN 'jovens' THEN
            notification_title := 'Nova Escala de Jovens';
        ELSE
            notification_title := 'Nova Escala - ' || ministerio_nome;
    END CASE;
    
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'escala',
            'ministerio', NEW.ministerio,
            'title', notification_title,
            'body', COALESCE(NEW.descricao, 'Confira sua nova escala'),
            'data', jsonb_build_object(
                'escala_id', NEW.id, 
                'type', 'escala',
                'ministerio', NEW.ministerio
            )
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
