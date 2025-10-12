-- Verificar e adicionar colunas faltantes na tabela workshops

-- Adicionar coluna permissao_inscricao se não existir
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS permissao_inscricao TEXT[] DEFAULT ARRAY['todos']::TEXT[];

-- Verificar estrutura da tabela workshops
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'workshops'
ORDER BY 
    ordinal_position;
