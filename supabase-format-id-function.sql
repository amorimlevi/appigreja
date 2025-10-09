-- Função para formatar IDs com 4 dígitos (0001, 0002...)
CREATE OR REPLACE FUNCTION format_id(id_value INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(id_value::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exemplo de uso:
-- SELECT id, format_id(id) as id_formatado, nome FROM members;
