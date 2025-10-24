# 🔀 Decisão: Qual Edge Function Usar?

## Situação Atual

Você tem **2 edge functions** com comportamentos diferentes:

### 1️⃣ `send-push-notification` (SINGULAR)
- **Recebe dados no body** do request (title, body, data)
- **Envia imediatamente** para os tokens
- **NÃO** usa a fila `push_notifications_queue`
- Melhor para: chamadas diretas com dados específicos

### 2️⃣ `send-push-notifications` (PLURAL)
- **Busca da fila** `push_notifications_queue`
- **Processa todas** as notificações pendentes (`sent = false`)
- **Marca como enviadas** após processar
- Melhor para: sistema de fila com trigger

---

## ✅ Recomendação: Use `send-push-notifications` (PLURAL)

**Por quê?**

O trigger atual:
1. Insere na **fila** (`push_notifications_queue`)
2. Chama a edge function
3. A edge function deve **processar a fila**

Isso permite:
- ✅ Retry automático se edge function falhar
- ✅ Processamento em lote (melhor performance)
- ✅ Histórico de notificações enviadas
- ✅ Não perder notificações se houver erro temporário

---

## 🔧 Solução: Atualizar Trigger para Usar a Função PLURAL

Execute este SQL:

```sql
-- Atualizar trigger para chamar send-push-notifications (PLURAL)
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
DECLARE
    notification_id uuid;
BEGIN
    RAISE NOTICE 'Trigger notify_new_aviso disparado para aviso: %', NEW.titulo;
    
    -- Inserir notificação na fila
    INSERT INTO push_notifications_queue (
        title,
        body,
        data,
        sent
    ) VALUES (
        'Novo Aviso',
        COALESCE(NEW.mensagem, NEW.titulo),
        jsonb_build_object(
            'type', 'aviso',
            'aviso_id', NEW.id,
            'titulo', NEW.titulo,
            'mensagem', NEW.mensagem
        ),
        false
    )
    RETURNING id INTO notification_id;
    
    RAISE NOTICE 'Notificação criada com ID: %', notification_id;
    
    -- Chamar edge function PLURAL (processa a fila)
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notifications',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := '{}'::jsonb
    );
    
    RAISE NOTICE 'Webhook chamado: send-push-notifications (plural)';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro no trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Comparação

| Aspecto | send-push-notification (singular) | send-push-notifications (plural) |
|---------|-----------------------------------|-----------------------------------|
| **Dados** | Via body do request | Via fila (push_notifications_queue) |
| **Uso** | Chamada direta | Processamento de fila |
| **Retry** | ❌ Não tem | ✅ Sim (fila persiste) |
| **Histórico** | ❌ Não | ✅ Sim (coluna `sent`) |
| **Performance** | Envia 1 por vez | ✅ Processa todas pendentes |
| **iOS + Android** | ✅ Sim | ✅ Sim |
| **Logs detalhados** | ✅ Sim | ✅ Sim (mais completos) |

---

## 🎯 Fluxo Completo com PLURAL

```
1. Admin cria aviso
   ↓
2. INSERT INTO avisos
   ↓
3. Trigger notify_new_aviso() dispara
   ↓
4. INSERT INTO push_notifications_queue (sent = false)
   ↓
5. Webhook chama send-push-notifications
   ↓
6. Edge function:
   - SELECT * FROM push_notifications_queue WHERE sent = false
   - Para cada notificação:
     * Busca TODOS os device_tokens
     * Envia via FCM para iOS e Android
     * UPDATE sent = true, sent_at = NOW()
   ↓
7. Notificações aparecem em todos os dispositivos! 🎉
```

---

## ✅ Vantagens da Função PLURAL

### 1. Não perde notificações
Se a edge function falhar temporariamente, a notificação fica na fila (`sent = false`) e será processada na próxima chamada.

### 2. Processa em lote
Se 3 avisos forem criados rapidamente:
- Trigger insere 3 na fila
- Edge function processa os 3 de uma vez
- Mais eficiente!

### 3. Histórico completo
```sql
-- Ver todas as notificações enviadas
SELECT * FROM push_notifications_queue 
WHERE sent = true 
ORDER BY sent_at DESC;
```

### 4. Debug fácil
```sql
-- Ver notificações pendentes (não enviadas)
SELECT * FROM push_notifications_queue 
WHERE sent = false;

-- Se houver alguma, chamar manualmente:
SELECT net.http_post(
  url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notifications',
  ...
);
```

---

## 🚀 Implementação

Execute: `atualizar-trigger-para-plural.sql`
