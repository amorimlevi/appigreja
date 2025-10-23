# Testar Push Notifications via Dashboard do Supabase

Como o `pg_net` está com problemas de DNS, vamos testar diretamente:

## Método 1: Usar o botão "Invoke" no Dashboard

1. Vá para: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/functions/send-push-notification

2. Clique no botão **"Invoke"** (ou "Test")

3. Use este JSON como payload (deixe vazio ou use `{}`):
   ```json
   {}
   ```

4. Clique em **"Run"** ou **"Execute"**

5. Veja a resposta e os **Logs**

6. Verifique se as notificações foram processadas:
   - Vá para SQL Editor
   - Execute:
   ```sql
   SELECT id, title, sent, sent_at 
   FROM push_notifications_queue 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## Método 2: Usar curl (no terminal local)

```bash
curl -X POST \
  "https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## O que esperar

**Logs esperados (no Dashboard):**
```
🔧 Creating Supabase client
📬 Found X pending notifications
🔑 Using Firebase project: igreja-app-fe3db
✅ Firebase access token obtained
📤 Processing notification XX: "..."
📱 Found X device tokens (iOS: X, Android: X)
✅ Sent successfully to ios device (member X)
✅ Sent successfully to android device (member X)
✅ Notification XX marked as sent
📊 Summary: X notifications sent successfully
```

**Erros comuns:**
- `❌ FIREBASE_SERVICE_ACCOUNT not configured` → Falta configurar o Secret
- `❌ Failed to send to ios/android` → Ver detalhes do erro do Firebase
- `⚠️ No device tokens found` → Nenhum token registrado

## Após o teste

Verifique no celular se as notificações chegaram!
