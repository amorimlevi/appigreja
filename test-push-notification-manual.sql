-- Testar chamada manual da Edge Function via pg_net
SELECT net.http_post(
    url := 'https://prlxzjmctjxlczbwlbvh.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh6am1jdGp4bGN6YndsYnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg0Mzg1NCwiZXhwIjoyMDQyNDE5ODU0fQ.lTewEf00PN_QFZQdAoG0QFNM1QjE4YcK2PfHaZ_TiFs'
    ),
    body := jsonb_build_object(
        'type', 'aviso',
        'title', 'Teste Manual',
        'body', 'Esta é uma notificação de teste manual',
        'data', jsonb_build_object('test', 'true')
    )::text
) AS request_id;
