-- Verificar funções completas do membro marcos
SELECT 
    id, 
    nome, 
    funcoes,
    unnest(funcoes) as funcao_individual
FROM members 
WHERE nome ILIKE '%marcos%';
