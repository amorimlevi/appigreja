# 🎯 Passo a Passo para Corrigir Notificações iOS

## O Problema
Você está rodando do **Xcode em modo Production**, mas o token FCM foi gerado com certificado **Development**. Por isso o APNS rejeita silenciosamente.

## ✅ Solução (5 minutos)

### Passo 1: Deletar tokens antigos (OBRIGATÓRIO)

```sql
-- Execute no Supabase SQL Editor:
DELETE FROM device_tokens WHERE platform = 'ios' AND member_id = 29;
```

Ou use: `deletar-tokens-ios-antigos.sql`

**Por quê?** Os tokens atuais foram gerados com `aps-environment: development`. Precisamos gerar novos com `production`.

---

### Passo 2: Rebuild do app no Xcode

```bash
# No Xcode:
# 1. Product > Clean Build Folder (Cmd + Shift + K)
# 2. Product > Build (Cmd + B)
```

**O que mudou:** `App.entitlements` agora usa `production` em vez de `development`.

---

### Passo 3: Delete e reinstale o app

```bash
# No iPhone:
# 1. Pressione e segure o ícone do "Igreja Member"
# 2. Toque em "Remove App" > "Delete App"

# No Xcode:
# 3. Clique em "Run" (Cmd + R) para instalar novamente
```

**Por quê?** Garantir que o app será reinstalado com o novo entitlements e gerar um novo token FCM.

---

### Passo 4: Faça login e verifique os logs

```bash
# No Xcode, abra o Console (Cmd + Shift + Y)
# Filtre por: "FCM" ou "Token" ou "📱"

# Deve aparecer:
📱 APNs token received
🔑 FCM Token: [novo token longo]
📤 Sending FCM token to Capacitor
✅ FCM token sent to JS bridge
💾 Saving FCM token to Supabase...
✅ New device token saved successfully!
```

**Verifique no Supabase SQL Editor:**
```sql
SELECT 
    id, 
    member_id, 
    platform,
    LEFT(token, 50) as token_start,
    created_at
FROM device_tokens
WHERE platform = 'ios' AND member_id = 29
ORDER BY created_at DESC;
```

Deve mostrar um **novo token** criado **agora**.

---

### Passo 5: FECHE o app completamente

```bash
# No iPhone:
# 1. Swipe up do bottom (gesto de home)
# 2. App switcher aparece
# 3. Swipe UP no "Igreja Member" para fechar
# 4. Verifique que o app NÃO está no app switcher
```

**IMPORTANTE:** Notificações iOS **NÃO aparecem automaticamente** quando o app está aberto (foreground). Você DEVE fechar o app para ver o banner.

---

### Passo 6: Envie uma notificação

```bash
# No Supabase Dashboard:
# 1. Vá na tabela "avisos"
# 2. Crie um novo aviso:
#    - Título: "TESTE iOS Push"
#    - Descrição: "Se você viu este banner, funcionou! 🎉"
# 3. Clique em "Save"
```

Ou execute o SQL:
```sql
-- test-ios-push-detailed.sql
INSERT INTO avisos (titulo, descricao, igreja_id)
VALUES ('TESTE iOS', 'Funcionou! 🎉', 1);
```

---

### Passo 7: Aguarde a notificação!

```bash
# Aguarde 2-5 segundos...
# O banner DEVE aparecer no iPhone! 🎉
```

**Se aparecer:** ✅ **SUCESSO!** Está funcionando!

**Se não aparecer:** Vá para "Debug Avançado" abaixo.

---

## 🐛 Debug Avançado

### Verificar logs do Supabase Edge Function

```bash
# Dashboard > Edge Functions > send-push-notifications > Logs
# Procure por:

✅ Notification sent successfully to ios device (member 29)
   FCM Response: {"name":"projects/igreja-app-fe3db/messages/..."}
```

**Se mostrar erro:** Anote a mensagem de erro completa.

**Erros comuns:**
- `INVALID_ARGUMENT`: Token inválido → Volte ao Passo 1
- `UNREGISTERED`: Token expirado → Volte ao Passo 1
- `SENDER_ID_MISMATCH`: Firebase errado → Verifique GoogleService-Info.plist

### Verificar permissões no iPhone

```bash
# Settings > Notifications > Igreja Member

Verifique:
✅ Allow Notifications = ON
✅ Lock Screen = ON
✅ Notification Center = ON
✅ Banners = ON
✅ Sounds = ON
✅ Badges = ON
```

### Verificar "Do Not Disturb"

```bash
# Control Center (swipe down from top-right)
# Verifique se "Focus" ou "Do Not Disturb" está DESLIGADO
```

### Testar manualmente via Firebase Console

```bash
# 1. Acesse: https://console.firebase.google.com/project/igreja-app-fe3db/notification
# 2. Clique em "Send your first message"
# 3. Notification title: "Teste Manual"
# 4. Notification text: "Teste via Firebase Console"
# 5. Clique em "Send test message"
# 6. Cole o token FCM do device_tokens
# 7. Clique em "Test"

# Se NÃO aparecer mesmo assim:
# → Problema é no Firebase/APNS, não no nosso código!
```

---

## 📊 Verificações Finais

### ✅ Checklist - Tudo deve estar assim:

- [x] `App.entitlements` → `aps-environment: production`
- [x] Firebase Console → Certificado **Production** configurado
- [x] Tokens antigos deletados
- [x] App reinstalado do Xcode
- [x] Novo token FCM gerado e salvo
- [x] App fechado completamente (não em foreground)
- [x] Permissões habilitadas no iPhone
- [x] Do Not Disturb desligado

Se **TUDO** acima estiver correto, a notificação **DEVE** aparecer!

---

## 🎉 Resultado Esperado

```
+----------------------------------+
|  TESTE iOS Push             [x]  |
|  Se você viu este banner,        |
|  funcionou! 🎉                   |
|                                  |
|  Igreja Member          agora    |
+----------------------------------+
```

Banner deve aparecer na tela do iPhone com **som** e **badge**! 🚀

---

## 💡 Dica Final

Se ainda assim não funcionar após seguir TODOS os passos:

1. **Capture logs completos do Xcode** (todo o console)
2. **Capture logs do Supabase Edge Function** (últimas 20 linhas)
3. **Execute este SQL e mostre o resultado:**

```sql
SELECT 
    d.id,
    d.member_id,
    d.platform,
    LEFT(d.token, 60) as token_start,
    d.created_at,
    m.nome as member_name
FROM device_tokens d
JOIN members m ON m.id = d.member_id
WHERE d.platform = 'ios'
ORDER BY d.created_at DESC;
```

Isso ajudará a identificar exatamente onde está o problema!
