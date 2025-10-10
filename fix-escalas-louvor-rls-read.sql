-- Habilitar RLS na tabela escalas_louvor
ALTER TABLE escalas_louvor ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura de escalas de louvor" ON escalas_louvor;
DROP POLICY IF EXISTS "Permitir inserção de escalas de louvor" ON escalas_louvor;
DROP POLICY IF EXISTS "Permitir atualização de escalas de louvor" ON escalas_louvor;
DROP POLICY IF EXISTS "Permitir exclusão de escalas de louvor" ON escalas_louvor;

-- Criar política de leitura (SELECT) - todos podem ler
CREATE POLICY "Permitir leitura de escalas de louvor"
ON escalas_louvor
FOR SELECT
TO authenticated
USING (true);

-- Criar política de inserção (INSERT) - todos autenticados podem inserir
CREATE POLICY "Permitir inserção de escalas de louvor"
ON escalas_louvor
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar política de atualização (UPDATE) - todos autenticados podem atualizar
CREATE POLICY "Permitir atualização de escalas de louvor"
ON escalas_louvor
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar política de exclusão (DELETE) - todos autenticados podem deletar
CREATE POLICY "Permitir exclusão de escalas de louvor"
ON escalas_louvor
FOR DELETE
TO authenticated
USING (true);

-- Habilitar RLS na tabela escalas_louvor_musicos
ALTER TABLE escalas_louvor_musicos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura de músicos de escalas" ON escalas_louvor_musicos;
DROP POLICY IF EXISTS "Permitir inserção de músicos de escalas" ON escalas_louvor_musicos;
DROP POLICY IF EXISTS "Permitir atualização de músicos de escalas" ON escalas_louvor_musicos;
DROP POLICY IF EXISTS "Permitir exclusão de músicos de escalas" ON escalas_louvor_musicos;

-- Criar políticas para escalas_louvor_musicos
CREATE POLICY "Permitir leitura de músicos de escalas"
ON escalas_louvor_musicos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de músicos de escalas"
ON escalas_louvor_musicos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de músicos de escalas"
ON escalas_louvor_musicos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir exclusão de músicos de escalas"
ON escalas_louvor_musicos
FOR DELETE
TO authenticated
USING (true);
