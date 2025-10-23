# Diagnóstico: Webhook não está funcionando

## Problema
As notificações foram inseridas mas não foram enviadas automaticamente.

## Possíveis Causas

1. **Webhook não foi criado** - Verifique se o webhook existe
2. **Webhook está desabilitado** - Verifique se está enabled
3. **Webhook falhou** - Veja os logs de erro
4. **Database Hooks não está disponível no plano** - Supabase pode ter restrições

## Verificações

### 1. Ver Database Hooks
Vá para: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/database/hooks

Você vê algum webhook criado? Se sim, qual o status?

### 2. Ver Logs do Webhook (se existir)
Clique no webhook e veja a aba "Logs" ou "Invocations"

### 3. Alternativa: Usar SQL Trigger + pg_net

Se Database Hooks não estiver disponível, podemos usar SQL trigger.

Execute este SQL para criar o trigger:

```sql
-- Verificar se pg_net está disponível
SELECT * FROM pg_available_extensions WHERE name = 'pg_net';

-- Se pg_net estiver disponível, criar trigger
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    request_id bigint;
BEGIN
    PERFORM net.http_post(
        url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 5000
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to trigger push notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS auto_send_push_notification ON push_notifications_queue;
CREATE TRIGGER auto_send_push_notification
    AFTER INSERT ON push_notifications_queue
    FOR EACH ROW
    WHEN (NEW.sent = false)
    EXECUTE FUNCTION trigger_push_notification();
    
-- Comentário
COMMENT ON FUNCTION trigger_push_notification() IS 'Automatically calls Edge Function to send push notifications when a new notification is inserted';
```

### 4. Testar o Trigger SQL

Depois de criar o trigger, execute:

```sql
-- Inserir notificação de teste
INSERT INTO push_notifications_queue (
    type,
    title,
    body,
    data,
    sent
) VALUES (
    'test-sql-trigger',
    '⚡ Teste SQL Trigger',
    'Testando se o trigger SQL funciona',
    ('{"type": "test-trigger", "timestamp": "' || NOW()::text || '"}')::jsonb,
    false
);

-- Aguardar 5 segundos
SELECT pg_sleep(5);

-- Verificar
SELECT 
    id,
    title,
    sent,
    sent_at,
    CASE 
        WHEN sent THEN '✅ ENVIADA'
        ELSE '❌ NÃO ENVIADA'
    END as status
FROM push_notifications_queue
WHERE type = 'test-sql-trigger'
ORDER BY created_at DESC
LIMIT 1;
```

## Solução Temporária: Processar Manualmente

Enquanto o trigger automático não funciona, você pode processar as notificações pendentes manualmente:

```sql
-- Ver quantas notificações estão pendentes
SELECT COUNT(*) FROM push_notifications_queue WHERE sent = false;

-- Depois ir ao Dashboard e clicar "Send Request"
-- Ou chamar via curl:
```

```bash
curl -X POST \
  "https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g" \
  -H "Content-Type: application/json" \
  -d '{}'
```
