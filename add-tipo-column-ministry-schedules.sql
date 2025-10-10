-- Verificar estrutura atual
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ministry_schedules'
ORDER BY ordinal_position;

-- Adicionar coluna tipo se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ministry_schedules' 
        AND column_name = 'tipo'
    ) THEN
        ALTER TABLE ministry_schedules ADD COLUMN tipo text NOT NULL DEFAULT 'culto';
    END IF;
END $$;

-- Criar índice na coluna tipo
CREATE INDEX IF NOT EXISTS ministry_schedules_tipo_idx ON ministry_schedules(tipo);

-- Verificar estrutura final
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ministry_schedules'
ORDER BY ordinal_position;
