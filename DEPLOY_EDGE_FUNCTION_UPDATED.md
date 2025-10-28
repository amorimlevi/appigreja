# 🚀 Deploy da Edge Function Atualizada

## O que foi alterado
A função agora detecta automaticamente o tipo de token:
- **Token APNs** (64 chars hexadecimais): Envia via APNs HTTP/2
- **Token FCM** (>100 chars): Envia via Firebase Cloud Messaging

## Como fazer deploy

### Opção 1: Supabase Dashboard (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard
2. Vá em **Edge Functions** → `send-push-notification`
3. Clique em **Edit function**
4. Copie TODO o conteúdo do arquivo atualizado:
   ```
   /Users/user/appigreja/supabase/functions/send-push-notification/index.ts
   ```
5. Cole no editor
6. Clique em **Deploy**

### Opção 2: Via CLI

```bash
# Link o projeto (se ainda não fez)
npx supabase link --project-ref SEU_PROJECT_REF

# Deploy
npx supabase functions deploy send-push-notification
```

## Testar após deploy

Aguarde 1-2 minutos e rode:
```bash
node test-notification-member-37.mjs
```

A notificação deve chegar no TestFlight agora!
