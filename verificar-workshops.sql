-- Verificar se existem workshops cadastrados
SELECT 
    id,
    nome,
    data,
    horario,
    local,
    vagas,
    inscritos,
    created_at
FROM workshops
ORDER BY created_at DESC;

-- Verificar estrutura da tabela workshops
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workshops' 
ORDER BY ordinal_position;
