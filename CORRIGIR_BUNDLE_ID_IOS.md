# Corrigir Bundle ID para Notificações iOS

## Problema
Você tem 2 apps iOS com Bundle IDs diferentes:
- **Admin**: `com.igreja.admin`
- **Member**: `com.igreja.member`

A Edge Function estava usando apenas `com.igreja.admin` para todos os tokens, causando erro `BadDeviceToken` nos tokens do app Member.

## Solução Implementada

### 1. Adicionar coluna `bundle_id` na tabela
```bash
# No SQL Editor do Supabase, execute:
cat fix-ios-bundle-id-push.sql
```

### 2. Código atualizado
- ✅ `pushNotifications.js`: agora envia o Bundle ID ao registrar o token
- ✅ `index.ts` (Edge Function): agora usa o Bundle ID correto de cada token

### 3. Deploy

```bash
# Deploy da Edge Function
npx supabase functions deploy send-push-notification
```

### 4. Testar

**No app iOS (Member ou Admin):**
1. Faça logout
2. Faça login novamente (isso vai re-registrar o token com o Bundle ID correto)
3. Crie um novo aviso no app Admin
4. Verifique se a notificação chegou

**Verificar logs:**
```bash
npx supabase functions logs send-push-notification --tail
```

Agora deve aparecer:
```
🍎 Sending to iOS device (member 30) via APNs [com.igreja.member]...
✅ Sent successfully to iOS device (member 30)
```

### 5. Limpar tokens antigos (opcional)

Se quiser remover tokens antigos sem Bundle ID:

```sql
-- Ver tokens sem bundle_id
SELECT id, member_id, platform, bundle_id, LEFT(token, 20) as token_preview
FROM device_tokens
WHERE platform = 'ios' AND bundle_id IS NULL;

-- Deletar tokens sem bundle_id (forçar re-registro)
DELETE FROM device_tokens 
WHERE platform = 'ios' AND bundle_id IS NULL;
```

## Verificação Final

```sql
-- Ver todos os tokens iOS com seus Bundle IDs
SELECT 
    member_id,
    bundle_id,
    LEFT(token, 20) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;
```

Resultado esperado:
- Tokens do app Admin: `com.igreja.admin`
- Tokens do app Member: `com.igreja.member`

## Importante

**Ambos os Bundle IDs precisam usar a mesma chave APNs!**

Verifique no Apple Developer Console:
1. Vá em **Keys** > sua chave APNs
2. Confirme que ambos `com.igreja.admin` e `com.igreja.member` estão habilitados para Push Notifications
3. Se não estiverem, você precisa:
   - Adicionar Push Notifications nos Capabilities de ambos os App IDs
   - OU criar uma chave APNs separada para cada Bundle ID e configurar múltiplas chaves no Supabase
