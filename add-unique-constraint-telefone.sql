-- Verificar se já existem telefones duplicados antes de adicionar constraint
SELECT telefone, COUNT(*) as count
FROM members
WHERE telefone IS NOT NULL AND telefone != ''
GROUP BY telefone
HAVING COUNT(*) > 1;

-- Se não houver duplicatas, adicione uma constraint única no telefone
-- (comente esta linha se a query acima retornar resultados)
-- ALTER TABLE members ADD CONSTRAINT members_telefone_unique UNIQUE (telefone);

-- Criar índice para melhorar performance de buscas por telefone
CREATE INDEX IF NOT EXISTS idx_members_telefone ON members(telefone);
