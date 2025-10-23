# 🚀 Deploy de Notificações Push - Método pelo Dashboard

## ✅ Sem precisar de Supabase CLI!

### Passo 1: Configurar Secret pelo Dashboard

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, vá em **Edge Functions**
4. Clique em **"Create a new function"**
5. Nome da função: `send-push-v1`
6. Copie o código do arquivo `supabase/functions/send-push-v1/index.ts`
7. Cole no editor
8. Clique em **"Deploy function"**

### Passo 2: Adicionar Secret

1. Ainda em **Edge Functions**, clique na função `send-push-v1`
2. Vá na aba **"Secrets"**
3. Clique em **"Add secret"**
4. Nome: `FIREBASE_SERVICE_ACCOUNT`
5. Valor: **Cole todo o conteúdo do arquivo JSON** que você baixou (em uma linha)

O valor deve ser exatamente isto (copie do seu arquivo):
```json
{"type":"service_account","project_id":"igreja-app-fe3db","private_key_id":"1e2396f4841ad7ea39437a0eedcdccd630eaaeb2","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCeB6qfIjAgHZcK\n12ssKYAVAAiANwbyCx2uuUT1YC3MIFZaR6rVrcYjjqyHNTpiW76MjkHI7Bpos7Vk\nMQPo/2+wlM5ktB18ckKFtW4d5qRfiMTGpT+XrlgskZtvMRN7Egm88RMlEdEJIUZK\ngri6YBbFNuqhZE1k1ZOUANI0vCpaibNnd634dPUn4m0XBelCHffNsYakHEM3MWX3\n6n5NjZu4ab5vq0cSBO+EZP6VDxCXXFHOYktCO0criuda1vMd0Q330c38a0i06LnF\nS6TTPu+EaAakRlof4RJIPlOgtv/yldWkmd8VEABxawiAsT/UmZ3DAR/kBrtpUhHY\nofMf/rc7AgMBAAECggEADfibiwoYux4ilmDJJtRccH7aQYub35Y//4x9njvskJlj\nSQQBBHcih047zpBUIxH9XKvPARZul0ccCEmVEOpUU4Y0YQ7TdIcdfni1zYrwiUms\nK+u8HYraXMZauY/bKwxDNCMUEDjtBCOe9UNtVXzdRn4+bBpUBVAkhfc0nljsXaif\nUJcB5OCi0LJaKAWIMBeFA84EznU8HO91j6PqXyOobQln4PAVN3ZpbrRC/xmFvt7D\nGR3z1K+0/XvEnLapUhWUQiuGskeji22pDgrbxawtkwZPNmUvtxeUgNPGqzofd0Yu\nOk5B3poirv1VGcJRzo65BrhAIomm0rPxGUaRjJyg4QKBgQDPraiQT2R2SURn/j7Q\nic47qQk3xFWl+fLdRPWsvaF5vYrj1kVcdhM/8EW/xrlx+ABHPySov/x+xRcG9iEw\nBP1wcQ48pefXpauiD3nxiD/Qujkqgs1TPh7p59Q1NwRynOe7TLX3R2h+Jp2aiVMP\nVDHFCfbthUjogZ7qgthtd1+F+QKBgQDCzLSVlHORogi62gz8XuWOk1YC23GrBFrK\nIXBEZJ8B3zgQfPIPY9jnSf7T6Oj6mHHH75pg6XqIi+MJ0P305zZ7sV3RlusarXOB\naR7Dy07cX3DFekOl7j/VeFmHLBIL5zySrZXH9AFo+C2oVC3fKjliPzablKesAf/d\nfqCo9BRj0wKBgQCFkWUGW2l7gifS0nxH1zmiuVbKXSXQt+7xTLbNQLEoATXgzyCR\nFQfQaZISg5clq6FSMVQ8jC2ywsPKoGY74hm2RaAodXOlCFJYyqddJooUjpDRvIqd\n7SgovAeJqjbcF/oaRn4J6g1UhTV7/LJE+5t+5KfBn6WClEtG/JyB2vK+0QKBgE6f\nNmeE0hw+TM21gjY9yuL/nmBq13bRvB8G3fwMrIyh3kvxUfVaNEoteFdpEtdJveqX\nTzS8J0ODSjBFFKrKwxerX5VfFybeSNc7aTpXDU4uiyJ5FWKcRVFQULoY1HPPcYg1\n3VUlq4gFWtAsoZMHxL9dihnDJuVqrS1llUx7rtsXAoGAQWkZghsY2vGY4YbdFPkJ\nXul0BKUDnreNGOmkL6ocNBYB+qqPjxmAxflZcSg8TNJAkO9G2G3dJDslZ94BU9AL\nU4v8yLwqKYHN41E+S572GTh2e5SeGoMSK+Er4DjB7O24N8XI+crzBdnpcjXWoQAb\nmy0TkDYkvqvHXTEwZyT0QD0=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@igreja-app-fe3db.iam.gserviceaccount.com","client_id":"102254327500191841864","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40igreja-app-fe3db.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

6. Clique em **"Save"**

### Passo 3: Habilitar pg_net

No **SQL Editor**, execute:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Passo 4: Configurar Variáveis do Banco

No **SQL Editor**, execute (substitua pelos seus valores):

```sql
-- URL do seu projeto (veja em Settings > API > Project URL)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://dvbdvftaklstyhpqznmu.supabase.co';

-- Service Role Key (veja em Settings > API > service_role - clique em "Reveal" para ver)
ALTER DATABASE postgres SET app.settings.service_role_key = 'SUA_SERVICE_ROLE_KEY_AQUI';
```

Para obter a Service Role Key:
1. Dashboard → **Settings** → **API**
2. Seção **Project API keys**
3. `service_role` → clique em **"Reveal"**
4. Copie a chave (começa com `eyJ...`)

### Passo 5: Criar o Trigger

No **SQL Editor**, cole e execute todo o conteúdo do arquivo: `trigger-push-fcm-v1.sql`

### Passo 6: Testar!

1. Crie um aviso no app Admin
2. A notificação deve chegar! 🔔

---

## 📋 Checklist

- [ ] Edge function `send-push-v1` criada
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` configurado
- [ ] Extensão `pg_net` habilitada
- [ ] Variáveis `supabase_url` e `service_role_key` configuradas
- [ ] Trigger `trigger_notify_new_aviso_v1` criado
- [ ] Testado com um aviso

---

**Comece pelo Passo 1**: Vá no Dashboard do Supabase → Edge Functions → Create function
