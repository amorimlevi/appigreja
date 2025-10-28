# Verificar Logs da Edge Function

## Como verificar:
1. Acesse o Supabase Dashboard
2. Vá em **Edge Functions** → `send-push-notification`
3. Clique em **Logs**
4. Procure pelo log da última notificação (10:53 ou depois)
5. Verifique se há erro 401, 400, ou outro código

## O que procurar:
- ❌ **Erro 401**: Problema de autenticação do Firebase
- ❌ **Erro 400**: Token inválido ou formato errado
- ❌ **Erro 404**: Token não registrado no Firebase
- ✅ **Success**: Se enviou mas não chegou, problema no app/device

## Se o erro for 401:
A chave APNs no Firebase Console pode ter expirado ou estar incorreta.

**Solução:**
1. Firebase Console → Cloud Messaging
2. Veja se a chave APNs está configurada
3. Se não estiver, faça upload da chave .p8 que você tem (ID: 44UHHU47FR)
