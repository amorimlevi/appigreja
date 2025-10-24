# 🔍 Diagnóstico: Logs OK mas Notificação Não Chega

## Situação Atual

✅ Logs mostram: `"Sent successfully to ios device (member 29)"`
❌ iPhone não recebe a notificação

---

## 🎯 Possíveis Causas (em ordem de probabilidade)

### 1️⃣ Token foi gerado ANTES de configurar o certificado correto ⭐ MAIS PROVÁVEL

**Problema:**
- Você configurou o certificado `44UHHU47FR` no Firebase
- Mas o token iOS foi gerado ANTES dessa configuração
- O token está "vinculado" ao certificado antigo (`NR39P4964J`)
- FCM aceita, mas APNS rejeita silenciosamente

**Solução:**
```sql
-- Execute este SQL:
DELETE FROM device_tokens WHERE platform = 'ios';
```

Depois:
1. Delete o app do iPhone
2. Reinstale do TestFlight
3. Faça login novamente
4. Novo token será gerado com certificado correto

---

### 2️⃣ App está ABERTO (foreground)

**Problema:**
- Notificações iOS NÃO aparecem automaticamente quando o app está aberto
- O evento `pushNotificationReceived` é disparado, mas sem banner

**Como verificar:**
- O app está aberto na tela do iPhone?
- Se SIM, você deve ver um `alert()` (já configuramos isso)
- Se NÃO está vendo nem o alert, vá para causa #1

**Solução:**
- FECHE o app completamente:
  1. Swipe up (gesto de home)
  2. App switcher
  3. Swipe UP no app para fechá-lo
  4. Verifique que NÃO está no app switcher

---

### 3️⃣ Permissões não habilitadas

**Como verificar:**

No iPhone:
```
Settings > Notifications > Igreja Member
```

Deve estar assim:
- ✅ Allow Notifications = **ON**
- ✅ Lock Screen = **ON**
- ✅ Notification Center = **ON**
- ✅ Banners = **ON**
- ✅ Sounds = **ON**

**Solução:**
- Ative todas as opções acima

---

### 4️⃣ Do Not Disturb / Focus está ligado

**Como verificar:**

No iPhone:
- Control Center (swipe down do canto superior direito)
- Procure pelo ícone de lua 🌙 ou Focus

**Solução:**
- Desative Do Not Disturb / Focus

---

### 5️⃣ Build do app está incorreto

**Problema:**
- O app foi buildado com `aps-environment: development`
- Mas está instalado via TestFlight (que usa production)

**Como verificar:**

Arquivo: `ios-member/App/App/App-Release.entitlements`

Deve ter:
```xml
<key>aps-environment</key>
<string>production</string>
```

**Solução:**
- Se estiver `development`, mude para `production`
- Rebuild do app
- Upload nova build para TestFlight
- Reinstale

---

### 6️⃣ Cache do Firebase/APNS

**Problema:**
- Às vezes leva alguns minutos para o Firebase atualizar o certificado

**Solução:**
- Aguarde 5-10 minutos após configurar o certificado
- Delete tokens e reinstale app

---

## 🔧 Diagnóstico Passo a Passo

### Passo 1: Verificar quando o token foi criado

Execute: `debug-ios-push-nao-chega.sql`

**Resultado esperado:**
```
| created_at           | status                                        |
|---------------------|-----------------------------------------------|
| 2025-10-23 13:05:00 | ✅ NOVO                                       |
```

**Se mostrar "⚠️ ANTIGO":**
→ Esse é o problema! Token precisa ser regenerado.

---

### Passo 2: Clicar na linha do log para ver resposta completa

No dashboard do Supabase:
1. Edge Functions → send-push-notifications → Logs
2. Clique na linha: `"Sent successfully to ios device (member 29)"`
3. Veja a resposta completa do FCM

**Exemplo de sucesso real:**
```json
{
  "name": "projects/igreja-app-fe3db/messages/0:1729694753912345%abc123"
}
```

**Se tiver algo diferente, copie e analise**

---

### Passo 3: Verificar estado do app

**No iPhone, o app está:**
- [ ] Aberto na tela (foreground) → Feche completamente
- [ ] Minimizado (background) → Notificação deveria aparecer
- [ ] Fechado (terminated) → Notificação deveria aparecer

---

### Passo 4: Teste com app completamente fechado

1. **Feche o app:**
   - Swipe up (gesto home)
   - App switcher
   - Swipe UP no app

2. **Verifique que foi fechado:**
   - App não aparece no app switcher

3. **Crie novo aviso**

4. **Aguarde 10 segundos**

5. **Se NÃO aparecer:**
   → Token precisa ser regenerado (Passo 5)

---

### Passo 5: Regenerar token (SOLUÇÃO DEFINITIVA)

```sql
-- 1. Deletar tokens iOS
DELETE FROM device_tokens WHERE platform = 'ios';
```

**No iPhone:**
```
2. Delete o app (pressione e segure → Remove App)
3. Abra TestFlight
4. Reinstale "Igreja Member"
5. Faça login
6. Aceite permissões de notificação
```

**Verificar token novo foi salvo:**
```sql
SELECT * FROM device_tokens WHERE platform = 'ios' ORDER BY created_at DESC;
-- Deve mostrar created_at = agora (há poucos segundos)
```

**Testar novamente:**
```
7. FECHE o app (swipe up → app switcher → swipe up)
8. Crie novo aviso
9. Aguarde 5 segundos
10. Notificação DEVE aparecer! 🎉
```

---

## 📊 Checklist Completo

Antes de criar um aviso de teste, verifique:

### Firebase Console:
- [x] Certificado `44UHHU47FR` configurado
- [x] Team ID `LU3NTX93ML` correto
- [x] Status "Ativa ✓"

### Tokens:
- [ ] Tokens iOS deletados após configurar certificado
- [ ] App reinstalado do TestFlight
- [ ] Novo token gerado (verificado no SQL)
- [ ] Token criado há menos de 30 minutos

### iPhone:
- [ ] Permissões habilitadas (Settings > Notifications)
- [ ] Do Not Disturb desligado
- [ ] App **fechado completamente** (não no app switcher)

### App Build:
- [ ] `App-Release.entitlements` tem `production`
- [ ] Build do TestFlight é recente (após configurar certificado)

Se TODOS os itens acima estiverem ✅, a notificação **DEVE** aparecer!

---

## 🎯 Teste Final Definitivo

Execute este procedimento completo:

```sql
-- 1. Deletar TUDO
DELETE FROM device_tokens WHERE platform = 'ios';
DELETE FROM push_notifications_queue WHERE sent = true;
```

```bash
# 2. No iPhone:
# - Delete o app completamente
# - Reinstale do TestFlight
# - Faça login
# - Aceite permissões

# 3. Verificar token salvo
SELECT * FROM device_tokens WHERE platform = 'ios';
# Deve mostrar 1 linha com created_at recente

# 4. FECHAR app completamente
# - Swipe up → app switcher → swipe up no app

# 5. Criar aviso de teste
INSERT INTO avisos (titulo, descricao, igreja_id)
VALUES ('TESTE DEFINITIVO', 'Esta é a notificação de teste definitiva! Se você viu, FUNCIONOU! 🎉🎉🎉', 1);

# 6. Aguardar 5 segundos

# 7. DEVE APARECER! 🚀
```

---

## ❓ Se AINDA não funcionar

Compartilhe estas informações:

1. **Resultado do SQL:**
```sql
SELECT 
    id,
    member_id,
    LEFT(token, 60) as token,
    created_at,
    AGE(NOW(), created_at) as idade
FROM device_tokens 
WHERE platform = 'ios';
```

2. **Screenshot das permissões:**
- Settings > Notifications > Igreja Member

3. **Logs completos do Supabase:**
- Últimas 10 linhas da edge function

4. **Confirmar:**
- [ ] App foi fechado completamente? (não apenas minimizado)
- [ ] Token foi deletado e regenerado APÓS configurar certificado?
- [ ] Do Not Disturb está desligado?

Com essas informações, conseguiremos identificar o problema exato!
