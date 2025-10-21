-- Habilitar extensão pg_net (necessária para fazer HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que chama a Edge Function para enviar push notification
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh6am1jdGp4bGN6YndsYnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg0Mzg1NCwiZXhwIjoyMDQyNDE5ODU0fQ.lTewEf00PN_QFZQdAoG0QFNM1QjE4YcK2PfHaZ_TiFs';
BEGIN
    -- Chamar Edge Function via pg_net
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

-- Criar trigger para avisos
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
CREATE TRIGGER trigger_notify_new_aviso
    AFTER INSERT ON avisos
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_aviso();
