-- Passo 1: Criar tabela de notificações de avisos
CREATE TABLE IF NOT EXISTS aviso_notifications (
    id SERIAL PRIMARY KEY,
    aviso_id INTEGER NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
    membro_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    lido BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aviso_id, membro_id)
);

-- Passo 2: Criar índices
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_aviso_id ON aviso_notifications(aviso_id);
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_membro_id ON aviso_notifications(membro_id);
CREATE INDEX IF NOT EXISTS idx_aviso_notifications_lido ON aviso_notifications(lido);

-- Passo 3: Habilitar RLS
ALTER TABLE aviso_notifications ENABLE ROW LEVEL SECURITY;

-- Passo 4: Criar políticas RLS
DROP POLICY IF EXISTS "Membros podem ver suas notificações" ON aviso_notifications;
CREATE POLICY "Membros podem ver suas notificações"
    ON aviso_notifications
    FOR SELECT
    USING (
        membro_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Membros podem atualizar suas notificações" ON aviso_notifications;
CREATE POLICY "Membros podem atualizar suas notificações"
    ON aviso_notifications
    FOR UPDATE
    USING (
        membro_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins podem gerenciar todas notificações" ON aviso_notifications;
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

-- Passo 5: Popular a tabela com notificações corretas baseadas nos avisos existentes
DO $$
DECLARE
    aviso_record RECORD;
BEGIN
    -- Para cada aviso existente
    FOR aviso_record IN SELECT * FROM avisos LOOP
        -- Se destinatários incluir 'todos'
        IF 'todos' = ANY(aviso_record.destinatarios) THEN
            -- Criar notificação para todos os membros
            INSERT INTO aviso_notifications (aviso_id, membro_id, lido)
            SELECT aviso_record.id, id, false
            FROM members
            ON CONFLICT (aviso_id, membro_id) DO NOTHING;
        ELSE
            -- Criar notificação apenas para membros com as funções especificadas
            INSERT INTO aviso_notifications (aviso_id, membro_id, lido)
            SELECT DISTINCT aviso_record.id, m.id, false
            FROM members m
            WHERE EXISTS (
                SELECT 1
                FROM unnest(m.funcoes) AS funcao
                WHERE funcao = ANY(aviso_record.destinatarios)
            )
            ON CONFLICT (aviso_id, membro_id) DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- Passo 6: Verificar o resultado
SELECT 
    a.id,
    a.titulo,
    a.destinatarios,
    COUNT(an.id) as total_notificacoes
FROM avisos a
LEFT JOIN aviso_notifications an ON a.id = an.aviso_id
GROUP BY a.id, a.titulo, a.destinatarios
ORDER BY a.data_envio DESC;
