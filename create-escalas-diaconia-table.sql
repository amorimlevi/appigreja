-- Criar tabela de escalas de diaconia
CREATE TABLE IF NOT EXISTS escalas_diaconia (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    horario time NOT NULL,
    categoria text NOT NULL DEFAULT 'culto',
    observacoes text,
    membros_ids integer[] DEFAULT ARRAY[]::integer[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE escalas_diaconia ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem visualizar escalas de diaconia" ON escalas_diaconia;
DROP POLICY IF EXISTS "Líderes podem gerenciar escalas de diaconia" ON escalas_diaconia;

-- Criar políticas
CREATE POLICY "Todos podem visualizar escalas de diaconia"
    ON escalas_diaconia FOR SELECT
    USING (true);

CREATE POLICY "Líderes podem gerenciar escalas de diaconia"
    ON escalas_diaconia FOR ALL
    USING (true)
    WITH CHECK (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS escalas_diaconia_data_idx ON escalas_diaconia(data);
CREATE INDEX IF NOT EXISTS escalas_diaconia_categoria_idx ON escalas_diaconia(categoria);

-- Verificar estrutura final
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'escalas_diaconia'
ORDER BY ordinal_position;
