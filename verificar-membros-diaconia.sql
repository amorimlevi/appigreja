-- Verificar todos os membros e suas funções
SELECT id, nome, funcoes
FROM members
ORDER BY nome;

-- Verificar especificamente membros com diaconia
SELECT id, nome, funcoes
FROM members
WHERE 
    'diaconia' = ANY(funcoes) OR
    'lider da diaconia' = ANY(funcoes) OR
    'líder da diaconia' = ANY(funcoes) OR
    'diácono' = ANY(funcoes);
