-- Criar tabela de notificações de avisos
CREATE TABLE IF NOT EXISTS aviso_notifications (
    id SERIAL PRIMARY KEY,
    aviso_id INTEGER NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
    membro_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    lido BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aviso_id, membro_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_aviso_id ON aviso_notifications(aviso_id);
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_membro_id ON aviso_notifications(membro_id);
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_lido ON aviso_notifications(lido);

-- Habilitar RLS (Row Level Security)
ALTER TABLE aviso_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Membros podem ver apenas suas próprias notificações
CREATE POLICY "Membros podem ver suas notificações"
    ON aviso_notifications
    FOR SELECT
    USING (
        membro_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

-- Política: Membros podem atualizar apenas suas próprias notificações
CREATE POLICY "Membros podem atualizar suas notificações"
    ON aviso_notifications
    FOR UPDATE
    USING (
        membro_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

-- Política: Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar todas notificações"
    ON aviso_notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE user_id = auth.uid() 
            AND 'admin' = ANY(funcoes)
        )
    );
