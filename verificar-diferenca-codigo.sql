-- Verificar se há triggers ativos na tabela avisos

SELECT 
    t.tgname as trigger_name,
    t.tgenabled as habilitado,
    p.proname as funcao,
    CASE t.tgenabled
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESABILITADO'
        WHEN 'R' THEN '⚠️ REPLICA'
        WHEN 'A' THEN '⚠️ ALWAYS'
        ELSE '❓ DESCONHECIDO'
    END as status,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'  
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    END as evento
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'avisos'
AND NOT t.tgisinternal -- Excluir triggers internos
ORDER BY 
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 1  -- BEFORE primeiro
        ELSE 2  -- AFTER depois
    END,
    t.tgname;

-- Se houver múltiplos triggers AFTER INSERT, pode haver conflito!
-- Apenas um deve chamar a edge function
