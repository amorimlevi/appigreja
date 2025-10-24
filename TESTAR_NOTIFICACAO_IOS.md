# 📱 Como Testar Notificações iOS Corretamente

## ✅ Mudanças Aplicadas

1. **Payload APNS completo** com `alert`, `sound`, `badge`, `content-available`
2. **PushNotifications plugin** configurado com `presentationOptions`
3. **Tratamento de notificação em foreground** (mostra alert se app está aberto)
4. **Certificados APNS** configurados no Firebase (dev + production)

---

## 🧪 Cenários de Teste

### 1️⃣ **App ABERTO (Foreground)**
**O que acontece:**
- ✅ Notificação chega
- ✅ `pushNotificationReceived` é chamado
- ✅ Mostra um **alert** com título e corpo
- ❌ **NÃO** mostra banner na tela

**Como testar:**
```bash
# 1. Abra o Xcode
open ios-member/App/App.xcworkspace

# 2. Rode no dispositivo físico (não simulador!)

# 3. Com o app aberto, crie um novo aviso no dashboard

# 4. Você verá um ALERT com a mensagem (não um banner)
```

### 2️⃣ **App MINIMIZADO (Background)**
**O que acontece:**
- ✅ Notificação chega
- ✅ Mostra **banner** na tela
- ✅ Mostra na **Central de Notificações**
- ✅ Aparece na **tela bloqueada**
- ✅ Reproduz **som**
- ✅ Atualiza **badge** do ícone

**Como testar:**
```bash
# 1. Rode o app no iPhone

# 2. MINIMIZE o app (botão Home ou gesto de home)
#    O app fica no app switcher mas não está visível

# 3. Crie um novo aviso no dashboard

# 4. Você verá o BANNER aparecer na tela! 🎉
```

### 3️⃣ **App FECHADO (Terminated)**
**O que acontece:**
- ✅ Notificação chega
- ✅ Mostra **banner** na tela
- ✅ Mostra na **Central de Notificações**
- ✅ Aparece na **tela bloqueada**
- ✅ Reproduz **som**
- ✅ Quando clicar, o app abre

**Como testar:**
```bash
# 1. Rode o app no iPhone

# 2. FECHE COMPLETAMENTE:
#    - Gesto de home (swipe up do bottom)
#    - App switcher aparece
#    - Swipe UP no app para fechar

# 3. Verifique que o app NÃO está no app switcher

# 4. Crie um novo aviso no dashboard

# 5. Você verá o BANNER aparecer na tela! 🎉

# 6. Clique na notificação para abrir o app
```

---

## 🔍 Como Verificar se Funcionou

### No iPhone:

1. **Banner apareceu na tela?** ✅
2. **Tocou o som?** ✅
3. **Badge apareceu no ícone?** ✅
4. **Notificação está na Central de Notificações?** ✅

### Nos Logs do Xcode:

```
📱 APNs token received
🔑 FCM Token: [token longo]
📤 Sending FCM token to Capacitor
✅ FCM token sent to JS bridge
💾 Saving FCM token to Supabase...
✅ New device token saved successfully!

// Quando notificação chegar:
📬 Push notification received: { ... }
```

### Nos Logs do Supabase:

```
Found 3 device tokens (iOS: 1, Android: 2)
✅ Notification sent successfully to ios device (member 29)
Summary: 3 notifications sent successfully
```

---

## ⚠️ Problemas Comuns

### ❌ "Notificação não aparece" (app aberto)
**Solução:** Isso é normal! No iOS, notificações não aparecem como banner quando o app está aberto. Você verá um **alert** em vez disso.

### ❌ "Notificação não aparece" (app fechado)
**Verifique:**
1. App foi fechado COMPLETAMENTE? (não apenas minimizado)
2. Permissões estão habilitadas? (Settings > Notifications > Igreja Member)
3. "Do Not Disturb" está desligado?
4. O token foi salvo no Supabase? (verifique device_tokens table)

### ❌ "Token não está sendo salvo"
**Verifique os logs do Xcode:**
```
# Deve aparecer:
🔑 FCM Token: ...
📤 Sending FCM token to Capacitor
✅ FCM token sent to JS bridge
💾 Saving token to Supabase...
✅ New device token saved successfully!

# Se aparecer erro:
❌ Error saving device token: ...
```

### ❌ "Push registration failed"
**Possíveis causas:**
1. App não está assinado com perfil de desenvolvimento correto
2. Entitlements não tem `aps-environment`
3. Dispositivo não está conectado à internet
4. Simulador (push não funciona no simulador!)

---

## 🎯 Passo a Passo Completo

```bash
# 1. Abrir Xcode
cd /Users/user/appigreja
open ios-member/App/App.xcworkspace

# 2. No Xcode:
# - Selecione seu iPhone físico como destino
# - Clique em "Run" (Cmd + R)

# 3. Quando o app abrir no iPhone:
# - Faça login como membro
# - Aceite as permissões de notificação
# - Verifique os logs do Xcode para ver o FCM token

# 4. FECHE o app completamente:
# - Swipe up do bottom para o app switcher
# - Swipe up no Igreja Member para fechá-lo

# 5. No Supabase Dashboard:
# - Vá em "Avisos"
# - Crie um novo aviso
# - Clique em "Adicionar Aviso"

# 6. Olhe para o iPhone:
# - O banner deve aparecer em 1-5 segundos! 🎉
```

---

## 📊 Verificar Logs em Tempo Real

### No Xcode Console (enquanto o app está rodando):
```bash
# Filtrar apenas logs de push:
# Na barra de busca do console, digite: "FCM" ou "Push" ou "📬"
```

### No Supabase Dashboard:
```bash
# 1. Edge Functions > send-push-notifications > Logs
# 2. Procure por:
#    - "Found X device tokens"
#    - "Sent successfully to ios device"
```

### No Supabase SQL Editor:
```sql
-- Ver tokens salvos
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 40) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;

-- Ver notificações enviadas
SELECT *
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist Final

Antes de testar:
- [ ] App rodando no **dispositivo físico** (não simulador)
- [ ] Permissões de notificação **aceitas** no iPhone
- [ ] Token FCM **salvo** no Supabase (verifique device_tokens)
- [ ] Certificado APNS **configurado** no Firebase Console
- [ ] App **fechado completamente** (não apenas minimizado)
- [ ] Do Not Disturb **desligado**

Se TUDO acima estiver correto, a notificação **DEVE** aparecer! 🚀
