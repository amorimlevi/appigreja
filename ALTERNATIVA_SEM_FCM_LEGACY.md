# 🔔 Alternativa: Notificações Push SEM API Legacy

## Problema
A API Cloud Messaging (legada) pode estar desativada e dar erro ao tentar ativar no Google Cloud Console.

## ✅ Solução Alternativa - Usar Firebase Admin SDK

Esta solução **NÃO precisa** da API Legacy e é mais moderna!

### Passo 1: Obter Service Account Key do Firebase

1. Acesse o Firebase Console: https://console.firebase.google.com/
2. Selecione seu projeto
3. ⚙️ **Configurações do Projeto** (engrenagem)
4. Aba **Contas de serviço**
5. Clique em **Gerar nova chave privada**
6. Confirme e **baixe o arquivo JSON**
7. Guarde esse arquivo em local seguro

O arquivo terá este formato:
```json
{
  "type": "service_account",
  "project_id": "igreja-app-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@igreja-app.iam.gserviceaccount.com",
  ...
}
```

### Passo 2: Configurar Edge Function no Supabase

Crie uma edge function que usa o Firebase Admin SDK:

**Arquivo**: `supabase/functions/send-fcm-v1/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Service Account Key do Firebase (configure como variável de ambiente)
const SERVICE_ACCOUNT = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

interface PushPayload {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, any>
}

async function getAccessToken() {
  // Implementação do OAuth2 para obter token
  // ... (código completo no arquivo)
}

serve(async (req) => {
  try {
    const { tokens, title, body, data } = await req.json() as PushPayload
    const accessToken = await getAccessToken()
    
    const promises = tokens.map(async (token) => {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: data || {},
              android: { priority: 'high' },
            }
          }),
        }
      )
      
      return await response.json()
    })
    
    const results = await Promise.all(promises)
    
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Passo 3: Deploy da Edge Function

```bash
# Configurar secret com o Service Account
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Deploy
supabase functions deploy send-fcm-v1
```

### Passo 4: Atualizar Trigger SQL

Modifique o trigger para chamar a nova edge function:

```sql
CREATE OR REPLACE FUNCTION notify_new_aviso_v1()
RETURNS TRIGGER AS $$
DECLARE
    v_tokens TEXT[];
BEGIN
    -- Buscar tokens...
    SELECT ARRAY_AGG(DISTINCT dt.token)
    INTO v_tokens
    FROM device_tokens dt
    INNER JOIN members m ON m.id = dt.member_id;
    
    IF v_tokens IS NOT NULL AND array_length(v_tokens, 1) > 0 THEN
        PERFORM net.http_post(
            url := current_setting('app.settings.supabase_url') || '/functions/v1/send-fcm-v1',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
            ),
            body := jsonb_build_object(
                'tokens', v_tokens,
                'title', '📢 Novo Aviso',
                'body', NEW.titulo,
                'data', jsonb_build_object('type', 'aviso', 'aviso_id', NEW.id)
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🎯 Vantagens desta Abordagem

✅ **Não precisa da API Legacy**
✅ **Usa Firebase Cloud Messaging v1** (mais recente)
✅ **Mais seguro** (usa service account em vez de server key)
✅ **Suportado oficialmente** pelo Google

## ⚠️ Desvantagem

❌ Mais complexo de configurar
❌ Requer edge function do Supabase

## 🚀 Recomendação

Se você conseguir ativar a API Legacy, use a solução do `GUIA_RAPIDO_PUSH.md` (é mais simples).

Se não conseguir, use esta alternativa.
