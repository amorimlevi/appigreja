-- Corrigir RLS da tabela push_notifications_queue
-- Permitir que qualquer usuário autenticado possa inserir notificações

-- Desabilitar RLS temporariamente para verificar
ALTER TABLE push_notifications_queue DISABLE ROW LEVEL SECURITY;

-- Ou criar política para permitir insert de usuários autenticados
-- ALTER TABLE push_notifications_queue ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON push_notifications_queue;

-- CREATE POLICY "Allow authenticated users to insert notifications"
-- ON push_notifications_queue
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- Verificar se a tabela existe e sua estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'push_notifications_queue';
