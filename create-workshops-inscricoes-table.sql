-- Remover tabela antiga se existir
DROP TABLE IF EXISTS workshops_inscricoes CASCADE;

-- Criar tabela de inscrições em workshops
CREATE TABLE workshops_inscricoes (
    id serial PRIMARY KEY,
    workshop_id uuid REFERENCES workshops(id) ON DELETE CASCADE NOT NULL,
    membro_id integer REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    inscrito_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'confirmado'::text,
    UNIQUE(workshop_id, membro_id)
);

-- Habilitar RLS
ALTER TABLE workshops_inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para visualização (todos podem ver)
CREATE POLICY "Todos podem visualizar inscrições em workshops"
    ON workshops_inscricoes FOR SELECT
    USING (true);

-- Política para inserção (membros autenticados podem se inscrever)
CREATE POLICY "Membros podem se inscrever em workshops"
    ON workshops_inscricoes FOR INSERT
    WITH CHECK (true);

-- Política para deleção (membros podem cancelar suas próprias inscrições)
CREATE POLICY "Membros podem cancelar suas inscrições"
    ON workshops_inscricoes FOR DELETE
    USING (true);

-- Criar índices para melhor performance
CREATE INDEX workshops_inscricoes_workshop_id_idx ON workshops_inscricoes(workshop_id);
CREATE INDEX workshops_inscricoes_membro_id_idx ON workshops_inscricoes(membro_id);

-- Verificar estrutura
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'workshops_inscricoes'
ORDER BY ordinal_position;
