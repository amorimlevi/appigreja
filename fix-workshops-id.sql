-- Script para alterar o ID da tabela workshops de UUID para INTEGER

-- 1. Remover a tabela workshop_registrations (depende de workshops)
DROP TABLE IF EXISTS workshop_registrations CASCADE;

-- 2. Remover a tabela workshops
DROP TABLE IF EXISTS workshops CASCADE;

-- 3. Recriar a tabela workshops com ID INTEGER
CREATE TABLE workshops (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    instrutor TEXT,
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT,
    vagas INTEGER,
    exige_cadastro BOOLEAN DEFAULT false,
    faixa_etaria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reiniciar sequência
ALTER SEQUENCE workshops_id_seq RESTART WITH 1;

-- 5. Recriar a tabela workshop_registrations
CREATE TABLE workshop_registrations (
    id SERIAL PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops(id) ON DELETE CASCADE,
    membro_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workshop_id, membro_id)
);

ALTER SEQUENCE workshop_registrations_id_seq RESTART WITH 1;

-- 6. Recriar índices
CREATE INDEX idx_workshops_event_id ON workshops(event_id);
CREATE INDEX idx_workshop_registrations_workshop_id ON workshop_registrations(workshop_id);

-- 7. Recriar trigger
CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Habilitar RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

-- 9. Recriar políticas para WORKSHOPS
CREATE POLICY "Todos podem ler workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar workshops" ON workshops
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar workshops" ON workshops
    FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar workshops" ON workshops
    FOR DELETE USING (true);

-- 10. Recriar políticas para WORKSHOP_REGISTRATIONS
CREATE POLICY "Todos podem ler inscrições" ON workshop_registrations
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar inscrições" ON workshop_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem deletar inscrições" ON workshop_registrations
    FOR DELETE USING (true);
