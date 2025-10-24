-- SOLUÇÃO: Configurar service_role_key no PostgreSQL

-- OPÇÃO 1: Configurar a chave como database setting (RECOMENDADO)
-- Substitua 'SUA_SERVICE_ROLE_KEY_AQUI' pela sua chave real
-- Pegue em: Supabase Dashboard > Project Settings > API > service_role key

ALTER DATABASE postgres SET app.settings.service_role_key = 'SUA_SERVICE_ROLE_KEY_AQUI';

-- Recarregar configurações
SELECT pg_reload_conf();

-- Verificar se foi configurada
SELECT current_setting('app.settings.service_role_key', true);

-- OPÇÃO 2: Usar Vault do Supabase (mais seguro)
-- Primeiro, salve a chave no Vault via Dashboard
-- Depois altere a função para usar o Vault:

CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    request_id bigint;
    service_key text;
BEGIN
    RAISE WARNING '🔵 notify_new_aviso iniciado para ID=%, Titulo=%', NEW.id, NEW.titulo;
    
    -- Buscar chave do Vault
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key';
    
    IF service_key IS NULL THEN
        RAISE WARNING '❌ service_role_key não encontrada no Vault!';
        RETURN NEW;
    END IF;
    
    BEGIN
        SELECT net.http_post(
            url := 'https://xxxxxxxxxxxxxxxx.supabase.co/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_key
            ),
            body := jsonb_build_object(
                'aviso_id', NEW.id,
                'titulo', NEW.titulo,
                'mensagem', NEW.mensagem
            )
        ) INTO request_id;
        
        RAISE WARNING '✅ HTTP POST enviado! Request ID=%', request_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ ERRO: % - %', SQLSTATE, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;
