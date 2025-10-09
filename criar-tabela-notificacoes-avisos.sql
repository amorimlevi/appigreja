-- Criar tabela para rastrear avisos lidos por membros
CREATE TABLE IF NOT EXISTS aviso_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aviso_id UUID REFERENCES avisos(id) ON DELETE CASCADE,
    membro_id INT REFERENCES members(id) ON DELETE CASCADE,
    lido BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aviso_id, membro_id)
);

-- Índices para performance
CREATE INDEX idx_aviso_notifications_aviso_id ON aviso_notifications(aviso_id);
CREATE INDEX idx_aviso_notifications_membro_id ON aviso_notifications(membro_id);
CREATE INDEX idx_aviso_notifications_lido ON aviso_notifications(membro_id, lido);

-- Habilitar RLS
ALTER TABLE aviso_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Membros podem ver suas próprias notificações" ON aviso_notifications
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar notificações" ON aviso_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Membros podem atualizar suas notificações" ON aviso_notifications
    FOR UPDATE USING (true);

COMMENT ON TABLE aviso_notifications IS 'Rastreamento de avisos lidos por membros';
