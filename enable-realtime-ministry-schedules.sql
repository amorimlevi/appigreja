-- Habilitar realtime na tabela ministry_schedules
ALTER PUBLICATION supabase_realtime ADD TABLE ministry_schedules;

-- Verificar se está habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'ministry_schedules';
