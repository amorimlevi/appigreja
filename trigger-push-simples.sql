-- SOLUÇÃO MAIS SIMPLES: Trigger que envia push diretamente via FCM (sem edge function)

-- Habilitar pg_net para fazer requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para enviar notificação push via FCM
CREATE OR REPLACE FUNCTION send_push_notification_fcm(
    p_token TEXT,
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
    v_fcm_key TEXT;
    v_response_id BIGINT;
BEGIN
    -- Obter FCM Server Key das configurações
    v_fcm_key := current_setting('app.settings.fcm_server_key', true);
    
    IF v_fcm_key IS NULL THEN
        RAISE NOTICE 'FCM_SERVER_KEY não configurada';
        RETURN;
    END IF;
    
    -- Enviar requisição para FCM
    SELECT net.http_post(
        url := 'https://fcm.googleapis.com/fcm/send',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'key=' || v_fcm_key
        ),
        body := jsonb_build_object(
            'to', p_token,
            'notification', jsonb_build_object(
                'title', p_title,
                'body', p_body,
                'sound', 'default',
                'priority', 'high'
            ),
            'data', p_data,
            'android', jsonb_build_object(
                'priority', 'high'
            )
        )
    ) INTO v_response_id;
    
    RAISE NOTICE 'Push enviado - Response ID: %', v_response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION notify_new_aviso_simple()
RETURNS TRIGGER AS $$
DECLARE
    v_token_record RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '📬 Novo aviso criado: %', NEW.titulo;
    
    -- Buscar tokens dos destinatários e enviar notificação para cada um
    IF 'todos' = ANY(NEW.destinatarios) THEN
        -- Notificar todos os membros
        FOR v_token_record IN 
            SELECT DISTINCT dt.token, m.nome
            FROM device_tokens dt
            INNER JOIN members m ON m.id = dt.member_id
            WHERE dt.token IS NOT NULL
        LOOP
            PERFORM send_push_notification_fcm(
                v_token_record.token,
                '📢 Novo Aviso',
                NEW.titulo,
                jsonb_build_object(
                    'type', 'aviso',
                    'aviso_id', NEW.id
                )
            );
            v_count := v_count + 1;
        END LOOP;
    ELSE
        -- Notificar apenas membros com as funções especificadas
        FOR v_token_record IN 
            SELECT DISTINCT dt.token, m.nome
            FROM device_tokens dt
            INNER JOIN members m ON m.id = dt.member_id
            WHERE dt.token IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM unnest(m.funcoes) AS funcao
                WHERE funcao = ANY(NEW.destinatarios)
            )
        LOOP
            PERFORM send_push_notification_fcm(
                v_token_record.token,
                '📢 Novo Aviso',
                NEW.titulo,
                jsonb_build_object(
                    'type', 'aviso',
                    'aviso_id', NEW.id
                )
            );
            v_count := v_count + 1;
        END LOOP;
    END IF;
    
    RAISE NOTICE '✅ Notificações enviadas para % dispositivos', v_count;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_simple ON avisos;

-- Criar trigger
CREATE TRIGGER trigger_notify_new_aviso_simple
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso_simple();

-- ====================================
-- IMPORTANTE: Configure sua FCM Server Key
-- ====================================
-- Substitua 'SUA_FCM_SERVER_KEY_AQUI' pela sua chave do Firebase
-- Para obter: Firebase Console > Configurações > Cloud Messaging > Server Key

ALTER DATABASE postgres SET app.settings.fcm_server_key = 'SUA_FCM_SERVER_KEY_AQUI';

-- Para verificar se foi configurado:
SELECT current_setting('app.settings.fcm_server_key', true);

-- ====================================
-- TESTE MANUAL
-- ====================================
-- 1. Primeiro, obtenha um token de dispositivo:
SELECT token, m.nome, dt.platform 
FROM device_tokens dt
JOIN members m ON m.id = dt.member_id
LIMIT 5;

-- 2. Teste enviando uma notificação manualmente:
-- SELECT send_push_notification_fcm(
--     'SEU_DEVICE_TOKEN_AQUI',
--     'Teste',
--     'Mensagem de teste',
--     '{"type": "test"}'::jsonb
-- );

-- 3. Crie um aviso de teste:
-- INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio, autor)
-- VALUES ('Teste Push', 'Mensagem de teste', ARRAY['todos'], NOW(), 'Admin');

-- ====================================
-- VERIFICAR LOGS
-- ====================================
-- Ver se o trigger está funcionando:
-- Supabase Dashboard > Database > Logs
-- Procure por mensagens começando com 📬 ou ✅
