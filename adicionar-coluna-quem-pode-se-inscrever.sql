-- Adicionar coluna quem_pode_se_inscrever à tabela workshops
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS quem_pode_se_inscrever text[] DEFAULT ARRAY['todos']::text[];

-- Atualizar workshops existentes para ter o valor padrão
UPDATE workshops 
SET quem_pode_se_inscrever = ARRAY['todos']::text[] 
WHERE quem_pode_se_inscrever IS NULL;

-- Verificar a estrutura da tabela
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'workshops'
ORDER BY ordinal_position;
