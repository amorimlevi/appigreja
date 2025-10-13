-- Primeiro, remover políticas antigas se existirem
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete" ON storage.objects;

-- Política de leitura (todos podem ver as fotos)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-photos');

-- Política de upload (todos autenticados podem fazer upload)
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-photos');

-- Política de update (todos autenticados podem atualizar)
CREATE POLICY "Authenticated can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'church-photos');

-- Política de delete (todos autenticados podem deletar)
CREATE POLICY "Authenticated can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'church-photos');
