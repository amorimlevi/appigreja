# Configuração de Push Notifications

Este guia explica como configurar push notifications para iOS e Android.

## ✅ O que já foi configurado

1. **Plugin instalado**: `@capacitor/push-notifications`
2. **Permissões configuradas**:
   - iOS: `UIBackgroundModes` com `remote-notification`
   - Android: `POST_NOTIFICATIONS` permission
3. **Código implementado**:
   - Serviço de push notifications (`src/services/pushNotifications.js`)
   - Integração no MemberApp
   - Tabela `device_tokens` no Supabase
   - Triggers para avisos e eventos

## 📱 Configuração iOS (Apple Push Notification Service - APNs)

### 1. Apple Developer Account

1. Acesse [Apple Developer](https://developer.apple.com)
2. Vá em **Certificates, Identifiers & Profiles**
3. Selecione **Keys** e crie uma nova chave:
   - Marque **Apple Push Notifications service (APNs)**
   - Baixe a chave `.p8`
   - Anote o **Key ID** e **Team ID**

### 2. Configurar no Xcode

1. Abra o projeto no Xcode (`ios-member/App/App.xcworkspace`)
2. Selecione o target do app
3. Vá em **Signing & Capabilities**
4. Clique em **+ Capability** e adicione:
   - **Push Notifications**
   - **Background Modes** (já deve estar configurado)
     - Marque **Remote notifications**

### 3. Configurar no Firebase (Recomendado)

O Firebase Cloud Messaging (FCM) facilita o envio de notificações:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Adicione seu app iOS
3. Baixe o `GoogleService-Info.plist`
4. Coloque em `ios-member/App/App/`
5. No Firebase, vá em **Project Settings > Cloud Messaging**
6. Faça upload da chave APNs `.p8`

## 🤖 Configuração Android (Firebase Cloud Messaging)

### 1. Firebase Console

1. No mesmo projeto Firebase, adicione um app Android
2. Use o package name: `com.igreja.member`
3. Baixe o `google-services.json`
4. Coloque em `android-member/app/`

### 2. Configurar gradle

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

## 🔔 Configurar Backend (Supabase Edge Function)

### 1. Executar SQLs no Supabase

Execute os seguintes arquivos SQL no Supabase SQL Editor:

```bash
# 1. Criar tabela de tokens
create-device-tokens-table.sql

# 2. Criar triggers e fila de notificações
setup-push-notification-triggers.sql
```

### 2. Criar Edge Function para enviar notificações

Crie uma Edge Function no Supabase que processa a fila:

```typescript
// supabase/functions/send-push-notifications/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { fcmServerKey } = await req.json()
  
  // Buscar notificações pendentes
  const { data: notifications } = await supabaseAdmin
    .from('push_notifications_queue')
    .select('*')
    .eq('sent', false)
    .limit(50)
  
  for (const notification of notifications) {
    // Buscar todos os tokens de dispositivos
    const { data: tokens } = await supabaseAdmin
      .from('device_tokens')
      .select('*')
    
    // Enviar para cada token
    for (const token of tokens) {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: token.token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: notification.data
        })
      })
    }
    
    // Marcar como enviada
    await supabaseAdmin
      .from('push_notifications_queue')
      .update({ sent: true, sent_at: new Date() })
      .eq('id', notification.id)
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 3. Agendar execução periódica

Configure um cron job (pode usar o Supabase Cron) para executar a Edge Function a cada minuto.

## 🧪 Testar

### iOS
1. Build e rode no dispositivo físico (simulador não suporta push)
2. Aceite as permissões quando solicitado
3. Crie um novo aviso no admin app
4. Verifique se a notificação chega

### Android
1. Build e rode no dispositivo (emulador com Google Play funciona)
2. Aceite as permissões
3. Crie um novo aviso/evento
4. Verifique a notificação

## 📝 Notas Importantes

- **iOS**: Push notifications só funcionam em dispositivos físicos
- **Certificados**: Mantenha as chaves APNs e FCM seguras
- **Teste**: Sempre teste em dispositivos reais antes de publicar
- **Background**: O app pode estar fechado e as notificações ainda chegam

## 🔐 Server Key do Firebase

Para obter a FCM Server Key:
1. Firebase Console > Project Settings
2. Cloud Messaging tab
3. Copie a **Server Key**
4. Configure como secret na Supabase Edge Function

## Sincronizar os apps

Após configurar tudo, sincronize os apps:

```bash
npm run cap:sync:member
npm run cap:sync:admin
```
