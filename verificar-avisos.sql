-- Verificar todos os avisos na tabela
SELECT * FROM avisos ORDER BY data_envio DESC;

-- Verificar todas as notificações
SELECT * FROM aviso_notifications ORDER BY created_at DESC;

-- Contar avisos e notificações
SELECT 
    (SELECT COUNT(*) FROM avisos) as total_avisos,
    (SELECT COUNT(*) FROM aviso_notifications) as total_notificacoes;
