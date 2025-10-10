-- Verificar se as tabelas de escalas existem
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name IN ('escalas_louvor', 'escalas_diaconia', 'escalas_louvor_musicos')
ORDER BY table_name;

-- Verificar estrutura das tabelas
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('escalas_louvor', 'escalas_diaconia')
ORDER BY table_name, ordinal_position;
