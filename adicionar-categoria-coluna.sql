-- Adicionar coluna categoria à tabela ministry_schedules existente
ALTER TABLE ministry_schedules 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) CHECK (categoria IN ('culto', 'limpeza'));
