-- Criar tabela ministry_schedules se não existir
CREATE TABLE IF NOT EXISTS ministry_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ministerio text NOT NULL,
    data date NOT NULL,
    horario time NOT NULL,
    tipo text NOT NULL DEFAULT 'culto',
    observacoes text,
    membros_ids integer[] DEFAULT ARRAY[]::integer[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE ministry_schedules ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem visualizar escalas" ON ministry_schedules;
DROP POLICY IF EXISTS "Membros autenticados podem gerenciar escalas" ON ministry_schedules;

-- Criar políticas
CREATE POLICY "Todos podem visualizar escalas"
    ON ministry_schedules FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Membros autenticados podem gerenciar escalas"
    ON ministry_schedules FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Criar índices
CREATE INDEX IF NOT EXISTS ministry_schedules_ministerio_idx ON ministry_schedules(ministerio);
CREATE INDEX IF NOT EXISTS ministry_schedules_data_idx ON ministry_schedules(data);
CREATE INDEX IF NOT EXISTS ministry_schedules_tipo_idx ON ministry_schedules(tipo);

-- Verificar estrutura final
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ministry_schedules'
ORDER BY ordinal_position;
