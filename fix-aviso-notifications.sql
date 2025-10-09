-- Corrigir notificações de avisos que foram enviadas incorretamente
-- Este script remove notificações de membros que não deveriam ter recebido o aviso

-- 1. Primeiro, vamos limpar todas as notificações existentes
-- (CUIDADO: Isso vai remover TODAS as notificações existentes)
-- Descomente a linha abaixo se quiser fazer uma limpeza completa
-- DELETE FROM aviso_notifications;

-- 2. Função para recriar as notificações corretamente baseando-se nos destinatários do aviso
DO $$
DECLARE
    aviso_record RECORD;
    member_record RECORD;
BEGIN
    -- Para cada aviso
    FOR aviso_record IN SELECT * FROM avisos LOOP
        -- Remover notificações existentes deste aviso
        DELETE FROM aviso_notifications WHERE aviso_id = aviso_record.id;
        
        -- Se destinatários incluir 'todos'
        IF 'todos' = ANY(aviso_record.destinatarios) THEN
            -- Criar notificação para todos os membros
            INSERT INTO aviso_notifications (aviso_id, membro_id, lido)
            SELECT aviso_record.id, id, false
            FROM members;
        ELSE
            -- Criar notificação apenas para membros com as funções especificadas
            INSERT INTO aviso_notifications (aviso_id, membro_id, lido)
            SELECT DISTINCT aviso_record.id, m.id, false
            FROM members m
            WHERE EXISTS (
                SELECT 1
                FROM unnest(m.funcoes) AS funcao
                WHERE funcao = ANY(aviso_record.destinatarios)
            );
        END IF;
    END LOOP;
END $$;

-- 3. Verificar o resultado (consulta para debug)
-- Esta consulta mostra quantas notificações cada aviso tem
SELECT 
    a.id,
    a.titulo,
    a.destinatarios,
    COUNT(an.id) as total_notificacoes
FROM avisos a
LEFT JOIN aviso_notifications an ON a.id = an.aviso_id
GROUP BY a.id, a.titulo, a.destinatarios
ORDER BY a.data_envio DESC;
