-- Verificar se realtime está habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'ministry_schedules';
