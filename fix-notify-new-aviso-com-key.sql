-- Solução: Adicionar service_role_key direto na função + logs
-- IMPORTANTE: Substitua 'SUA_SERVICE_ROLE_KEY_AQUI' pela chave real
-- Pegue em: Dashboard > Project Settings > API > service_role key

CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    request_id bigint;
    service_role_key text := 'SUA_SERVICE_ROLE_KEY_AQUI';  -- SUBSTITUA AQUI
BEGIN
    RAISE WARNING '🔵 notify_new_aviso iniciado: ID=%, Titulo=%', NEW.id, NEW.titulo;
    
    BEGIN
        SELECT net.http_post(
            url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
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

-- Teste: verificar se a função foi atualizada
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'notify_new_aviso';
