-- DIAGNÓSTICO: Trigger dispara mas função notify_new_aviso falha

-- 1. Ver definição completa da função notify_new_aviso
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'notify_new_aviso';

-- 2. Testar manualmente a função com o último aviso criado
DO $$
DECLARE
    ultimo_aviso RECORD;
BEGIN
    -- Pegar último aviso
    SELECT * INTO ultimo_aviso
    FROM avisos
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE '🔵 Testando função com aviso ID=%', ultimo_aviso.id;
    
    -- Tentar executar a função (simular trigger)
    PERFORM net.http_post(
        url := 'https://xxxxxxxxxxxxxxxx.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
            'aviso_id', ultimo_aviso.id,
            'titulo', ultimo_aviso.titulo,
            'mensagem', ultimo_aviso.mensagem
        )
    );
    
    RAISE NOTICE '✅ Chamada HTTP feita com sucesso';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ ERRO ao chamar Edge Function: %', SQLERRM;
END $$;

-- 3. Verificar se a chave service_role_key está configurada
SELECT current_setting('app.settings.service_role_key', true) as service_role_key_configurada;

-- 4. Criar versão com LOG da função notify_new_aviso
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    request_id bigint;
BEGIN
    RAISE WARNING '🔵 notify_new_aviso iniciado para ID=%, Titulo=%', NEW.id, NEW.titulo;
    
    BEGIN
        SELECT net.http_post(
            url := 'https://xxxxxxxxxxxxxxxx.supabase.co/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'aviso_id', NEW.id,
                'titulo', NEW.titulo,
                'mensagem', NEW.mensagem
            )
        ) INTO request_id;
        
        RAISE WARNING '✅ HTTP POST enviado com sucesso! Request ID=%', request_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ ERRO em notify_new_aviso: % - %', SQLSTATE, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- 5. Agora teste criando um novo aviso do iOS
-- Você deve ver nos logs:
-- 🚨 AVISO INSERIDO (do log_avisos_insert)
-- 🔵 notify_new_aviso iniciado (início da função)
-- ✅ HTTP POST enviado (sucesso) OU ❌ ERRO (falha com detalhes)
