-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'avisos';

-- Verificar se a extensão pg_net está habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Ver requisições HTTP feitas pelo pg_net (últimas 20)
SELECT 
    id,
    created,
    url,
    status_code,
    error_msg
FROM net._http_response
ORDER BY created DESC
LIMIT 20;
