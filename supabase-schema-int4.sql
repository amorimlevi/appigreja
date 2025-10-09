-- Schema SQL para Supabase - App Igreja
-- IDs com INTEGER (4 dígitos) em ordem crescente

-- Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS workshop_registrations CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS avisos CASCADE;
DROP TABLE IF EXISTS event_foods CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Tabela de Membros
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    nascimento DATE,
    idade INTEGER,
    genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro')),
    funcoes TEXT[] DEFAULT ARRAY['membro']::TEXT[],
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    familia TEXT,
    senha TEXT NOT NULL,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Definir sequência para começar em 1 (0001)
ALTER SEQUENCE members_id_seq RESTART WITH 1;

-- Tabela de Famílias
CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    membros_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER SEQUENCE families_id_seq RESTART WITH 1;

-- Tabela de Eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT,
    tipo TEXT DEFAULT 'evento' CHECK (tipo IN ('evento', 'oficina')),
    alimentacao BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER SEQUENCE events_id_seq RESTART WITH 1;

-- Tabela de Comidas dos Eventos
CREATE TABLE event_foods (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    responsavel TEXT,
    membro_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER SEQUENCE event_foods_id_seq RESTART WITH 1;

-- Tabela de Oficinas/Workshops
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

ALTER SEQUENCE workshops_id_seq RESTART WITH 1;

-- Tabela de Avisos
CREATE TABLE avisos (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    destinatarios TEXT[] DEFAULT ARRAY[]::TEXT[],
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    autor_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER SEQUENCE avisos_id_seq RESTART WITH 1;

-- Tabela de Pedidos de Oração
CREATE TABLE prayer_requests (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    solicitante_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'respondido', 'arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER SEQUENCE prayer_requests_id_seq RESTART WITH 1;

-- Tabela de Inscrições em Oficinas
CREATE TABLE workshop_registrations (
    id SERIAL PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops(id) ON DELETE CASCADE,
    membro_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workshop_id, membro_id)
);

ALTER SEQUENCE workshop_registrations_id_seq RESTART WITH 1;

-- Tabela de Participação em Eventos
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    membro_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    confirmado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, membro_id)
);

ALTER SEQUENCE event_participants_id_seq RESTART WITH 1;

-- Índices para melhor performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_familia ON members(familia);
CREATE INDEX idx_members_funcoes ON members USING GIN(funcoes);
CREATE INDEX idx_events_data ON events(data);
CREATE INDEX idx_events_tipo ON events(tipo);
CREATE INDEX idx_event_foods_event_id ON event_foods(event_id);
CREATE INDEX idx_workshops_event_id ON workshops(event_id);
CREATE INDEX idx_avisos_destinatarios ON avisos USING GIN(destinatarios);
CREATE INDEX idx_workshop_registrations_workshop_id ON workshop_registrations(workshop_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_foods_updated_at BEFORE UPDATE ON event_foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avisos_updated_at BEFORE UPDATE ON avisos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para MEMBERS
CREATE POLICY "Todos podem ler membros" ON members
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar membros" ON members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar membros" ON members
    FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar membros" ON members
    FOR DELETE USING (true);

-- Políticas para EVENTS
CREATE POLICY "Todos podem ler eventos" ON events
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar eventos" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar eventos" ON events
    FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar eventos" ON events
    FOR DELETE USING (true);

-- Políticas para FAMILIES
CREATE POLICY "Todos podem ler famílias" ON families
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar famílias" ON families
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar famílias" ON families
    FOR UPDATE USING (true);

-- Políticas para EVENT_FOODS
CREATE POLICY "Todos podem ler comidas" ON event_foods
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar comidas" ON event_foods
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar comidas" ON event_foods
    FOR UPDATE USING (true);

-- Políticas para WORKSHOPS
CREATE POLICY "Todos podem ler workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar workshops" ON workshops
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar workshops" ON workshops
    FOR UPDATE USING (true);

-- Políticas para AVISOS
CREATE POLICY "Todos podem ler avisos" ON avisos
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar avisos" ON avisos
    FOR INSERT WITH CHECK (true);

-- Políticas para PRAYER_REQUESTS
CREATE POLICY "Todos podem ler pedidos" ON prayer_requests
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar pedidos" ON prayer_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar pedidos" ON prayer_requests
    FOR UPDATE USING (true);

-- Políticas para WORKSHOP_REGISTRATIONS
CREATE POLICY "Todos podem ler inscrições" ON workshop_registrations
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar inscrições" ON workshop_registrations
    FOR INSERT WITH CHECK (true);

-- Políticas para EVENT_PARTICIPANTS
CREATE POLICY "Todos podem ler participantes" ON event_participants
    FOR SELECT USING (true);

CREATE POLICY "Todos podem criar participantes" ON event_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar participantes" ON event_participants
    FOR UPDATE USING (true);

-- Inserir dados de exemplo (opcional)
INSERT INTO members (nome, email, telefone, nascimento, genero, funcoes, senha) VALUES
    ('Levi Amorim', 'levi@igreja.com', '(11) 98765-4321', '1990-01-15', 'masculino', ARRAY['pastor', 'lider jovens'], 'senha123'),
    ('João da Silva', 'joao@igreja.com', '(11) 98765-4322', '1995-05-20', 'masculino', ARRAY['membro', 'jovem'], 'senha123'),
    ('Maria Santos', 'maria@igreja.com', '(11) 98765-4323', '1992-08-10', 'feminino', ARRAY['membro', 'louvor'], 'senha123');

-- Comentários nas tabelas para documentação
COMMENT ON TABLE members IS 'Tabela de membros da igreja';
COMMENT ON TABLE families IS 'Tabela de famílias';
COMMENT ON TABLE events IS 'Tabela de eventos e cultos';
COMMENT ON TABLE event_foods IS 'Comidas para eventos';
COMMENT ON TABLE workshops IS 'Oficinas e workshops';
COMMENT ON TABLE avisos IS 'Avisos e comunicados';
COMMENT ON TABLE prayer_requests IS 'Pedidos de oração';
COMMENT ON TABLE workshop_registrations IS 'Inscrições em oficinas';
COMMENT ON TABLE event_participants IS 'Participantes de eventos';
