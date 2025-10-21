# Guia: Atualizar Logo da Igreja (Manual)

## Passo 1: Upload da Logo no Supabase Storage

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Storage** → **church-logos**
3. Clique em **Upload file**
4. Selecione a imagem da logo (PNG, JPG, WEBP ou SVG - máx 5MB)
5. Após o upload, clique na imagem
6. Clique em **Copy URL** para copiar a URL pública

## Passo 2: Atualizar Configuração no Banco

Execute no SQL Editor do Supabase:

```sql
UPDATE church_settings 
SET setting_value = 'SUA_URL_AQUI'
WHERE setting_key = 'church_logo_url';
```

**Exemplo:**
```sql
UPDATE church_settings 
SET setting_value = 'https://seu-projeto.supabase.co/storage/v1/object/public/church-logos/logo-123456.png'
WHERE setting_key = 'church_logo_url';
```

## Passo 3: Verificar

Execute para confirmar:
```sql
SELECT * FROM church_settings WHERE setting_key = 'church_logo_url';
```

## Pronto!

A logo será atualizada automaticamente em:
- ✅ Tela de login do admin
- ✅ Tela de login do membro
- ✅ Dashboard do admin
- ✅ App membro

Não precisa fazer deploy ou recompilar - a mudança é imediata!
