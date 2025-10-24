# 🔴 ERRO 401 - APNS Authentication Failed

## Problema Identificado

```
❌ Failed to send to ios (member 29): {"error":{"code":401,"message"...
```

**Erro 401** = **APNS rejeitou a autenticação**

Isso significa que o **certificado APNS está incorreto** ou **inválido**.

---

## 🎯 Causa Raiz

O erro 401 do APNS acontece quando:

### 1. **Team ID está incorreto** ❌
O Team ID no Firebase não corresponde ao Team ID da sua conta Apple Developer.

### 2. **Key ID está incorreto** ❌
O Key ID no Firebase não corresponde ao Key ID da chave APNS.

### 3. **Chave .p8 está incorreta** ❌
O arquivo .p8 enviado ao Firebase não é o correto ou está corrompido.

### 4. **Bundle ID não corresponde** ❌
O Bundle ID no Firebase não é exatamente `com.igreja.member`

### 5. **Certificado expirado** ❌
A chave APNS foi revogada ou expirou na Apple Developer Console.

---

## ✅ Solução - Reconfigurar Certificado APNS

### Passo 1: Verificar informações da Apple Developer

1. **Acesse:** https://developer.apple.com/account/resources/authkeys/list

2. **Encontre sua chave APNS** (ou crie uma nova se não existir)

3. **Anote EXATAMENTE:**
   - **Key ID:** (exemplo: `NR39P4964J`)
   - **Team ID:** (exemplo: `LU3NTX93ML`)
   
4. **Baixe o arquivo .p8** (se não tiver mais)
   - ⚠️ Só é possível baixar **UMA VEZ**
   - Se perdeu, precisa **criar uma nova chave**

---

### Passo 2: Criar nova chave APNS (se necessário)

Se você perdeu o arquivo .p8 original:

1. **Acesse:** https://developer.apple.com/account/resources/authkeys/add

2. **Configure:**
   - Key Name: `Igreja App APNS`
   - Services: ✅ **Apple Push Notifications service (APNs)**

3. **Clique em "Continue" → "Register"**

4. **IMPORTANTE:** Baixe o arquivo `.p8` imediatamente e salve em local seguro!

5. **Anote:**
   - Key ID (aparece na tela)
   - Team ID (canto superior direito)

---

### Passo 3: Reconfigurar no Firebase Console

1. **Acesse:** https://console.firebase.google.com/project/igreja-app-fe3db/settings/cloudmessaging

2. **Vá em "Apple app configuration"**

3. **Delete os certificados antigos:**
   - Clique em "Excluir" nas chaves de desenvolvimento e produção existentes

4. **Adicione novo certificado de PRODUCTION:**
   - Clique em "Upload APNs authentication key"
   - Selecione o arquivo `.p8` que você baixou
   - Insira o **Key ID** (copie exatamente)
   - Insira o **Team ID** (copie exatamente)
   - Clique em "Upload"

5. **Verifique:**
   - Status deve mostrar: ✅ "APNs authentication key de produção"
   - Não deve ter ícone de erro ou aviso

---

### Passo 4: Verificar Bundle ID

No Firebase Console, na mesma página:

**Bundle ID deve ser EXATAMENTE:** `com.igreja.member`

Se estiver diferente:
1. Vá em "Configurações do projeto" → "Geral"
2. Role até "Seus apps" → iOS
3. Verifique se o Bundle ID é `com.igreja.member`

---

### Passo 5: Deletar tokens antigos e reinstalar

```sql
-- Execute no Supabase SQL Editor:
DELETE FROM device_tokens WHERE platform = 'ios';
```

Depois:
1. Delete o app do TestFlight no iPhone
2. Reinstale do TestFlight
3. Faça login e aceite permissões
4. Novo token será gerado com o certificado correto

---

### Passo 6: Testar novamente

1. **Feche o app completamente** (swipe up do app switcher)

2. **Crie um novo aviso** no dashboard

3. **Verifique os logs do Supabase:**
   - Dashboard → Edge Functions → send-push-notifications → Logs
   - Procure por: ✅ "Sent successfully to ios device"
   - **NÃO** deve ter erro 401

4. **A notificação deve aparecer no iPhone!** 🎉

---

## 🔍 Como Verificar se o Certificado Está Correto

### No Firebase Console:

```
Cloud Messaging → Apple app configuration

✅ Deve mostrar:
┌─────────────────────────────────────────────┐
│ Chave de autenticação de APNs de produção   │
│                                              │
│ Arquivo: AuthKey_XXXXXXXX.p8                │
│ ID da chave: NR39P4964J                      │
│ ID: LU3NTX93ML                               │
│                                              │
│ Status: Ativa ✓                              │
└─────────────────────────────────────────────┘
```

### Na Apple Developer Console:

```
Certificates, IDs & Profiles → Keys

Deve existir uma chave com:
- Services: Apple Push Notifications service (APNs)
- Status: Enabled
- Key ID corresponde ao Firebase
```

---

## 🐛 Debug Avançado

### Ver erro completo nos logs

Clique na linha do erro 401 nos logs do Supabase para ver a mensagem completa:

```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials...",
    "status": "UNAUTHENTICATED",
    "details": [...]
  }
}
```

Possíveis mensagens:
- `"Invalid authentication credentials"` → Key ID ou Team ID incorreto
- `"Permission denied"` → Certificado não tem permissão para este Bundle ID
- `"Token signature verification failed"` → Arquivo .p8 incorreto

---

## ⚠️ Pontos de Atenção

### 1. Team ID é diferente do Key ID!

- **Team ID:** Identifica sua conta Apple Developer (ex: `LU3NTX93ML`)
- **Key ID:** Identifica a chave APNS específica (ex: `NR39P4964J`)

### 2. Arquivo .p8 só pode ser baixado uma vez!

Se você perdeu o arquivo original:
- ❌ NÃO é possível baixar novamente
- ✅ Precisa criar uma **nova chave**

### 3. Production vs Development

Para **TestFlight**:
- ✅ Usar certificado de **PRODUCTION**
- ✅ App com `aps-environment: production`
- ❌ Certificado de Development NÃO funciona!

### 4. Bundle ID deve ser exato

- ✅ Correto: `com.igreja.member`
- ❌ Errado: `com.igreja.member.app`
- ❌ Errado: `com.igreja.member-app`

---

## 📝 Checklist de Verificação

Antes de testar novamente:

- [ ] Key ID copiado EXATAMENTE da Apple Developer Console
- [ ] Team ID copiado EXATAMENTE da Apple Developer Console
- [ ] Arquivo .p8 correto enviado ao Firebase
- [ ] Certificado de **PRODUCTION** (não development)
- [ ] Bundle ID é `com.igreja.member` no Firebase
- [ ] Status do certificado no Firebase mostra "Ativa ✓"
- [ ] Tokens iOS antigos deletados
- [ ] App reinstalado do TestFlight
- [ ] Novo token gerado e salvo

Se TODOS os itens acima estiverem ✅, o erro 401 será resolvido!

---

## 🎉 Resultado Esperado

Após corrigir o certificado:

```
Logs do Supabase:

✅ Firebase access token obtained
✅ Found 2 device tokens (iOS: 1, Android: 1)
✅ Notification sent successfully to ios device (member 29)
   FCM Response: {"name":"projects/igreja-app-fe3db/messages/..."}
✅ Summary: 2 notifications sent successfully
```

E a notificação aparecerá no iPhone do TestFlight! 🚀

---

## 📞 Se Ainda Não Funcionar

Compartilhe:
1. Screenshot da configuração APNS no Firebase Console
2. Key ID e Team ID da Apple Developer (pode compartilhar, não são sensíveis)
3. Erro completo dos logs (clique na linha do erro 401)
