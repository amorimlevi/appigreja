-- Atualizar trigger para usar send-push-notifications (PLURAL) com fila

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
    RAISE NOTICE 'Notificação ID % criada e inserida na fila', notification_id;
    
    -- Chamar edge function PLURAL (processa fila automaticamente)
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notifications',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := '{}'::jsonb
    );
    
    RAISE NOTICE 'Webhook chamado: send-push-notifications (processa fila)';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro mas não bloqueia inserção
        RAISE WARNING 'Erro no trigger notify_new_aviso: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Confirmar atualização
SELECT '✅ Função atualizada! Agora usa send-push-notifications (PLURAL) que processa a fila' as status;

-- Testar com novo aviso
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES ('[TESTE] Fila Automática', 'Testando processamento automático da fila de notificações', ARRAY['todos']::text[], CURRENT_DATE)
RETURNING id, titulo, created_at;

-- Aguarde 3 segundos e verifique:

-- 1. Notificação na fila
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 3;

-- 2. Logs da edge function (PLURAL!)
-- Dashboard > Edge Functions > send-push-notifications > Logs
-- Deve mostrar:
-- ✅ "Found X device tokens"
-- ✅ "Sent successfully to ios device"
-- ✅ "Sent successfully to android device"
-- ✅ "Summary: X notifications sent successfully"

-- 3. Notificação marcada como enviada
SELECT 
    id,
    title,
    sent,
    sent_at
FROM push_notifications_queue
WHERE title LIKE '%TESTE%'
ORDER BY created_at DESC;
-- sent deve ser 'true' após processamento!
