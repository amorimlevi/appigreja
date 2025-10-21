-- Primeiro, qual é a URL correta do seu projeto Supabase?
-- Vá em: Dashboard → Settings → API → Project URL
-- Ex: https://xxxxx.supabase.co

-- Depois atualize aqui com a URL correta:
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh6am1jdGp4bGN6YndsYnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg0Mzg1NCwiZXhwIjoyMDQyNDE5ODU0fQ.lTewEf00PN_QFZQdAoG0QFNM1QjE4YcK2PfHaZ_TiFs';
BEGIN
    PERFORM net.http_post(
        url := 'COLOQUE_A_URL_CORRETA_AQUI/functions/v1/send-push-notification',
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
