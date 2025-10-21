-- Função que chama a Edge Function para enviar push notification
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    request_id bigint;
BEGIN
    -- Chamar Edge Function via http request
    SELECT http_post(
        url := 'https://prlxzjmctjxlczbwlbvh.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('request.jwt.claim', true)::text
        ),
        body := jsonb_build_object(
            'type', 'aviso',
            'title', 'Novo Aviso',
            'body', NEW.titulo,
            'data', jsonb_build_object('aviso_id', NEW.id, 'type', 'aviso')
        )::text
    ) INTO request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para avisos
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
CREATE TRIGGER trigger_notify_new_aviso
    AFTER INSERT ON avisos
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_aviso();
