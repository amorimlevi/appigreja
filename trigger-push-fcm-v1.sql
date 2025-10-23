-- Trigger para notificações push usando Firebase Cloud Messaging API v1

-- Habilitar pg_net para fazer requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION notify_new_aviso_v1()
RETURNS TRIGGER AS $$
DECLARE
    v_tokens TEXT[];
    v_count INTEGER := 0;
    v_supabase_url TEXT;
    v_service_role_key TEXT;
    v_response_id BIGINT;
BEGIN
    RAISE NOTICE '📬 Novo aviso criado: % (ID: %)', NEW.titulo, NEW.id;
    RAISE NOTICE '📋 Destinatários: %', NEW.destinatarios;
    
    -- Obter configurações
    v_supabase_url := current_setting('app.settings.supabase_url', true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    
    IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
        RAISE NOTICE '⚠️ Configurações não encontradas!';
        RAISE NOTICE '   Execute:';
        RAISE NOTICE '   ALTER DATABASE postgres SET app.settings.supabase_url = ''https://seu-projeto.supabase.co'';';
        RAISE NOTICE '   ALTER DATABASE postgres SET app.settings.service_role_key = ''sua_service_role_key'';';
        RETURN NEW;
    END IF;
    
    -- Buscar tokens dos destinatários
    IF 'todos' = ANY(NEW.destinatarios) THEN
        -- Notificar todos os membros
        SELECT ARRAY_AGG(DISTINCT dt.token), COUNT(DISTINCT dt.token)
        INTO v_tokens, v_count
        FROM device_tokens dt
        INNER JOIN members m ON m.id = dt.member_id
        WHERE dt.token IS NOT NULL;
    ELSE
        -- Notificar apenas membros com as funções especificadas
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
    
    -- Se houver tokens, chamar edge function
    IF v_tokens IS NOT NULL AND array_length(v_tokens, 1) > 0 THEN
        RAISE NOTICE '📤 Chamando edge function para enviar notificações...';
        
        SELECT net.http_post(
            url := v_supabase_url || '/functions/v1/send-push-v1',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_service_role_key
            ),
            body := jsonb_build_object(
                'tokens', v_tokens,
                'title', '📢 Novo Aviso',
                'body', NEW.titulo,
                'data', jsonb_build_object(
                    'type', 'aviso',
                    'aviso_id', NEW.id::text
                )
            )
        ) INTO v_response_id;
        
        RAISE NOTICE '✅ Edge function chamada! Response ID: %', v_response_id;
    ELSE
        RAISE NOTICE '⚠️ Nenhum token encontrado para os destinatários';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_temp ON avisos;
DROP TRIGGER IF EXISTS trigger_notify_new_aviso_v1 ON avisos;

-- Criar trigger
CREATE TRIGGER trigger_notify_new_aviso_v1
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso_v1();

-- ====================================
-- IMPORTANTE: Configure as variáveis
-- ====================================
-- Substitua pelos seus valores reais do Supabase Dashboard

-- 1. Supabase URL (Settings > API > Project URL)
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://seu-projeto.supabase.co';

-- 2. Service Role Key (Settings > API > service_role key - secret)
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

-- Para verificar se foram configurados:
SELECT current_setting('app.settings.supabase_url', true) as supabase_url;
SELECT current_setting('app.settings.service_role_key', true) as service_role_key;

-- ====================================
-- TESTE
-- ====================================
-- Criar aviso de teste (após configurar tudo):
-- INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
-- VALUES ('Teste Push v1', 'Testando Firebase Cloud Messaging API v1', ARRAY['todos'], NOW());

-- Ver se o trigger foi criado:
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_new_aviso_v1';
