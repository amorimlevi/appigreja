# 🔴 Problema: "Sent successfully to ios device" mas não notifica

## Sintoma
- ✅ Logs mostram "Sent successfully to ios device"
- ✅ FCM retorna sucesso (200 OK)
- ✅ O aviso aparece no app (via realtime sync)
- ❌ **A notificação push NÃO aparece no iPhone**

## Causa Raiz
O FCM **aceita** a mensagem, mas o **APNS (Apple Push Notification Service) rejeita silenciosamente** a entrega.

---

## 🔍 Por que o APNS rejeita?

### 1. **Mismatch de Ambiente (Development vs Production)**

**O PROBLEMA MAIS COMUM!**

Você tem 2 certificados no Firebase:
- ✅ Chave de autenticação de APNs de **desenvolvimento** (NR39P4964J / LU3NTX93ML)
- ✅ Chave de autenticação de APNs de **produção** (NR39P4964J / LU3NTX93ML)

**Regra:** O certificado usado deve corresponder ao `aps-environment` do app:

| Como está rodando | aps-environment | Certificado necessário |
|-------------------|----------------|------------------------|
| Xcode (Debug) | `development` | Development |
| Xcode (Release) | `production` | Production |
| TestFlight | `production` | Production |
| App Store | `production` | Production |

**Seu app atualmente:**
- Debug: `ios-member/App/App/App.entitlements` → `development`
- Release: `ios-member/App/App/App-Release.entitlements` → `production`

**O Firebase está usando:** Ambos certificados estão lá, mas precisa verificar qual está **ativo/válido**.

### 2. **Token FCM inválido ou expirado**

Se o token FCM foi gerado com um certificado diferente, o APNS rejeita.

**Solução:** Deletar o app, reinstalar e obter um novo token.

### 3. **Bundle ID não corresponde ao certificado**

O certificado APNS foi criado para o Bundle ID exato: `com.igreja.member`

Se o app estiver usando outro Bundle ID, o APNS rejeita.

### 4. **App está em foreground**

Notificações iOS não aparecem automaticamente quando o app está aberto.

**Já corrigimos:** Adicionamos um `alert()` para mostrar quando está em foreground.

### 5. **Permissões não habilitadas**

Settings > Notifications > Igreja Member > Allow Notifications = OFF

---

## ✅ Checklist de Diagnóstico

### Passo 1: Verificar Build Configuration

```bash
# No Xcode:
# 1. Selecione o projeto "App" no navigator
# 2. Selecione o target "App"
# 3. Vá em "Build Settings"
# 4. Procure por "Code Signing Entitlements"
# 5. Verifique qual entitlements está sendo usado:
#    - Debug: App/App.entitlements (development)
#    - Release: App/App-Release.entitlements (production)
```

**Está rodando em Debug?** Deve usar `development`
**Está rodando em Release?** Deve usar `production`

### Passo 2: Verificar qual esquema está usando

```bash
# No Xcode:
# Product > Scheme > Edit Scheme...
# Run (esquerda) > Info > Build Configuration

# Deve ser:
# - Debug (para teste local)
# - Release (para TestFlight/App Store)
```

### Passo 3: Verificar Firebase Console

1. Acesse: https://console.firebase.google.com/project/igreja-app-fe3db/settings/cloudmessaging
2. Vá em **Apple app configuration**
3. Verifique:
   - [ ] Certificado de **Development** está lá
   - [ ] Certificado de **Production** está lá
   - [ ] **Key ID** e **Team ID** estão corretos
   - [ ] Nenhum está **expirado**

### Passo 4: Deletar token antigo e obter novo

```sql
-- No Supabase SQL Editor:
-- Ver tokens atuais
SELECT * FROM device_tokens WHERE platform = 'ios';

-- Deletar tokens antigos (CUIDADO!)
DELETE FROM device_tokens WHERE platform = 'ios' AND member_id = 29;
```

Depois:
1. Delete o app do iPhone
2. Reinstale do Xcode
3. Faça login novamente
4. Aceite as permissões de notificação
5. Verifique nos logs do Xcode se o novo token foi salvo

### Passo 5: Testar com app fechado

```bash
# 1. Rode o app no iPhone físico
# 2. Faça login e aceite permissões
# 3. FECHE completamente o app:
#    - Gesto de home (swipe up)
#    - App switcher
#    - Swipe up no app para fechar
# 4. Crie um novo aviso no dashboard
# 5. Aguarde 5-10 segundos
# 6. A notificação DEVE aparecer
```

### Passo 6: Verificar logs detalhados do FCM

Agora os logs mostram a resposta completa do FCM:

```bash
# No Supabase Dashboard:
# Edge Functions > send-push-notifications > Logs

# Procure por:
✅ Notification sent successfully to ios device (member 29)
   FCM Response: {"name":"projects/..."}

# Ou erros:
❌ Failed to send to ios (member 29): {...}
   Full error details: {
     "error": {
       "code": 400,
       "message": "The registration token is not a valid FCM registration token",
       "status": "INVALID_ARGUMENT"
     }
   }
```

**Erros comuns:**
- `INVALID_ARGUMENT`: Token inválido → Delete e gere novo token
- `UNREGISTERED`: Token expirado → Delete e gere novo token
- `SENDER_ID_MISMATCH`: App usando Firebase projeto errado
- Sem erro mas não chega: Mismatch de ambiente (dev/prod)

---

## 🎯 Solução Recomendada

### Opção 1: Forçar Production em todos os builds (RECOMENDADO)

Se você quer que funcione tanto no Xcode quanto no TestFlight:

```bash
# Editar ambos entitlements para usar production
```

<function_calls>
<invoke name="edit_file">
<parameter name="path">/Users/user/appigreja/ios-member/App/App/App.entitlements
