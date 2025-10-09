-- 1. Ver todos os avisos e seus destinatários
SELECT id, titulo, destinatarios 
FROM avisos 
ORDER BY id;

-- 2. Ver todas as notificações criadas
SELECT 
    an.id,
    an.aviso_id,
    a.titulo,
    a.destinatarios,
    an.membro_id,
    m.nome,
    m.funcoes
FROM aviso_notifications an
JOIN avisos a ON an.aviso_id = a.id
JOIN members m ON an.membro_id = m.id
ORDER BY an.aviso_id, m.nome;

-- 3. Ver especificamente notificações de avisos de diaconia para membros sem a função
SELECT 
    an.id,
    a.titulo,
    a.destinatarios,
    m.nome,
    m.funcoes,
    'ERRO: Membro não deveria receber este aviso' as status
FROM aviso_notifications an
JOIN avisos a ON an.aviso_id = a.id
JOIN members m ON an.membro_id = m.id
WHERE 'diaconia' = ANY(a.destinatarios)
  AND NOT ('todos' = ANY(a.destinatarios))
  AND NOT ('diaconia' = ANY(m.funcoes));
