-- Apenas Políticas RLS - Execute este arquivo se as tabelas já existem

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Eventos são públicos" ON events;
DROP POLICY IF EXISTS "Membros autenticados podem ver membros" ON members;
DROP POLICY IF EXISTS "Membros podem atualizar seus dados" ON members;
DROP POLICY IF EXISTS "Avisos são públicos" ON avisos;
DROP POLICY IF EXISTS "Workshops são públicos" ON workshops;
DROP POLICY IF EXISTS "Famílias são públicas" ON families;

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
