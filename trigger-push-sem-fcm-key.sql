-- SOLUÇÃO ALTERNATIVA: Trigger que loga quando avisos são criados
-- Use isso temporariamente até conseguir a FCM Server Key

-- Função temporária que apenas loga
CREATE OR REPLACE FUNCTION notify_new_aviso_temp()
RETURNS TRIGGER AS $$
DECLARE
    v_tokens TEXT[];
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '📬 Novo aviso criado: % (ID: %)', NEW.titulo, NEW.id;
    RAISE NOTICE '📋 Destinatários: %', NEW.destinatarios;
    
    -- Buscar tokens dos destinatários
    IF 'todos' = ANY(NEW.destinatarios) THEN
        SELECT ARRAY_AGG(DISTINCT dt.token), COUNT(DISTINCT dt.token)
        INTO v_tokens, v_count
        FROM device_tokens dt
        INNER JOIN members m ON m.id = dt.member_id
        WHERE dt.token IS NOT NULL;
    ELSE
        SELECT ARRAY_AGG(DISTINCT dt.token), COUNT(DISTINCT dt.token)
        INTO v_tokens, v_count
        FROM device_tokens dt
        INNER JOIN members m ON m.id = dt.member_id
        WHERE dt.token IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM unnest(m.funcoes) AS funcao
            WHERE funcao = ANY(NEW.destinatarios)
        );
    END IF;
    
    RAISE NOTICE '📱 Tokens encontrados: %', v_count;
    RAISE NOTICE '⚠️ Notificações NÃO foram enviadas (FCM Key não configurada)';
    RAISE NOTICE '💡 Configure a FCM Server Key para ativar notificações';
    RAISE NOTICE '   Execute: ALTER DATABASE postgres SET app.settings.fcm_server_key = ''SUA_CHAVE_AQUI'';';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger temporário
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_temp ON avisos;

CREATE TRIGGER trigger_notify_new_aviso_temp
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso_temp();

-- Teste criando um aviso:
-- INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio, autor)
-- VALUES ('Teste Trigger', 'Verificando se o trigger funciona', ARRAY['todos'], NOW(), 'Admin');

-- Ver os logs:
-- Dashboard Supabase > Database > Logs
-- Procure por mensagens começando com 📬, 📋, 📱
