-- FIX: Fazer trigger funcionar para avisos criados do app iOS

-- 1. Habilitar extensão pg_net (se não estiver)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Recriar função com SECURITY DEFINER e logs detalhados
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER -- Executa com permissões do owner (ignora RLS)
SET search_path = public
AS $$
BEGIN
    -- Log detalhado
    RAISE NOTICE '🔵 TRIGGER INICIADO - Aviso: % (ID: %)', NEW.titulo, NEW.id;
    RAISE NOTICE '📱 Chamando edge function...';
    
    -- Chamar edge function
    BEGIN
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
        RAISE NOTICE '🟢 WEBHOOK CHAMADO COM SUCESSO';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '🔴 ERRO AO CHAMAR WEBHOOK: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
    
    RAISE NOTICE '✅ TRIGGER FINALIZADO';
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '🔴 ERRO GERAL NO TRIGGER: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN NEW; -- Não bloqueia inserção mesmo com erro
END;
$$ LANGUAGE plpgsql;

-- 3. Dar permissões explícitas
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO anon;
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO service_role;

-- 4. Verificar que trigger existe
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅ ATIVO' as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_new_aviso';

-- 5. Teste manual (simula iOS)
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES ('[TESTE] Simulando iOS', 'Este aviso simula criação do app iOS', ARRAY['todos']::text[], CURRENT_DATE)
RETURNING id, titulo, created_at;

-- 6. AGUARDE 3 SEGUNDOS e verifique:

-- A) Logs do PostgreSQL
-- Dashboard > Database > Logs
-- Procure por: 🔵 TRIGGER INICIADO, 🟢 WEBHOOK CHAMADO

-- B) Logs da Edge Function
-- Dashboard > Edge Functions > send-push-notification > Logs
-- Deve aparecer: "Received push notification request"

-- C) Se ambos funcionarem, teste no app iOS!

-- 7. Ver últimos avisos criados
SELECT 
    id,
    titulo,
    mensagem,
    created_at,
    AGE(NOW(), created_at) as idade
FROM avisos
ORDER BY created_at DESC
LIMIT 5;
