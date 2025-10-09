-- Verificar as notificações existentes e comparar com os destinatários dos avisos
SELECT 
    a.id as aviso_id,
    a.titulo,
    a.destinatarios,
    m.id as membro_id,
    m.nome as membro_nome,
    m.funcoes as membro_funcoes,
    an.lido
FROM avisos a
JOIN aviso_notifications an ON a.id = an.aviso_id
JOIN members m ON an.membro_id = m.id
ORDER BY a.id, m.nome;

-- Verificar membros que receberam avisos de diaconia mas não têm a função
SELECT 
    a.id as aviso_id,
    a.titulo,
    a.destinatarios,
    m.id as membro_id,
    m.nome as membro_nome,
    m.funcoes as membro_funcoes
FROM avisos a
JOIN aviso_notifications an ON a.id = an.aviso_id
JOIN members m ON an.membro_id = m.id
WHERE 'diaconia' = ANY(a.destinatarios)
  AND NOT ('diaconia' = ANY(m.funcoes))
ORDER BY a.id, m.nome;
