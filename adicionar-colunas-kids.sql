-- Adicionar colunas para escalas de Kids na tabela ministry_schedules
ALTER TABLE ministry_schedules 
ADD COLUMN IF NOT EXISTS turmas TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE ministry_schedules 
ADD COLUMN IF NOT EXISTS professoresSelecionados UUID[] DEFAULT ARRAY[]::UUID[];

-- Comentário: turmas armazena as turmas selecionadas (Pequenos, Grandes)
-- professoresSelecionados armazena os IDs dos professores (duplicata de membros_ids para compatibilidade)
