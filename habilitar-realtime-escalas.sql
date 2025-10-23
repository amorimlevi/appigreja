-- Habilitar Realtime para todas as tabelas importantes

-- Escalas de ministérios
ALTER PUBLICATION supabase_realtime ADD TABLE ministry_schedules;

-- Escalas de louvor
ALTER PUBLICATION supabase_realtime ADD TABLE escalas_louvor;
ALTER PUBLICATION supabase_realtime ADD TABLE escalas_louvor_musicos;

-- Eventos
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;

-- Avisos
ALTER PUBLICATION supabase_realtime ADD TABLE avisos;

-- Workshops
ALTER PUBLICATION supabase_realtime ADD TABLE workshops;
ALTER PUBLICATION supabase_realtime ADD TABLE workshops_inscricoes;

-- Membros e famílias
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE families;

-- Verificar se as tabelas foram adicionadas
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
