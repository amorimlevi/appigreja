# Fix: Push Notifications para App Store

## Problema Identificado

Apps baixados da **App Store** não estão recebendo notificações push porque:

1. **Ambiente APNs incorreto**: A edge function precisa usar o servidor de **produção** da Apple para apps da App Store
2. **Configuração de ambiente**: A variável `APNS_ENVIRONMENT` precisa estar definida como `production`

## Diferença entre TestFlight e App Store

- **TestFlight**: Usa servidor **sandbox** da Apple (`api.sandbox.push.apple.com`)
- **App Store**: Usa servidor **production** da Apple (`api.push.apple.com`)

## Solução

### 1. Verificar Variável de Ambiente no Supabase

A edge function `send-push-notification` verifica a variável `APNS_ENVIRONMENT`:

```typescript
// Linha 148-151 da edge function
const isProduction = Deno.env.get('APNS_ENVIRONMENT') === 'production'
const apnsServer = isProduction 
  ? 'https://api.push.apple.com'
  : 'https://api.sandbox.push.apple.com'
```

### 2. Configurar no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/[SEU-PROJECT-ID]/settings/functions
2. Na seção **Environment Variables** da edge function `send-push-notification`, adicione:
   - **Name**: `APNS_ENVIRONMENT`
   - **Value**: `production`

### 3. Solução Alternativa: Detectar Automaticamente

**Melhor solução**: Modificar a edge function para **tentar produção primeiro, depois sandbox** automaticamente:

```typescript
// Substituir linha 148-151 por lógica inteligente
async function sendToApns(deviceToken: string, notification: any, bundleId: string, jwt: string) {
  // Tentar produção primeiro
  let response = await fetch(
    `https://api.push.apple.com/3/device/${deviceToken}`,
    { /* ... */ }
  )
  
  // Se falhar com BadDeviceToken, tentar sandbox
  if (!response.ok) {
    const error = await response.json()
    if (error.reason === 'BadDeviceToken') {
      console.log('Trying sandbox environment...')
      response = await fetch(
        `https://api.sandbox.push.apple.com/3/device/${deviceToken}`,
        { /* ... */ }
      )
    }
  }
  
  return response
}
```

### 4. Opção Mais Simples: Sempre Usar Produção

Como o certificado de **produção funciona tanto para App Store quanto para TestFlight**, a solução mais simples é:

**Sempre usar o servidor de produção:**

Modifique a linha 148-151 da edge function para:

```typescript
// Sempre usar produção (funciona para App Store e TestFlight)
const apnsServer = 'https://api.push.apple.com'
```

## Implementação Recomendada

Vou implementar a **Opção 4** (sempre usar produção) pois é a mais simples e funciona em todos os casos.

## Verificação

Após fazer a mudança, teste:

1. **App Store**: Criar um novo aviso e verificar se a notificação chega
2. **TestFlight**: Verificar se continua funcionando
3. **Logs**: Verificar os logs da edge function no Supabase Dashboard

## Arquivos Relacionados

- [Edge Function](file:///Users/user/appigreja/supabase/functions/send-push-notification/index.ts)
- [Push Notifications Service](file:///Users/user/appigreja/src/services/pushNotifications.js)
- [Trigger SQL](file:///Users/user/appigreja/setup-push-notification-triggers-v3.sql)
