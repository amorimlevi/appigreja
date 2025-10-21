-- Adicionar coluna 'quem_pode_se_inscrever' na tabela workshops se não existir

-- Verificar e adicionar coluna quem_pode_se_inscrever
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workshops' 
        AND column_name = 'quem_pode_se_inscrever'
    ) THEN
        ALTER TABLE workshops 
        ADD COLUMN quem_pode_se_inscrever TEXT[];
    END IF;
END $$;

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'workshops'
ORDER BY ordinal_position;
