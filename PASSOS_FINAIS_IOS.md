# ✅ Últimos Passos para Notificações iOS Funcionarem

## 🎯 O certificado já está configurado corretamente!

✅ Firebase Console:
- Key ID: `44UHHU47FR` (Production)
- Team ID: `LU3NTX93ML`
- Status: Configurado

---

## 📝 Falta apenas:

### 1️⃣ Deletar tokens iOS antigos

Execute no **Supabase SQL Editor**:

```sql
DELETE FROM device_tokens WHERE platform = 'ios';
```

**Por quê?** Os tokens atuais foram gerados com o certificado antigo (NR39P4964J). Precisamos gerar novos com o certificado correto (44UHHU47FR).

---

### 2️⃣ Reinstalar app do TestFlight

**No iPhone:**

1. **Delete o app:**
   - Pressione e segure o ícone "Igreja Member"
   - "Remove App" → "Delete App"

2. **Reinstale:**
   - Abra o TestFlight
   - Instale "Igreja Member" novamente

3. **Faça login:**
   - Entre com suas credenciais
   - Aceite as permissões de notificação quando solicitar

---

### 3️⃣ Verificar se token foi salvo

Execute no **Supabase SQL Editor**:

```sql
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 50) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;
```

**Deve aparecer:** Um novo registro criado há poucos segundos!

---

### 4️⃣ Fechar o app completamente

**No iPhone:**

1. Swipe up do bottom (gesto de home)
2. App switcher aparece
3. **Swipe UP** no "Igreja Member" para fechá-lo
4. Verifique que o app **NÃO** está no app switcher

⚠️ **IMPORTANTE:** Notificações iOS não aparecem quando o app está aberto (foreground). Você DEVE fechar o app!

---

### 5️⃣ Criar um aviso de teste

**No Supabase Dashboard:**

1. Vá na tabela `avisos`
2. Clique em "Insert row"
3. Preencha:
   - `titulo`: "TESTE Push iOS"
   - `descricao`: "Se você viu esta notificação, funcionou! 🎉"
   - `igreja_id`: 1
4. Clique em "Save"

**Ou execute este SQL:**

```sql
INSERT INTO avisos (titulo, descricao, igreja_id)
VALUES ('TESTE Push iOS', 'Se você viu esta notificação, funcionou! 🎉', 1);
```

---

### 6️⃣ Aguardar notificação!

**Aguarde 2-5 segundos...**

A notificação **DEVE** aparecer no iPhone! 🎉

```
+----------------------------------------+
|  Novo Aviso                       [x]  |
|  TESTE Push iOS                       |
|  Se você viu esta notificação,        |
|  funcionou! 🎉                         |
|                                        |
|  Igreja Member              agora      |
+----------------------------------------+
```

---

## 🐛 Se não aparecer

### Verificar logs do Supabase

1. Dashboard → Edge Functions → send-push-notifications → Logs
2. Clique em "Refresh" para atualizar
3. Procure por:

**✅ Sucesso (deve aparecer):**
```
✅ Notification sent successfully to ios device (member XX)
   FCM Response: {"name":"projects/igreja-app-fe3db/messages/..."}
```

**❌ Erro (não deve aparecer):**
```
❌ Failed to send to ios (member XX): {"error":{"code":401...
```

Se ainda mostrar erro 401:
- Aguarde 2-3 minutos (cache do Firebase)
- Delete tokens novamente
- Reinstale o app novamente

---

### Verificar permissões no iPhone

```
Settings > Notifications > Igreja Member

✅ Allow Notifications = ON
✅ Lock Screen = ON
✅ Notification Center = ON
✅ Banners = ON
✅ Sounds = ON
✅ Badges = ON
```

---

### Verificar Focus/Do Not Disturb

```
Control Center (swipe down from top-right)

✅ Focus/Do Not Disturb = OFF
```

---

## ✅ Checklist Final

Antes de criar o aviso de teste:

- [ ] Tokens iOS deletados (`DELETE FROM device_tokens WHERE platform = 'ios'`)
- [ ] App deletado do iPhone
- [ ] App reinstalado do TestFlight
- [ ] Login feito e permissões aceitas
- [ ] Novo token aparece no SQL (`SELECT * FROM device_tokens WHERE platform = 'ios'`)
- [ ] App **fechado completamente** (não apenas minimizado)
- [ ] Permissões habilitadas no iPhone (Settings > Notifications)
- [ ] Do Not Disturb/Focus desligado

Se TODOS os itens acima estiverem ✅, a notificação **DEVE** aparecer!

---

## 🎉 Sucesso!

Quando funcionar, você verá:

1. ✅ Banner na tela do iPhone
2. ✅ Som de notificação
3. ✅ Badge (número vermelho) no ícone do app
4. ✅ Notificação na Central de Notificações
5. ✅ Notificação na tela bloqueada

**Parabéns!** 🎊 As notificações push estão funcionando no iOS!

---

## 📊 Próximas Notificações

Depois que funcionar a primeira vez, **todas as próximas** notificações funcionarão automaticamente:

- ✅ Quando admin cria novo aviso
- ✅ Quando admin cria novo evento
- ✅ Quando admin cria nova escala
- ✅ Todos os membros recebem (iOS + Android)
- ✅ Todos os admins recebem (iOS + Android)

Não é necessário fazer nada! O sistema funciona automaticamente. 🚀
