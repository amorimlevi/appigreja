# 📱 Como Funcionam as Notificações Push

## ✅ Sistema Atual

O sistema de notificações **JÁ está configurado** para notificar **TODOS os dispositivos** (admin e member) quando um aviso, evento ou escala é criado.

---

## 🔄 Fluxo Completo

### 1️⃣ **Admin cria um aviso** (web, iOS ou Android)

```
Admin App → Supabase → Tabela "avisos"
```

---

### 2️⃣ **Trigger é acionado automaticamente**

Quando um novo aviso é inserido na tabela `avisos`, o trigger `trigger_notify_new_aviso` executa a função `notify_new_aviso()`.

```sql
-- Esta função é executada automaticamente:
CREATE TRIGGER trigger_notify_new_aviso
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso();
```

**O que ela faz:**
1. Insere uma notificação na `push_notifications_queue`
2. Chama a Edge Function `send-push-notifications` via webhook

---

### 3️⃣ **Edge Function processa a notificação**

```typescript
// Código atual (linhas 140-142):
const { data: tokens } = await supabaseClient
  .from('device_tokens')
  .select('*')  // ← Busca TODOS os tokens (sem filtro!)
```

**Importante:** A função busca **TODOS os tokens** de **TODOS os membros** e **TODOS os dispositivos**:
- ✅ Membros no iOS
- ✅ Membros no Android
- ✅ Admins no iOS
- ✅ Admins no Android

---

### 4️⃣ **FCM envia para cada dispositivo**

```
Edge Function → Firebase FCM → Apple APNS / Google FCM → Dispositivo
```

Para cada token encontrado:
- Android: FCM envia diretamente
- iOS: FCM envia via APNS (Apple Push Notification Service)

---

## 📊 Exemplo Real

### Cenário: Admin cria aviso "Culto de Sexta"

```
1. Admin cria aviso no Admin App (iOS)
   ↓
2. INSERT INTO avisos (titulo, descricao, igreja_id)
   VALUES ('Culto de Sexta', 'Haverá culto...', 1)
   ↓
3. Trigger executa notify_new_aviso()
   ↓
4. INSERT INTO push_notifications_queue
   (title, body, data, sent)
   VALUES ('Novo Aviso', 'Culto de Sexta', {...}, false)
   ↓
5. Webhook chama send-push-notifications
   ↓
6. Edge Function busca tokens:
   - device_tokens.id = 1 → member 29, iOS
   - device_tokens.id = 2 → member 27, Android
   - device_tokens.id = 3 → member 25, Android
   - device_tokens.id = 4 → member 30, iOS (admin)
   ↓
7. FCM envia para TODOS os 4 dispositivos
   ↓
8. Notificações aparecem em:
   ✅ iPhone do membro 29
   ✅ Android do membro 27
   ✅ Android do membro 25
   ✅ iPhone do admin 30
```

---

## 🎯 Quem Recebe Notificações?

### Atualmente (sistema padrão):

**TODOS os dispositivos cadastrados na tabela `device_tokens`**, independente de:
- Ser admin ou member
- Estar no iOS ou Android
- Estar com app aberto ou fechado

### Verificar quem receberá:

```sql
-- Ver todos os dispositivos que receberão notificações
SELECT 
    d.id,
    d.member_id,
    m.nome as member_name,
    d.platform,
    LEFT(d.token, 40) as token_preview,
    d.created_at
FROM device_tokens d
LEFT JOIN members m ON m.id = d.member_id
ORDER BY d.created_at DESC;
```

---

## 🔧 Personalizações Possíveis

Se você quiser **filtrar** quem recebe notificações:

### Opção 1: Filtrar por tipo de usuário (admin/member)

```sql
-- Na edge function, modificar a query:
SELECT * FROM device_tokens 
WHERE member_id IN (
  SELECT id FROM members WHERE is_admin = false
)
```

### Opção 2: Filtrar por igreja

```sql
-- Apenas membros da mesma igreja que criou o aviso
SELECT d.* 
FROM device_tokens d
JOIN members m ON m.id = d.member_id
WHERE m.igreja_id = NEW.igreja_id
```

### Opção 3: Filtrar por preferências

```sql
-- Adicionar coluna "notification_preferences" em members
-- Respeitar quem desabilitou notificações
SELECT d.* 
FROM device_tokens d
JOIN members m ON m.id = d.member_id
WHERE m.notifications_enabled = true
```

---

## 📱 Apps Admin e Member

### Admin App (iOS/Android)
- **Cria:** Avisos, eventos, escalas
- **Recebe:** Notificações quando outros admins criam conteúdo
- **Token salvo em:** `device_tokens` (mesmo lugar que member)

### Member App (iOS/Android)
- **Visualiza:** Avisos, eventos, escalas
- **Recebe:** Notificações quando conteúdo novo é criado
- **Token salvo em:** `device_tokens`

**Importante:** Ambos apps usam a **mesma tabela** `device_tokens` e **mesma edge function**.

---

## ✅ Status Atual

- [x] Trigger criado para avisos
- [x] Trigger criado para eventos
- [x] Trigger criado para escalas
- [x] Edge function envia para TODOS os dispositivos
- [x] Funciona para Android (confirmado nos logs)
- [x] Configurado para iOS (aguardando correção do certificado)

---

## 🐛 Debugging

### Ver notificações enviadas:

```sql
SELECT 
    id,
    title,
    body,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 20;
```

### Ver logs da edge function:

```
Dashboard > Edge Functions > send-push-notifications > Logs

Procure por:
- "Found X device tokens"
- "Sending notification to X devices"
- "Sent successfully to ios device (member Y)"
```

### Testar manualmente:

```sql
-- Inserir notificação de teste que vai para TODOS
INSERT INTO push_notifications_queue (title, body, data, sent)
VALUES (
  'Teste Manual',
  'Esta notificação vai para TODOS os dispositivos cadastrados',
  '{"type": "test"}'::jsonb,
  false
);

-- Chamar edge function
SELECT net.http_post(
  url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notifications',
  headers := '{"Authorization": "Bearer YOUR_KEY"}'::jsonb
);
```

---

## 🎉 Resumo

**Quando um admin cria um aviso no iOS:**

1. ✅ Aviso é salvo no Supabase
2. ✅ Trigger aciona automaticamente
3. ✅ Edge function busca **TODOS** os tokens
4. ✅ Notificação é enviada para:
   - ✅ Todos os membros (iOS + Android)
   - ✅ Todos os admins (iOS + Android)
5. ✅ Banner aparece em todos os dispositivos

**Não é necessária configuração adicional!** O sistema já funciona assim. 🚀

---

## 📝 Próximos Passos

Para que as notificações iOS funcionem:

1. **Deletar tokens antigos:** (execute SQL)
   ```sql
   DELETE FROM device_tokens WHERE platform = 'ios';
   ```

2. **Rebuild app iOS:** Com `App.entitlements` → `production`

3. **Reinstalar app:** Em todos os iPhones (admin e member)

4. **Testar:** Admin cria aviso → Todos recebem notificação! 🎉
