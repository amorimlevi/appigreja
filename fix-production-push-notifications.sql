-- ============================================
-- FIX: Push Notifications para App Store
-- ============================================
-- Este script garante que notificações sejam enviadas
-- para todos os dispositivos (App Store e TestFlight)

-- 1. Verificar device tokens existentes
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 20) || '...' as token_preview,
    created_at,
    updated_at
FROM device_tokens
ORDER BY created_at DESC;

-- 2. Verificar se a extensão pg_net está habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 3. Verificar triggers ativos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%push%' OR trigger_name LIKE '%notif%'
ORDER BY event_object_table, trigger_name;

-- 4. Verificar a função do trigger
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%notify%' OR routine_name LIKE '%push%'
ORDER BY routine_name;
