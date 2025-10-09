-- Adicionar política de DELETE para event_foods
CREATE POLICY "Todos podem deletar comidas" ON event_foods
    FOR DELETE USING (true);
