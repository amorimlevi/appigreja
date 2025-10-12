-- Script para habilitar Realtime nas tabelas do Supabase

-- Habilitar Realtime para avisos
ALTER PUBLICATION supabase_realtime ADD TABLE avisos;

-- Habilitar Realtime para events
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Habilitar Realtime para members
ALTER PUBLICATION supabase_realtime ADD TABLE members;

-- Habilitar Realtime para families
ALTER PUBLICATION supabase_realtime ADD TABLE families;

-- Habilitar Realtime para workshops
ALTER PUBLICATION supabase_realtime ADD TABLE workshops;

-- Habilitar Realtime para ministry_schedules
ALTER PUBLICATION supabase_realtime ADD TABLE ministry_schedules;

-- Habilitar Realtime para prayer_requests
ALTER PUBLICATION supabase_realtime ADD TABLE prayer_requests;

-- Habilitar Realtime para event_foods (para ver comidas em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE event_foods;

-- Habilitar Realtime para workshop_registrations (para ver inscrições em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_registrations;

-- Verificar tabelas habilitadas para Realtime
SELECT 
    schemaname, 
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    tablename;
