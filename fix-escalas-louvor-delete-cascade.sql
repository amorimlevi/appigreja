-- Adicionar CASCADE DELETE para escala_id na tabela escalas_louvor_musicos

-- Primeiro, remover a constraint existente
ALTER TABLE escalas_louvor_musicos
DROP CONSTRAINT IF EXISTS escalas_louvor_musicos_escala_id_fkey;

-- Adicionar a constraint com ON DELETE CASCADE
ALTER TABLE escalas_louvor_musicos
ADD CONSTRAINT escalas_louvor_musicos_escala_id_fkey
FOREIGN KEY (escala_id)
REFERENCES escalas_louvor(id)
ON DELETE CASCADE;
