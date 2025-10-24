-- Verificar estrutura real da tabela avisos

-- Ver todas as colunas da tabela avisos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'avisos'
ORDER BY ordinal_position;

-- Ver um aviso exemplo para entender os campos
SELECT * FROM avisos ORDER BY created_at DESC LIMIT 1;
