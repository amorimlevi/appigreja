# Problema Identificado

A Edge Function `send-push-notifications` está sendo executada (status 200), mas **não está marcando as notificações como enviadas** (`sent = true`).

## Causa Raiz

A função usa:
```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
```

Mas essas variáveis de ambiente **não estão configuradas** na Edge Function.

## Solução

Adicionar Secrets na Edge Function:

1. Acesse: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/functions/send-push-notifications
2. Clique na aba **"Secrets"**
3. Adicione (se não existirem):

### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://dvbdvftakl5tyhpqznmu.supabase.co`

### Secret 2: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g`

### Secret 3: FIREBASE_SERVICE_ACCOUNT (já deve existir)
Se não existir, adicione com o conteúdo completo do JSON:
```json
{
  "type": "service_account",
  "project_id": "igreja-app-fe3db",
  ...todo o conteúdo do arquivo JSON
}
```

## Testar Após Configurar

Após adicionar os Secrets, execute novamente:
```sql
SELECT net.http_post(
    url := 'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g'
    ),
    body := '{}'::jsonb
) as request_id;
```

Aguarde 15 segundos e verifique se `sent = true`.
