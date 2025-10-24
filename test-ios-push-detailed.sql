-- Teste de notificação iOS com detalhes completos
-- Execute este SQL e depois verifique os logs da edge function

-- 1. Ver tokens iOS salvos
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 50) as token_start,
    created_at,
    updated_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY updated_at DESC;

-- 2. Inserir notificação de teste
INSERT INTO push_notifications_queue (title, body, data, sent)
VALUES (
    'TESTE iOS Push',
    'Esta é uma notificação de teste. Se você viu este banner, está funcionando! 🎉',
    jsonb_build_object('type', 'aviso', 'test', 'true'),
    false
);

-- 3. Chamar a edge function manualmente
SELECT
    net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notifications',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := '{}'::jsonb
    ) as response;

-- 4. Verificar se foi marcado como enviado
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;
