# 🔔 Configurar Firebase Cloud Messaging API v1

## Passo 1: Baixar Service Account Key

1. Acesse o Firebase Console: https://console.firebase.google.com/
2. Selecione seu projeto "igreja app"
3. Clique na **engrenagem** ⚙️ → **Configurações do projeto**
4. Vá na aba **"Contas de serviço"**
5. Role para baixo e clique em **"Gerar nova chave privada"**
6. Confirme clicando em **"Gerar chave"**
7. Um arquivo JSON será baixado automaticamente (ex: `igreja-app-firebase-adminsdk-xxxxx.json`)
8. **Guarde este arquivo em local seguro!** 🔒

O arquivo terá este formato:
```json
{
  "type": "service_account",
  "project_id": "igreja-app-xxxxx",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...",
  "client_email": "firebase-adminsdk-xxxxx@igreja-app.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Passo 2: Instalar Supabase CLI

No terminal do Windows:

```bash
npm install -g supabase
```

Verifique a instalação:
```bash
supabase --version
```

## Passo 3: Login no Supabase CLI

```bash
supabase login
```

Um navegador vai abrir para você fazer login. Confirme e volte ao terminal.

## Passo 4: Link com seu projeto

```bash
cd c:/Projetos/appigreja
supabase link --project-ref SEU_PROJECT_REF
```

Para encontrar o PROJECT_REF:
- Dashboard do Supabase → Settings → General → Reference ID

## Passo 5: Configurar Secret

**Abra o arquivo JSON** que você baixou e **copie TODO o conteúdo** (incluindo as chaves).

Execute no terminal (substitua pelo conteúdo real):

```bash
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"igreja-app-xxxxx",...}'
```

**IMPORTANTE**: Cole todo o JSON em uma única linha, entre aspas simples.

## Passo 6: Deploy da Edge Function

A edge function já está criada em `supabase/functions/send-push-v1/index.ts`.

Execute:

```bash
supabase functions deploy send-push-v1
```

## Passo 7: Habilitar pg_net no Supabase

No SQL Editor do Supabase, execute:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## Passo 8: Configurar Variáveis no Banco

Execute no SQL Editor:

```sql
-- Substitua pela URL do seu projeto Supabase
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://seu-projeto.supabase.co';

-- Encontre no Dashboard > Settings > API > service_role key
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Passo 9: Criar Trigger Final

Execute o SQL do arquivo `trigger-push-fcm-v1.sql` no SQL Editor.

## Passo 10: Testar!

Crie um aviso no app admin e a notificação deve chegar! 🎉

---

**Problemas?** Ver seção de troubleshooting no final do arquivo.
