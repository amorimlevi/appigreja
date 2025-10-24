-- Atualizar trigger para usar a edge function correta (singular)

-- Recriar a função com a URL correta
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
BEGIN
    -- Log de debug
    RAISE NOTICE 'Trigger notify_new_aviso disparado para aviso: %', NEW.titulo;
    
    -- Chamar edge function via webhook (URL CORRETA - SINGULAR!)
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := jsonb_build_object(
            'type', 'aviso',
            'title', 'Novo Aviso',
            'body', COALESCE(NEW.mensagem, NEW.titulo),
            'data', jsonb_build_object(
                'aviso_id', NEW.id,
                'titulo', NEW.titulo,
                'mensagem', NEW.mensagem
            )
        )
    );
    
    RAISE NOTICE 'Webhook chamado com sucesso para send-push-notification';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro
        RAISE WARNING 'Erro no trigger notify_new_aviso: %', SQLERRM;
        RETURN NEW; -- Não bloqueia a inserção do aviso mesmo se houver erro
END;
$$ LANGUAGE plpgsql;

-- Verificar que a função foi atualizada
SELECT 'Função atualizada! Agora chama send-push-notification (singular)' as status;

-- Testar com um novo aviso
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES ('[TESTE] URL Corrigida', 'Testando com a URL correta: send-push-notification', ARRAY['todos']::text[], CURRENT_DATE)
RETURNING id, titulo, created_at;

-- Aguarde 3 segundos e verifique os logs em:
-- Dashboard > Edge Functions > send-push-notification (SINGULAR!) > Logs
