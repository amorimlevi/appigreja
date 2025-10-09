-- Habilitar RLS na tabela workshops
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (visualização) para todos
CREATE POLICY "Permitir visualização de workshops para todos"
ON workshops FOR SELECT
USING (true);

-- Política para permitir INSERT (criação) para todos usuários autenticados
CREATE POLICY "Permitir criação de workshops para autenticados"
ON workshops FOR INSERT
WITH CHECK (true);

-- Política para permitir UPDATE (edição) para todos usuários autenticados
CREATE POLICY "Permitir edição de workshops para autenticados"
ON workshops FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para permitir DELETE (deleção) para todos usuários autenticados
CREATE POLICY "Permitir deleção de workshops para autenticados"
ON workshops FOR DELETE
USING (true);

-- Mesmo para workshop_registrations
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir visualização de inscrições para todos"
ON workshop_registrations FOR SELECT
USING (true);

CREATE POLICY "Permitir criação de inscrições para autenticados"
ON workshop_registrations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir deleção de inscrições para autenticados"
ON workshop_registrations FOR DELETE
USING (true);
