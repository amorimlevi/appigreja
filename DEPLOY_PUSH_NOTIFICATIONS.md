# 🚀 Deploy Push Notifications - Passo a Passo

## Situação Atual

✅ Token APNs sendo gerado no iOS
✅ Token salvo no Supabase (tabela `device_tokens`)
✅ Trigger criando avisos na fila (`push_notifications_queue`)
✅ Edge Function criada (`send-push-notifications`)
❌ **Edge Function não está deployada/executando**

---

## Passo 1: Deploy da Edge Function

### Opção A: Via Supabase Dashboard (Recomendado)

1. Abra [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Edge Functions**
3. Clique em **New function**
4. Nome: `send-push-notifications`
5. Cole o conteúdo de `supabase/functions/send-push-notifications/index.ts`
6. Clique em **Deploy**

### Opção B: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Link com seu projeto
supabase link --project-ref [seu-project-ref]

# Deploy da função
supabase functions deploy send-push-notifications
```

---

## Passo 2: Configurar FCM Server Key

1. No Firebase Console, vá em **Project Settings** > **Cloud Messaging**
2. Copie a **Server Key** (legacy)
3. No Supabase Dashboard:
   - Vá em **Edge Functions** > `send-push-notifications`
   - Clique em **Settings** ou **Secrets**
   - Adicione:
     - Key: `FCM_SERVER_KEY`
     - Value: [sua server key do Firebase]

---

## Passo 3: Executar Triggers SQL

Execute o SQL se ainda não fez:

```sql
-- No Supabase SQL Editor
\i setup-push-notification-triggers.sql
```

---

## Passo 4: Configurar Execução Automática

### Opção A: Database Webhook (Recomendado)

Crie uma função que chama a Edge Function automaticamente:

```sql
-- Criar função que chama a Edge Function via pg_net
CREATE OR REPLACE FUNCTION call_send_push_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Usar pg_net para chamar a Edge Function
    PERFORM net.http_post(
        url := 'https://[seu-projeto].supabase.co/functions/v1/send-push-notifications',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para chamar a função
DROP TRIGGER IF EXISTS trigger_send_push_after_queue ON push_notifications_queue;
CREATE TRIGGER trigger_send_push_after_queue
    AFTER INSERT ON push_notifications_queue
    FOR EACH ROW
    EXECUTE FUNCTION call_send_push_notifications();
```

**Configure a variável do service role key:**

```sql
-- No Supabase SQL Editor
ALTER DATABASE postgres SET app.settings.service_role_key = '[seu-service-role-key]';
```

### Opção B: Supabase Cron (Alternativa)

Se preferir executar a cada minuto:

1. No Supabase Dashboard, vá em **Database** > **Cron Jobs**
2. Clique em **Create a new cron job**
3. Nome: `process-push-notifications`
4. Schedule: `* * * * *` (a cada minuto)
5. SQL:
```sql
SELECT net.http_post(
    url := 'https://[seu-projeto].supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [seu-service-role-key]'
    ),
    body := '{}'::jsonb
);
```

### Opção C: Chamar Manualmente (Para Testes)

Você pode chamar manualmente via HTTP:

```bash
curl -X POST \
  'https://[seu-projeto].supabase.co/functions/v1/send-push-notifications' \
  -H 'Authorization: Bearer [seu-service-role-key]' \
  -H 'Content-Type: application/json'
```

---

## Passo 5: Testar

1. **Crie um aviso** no app admin
2. **Verifique no Supabase** se entrou na tabela `push_notifications_queue`:
   ```sql
   SELECT * FROM push_notifications_queue ORDER BY created_at DESC LIMIT 5;
   ```
3. **Chame a Edge Function** (manualmente ou via trigger)
4. **Verifique se foi marcada como enviada**:
   ```sql
   SELECT * FROM push_notifications_queue WHERE sent = true ORDER BY sent_at DESC LIMIT 5;
   ```
5. **Veja os logs** da Edge Function:
   - Supabase Dashboard > Edge Functions > send-push-notifications > Logs

---

## 🐛 Troubleshooting

### Notificação não chega

1. **Verifique se está na fila**:
   ```sql
   SELECT * FROM push_notifications_queue WHERE sent = false;
   ```

2. **Verifique se tem tokens**:
   ```sql
   SELECT * FROM device_tokens;
   ```

3. **Chame manualmente** a Edge Function para ver os logs

4. **Verifique a FCM Server Key** está configurada corretamente

### Erro "FCM_SERVER_KEY not configured"

- Configure o secret na Edge Function (Passo 2)

### Erro de autenticação

- Verifique se está usando o **Service Role Key**, não o anon key

---

## 📝 Checklist Final

- [ ] Edge Function deployada no Supabase
- [ ] FCM Server Key configurada nos secrets
- [ ] Triggers SQL executados (`setup-push-notification-triggers.sql`)
- [ ] Webhook ou Cron configurado para executar automaticamente
- [ ] Testado criando um aviso
- [ ] Notificação chegou no iPhone

---

## 🚀 Próximos Passos (Opcional)

### Melhorias:
1. **Retry logic** - Tentar enviar novamente se falhar
2. **Rate limiting** - Limitar envios por dispositivo
3. **Segmentação** - Enviar apenas para usuários específicos
4. **Analytics** - Rastrear taxa de abertura
5. **Agendamento** - Enviar notificações em horários específicos

### Para Produção:
1. Mudar `aps-environment` para `production` no `App.entitlements`
2. Rebuild com certificado de produção
3. Testar no TestFlight
4. Monitorar logs de envio

---

## Documentação

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
