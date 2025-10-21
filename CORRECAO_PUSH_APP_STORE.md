# ✅ Correção: Push Notifications para App Store

## 🔍 Problema Identificado

Usuários que baixaram o app da **App Store** não estavam recebendo notificações push, enquanto usuários do **TestFlight** recebiam normalmente.

### Causa Raiz

A edge function `send-push-notification` estava configurada para usar dois servidores diferentes da Apple:
- **Sandbox** (`api.sandbox.push.apple.com`) - para TestFlight
- **Production** (`api.push.apple.com`) - para App Store

O código verificava a variável de ambiente `APNS_ENVIRONMENT`, que não estava configurada, fazendo com que **sempre usasse sandbox**.

## 🔧 Solução Aplicada

Modificamos a edge function para **sempre usar o servidor de produção** da Apple, pois:

1. ✅ Certificados de produção funcionam tanto para App Store quanto TestFlight
2. ✅ Simplifica a configuração (não precisa de variável de ambiente)
3. ✅ Garante que todos os usuários recebam notificações

### Mudança no Código

**Arquivo:** `supabase/functions/send-push-notification/index.ts`

**Antes (linhas 147-151):**
```typescript
// Determinar ambiente (production ou development/sandbox)
const isProduction = Deno.env.get('APNS_ENVIRONMENT') === 'production'
const apnsServer = isProduction 
  ? 'https://api.push.apple.com'
  : 'https://api.sandbox.push.apple.com'
```

**Depois:**
```typescript
// Sempre usar produção - funciona tanto para App Store quanto TestFlight
// Certificados de produção da Apple funcionam em ambos os ambientes
const apnsServer = 'https://api.push.apple.com'
```

## 📋 Checklist de Deploy

- [x] Código corrigido
- [x] Script de deploy criado
- [ ] Deploy da edge function realizado
- [ ] Teste com App Store
- [ ] Teste com TestFlight

## 🚀 Como Fazer o Deploy

Execute o script de deploy:

```bash
./deploy-fix-app-store-push.sh
```

Ou manualmente:

```bash
supabase functions deploy send-push-notification
```

## ✅ Como Testar

### 1. Teste com App Store

1. Abra o app baixado da **App Store**
2. Faça login como membro
3. No app admin, crie um **novo aviso**
4. Verifique se a notificação chega no dispositivo

### 2. Teste com TestFlight

1. Abra o app do **TestFlight**
2. Faça login como membro
3. No app admin, crie um **novo aviso**
4. Verifique se a notificação continua funcionando

### 3. Verificar Logs

Acompanhe os logs da edge function:

```bash
supabase functions logs send-push-notification --tail
```

Ou acesse o Supabase Dashboard:
- https://supabase.com/dashboard/project/[PROJECT-ID]/functions/send-push-notification/logs

## 🔍 Diagnóstico Adicional

Se as notificações ainda não chegarem, execute:

```sql
-- Verificar device tokens registrados
SELECT 
    COUNT(*) as total_devices,
    platform,
    COUNT(DISTINCT member_id) as unique_members
FROM device_tokens
GROUP BY platform;

-- Verificar últimos avisos criados
SELECT 
    id,
    titulo,
    created_at
FROM avisos
ORDER BY created_at DESC
LIMIT 5;

-- Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_new_aviso';
```

## 📚 Documentação Relacionada

- [FIX_APP_STORE_PUSH_NOTIFICATIONS.md](file:///Users/user/appigreja/FIX_APP_STORE_PUSH_NOTIFICATIONS.md) - Detalhes técnicos
- [Edge Function](file:///Users/user/appigreja/supabase/functions/send-push-notification/index.ts) - Código da função
- [Push Service](file:///Users/user/appigreja/src/services/pushNotifications.js) - Cliente de notificações
- [Apple APNs Documentation](https://developer.apple.com/documentation/usernotifications)

## ⚠️ Observações Importantes

1. **Certificados APNs**: Certifique-se de que está usando certificados de **produção** no Supabase
2. **Bundle ID**: Deve ser o mesmo usado na App Store (`com.igrejazoe.member` ou `com.igrejazoe.admin`)
3. **Capabilities**: Push Notifications deve estar habilitado no Xcode
4. **Permissions**: Usuários precisam aceitar notificações no primeiro uso

## 🎯 Resultado Esperado

Após o deploy, **todos** os dispositivos (App Store e TestFlight) devem receber notificações push quando:
- Um novo aviso é criado
- Um novo evento é criado (se implementado)
- Qualquer outra notificação configurada no trigger

---

**Status:** ✅ Correção aplicada, aguardando deploy e testes
**Data:** $(date +%Y-%m-%d)
