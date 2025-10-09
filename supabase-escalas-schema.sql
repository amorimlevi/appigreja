-- Tabela de escalas de ministérios
CREATE TABLE IF NOT EXISTS ministry_schedules (
    id SERIAL PRIMARY KEY,
    ministerio VARCHAR(50) NOT NULL CHECK (ministerio IN ('diaconia', 'louvor', 'kids', 'jovens')),
    categoria VARCHAR(50) CHECK (categoria IN ('culto', 'limpeza')),
    data DATE NOT NULL,
    horario TIME,
    descricao TEXT,
    local VARCHAR(255),
    membros_ids UUID[] DEFAULT ARRAY[]::UUID[],
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_ministry_schedules_ministerio ON ministry_schedules(ministerio);
CREATE INDEX idx_ministry_schedules_data ON ministry_schedules(data);

-- RLS (Row Level Security) - Desabilitado pois autenticação é via tabela members, não via Supabase Auth
-- A filtragem por ministério será feita no frontend/service layer
ALTER TABLE ministry_schedules ENABLE ROW LEVEL SECURITY;

-- Política: Permitir acesso completo (filtro de ministério será feito na aplicação)
CREATE POLICY "Acesso completo para service role" ON ministry_schedules
    FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ministry_schedules_updated_at BEFORE UPDATE ON ministry_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
