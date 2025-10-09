-- Criar tabela de playlist Zoe
CREATE TABLE IF NOT EXISTS playlist_zoe (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    artista VARCHAR(255),
    link VARCHAR(500),
    duracao VARCHAR(20),
    ordem INTEGER,
    ativa BOOLEAN DEFAULT true,
    data_adicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    adicionado_por INTEGER REFERENCES members(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_playlist_zoe_ativa ON playlist_zoe(ativa);
CREATE INDEX IF NOT EXISTS idx_playlist_zoe_ordem ON playlist_zoe(ordem);
CREATE INDEX IF NOT EXISTS idx_playlist_zoe_data_adicao ON playlist_zoe(data_adicao);

-- Desabilitar RLS (para todos poderem visualizar)
ALTER TABLE playlist_zoe DISABLE ROW LEVEL SECURITY;

-- Ou se preferir com RLS (comentado):
-- ALTER TABLE playlist_zoe ENABLE ROW LEVEL SECURITY;
-- 
-- -- Todos podem ver músicas
-- CREATE POLICY "Todos podem ver playlist"
--     ON playlist_zoe
--     FOR SELECT
--     USING (true);
-- 
-- -- Apenas admins e louvor podem gerenciar
-- CREATE POLICY "Admins e louvor podem gerenciar playlist"
--     ON playlist_zoe
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM members 
--             WHERE id = (SELECT id FROM members LIMIT 1)
--             AND ('admin' = ANY(funcoes) OR 'louvor' = ANY(funcoes) OR 'líder de louvor' = ANY(funcoes))
--         )
--     );
