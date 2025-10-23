-- Trigger para enviar notificações push quando um novo aviso é criado

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    v_tokens TEXT[];
    v_titulo TEXT;
    v_mensagem TEXT;
    v_destinatarios TEXT[];
BEGIN
    -- Capturar informações do aviso
    v_titulo := NEW.titulo;
    v_mensagem := NEW.mensagem;
    v_destinatarios := NEW.destinatarios;
    
    -- Buscar tokens de dispositivos dos destinatários
    IF 'todos' = ANY(v_destinatarios) THEN
        -- Notificar todos os membros
        SELECT ARRAY_AGG(DISTINCT dt.token)
        INTO v_tokens
        FROM device_tokens dt
        INNER JOIN members m ON m.id = dt.member_id
        WHERE dt.token IS NOT NULL;
    ELSE
        -- Notificar apenas membros com as funções especificadas
        SELECT ARRAY_AGG(DISTINCT dt.token)
        INTO v_tokens
        FROM device_tokens dt
        INNER JOIN members m ON m.id = dt.member_id
        WHERE dt.token IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM unnest(m.funcoes) AS funcao
            WHERE funcao = ANY(v_destinatarios)
        );
    END IF;
    
    -- Log para debug
    RAISE NOTICE 'Novo aviso criado: % - Destinatários: % - Tokens: %', 
        v_titulo, v_destinatarios, COALESCE(array_length(v_tokens, 1), 0);
    
    -- Se houver tokens, chamar edge function para enviar notificações
    IF v_tokens IS NOT NULL AND array_length(v_tokens, 1) > 0 THEN
        -- Usar pg_net para chamar a edge function
        PERFORM net.http_post(
            url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
            ),
            body := jsonb_build_object(
                'tokens', v_tokens,
                'title', '📢 Novo Aviso',
                'body', v_titulo,
                'data', jsonb_build_object(
                    'type', 'aviso',
                    'aviso_id', NEW.id
                )
            )
        );
        
        RAISE NOTICE 'Notificação enviada para % dispositivos', array_length(v_tokens, 1);
    ELSE
        RAISE NOTICE 'Nenhum token encontrado para os destinatários';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;

-- Criar trigger que chama a função quando um aviso é inserido
CREATE TRIGGER trigger_notify_new_aviso
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso();

-- Configurar variáveis necessárias (substitua pelos seus valores reais)
-- Você precisa executar estes comandos manualmente com seus valores:
/*
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://SEU_PROJETO.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'SUA_SERVICE_ROLE_KEY';
*/

-- Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_new_aviso';
