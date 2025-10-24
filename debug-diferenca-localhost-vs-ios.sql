-- Descobrir diferença entre avisos criados pelo localhost vs iOS

-- 1. Ver últimos avisos criados e seus campos
SELECT 
    id,
    titulo,
    mensagem,
    destinatarios,
    data_envio,
    autor_id,
    created_at,
    updated_at,
    -- Ver se há diferença no autor ou origem
    CASE 
        WHEN autor_id IS NULL THEN '⚠️ SEM AUTOR'
        ELSE '✅ COM AUTOR'
    END as tem_autor
FROM avisos
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver se avisos do iOS têm autor_id diferente
SELECT 
    autor_id,
    COUNT(*) as quantidade,
    MIN(created_at) as primeiro,
    MAX(created_at) as ultimo
FROM avisos
GROUP BY autor_id
ORDER BY ultimo DESC;

-- 3. Verificar se trigger está ativo
SELECT 
    tgname as trigger_name,
    tgenabled as status,
    CASE tgenabled
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESABILITADO'
        ELSE '⚠️ OUTRO'
    END as status_texto
FROM pg_trigger
WHERE tgname = 'trigger_notify_new_aviso';

-- 4. Ver logs do PostgreSQL (se disponível)
-- Procure por "Trigger notify_new_aviso disparado"
-- Dashboard > Database > Logs

-- 5. Comparar campos entre aviso localhost vs iOS
-- Execute após criar um aviso de cada:
SELECT 
    id,
    titulo,
    mensagem,
    destinatarios::text,
    data_envio,
    autor_id,
    pg_typeof(destinatarios) as tipo_destinatarios,
    pg_typeof(data_envio) as tipo_data_envio,
    created_at
FROM avisos
ORDER BY created_at DESC
LIMIT 5;
