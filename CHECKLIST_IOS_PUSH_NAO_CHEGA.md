# ✅ Checklist - Notificação iOS não aparece (mas log diz "enviado com sucesso")

## Problema
Os logs do Supabase mostram "Sent successfully to ios device", mas a notificação não aparece no iPhone.

## Causa Raiz
**O FCM pode aceitar a mensagem com sucesso, mas o APNS (Apple Push Notification Service) pode estar rejeitando silenciosamente** se:

1. ❌ **Certificado APNS não está configurado no Firebase Console**
2. ❌ **Certificado APNS está expirado**
3. ❌ **Usando certificado Development em app de Production (ou vice-versa)**
4. ❌ **Bundle ID não corresponde ao certificado**
5. ❌ **App está em foreground** (notificações não aparecem automaticamente)
6. ❌ **Permissões não foram concedidas**

---

## 🔧 Checklist de Diagnóstico

### 1️⃣ Verificar Firebase Console - Certificado APNS

**ESTE É O PROBLEMA MAIS COMUM!**

1. Acesse: https://console.firebase.google.com/project/igreja-app-fe3db/settings/cloudmessaging
2. Vá em **Cloud Messaging** > **Apple app configuration**
3. Verifique:
   - [ ] **APNs Authentication Key** ou **APNs Certificate** está configurado?
   - [ ] O **Team ID** está correto?
   - [ ] O **Key ID** está correto?
   - [ ] O certificado **não está expirado**?

**Se NÃO estiver configurado:**
```bash
# Você precisa fazer upload do certificado .p8 ou .p12 no Firebase Console
# Pegue a chave APNS da Apple Developer Console:
# https://developer.apple.com/account/resources/authkeys/list
```

### 2️⃣ Verificar Estado do App

**Notificações iOS só aparecem automaticamente quando:**
- [ ] App está **em background** (minimizado)
- [ ] App está **fechado** (não em execução)

**Se o app estiver aberto (foreground):**
- A notificação chega mas não exibe banner
- Você precisa lidar com `pushNotificationReceived` no código

**TESTE:**
1. Feche completamente o app (swipe up no app switcher)
2. Envie uma nova notificação
3. Verifique se aparece

### 3️⃣ Verificar Permissões no iPhone

```bash
# No iPhone:
Settings > Notifications > Igreja Member

Verifique:
- [ ] Allow Notifications está LIGADO
- [ ] Lock Screen está LIGADO
- [ ] Notification Center está LIGADO
- [ ] Banners está LIGADO
```

### 4️⃣ Verificar Entitlements (Development vs Production)

Arquivo: `ios-member/App/App/App.entitlements`

```xml
<key>aps-environment</key>
<string>development</string>  <!-- ou 'production' -->
```

**Regra:**
- **TestFlight / Debug**: use `development`
- **App Store**: use `production`

O certificado APNS no Firebase **DEVE** corresponder a este ambiente!

### 5️⃣ Verificar Token FCM está sendo salvo

```sql
-- No Supabase SQL Editor:
SELECT 
    id, 
    member_id, 
    platform, 
    LEFT(token, 40) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC
LIMIT 5;
```

**Verifique:**
- [ ] Token existe?
- [ ] Token tem mais de 100 caracteres? (tokens FCM são longos)
- [ ] Token foi atualizado recentemente?

### 6️⃣ Verificar Build do App

```bash
# Rebuild do app iOS com as configurações atualizadas
cd ios-member/App
npx cap sync
npx cap open ios

# No Xcode:
# 1. Clean Build Folder (Cmd + Shift + K)
# 2. Build novamente (Cmd + B)
# 3. Rode no dispositivo físico (não simulador)
```

⚠️ **IMPORTANTE**: Notificações push **NÃO funcionam no simulador iOS**! Você DEVE usar um dispositivo físico.

### 7️⃣ Verificar Bundle ID

Arquivo: `capacitor.config.member.json`
```json
"appId": "com.igreja.member"
```

Arquivo: `ios-member/App/App/GoogleService-Info.plist`
```xml
<key>BUNDLE_ID</key>
<string>com.igreja.member</string>
```

**Verifique:**
- [ ] Bundle IDs são **idênticos** em todos os lugares
- [ ] Certificado APNS foi criado para este Bundle ID exato

---

## 🎯 Solução Mais Provável

**90% dos casos: Certificado APNS não está configurado no Firebase Console**

### Passos para corrigir:

1. **Obter chave APNS da Apple:**
   - Acesse: https://developer.apple.com/account/resources/authkeys/list
   - Clique em "+" para criar uma nova chave
   - Selecione "Apple Push Notifications service (APNs)"
   - Baixe o arquivo `.p8`
   - **Salve o Key ID e Team ID** (você vai precisar)

2. **Configurar no Firebase Console:**
   - Vá para: https://console.firebase.google.com/project/igreja-app-fe3db/settings/cloudmessaging
   - Clique em "Upload APNs authentication key"
   - Faça upload do arquivo `.p8`
   - Insira o **Key ID** e **Team ID**
   - Salve

3. **Testar novamente:**
   - Feche o app completamente
   - Envie um novo aviso
   - A notificação deve aparecer! 🎉

---

## 📱 Como Testar

```bash
# 1. Rebuild e instale no iPhone físico
cd /Users/user/appigreja
npx cap sync -c capacitor.config.member.json
npx cap open ios -c capacitor.config.member.json

# 2. No Xcode, rode no dispositivo físico

# 3. Com o app aberto, verifique os logs do Xcode para ver:
# - "APNs token received"
# - "FCM Token: ..."
# - "FCM token sent to JS bridge"

# 4. FECHE o app completamente (swipe up)

# 5. No Supabase Dashboard, crie um novo aviso

# 6. A notificação deve aparecer na tela bloqueada do iPhone!
```

---

## 🐛 Debug Avançado

Se ainda não funcionar, verifique os logs do Firebase:

```bash
# No terminal do Xcode, procure por:
# - "APNs token received"
# - "FCM Token:"
# - Erros de APNS
```

E nos logs do Supabase Edge Function, verifique:
```bash
# Dashboard > Edge Functions > send-push-notifications > Logs
# Procure por erros específicos do APNS
```

---

## ✅ Configuração Atual (já aplicada)

- [x] Payload APNS com `alert`, `sound`, `badge`
- [x] `content-available: 1` e `mutable-content: 1`
- [x] PushNotifications plugin configurado com `presentationOptions`
- [x] AppDelegate com Firebase Messaging delegate
- [x] Token FCM sendo enviado para Supabase
- [x] Edge function enviando via FCM V1 API

---

## 🚨 Próximo Passo OBRIGATÓRIO

**Você DEVE verificar se o certificado APNS está configurado no Firebase Console.**

Sem o certificado APNS, o FCM não consegue enviar para o APNS, e as notificações nunca chegarão ao iPhone, mesmo que os logs digam "enviado com sucesso".
