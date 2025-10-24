-- Recriar trigger de avisos do zero

-- 1. Deletar trigger antigo (se existir)
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_v1 ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_temp ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_simple ON avisos;

-- 2. Recriar a função do trigger
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    notification_id uuid;
BEGIN
    -- Log de debug
    RAISE NOTICE 'Trigger notify_new_aviso disparado para aviso: %', NEW.titulo;
    
    -- Inserir notificação na fila
    INSERT INTO push_notifications_queue (
        title,
        body,
        data,
        sent
    ) VALUES (
        'Novo Aviso',
        COALESCE(NEW.mensagem, NEW.titulo),
        jsonb_build_object(
            'type', 'aviso',
            'aviso_id', NEW.id,
            'titulo', NEW.titulo,
            'mensagem', NEW.mensagem
        ),
        false
    )
    RETURNING id INTO notification_id;
    
    -- Log de sucesso
    RAISE NOTICE 'Notificação criada com ID: %', notification_id;
    
    -- Chamar edge function via webhook
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := '{}'::jsonb
    );
    
    RAISE NOTICE 'Webhook chamado com sucesso';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro
        RAISE WARNING 'Erro no trigger notify_new_aviso: %', SQLERRM;
        RETURN NEW; -- Não bloqueia a inserção do aviso mesmo se houver erro
END;
$$ LANGUAGE plpgsql;

-- 3. Criar novo trigger
CREATE TRIGGER trigger_notify_new_aviso
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso();

-- 4. Verificar que foi criado
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅ CRIADO' as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_new_aviso';

-- 5. Testar o trigger
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES ('[TESTE] Trigger Recriado', 'Este aviso foi criado para testar o trigger recriado. Você deve receber notificação!', ARRAY['todos']::text[], CURRENT_DATE)
RETURNING id, titulo, created_at;

-- 6. Verificar se notificação foi criada (aguarde 2 segundos)
SELECT 
    id,
    title,
    body,
    sent,
    created_at
FROM push_notifications_queue
WHERE title LIKE '%Novo Aviso%'
ORDER BY created_at DESC
LIMIT 3;

-- 7. Verificar logs da edge function
-- Dashboard > Edge Functions > send-push-notification > Logs (SINGULAR!)
-- Deve aparecer:
-- - "Received push notification request"
-- - "Found X device tokens"
-- - "Sent successfully to ios device"
