# Resumo: Correção de Push Notifications iOS

## ✅ Problemas Resolvidos

### 1. Tokens iOS eram FCM, mas Edge Function tentava usar APNs
**Problema:** Código iOS salvava tokens FCM, mas Edge Function tentava enviar via APNs HTTP/2, resultando em erro `400 BadDeviceToken`.

**Solução:** 
- Configurar Edge Function para usar FCM também no iOS
- Firebase gerencia APNs automaticamente
- Ambos os apps (Admin e Member) já tinham `GoogleService-Info.plist`

### 2. Bundle ID não estava sendo salvo com os tokens
**Problema:** Coluna `bundle_id` não existia, causando erros de configuração.

**Solução:**
- Adicionada coluna `bundle_id` na tabela `device_tokens`
- Código iOS atualizado para capturar e salvar Bundle ID via `@capacitor/app`
- Edge Function usa Bundle ID correto para cada token

### 3. Notificação duplicada (título + vazia)
**Problema:** App Admin chamava `notifyNewAviso()` manualmente + trigger do banco = 2 notificações.

**Solução:**
- Removida chamada manual em `ChurchAdminDashboard.jsx` (linha 6748)
- Apenas o trigger do banco envia notificação agora

### 4. Tokens inválidos deletados prematuramente
**Problema:** Edge Function deletava tokens em erro 400 (que podia ser config errada).

**Solução:**
- Agora só deleta em erro 410 (token definitivamente inválido)

## 📋 Arquivos Modificados

1. **src/services/pushNotifications.js**
   - Removido bloqueio para salvar token iOS
   - Adicionado captura de Bundle ID via `@capacitor/app`

2. **supabase/functions/send-push-notification/index.ts**
   - Alterado para enviar iOS via FCM (não APNs direto)
   - Configuração específica iOS (apns payload)
   - Remoção apenas em erro 410

3. **src/components/ChurchAdminDashboard.jsx**
   - Removida chamada duplicada `notifyNewAviso()`

4. **Banco de Dados**
   - Adicionada coluna `bundle_id` em `device_tokens`

## 🔧 Configurações Necessárias

### Firebase Console
- ✅ Apps iOS registrados (Admin e Member)
- ✅ GoogleService-Info.plist atualizado em ambos
- ✅ Chave APNs configurada (Key ID: 44UHHU47FR)

### Supabase
- ✅ `FIREBASE_SERVICE_ACCOUNT` configurado
- ✅ Edge Function `send-push-notification` deployada

## 🧪 Testes Validados

- ✅ Android: notificações chegam corretamente
- ✅ iOS (Admin): notificações chegam corretamente
- ✅ iOS (Member): notificações chegam corretamente
- ✅ Apenas 1 notificação por aviso (sem duplicação)
- ✅ Título e mensagem corretos
- ✅ Bundle ID salvo e usado corretamente

## 📦 Dependências Adicionadas

```json
{
  "@capacitor/app": "^7.1.0"
}
```

## 🚀 Próximos Passos (Opcional)

1. **Publicar apps atualizados:**
   - TestFlight/App Store (iOS)
   - Google Play (Android)

2. **Monitoramento:**
   - Verificar logs periodicamente: `npx supabase functions logs send-push-notification`
   - Limpar tokens antigos/inválidos se necessário

3. **Melhorias futuras:**
   - Rate limiting para evitar spam
   - Agendamento de notificações
   - Notificações personalizadas por usuário
   - Analytics de entrega

## 📚 Arquivos de Referência

- [IOS_FCM_SETUP.md](./IOS_FCM_SETUP.md) - Configuração FCM para iOS
- [BUILD_E_TESTAR_IOS.md](./BUILD_E_TESTAR_IOS.md) - Build e testes
- [CORRIGIR_BUNDLE_ID_IOS.md](./CORRIGIR_BUNDLE_ID_IOS.md) - Bundle ID
- [limpar-tokens-invalidos.sql](./limpar-tokens-invalidos.sql) - Limpeza de tokens
