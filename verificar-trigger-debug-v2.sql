-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'avisos';

-- Verificar se a extensão pg_net está habilitada
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_net';

-- Ver todas as colunas da tabela _http_response
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'net' AND table_name = '_http_response';

-- Ver últimas requisições (sem especificar colunas ainda)
SELECT * FROM net._http_response ORDER BY id DESC LIMIT 5;
