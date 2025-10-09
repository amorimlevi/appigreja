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

-- Passo 3: Popular a tabela com notificações corretas baseadas nos avisos existentes
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

-- Passo 4: Verificar o resultado
SELECT 
    a.id,
    a.titulo,
    a.destinatarios,
    COUNT(an.id) as total_notificacoes
FROM avisos a
LEFT JOIN aviso_notifications an ON a.id = an.aviso_id
GROUP BY a.id, a.titulo, a.destinatarios
ORDER BY a.data_envio DESC;
