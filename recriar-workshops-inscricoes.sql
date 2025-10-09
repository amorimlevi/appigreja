-- Deletar a tabela antiga completamente
DROP TABLE IF EXISTS workshops_inscricoes CASCADE;

-- Recriar a tabela com os tipos corretos
CREATE TABLE workshops_inscricoes (
    id serial PRIMARY KEY,
    workshop_id uuid NOT NULL,
    membro_id integer NOT NULL,
    inscrito_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'confirmado'::text,
    UNIQUE(workshop_id, membro_id)
);

-- Adicionar foreign keys manualmente
ALTER TABLE workshops_inscricoes 
ADD CONSTRAINT workshops_inscricoes_workshop_id_fkey 
FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE;

ALTER TABLE workshops_inscricoes 
ADD CONSTRAINT workshops_inscricoes_membro_id_fkey 
FOREIGN KEY (membro_id) REFERENCES members(id) ON DELETE CASCADE;

-- Habilitar RLS
ALTER TABLE workshops_inscricoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem visualizar inscrições em workshops" ON workshops_inscricoes;
DROP POLICY IF EXISTS "Membros podem se inscrever em workshops" ON workshops_inscricoes;
DROP POLICY IF EXISTS "Membros podem cancelar suas inscrições" ON workshops_inscricoes;

-- Criar políticas
CREATE POLICY "Todos podem visualizar inscrições em workshops"
    ON workshops_inscricoes FOR SELECT
    USING (true);

CREATE POLICY "Membros podem se inscrever em workshops"
    ON workshops_inscricoes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Membros podem cancelar suas inscrições"
    ON workshops_inscricoes FOR DELETE
    USING (true);

-- Criar índices
CREATE INDEX workshops_inscricoes_workshop_id_idx ON workshops_inscricoes(workshop_id);
CREATE INDEX workshops_inscricoes_membro_id_idx ON workshops_inscricoes(membro_id);

-- Verificar estrutura final
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'workshops_inscricoes'
ORDER BY ordinal_position;
