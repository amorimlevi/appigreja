-- Adicionar coluna 'inscritos' na tabela workshops se não existir

-- Verificar e adicionar coluna inscritos (número de vagas preenchidas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workshops' 
        AND column_name = 'inscritos'
    ) THEN
        ALTER TABLE workshops 
        ADD COLUMN inscritos INTEGER DEFAULT 0;
    END IF;
END $$;

-- Atualizar o valor de inscritos baseado nas inscrições existentes
UPDATE workshops w
SET inscritos = (
    SELECT COUNT(*)
    FROM workshop_registrations wr
    WHERE wr.workshop_id = w.id
);

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'workshops'
ORDER BY ordinal_position;
