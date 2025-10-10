-- Verificar se há escalas na tabela
SELECT * FROM escalas_louvor ORDER BY data DESC;

-- Verificar músicos escalados
SELECT * FROM escalas_louvor_musicos;

-- Verificar funções do membro marcos
SELECT id, nome, funcoes FROM members WHERE nome ILIKE '%marcos%';
