-- Debug: Por que trigger não dispara do app iOS?

-- 1. Ver avisos criados recentemente (últimos 10 minutos)
SELECT 
    id,
    titulo,
    mensagem,
    autor_id,
    created_at,
    AGE(NOW(), created_at) as idade,
    CASE 
        WHEN titulo LIKE '%TESTE%' THEN '🧪 TESTE SQL'
        WHEN titulo LIKE '%iOS%' OR titulo LIKE '%Simulando%' THEN '🧪 TESTE SQL'
        ELSE '📱 APP iOS'
    END as origem
FROM avisos
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- 2. Comparar estrutura: avisos do SQL vs avisos do iOS
-- Execute ANTES de criar aviso no iOS, depois compare
WITH ultimos_avisos AS (
    SELECT 
        id,
        titulo,
        mensagem,
        destinatarios,
        data_envio,
        autor_id,
        created_at,
        updated_at,
        pg_typeof(destinatarios) as tipo_dest,
        pg_typeof(data_envio) as tipo_data,
        -- Ver todos os campos
        *
    FROM avisos
    ORDER BY created_at DESC
    LIMIT 5
)
SELECT * FROM ultimos_avisos;

-- 3. Verificar se há triggers diferentes para operações diferentes
SELECT 
    tgname,
    tgtype,
    tgenabled,
    CASE 
        WHEN tgtype & 1 = 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END as nivel,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        WHEN tgtype & 32 = 32 THEN 'TRUNCATE'
    END as operation
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'avisos'
ORDER BY tgname;

-- 4. Criar trigger de LOG para capturar TODAS as inserções
CREATE OR REPLACE FUNCTION log_all_avisos_inserts()
RETURNS TRIGGER AS $$
BEGIN
    RAISE WARNING '🚨 AVISO INSERIDO: ID=%, Titulo=%, Origem=%, User=%', 
        NEW.id, NEW.titulo, current_setting('application_name', true), current_user;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de LOG (roda ANTES do trigger principal)
DROP TRIGGER IF EXISTS log_avisos_insert ON avisos;
CREATE TRIGGER log_avisos_insert
BEFORE INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION log_all_avisos_inserts();

-- 5. Agora crie um aviso do iOS e depois execute:
-- Dashboard > Database > Logs
-- Procure por "🚨 AVISO INSERIDO"

-- Se aparecer 🚨 mas NÃO aparecer 🔵 do trigger principal:
-- → O trigger notify_new_aviso está falhando silenciosamente

-- Se NÃO aparecer nem o 🚨:
-- → O aviso não está sendo inserido via INSERT normal
-- → Pode estar usando stored procedure ou RPC

-- 6. Verificar se há funções/RPCs customizadas
SELECT 
    p.proname as nome_funcao,
    pg_get_functiondef(p.oid) as definicao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname ILIKE '%aviso%'
AND p.prokind = 'f' -- Apenas funções normais (não triggers)
ORDER BY p.proname;
