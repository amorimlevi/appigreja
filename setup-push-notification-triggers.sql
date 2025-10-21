-- Criar função para enviar notificação push quando um novo aviso é criado
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
BEGIN
    -- Aqui você chamaria a Edge Function do Supabase para enviar push notifications
    -- Por enquanto, apenas inserimos na tabela de notificações pendentes
    INSERT INTO push_notifications_queue (
        type,
        title,
        body,
        data,
        created_at
    ) VALUES (
        'aviso',
        'Novo Aviso',
        NEW.titulo,
        jsonb_build_object('aviso_id', NEW.id, 'type', 'aviso'),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para enviar notificação push quando um novo evento é criado
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO push_notifications_queue (
        type,
        title,
        body,
        data,
        created_at
    ) VALUES (
        'evento',
        'Novo Evento',
        NEW.nome,
        jsonb_build_object('evento_id', NEW.id, 'type', 'evento'),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de fila de notificações push
CREATE TABLE IF NOT EXISTS push_notifications_queue (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Index para buscar notificações não enviadas
CREATE INDEX IF NOT EXISTS idx_push_queue_sent ON push_notifications_queue(sent) WHERE sent = FALSE;

-- RLS para a tabela de fila (apenas admins podem ver)
ALTER TABLE push_notifications_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view push queue"
    ON push_notifications_queue FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE email = auth.uid()::text 
            AND 'admin' = ANY(funcoes)
        )
    );

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
CREATE TRIGGER trigger_notify_new_aviso
    AFTER INSERT ON avisos
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_aviso();

DROP TRIGGER IF EXISTS trigger_notify_new_event ON events;
CREATE TRIGGER trigger_notify_new_event
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_event();

-- Comentário explicativo
COMMENT ON TABLE push_notifications_queue IS 'Fila de notificações push pendentes. Uma Edge Function deve processar esta tabela periodicamente e enviar as notificações.';
