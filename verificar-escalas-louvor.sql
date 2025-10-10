-- Verificar escalas de louvor
SELECT * FROM escalas_louvor ORDER BY data DESC;

-- Verificar músicos escalados
SELECT 
    el.*,
    elm.instrumento,
    m.nome as musico_nome
FROM escalas_louvor el
LEFT JOIN escalas_louvor_musicos elm ON el.id = elm.escala_id
LEFT JOIN members m ON elm.membro_id = m.id
ORDER BY el.data DESC;

-- Verificar membros com função de louvor
SELECT id, nome, funcoes 
FROM members 
WHERE 
    'louvor' = ANY(funcoes) OR 
    'líder de louvor' = ANY(funcoes) OR
    'lider de louvor' = ANY(funcoes);
