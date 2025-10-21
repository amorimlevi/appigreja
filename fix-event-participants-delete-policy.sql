-- Adicionar política de DELETE para event_participants
CREATE POLICY "Todos podem deletar participantes" ON event_participants
    FOR DELETE USING (true);
