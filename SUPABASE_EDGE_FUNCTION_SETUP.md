# Setup Supabase Edge Function para Push Notifications

## 1. Instalar Supabase CLI

```bash
brew install supabase/tap/supabase
```

## 2. Login no Supabase

```bash
supabase login
```

## 3. Link com seu projeto

```bash
supabase link --project-ref SEU_PROJECT_REF
```

Para encontrar o `project-ref`:
- Vá no Supabase Dashboard
- Settings > General > Reference ID

## 4. Deploy da Edge Function

```bash
cd /Users/user/appigreja
supabase functions deploy send-push-notifications
```

## 5. Configurar Secrets

### FCM Server Key

1. Vá no [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Settings (engrenagem) > Project Settings
4. Cloud Messaging tab
5. Copie a **Server Key**

Configure o secret:

```bash
supabase secrets set FCM_SERVER_KEY=sua_fcm_server_key_aqui
```

## 6. Configurar Cron Job (Automático)

Criar um Database Webhook que chama a função a cada minuto:

No Supabase Dashboard:
1. Database > Webhooks
2. Create new webhook
3. Configure:
   - Name: `send-push-notifications-cron`
   - Table: `push_notifications_queue`
   - Events: `INSERT`
   - HTTP Request:
     - Method: `POST`
     - URL: `https://SEU_PROJECT_REF.supabase.co/functions/v1/send-push-notifications`
     - Headers: 
       - `Authorization`: `Bearer SEU_ANON_KEY`

**Ou usar pg_cron (melhor):**

Execute no SQL Editor:

```sql
-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar execução a cada minuto
SELECT cron.schedule(
  'send-push-notifications',
  '* * * * *', -- A cada minuto
  $$
  SELECT net.http_post(
    url:='https://SEU_PROJECT_REF.supabase.co/functions/v1/send-push-notifications',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

## 7. Configurar Firebase Cloud Messaging

### Para Android:

1. Firebase Console > Adicionar app Android
2. Package name: `com.igreja.member`
3. Baixe `google-services.json`
4. Coloque em `android-member/app/google-services.json`

Adicione ao `android-member/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Adicione ao `android-member/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

### Para iOS (APNs):

1. Apple Developer > Certificates, Identifiers & Profiles
2. Keys > Create new key
3. Marque **Apple Push Notifications service (APNs)**
4. Baixe a chave `.p8`
5. No Firebase Console:
   - Project Settings > Cloud Messaging
   - Apple app configuration
   - Upload APNs Authentication Key
   - Key ID: (do arquivo .p8)
   - Team ID: (seu Apple Team ID)

## 8. Testar

### Testar manualmente a Edge Function:

```bash
curl -X POST \
  'https://SEU_PROJECT_REF.supabase.co/functions/v1/send-push-notifications' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### Testar criando um aviso:

1. Abra o app admin
2. Crie um novo aviso
3. Verifique se a notificação chega no app member

### Debug:

Ver logs da Edge Function:

```bash
supabase functions logs send-push-notifications
```

Ou no Dashboard: Functions > send-push-notifications > Logs

## 9. Verificar se está funcionando

Execute no Supabase SQL Editor:

```sql
-- Ver tokens salvos
SELECT * FROM device_tokens;

-- Ver notificações na fila
SELECT * FROM push_notifications_queue WHERE sent = false;

-- Ver notificações enviadas
SELECT * FROM push_notifications_queue WHERE sent = true ORDER BY sent_at DESC LIMIT 10;
```

## Troubleshooting

### Notificações não chegam no iOS:
- Certificado APNs configurado no Firebase?
- App rodando em dispositivo físico? (simulador não funciona)
- Push Notifications capability adicionada no Xcode?
- Apple Developer Account pago?

### Notificações não chegam no Android:
- `google-services.json` no lugar certo?
- Firebase configurado corretamente?
- Permissão aceita no dispositivo?

### Tokens não são salvos:
- App tem permissão para notificações?
- Rode `console.log` no `pushNotifications.js` para debug
- Verifique logs do dispositivo

### Edge Function não executa:
- FCM_SERVER_KEY configurado?
- Cron job ou webhook configurado?
- Verifique logs: `supabase functions logs send-push-notifications`
