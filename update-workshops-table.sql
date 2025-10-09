-- Atualizar tabela workshops para suportar oficinas do AdminApp
ALTER TABLE workshops 
  ADD COLUMN IF NOT EXISTS horario TEXT,
  ADD COLUMN IF NOT EXISTS inscritos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS permissao_inscricao TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Remover referência obrigatória a event_id (agora é opcional)
ALTER TABLE workshops 
  ALTER COLUMN event_id DROP NOT NULL;

-- Atualizar coluna data para aceitar apenas DATE se preferir separar data e horário
-- Ou manter TIMESTAMP e ajustar o código para combinar data + horario
