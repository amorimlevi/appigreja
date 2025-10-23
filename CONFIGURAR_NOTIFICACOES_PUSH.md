# 🔔 Configurar Notificações Push para Avisos

## ❌ Problema Atual
Os avisos aparecem no app devido ao Realtime, mas as **notificações push não chegam** nos dispositivos Android.

## ✅ Solução Completa

### Passo 1: Obter a Server Key do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Cloud Messaging**
5. Copie a **Server Key** (ou crie uma nova chave)

### Passo 2: Configurar Edge Function no Supabase

1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Faça login:
```bash
supabase login
```

3. Link com seu projeto:
```bash
supabase link --project-ref SEU_PROJECT_REF
```

4. Configure a variável de ambiente FCM_SERVER_KEY:
   - Acesse o **Supabase Dashboard**
   - Vá em **Edge Functions** → **Secrets**
   - Adicione: `FCM_SERVER_KEY` = `sua_server_key_do_firebase`

5. Deploy da edge function:
```bash
cd c:/Projetos/appigreja
supabase functions deploy send-push-notification
```

### Passo 3: Habilitar pg_net Extension

No **SQL Editor** do Supabase, execute:

```sql
-- Habilitar extensão pg_net para fazer requests HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Passo 4: Configurar Trigger no Supabase

No **SQL Editor** do Supabase, execute o arquivo `criar-trigger-notificacao-avisos.sql`:

```sql
-- Cole todo o conteúdo do arquivo criar-trigger-notificacao-avisos.sql aqui
```

**IMPORTANTE**: Antes de executar, você precisa configurar as variáveis:

```sql
-- Substitua pelos seus valores reais
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://SEU_PROJETO.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Para encontrar a **service_role_key**:
1. Dashboard do Supabase
2. **Settings** → **API**
3. **Project API keys** → `service_role` (secret)

### Passo 5: Verificar google-services.json

Certifique-se de que o arquivo `android-member/app/google-services.json` existe e está correto:

```json
{
  "project_info": {
    "project_number": "SEU_PROJECT_NUMBER",
    "project_id": "SEU_PROJECT_ID",
    "storage_bucket": "..."
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "...",
        "android_client_info": {
          "package_name": "com.igreja.member"
        }
      }
    }
  ]
}
```

### Passo 6: Rebuild do App

```bash
# Build
npm run build:member

# Copy files
copy dist\index.member.html dist\index.html
copy capacitor.config.member.json capacitor.config.json

# Sync
npx cap copy android

# Incrementar versão
# Edite android-member/app/build.gradle
# versionCode 6
# versionName "1.0.5"

# Build AAB
cd android-member
.\gradlew.bat bundleRelease
```

### Passo 7: Testar

1. **Instale o novo APK** no dispositivo
2. **Faça login** no app member
3. **Verifique os logs** no logcat:
   ```bash
   adb logcat | findstr "Push"
   ```
4. **No dashboard admin**, crie um novo aviso
5. **A notificação deve chegar** no dispositivo!

## 🔍 Debug

### Verificar se o token foi salvo:
```sql
SELECT * FROM device_tokens ORDER BY created_at DESC LIMIT 10;
```

### Verificar se o trigger está funcionando:
```sql
-- Inserir aviso de teste
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio, autor)
VALUES ('Teste Push', 'Mensagem de teste', ARRAY['todos'], NOW(), 'Admin');

-- Ver logs do trigger
-- (no Supabase Dashboard > Database > Logs)
```

### Ver quantas notificações foram enviadas:
```sql
SELECT 
    a.titulo,
    a.destinatarios,
    COUNT(dt.token) as total_tokens
FROM avisos a
CROSS JOIN device_tokens dt
WHERE a.created_at > NOW() - INTERVAL '1 day'
GROUP BY a.id, a.titulo, a.destinatarios;
```

## 📱 Testando manualmente a Edge Function

```bash
curl -X POST 'https://SEU_PROJETO.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "tokens": ["DEVICE_TOKEN_AQUI"],
    "title": "Teste",
    "body": "Mensagem de teste",
    "data": {
      "type": "aviso"
    }
  }'
```

## ⚠️ Problemas Comuns

### 1. Notificação não chega
- ✅ Verifique se FCM_SERVER_KEY está configurada
- ✅ Verifique se google-services.json está correto
- ✅ Verifique se o device token foi salvo
- ✅ Verifique os logs da edge function

### 2. Trigger não dispara
- ✅ Verifique se pg_net está habilitado
- ✅ Verifique se as variáveis app.settings estão configuradas
- ✅ Veja os logs no Supabase Dashboard

### 3. Edge function retorna erro
- ✅ Verifique se FCM_SERVER_KEY é válida
- ✅ Verifique se o token do dispositivo não está expirado
- ✅ Veja os logs da edge function no Dashboard

## 🎯 Resultado Esperado

Quando um aviso for criado no admin:
1. ✅ O trigger é disparado
2. ✅ A edge function é chamada
3. ✅ FCM envia a notificação
4. ✅ O dispositivo recebe e exibe a notificação
5. ✅ O app abre na tela de avisos ao clicar
