-- Verificar tipo de id da tabela members
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' AND column_name = 'id';

-- Verificar tipo de id da tabela workshops
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workshops' AND column_name = 'id';
