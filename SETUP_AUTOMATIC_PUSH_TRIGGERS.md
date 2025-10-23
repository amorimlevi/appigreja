# Configurar Triggers Automáticos de Push Notifications

## Problema
Atualmente as notificações precisam ser disparadas manualmente via Dashboard. Queremos que sejam enviadas automaticamente quando:
- Um novo aviso é criado
- Um novo evento é criado
- Uma notificação é inserida na `push_notifications_queue`

## Solução: Database Webhooks

Como `pg_net` tem problemas de DNS, vamos usar **Database Webhooks** do Supabase.

## Passos

### 1. Criar Database Webhook no Dashboard

1. Acesse: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/database/hooks

2. Clique em **"Create a new hook"**

3. Configure:
   - **Name:** `auto-send-push-notifications`
   - **Table:** `push_notifications_queue`
   - **Events:** Marque apenas ☑️ **Insert**
   - **Type:** `HTTP Request`
   - **HTTP Method:** `POST`
   - **URL:** `https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification`
   - **HTTP Headers:**
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g
     Content-Type: application/json
     ```
   - **Payload:** `{}`
   - **Timeout:** 5000 (5 segundos)

4. Clique em **"Create hook"**

### 2. Testar o Webhook

Execute no SQL Editor:

```sql
-- Inserir notificação de teste
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-webhook',
    '🚀 Teste Webhook Automático',
    'Esta notificação deve ser enviada automaticamente!',
    ('{"type": "test-webhook", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- Aguarde 3 segundos e verifique se foi enviada
SELECT pg_sleep(3);

SELECT 
    id,
    title,
    sent,
    sent_at,
    created_at
FROM push_notifications_queue
WHERE type = 'test-webhook'
ORDER BY created_at DESC;
```

Se `sent = true`, o webhook funcionou! ✅

### 3. Verificar Logs do Webhook

Vá para:
https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/database/hooks

Clique no webhook `auto-send-push-notifications` e veja os **Logs**.

### 4. (Opcional) Criar Webhooks para Avisos e Eventos

Se quiser que avisos e eventos disparem notificações automaticamente:

#### Webhook para Avisos

1. Vá em Database Hooks
2. Create new hook:
   - **Name:** `notify-new-aviso`
   - **Table:** `avisos`
   - **Events:** ☑️ Insert
   - **Type:** `SQL`
   - **SQL Function:**
   ```sql
   INSERT INTO push_notifications_queue (type, title, body, data, sent)
   VALUES (
       'aviso',
       'Novo Aviso',
       NEW.titulo,
       jsonb_build_object('aviso_id', NEW.id, 'type', 'aviso'),
       false
   );
   ```

#### Webhook para Eventos

1. Create new hook:
   - **Name:** `notify-new-event`
   - **Table:** `events`
   - **Events:** ☑️ Insert
   - **Type:** `SQL`
   - **SQL Function:**
   ```sql
   INSERT INTO push_notifications_queue (type, title, body, data, sent)
   VALUES (
       'evento',
       'Novo Evento',
       NEW.nome,
       jsonb_build_object('evento_id', NEW.id, 'type', 'evento'),
       false
   );
   ```

## Alternativa: Usar Supabase Cron (se Webhooks não funcionarem)

Se os webhooks não funcionarem, podemos usar um Cron Job que verifica a fila a cada minuto.

### Criar Cron Job

SQL:
```sql
-- Cria extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar job para executar a cada minuto
SELECT cron.schedule(
    'process-push-notifications',  -- nome do job
    '* * * * *',                    -- a cada minuto
    $$
    SELECT net.http_post(
        url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g", "Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);

-- Ver jobs agendados
SELECT * FROM cron.job;
```

**Nota:** pg_cron pode não estar disponível em planos gratuitos do Supabase.

## Verificação Final

Depois de configurar, teste criando um novo aviso ou evento no app e veja se a notificação chega automaticamente nos dispositivos! 📱
