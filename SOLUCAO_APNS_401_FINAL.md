# 🎯 SOLUÇÃO - Erro 401 APNS Identificado!

## ❌ Problema Encontrado

Você tem **2 chaves APNS** na Apple Developer:

| Key ID | Nome | Ambiente | Status |
|--------|------|----------|--------|
| **44UHHU47FR** | App igreja push **production** | **Production** | ✅ Correto para TestFlight |
| **NR39P4964J** | Push notifications key | **Sandbox** | ❌ Só funciona para Debug |

**O Firebase está usando:** `NR39P4964J` (Sandbox) ❌

**Deveria estar usando:** `44UHHU47FR` (Production) ✅

**Por isso o erro 401!** O TestFlight usa ambiente Production, mas o certificado configurado é Sandbox (Development).

---

## ✅ Solução (5 minutos)

### Passo 1: Fazer download da chave Production

⚠️ **IMPORTANTE:** Se você já tem o arquivo `.p8` da chave `44UHHU47FR`, pule para o Passo 2.

**Se NÃO tem o arquivo .p8:**

1. A Apple só permite **baixar UMA VEZ**
2. Se perdeu, precisa **criar nova chave**
3. Ou procure no seu computador: `AuthKey_44UHHU47FR.p8`

**Para criar nova chave Production (se necessário):**

1. Acesse: https://developer.apple.com/account/resources/authkeys/add
2. Key Name: `Igreja App Push Production V2`
3. Services: ✅ **Apple Push Notifications service (APNs)**
4. Clique "Continue" → "Register"
5. **BAIXE o arquivo `.p8` IMEDIATAMENTE** e salve
6. Anote o novo **Key ID** (será diferente de 44UHHU47FR)

---

### Passo 2: Configurar no Firebase Console

1. **Acesse:** https://console.firebase.google.com/project/igreja-app-fe3db/settings/cloudmessaging

2. **Vá em "Apple app configuration"**

3. **DELETE a chave antiga** (NR39P4964J - Sandbox):
   - Encontre "Chave de autenticação de APNs de **produção**"
   - Clique em "Excluir"
   - Confirme

4. **Adicione a chave PRODUCTION:**
   - Clique em "Upload APNs authentication key"
   - Selecione o arquivo: `AuthKey_44UHHU47FR.p8`
   - **Key ID:** `44UHHU47FR` (copie exatamente)
   - **Team ID:** `LU3NTX93ML` (copie exatamente)
   - Clique em "Upload"

5. **Verifique:**
   ```
   ✅ Chave de autenticação de APNs de produção
      Arquivo: AuthKey_44UHHU47FR.p8
      ID da chave: 44UHHU47FR
      ID: LU3NTX93ML
      Status: Ativa ✓
   ```

---

### Passo 3: Deletar tokens iOS antigos

```sql
-- Execute no Supabase SQL Editor:
DELETE FROM device_tokens WHERE platform = 'ios';
```

**Por quê?** Os tokens atuais foram gerados com a chave errada (NR39P4964J). Precisamos gerar novos com a chave correta (44UHHU47FR).

---

### Passo 4: Reinstalar app do TestFlight

No iPhone:

1. **Delete o app:**
   - Pressione e segure "Igreja Member"
   - "Remove App" → "Delete App"

2. **Reinstale:**
   - Abra o TestFlight
   - Instale "Igreja Member" novamente

3. **Faça login e aceite permissões**

4. **Verifique no SQL que token foi salvo:**
```sql
SELECT * FROM device_tokens WHERE platform = 'ios' ORDER BY created_at DESC;
```

---

### Passo 5: Testar notificação

1. **FECHE o app completamente:**
   - Swipe up (gesto de home)
   - App switcher
   - Swipe up no app para fechar

2. **Crie um novo aviso** no dashboard

3. **Aguarde 5 segundos...**

4. **A notificação DEVE aparecer!** 🎉

---

### Passo 6: Verificar logs

**Logs do Supabase** (Edge Functions → send-push-notifications):

```
✅ ANTES (erro):
❌ Failed to send to ios (member 29): {"error":{"code":401...

✅ DEPOIS (sucesso):
✅ Notification sent successfully to ios device (member 29)
   FCM Response: {"name":"projects/igreja-app-fe3db/messages/..."}
```

---

## 📋 Resumo das Informações

### Apple Developer Console:
- **Team ID:** `LU3NTX93ML`
- **Key ID Production:** `44UHHU47FR`
- **Key Name:** "App igreja push production"
- **Ambiente:** Production
- **Arquivo:** `AuthKey_44UHHU47FR.p8`

### Firebase Console:
- **Project:** `igreja-app-fe3db`
- **Bundle ID:** `com.igreja.member`
- **Certificado:** APNs authentication key (Production)
- **Key ID:** `44UHHU47FR`
- **Team ID:** `LU3NTX93ML`

---

## ⚠️ Importante

### Diferença entre as chaves:

| Chave | Ambiente | Quando usar |
|-------|----------|-------------|
| **NR39P4964J** (Sandbox) | Development | ❌ Só para Debug do Xcode |
| **44UHHU47FR** (Production) | Production | ✅ TestFlight + App Store |

### Para que funcione no Xcode (Debug):

Se você quiser testar rodando do Xcode em modo Debug:

1. Adicione **também** a chave Sandbox no Firebase:
   - Upload APNs authentication key
   - Key ID: `NR39P4964J`
   - Team ID: `LU3NTX93ML`
   - Marque como "Development"

2. Ou mude `App.entitlements` para usar production (já fizemos isso)

---

## 🎉 Resultado Esperado

Após configurar a chave correta:

### Logs do Supabase:
```
23 Oct 12:45:30  INFO  🔑 Using Firebase project: igreja-app-fe3db
23 Oct 12:45:30  INFO  📦 Found 2 device tokens (iOS: 1, Android: 1)
23 Oct 12:45:31  INFO  ✅ Firebase access token obtained
23 Oct 12:45:31  INFO  ✅ Notification sent successfully to ios device (member 29)
23 Oct 12:45:31  INFO     FCM Response: {"name":"projects/igreja-app-fe3db/messages/0:1234567890"}
23 Oct 12:45:31  INFO  📊 Summary: 2 notifications sent successfully
```

### No iPhone (TestFlight):
```
+----------------------------------------+
|  Novo Aviso                       [x]  |
|  Culto de Sexta às 19h                |
|                                        |
|  Igreja Member              agora      |
+----------------------------------------+
```

Banner deve aparecer com **som** e **badge**! 🚀

---

## 🔧 Se Ainda Não Funcionar

Verifique:

1. **Firebase Console** mostra Status "Ativa ✓"?
2. **Key ID** é exatamente `44UHHU47FR`?
3. **Team ID** é exatamente `LU3NTX93ML`?
4. **Tokens antigos** foram deletados?
5. **App foi reinstalado** do TestFlight?
6. **App está fechado** completamente?
7. **Permissões** habilitadas no iPhone?

Se TUDO acima estiver ✅, deve funcionar!

---

## 📞 Checklist Final

- [ ] Arquivo `AuthKey_44UHHU47FR.p8` em mãos
- [ ] Firebase configurado com Key ID: `44UHHU47FR`
- [ ] Firebase configurado com Team ID: `LU3NTX93ML`
- [ ] Status no Firebase mostra "Ativa ✓"
- [ ] Tokens iOS deletados (`DELETE FROM device_tokens...`)
- [ ] App reinstalado do TestFlight
- [ ] Novo token salvo (verificado no SQL)
- [ ] App fechado completamente
- [ ] Permissões habilitadas

Quando TODOS os itens estiverem ✅, o erro 401 será resolvido e as notificações funcionarão! 🎉
