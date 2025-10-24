-- Deletar tokens iOS antigos para forçar geração de novos tokens
-- IMPORTANTE: Execute este SQL ANTES de reinstalar o app

-- 1. Ver tokens atuais
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 50) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;

-- 2. Deletar TODOS os tokens iOS (CUIDADO!)
-- Descomente a linha abaixo para executar:
-- DELETE FROM device_tokens WHERE platform = 'ios';

-- 3. Ou deletar apenas do membro específico (member 29):
-- DELETE FROM device_tokens WHERE platform = 'ios' AND member_id = 29;

-- 4. Verificar que foram deletados
SELECT COUNT(*) as remaining_ios_tokens
FROM device_tokens
WHERE platform = 'ios';
