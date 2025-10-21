-- IMPORTANTE: Pegue a service_role key correta em:
-- Dashboard → Settings → API → Project API keys → service_role (secret)
-- 
-- Cole a chave abaixo substituindo 'COLOQUE_A_SERVICE_ROLE_KEY_AQUI'

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
