-- Criar tabela de escalas de louvor
CREATE TABLE IF NOT EXISTS escalas_louvor (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('culto', 'ensaio')),
    data DATE NOT NULL,
    horario TIME NOT NULL,
    musicas JSONB DEFAULT '[]'::jsonb,
    observacoes TEXT,
    ministerio VARCHAR(50) DEFAULT 'louvor',
    criado_por INTEGER REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de músicos escalados por escala
CREATE TABLE IF NOT EXISTS escalas_louvor_musicos (
    id SERIAL PRIMARY KEY,
    escala_id INTEGER NOT NULL REFERENCES escalas_louvor(id) ON DELETE CASCADE,
    membro_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    instrumento VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(escala_id, instrumento)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_escalas_louvor_data ON escalas_louvor(data);
CREATE INDEX IF NOT EXISTS idx_escalas_louvor_tipo ON escalas_louvor(tipo);
CREATE INDEX IF NOT EXISTS idx_escalas_louvor_ministerio ON escalas_louvor(ministerio);
CREATE INDEX IF NOT EXISTS idx_escalas_louvor_musicos_escala ON escalas_louvor_musicos(escala_id);
CREATE INDEX IF NOT EXISTS idx_escalas_louvor_musicos_membro ON escalas_louvor_musicos(membro_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_escalas_louvor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_escalas_louvor_updated_at ON escalas_louvor;
CREATE TRIGGER trigger_update_escalas_louvor_updated_at
    BEFORE UPDATE ON escalas_louvor
    FOR EACH ROW
    EXECUTE FUNCTION update_escalas_louvor_updated_at();

-- Desabilitar RLS (para permitir acesso a todos os membros autenticados)
ALTER TABLE escalas_louvor DISABLE ROW LEVEL SECURITY;
ALTER TABLE escalas_louvor_musicos DISABLE ROW LEVEL SECURITY;

-- Ou se preferir com RLS (comentado):
-- ALTER TABLE escalas_louvor ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE escalas_louvor_musicos ENABLE ROW LEVEL SECURITY;
-- 
-- -- Todos podem ver escalas
-- CREATE POLICY "Todos podem ver escalas de louvor"
--     ON escalas_louvor
--     FOR SELECT
--     USING (true);
-- 
-- -- Apenas admins e louvor podem criar/editar escalas
-- CREATE POLICY "Admins e louvor podem gerenciar escalas"
--     ON escalas_louvor
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM members 
--             WHERE id = auth.uid()::integer
--             AND ('admin' = ANY(funcoes) OR 'louvor' = ANY(funcoes) OR 'líder de louvor' = ANY(funcoes) OR 'lider de louvor' = ANY(funcoes))
--         )
--     );
-- 
-- -- Todos podem ver músicos das escalas
-- CREATE POLICY "Todos podem ver músicos escalados"
--     ON escalas_louvor_musicos
--     FOR SELECT
--     USING (true);
-- 
-- -- Apenas admins e louvor podem gerenciar músicos das escalas
-- CREATE POLICY "Admins e louvor podem gerenciar músicos escalados"
--     ON escalas_louvor_musicos
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM members 
--             WHERE id = auth.uid()::integer
--             AND ('admin' = ANY(funcoes) OR 'louvor' = ANY(funcoes) OR 'líder de louvor' = ANY(funcoes) OR 'lider de louvor' = ANY(funcoes))
--         )
--     );
