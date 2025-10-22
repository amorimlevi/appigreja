-- ============================================
-- Setup completo de triggers para notificações
-- ============================================

-- Habilitar extensão pg_net (necessária para fazer HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 1. TRIGGER PARA NOVOS AVISOS
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := '[REDACTED:jwt-token]';
BEGIN
    -- Enviar notificação para TODOS os membros
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'aviso',
            'title', 'Novo Aviso',
            'body', NEW.titulo,
            'data', jsonb_build_object('aviso_id', NEW.id, 'type', 'aviso')
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
CREATE TRIGGER trigger_notify_new_aviso
    AFTER INSERT ON avisos
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_aviso();

-- ============================================
-- 2. TRIGGER PARA NOVOS EVENTOS
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_evento()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := '[REDACTED:jwt-token]';
BEGIN
    -- Enviar notificação para TODOS os membros
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'evento',
            'title', 'Novo Evento',
            'body', NEW.nome,
            'data', jsonb_build_object('evento_id', NEW.id, 'type', 'evento')
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_evento ON events;
CREATE TRIGGER trigger_notify_new_evento
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_evento();

-- ============================================
-- 3. TRIGGER PARA NOVAS ESCALAS (COM FILTRO POR MINISTÉRIO)
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_escala()
RETURNS TRIGGER AS $$
DECLARE
    service_role_key text := '[REDACTED:jwt-token]';
    ministerio_nome text;
    notification_title text;
BEGIN
    -- Determinar nome do ministério para notificação
    ministerio_nome := COALESCE(NEW.ministerio, 'Ministério');
    
    CASE NEW.ministerio
        WHEN 'louvor' THEN
            notification_title := 'Nova Escala de Louvor';
        WHEN 'diaconia' THEN
            notification_title := 'Nova Escala de Diáconia';
        WHEN 'kids' THEN
            notification_title := 'Nova Escala de Professores Kids';
        WHEN 'jovens' THEN
            notification_title := 'Nova Escala de Jovens';
        ELSE
            notification_title := 'Nova Escala - ' || ministerio_nome;
    END CASE;
    
    -- Enviar notificação FILTRADA por ministério
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'type', 'escala',
            'ministerio', NEW.ministerio,
            'title', notification_title,
            'body', COALESCE(NEW.descricao, 'Confira sua nova escala'),
            'data', jsonb_build_object(
                'escala_id', NEW.id, 
                'type', 'escala',
                'ministerio', NEW.ministerio
            )
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_escala ON ministry_schedules;
CREATE TRIGGER trigger_notify_new_escala
    AFTER INSERT ON ministry_schedules
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_escala();

-- ============================================
-- Verificar triggers criados
-- ============================================

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
    'trigger_notify_new_aviso',
    'trigger_notify_new_evento', 
    'trigger_notify_new_escala'
)
ORDER BY event_object_table;
