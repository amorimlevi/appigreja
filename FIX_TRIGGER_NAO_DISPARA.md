# 🔴 Problema: Aviso Criado mas Notificação Não Enviada

## Sintoma
- ✅ Admin cria aviso no app iOS
- ✅ Aviso aparece para os membros (via realtime sync)
- ❌ **Trigger NÃO dispara** (sem logs)
- ❌ **Notificação NÃO é enviada**

---

## 🎯 Causa Raiz

O **trigger** `trigger_notify_new_aviso` está:
- ❌ Não existe / foi deletado
- ❌ Está desabilitado
- ❌ Tem erro na função que falha silenciosamente
- ❌ A função não tem permissão para chamar a edge function

---

## ✅ Solução - Diagnosticar e Recriar Trigger

### Passo 1: Diagnosticar o problema

Execute: `diagnostico-trigger-nao-dispara.sql`

**Procure por:**

```sql
-- Resultado esperado:
| trigger_name              | status      |
|---------------------------|-------------|
| trigger_notify_new_aviso  | ✅ ATIVO    |

-- Se não aparecer nada ou mostrar ❌ DESABILITADO:
-- → Trigger não existe ou está desabilitado!
```

---

### Passo 2: Recriar o trigger

Execute: `recriar-trigger-avisos.sql`

Este script irá:
1. ✅ Deletar triggers antigos
2. ✅ Recriar função `notify_new_aviso()` com logs de debug
3. ✅ Criar trigger `trigger_notify_new_aviso`
4. ✅ Testar inserindo um aviso
5. ✅ Verificar se notificação foi criada

---

### Passo 3: Verificar se funcionou

Após executar o script, você verá:

**No SQL Editor:**
```sql
-- Aviso de teste criado:
| id  | titulo                  | created_at          |
|-----|-------------------------|---------------------|
| 123 | [TESTE] Trigger Recriado| 2025-10-23 13:30:00 |

-- Notificação criada:
| id  | title       | body                    | sent  | created_at          |
|-----|-------------|-------------------------|-------|---------------------|
| 456 | Novo Aviso  | [TESTE] Trigger Recriado| false | 2025-10-23 13:30:00 |
```

**Nos Logs da Edge Function:**
```
Dashboard > Edge Functions > send-push-notifications > Logs

📬 Received push notification request
🔑 Using Firebase project: igreja-app-fe3db
📦 Found 3 device tokens (iOS: 1, Android: 2)
✅ Firebase access token obtained
✅ Notification sent successfully to android device (member 25)
✅ Notification sent successfully to android device (member 27)
✅ Notification sent successfully to ios device (member 29)
📊 Summary: 3 notifications sent successfully
```

---

### Passo 4: Testar com app admin

1. **No app admin iOS:**
   - Crie um novo aviso
   - Título: "Teste Final"
   - Descrição: "Este é o teste final do trigger"

2. **Verificar SQL:**
```sql
-- Ver se notificação foi criada
SELECT * FROM push_notifications_queue 
ORDER BY created_at DESC 
LIMIT 3;
```

3. **Verificar logs do Supabase:**
   - Dashboard > Edge Functions > send-push-notifications > Logs
   - Refresh
   - Deve aparecer os logs de envio

4. **Verificar iPhone:**
   - Feche o app member completamente
   - Notificação deve aparecer! 🎉

---

## 🔍 Debug Avançado

### Ver logs do PostgreSQL (NOTICES)

Os logs `RAISE NOTICE` aparecem no Supabase Dashboard:

```
Dashboard > Database > Logs

Procure por:
- "Trigger notify_new_aviso disparado para aviso: ..."
- "Notificação criada com ID: ..."
- "Webhook chamado com sucesso"
```

### Se houver erros:

```
Dashboard > Database > Logs

Procure por:
- "Erro no trigger notify_new_aviso: ..."
- Anote a mensagem de erro completa
```

Erros comuns:
- `permission denied for extension pg_net` → Precisa habilitar extensão
- `function net.http_post does not exist` → Extensão pg_net não instalada
- `could not connect to server` → URL da edge function incorreta

---

## 🛠️ Habilitar Extensão pg_net (se necessário)

Se o erro for relacionado ao `pg_net`:

```sql
-- Habilitar extensão (requer permissões de admin)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar que foi habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

No Supabase Dashboard:
1. Database > Extensions
2. Procure por "pg_net"
3. Se não estiver habilitado, clique em "Enable"

---

## 📋 Checklist Pós-Correção

Após recriar o trigger:

- [ ] Trigger existe (`SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_new_aviso'`)
- [ ] Trigger está habilitado (status = 'O')
- [ ] Função existe (`SELECT * FROM pg_proc WHERE proname = 'notify_new_aviso'`)
- [ ] Teste manual funcionou (aviso inserido → notificação criada)
- [ ] Logs aparecem no Supabase
- [ ] Edge function é chamada (verificar logs)
- [ ] Notificações são enviadas (verificar logs "sent successfully")

---

## 🎯 Teste Final

```sql
-- 1. Criar aviso de teste
INSERT INTO avisos (titulo, descricao, igreja_id)
VALUES ('Teste Trigger Final', 'Se você receber notificação, o trigger está funcionando! 🎉', 1);

-- 2. Verificar que notificação foi criada (aguarde 2 segundos)
SELECT 
    a.id as aviso_id,
    a.titulo,
    a.created_at as aviso_criado,
    pnq.id as notif_id,
    pnq.title,
    pnq.sent,
    pnq.created_at as notif_criada
FROM avisos a
LEFT JOIN push_notifications_queue pnq 
    ON pnq.created_at >= a.created_at - INTERVAL '2 seconds'
    AND pnq.created_at <= a.created_at + INTERVAL '2 seconds'
WHERE a.titulo = 'Teste Trigger Final';

-- Resultado esperado:
-- ✅ Deve mostrar 1 linha com notif_id preenchido
-- ❌ Se notif_id for NULL, trigger não disparou!
```

---

## 🚨 Se Ainda Não Funcionar

### Opção 1: Verificar permissões do trigger

```sql
-- Ver permissões da função
SELECT 
    proname,
    proowner::regrole as owner,
    proacl as permissions
FROM pg_proc
WHERE proname = 'notify_new_aviso';

-- Garantir que a função pode ser executada
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO service_role;
```

### Opção 2: Trigger alternativo (sem pg_net)

Se o `pg_net` não funcionar, use trigger que apenas insere na fila:

```sql
CREATE OR REPLACE FUNCTION notify_new_aviso_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas inserir na fila (sem chamar webhook)
    INSERT INTO push_notifications_queue (title, body, data, sent)
    VALUES (
        'Novo Aviso',
        NEW.titulo,
        jsonb_build_object('type', 'aviso', 'aviso_id', NEW.id),
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_aviso ON avisos;
CREATE TRIGGER trigger_notify_new_aviso
AFTER INSERT ON avisos
FOR EACH ROW
EXECUTE FUNCTION notify_new_aviso_simple();
```

Depois, chame a edge function manualmente ou via cron job.

---

## ✅ Resultado Esperado

Após corrigir o trigger, quando admin criar aviso:

1. ✅ Aviso inserido na tabela `avisos`
2. ✅ Trigger dispara automaticamente
3. ✅ Notificação inserida em `push_notifications_queue`
4. ✅ Webhook chama edge function
5. ✅ Edge function envia para FCM
6. ✅ FCM envia para APNS/Android
7. ✅ Notificação aparece em todos os dispositivos! 🎉

**Logs completos devem aparecer automaticamente!**
