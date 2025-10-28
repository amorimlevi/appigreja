# ✅ Solução: Notificações iOS Member App

## Problema
- Notificações pararam de chegar no app iOS Member
- App Admin funcionava normalmente
- Erro 401: "Auth error from APNS or Web Push Service"

## Causa Raiz
O Firebase Console tinha apenas a chave APNs de **produção** configurada, mas o app estava sendo testado via **Xcode** (ambiente de desenvolvimento).

## Solução Aplicada
Configurado a chave APNs de **desenvolvimento** no Firebase Console:
- **Desenvolvimento**: `AuthKey_NR39P4964J.p8` (Key ID: NR39P4964J)
- **Produção**: `AuthKey_44UHHU47FR.p8` (Key ID: 44UHHU47FR)
- **Team ID**: LU3NTX93ML

## Como Configurar (para referência futura)

### Firebase Console
1. Project Settings → Cloud Messaging
2. Apple app configuration:
   - **Chave de desenvolvimento**: Upload do `.p8` (para Xcode/TestFlight beta)
   - **Chave de produção**: Upload do `.p8` (para TestFlight/App Store)

### Ambientes
- **Xcode (Debug)**: Usa chave de desenvolvimento
- **TestFlight**: Pode usar desenvolvimento ou produção
- **App Store**: Usa chave de produção

## Verificação
- ✅ Token FCM válido (142 chars) no banco de dados
- ✅ Bundle ID correto: `com.igreja.member`
- ✅ GoogleService-Info.plist no projeto
- ✅ Chaves APNs configuradas para dev e prod
- ✅ Notificações chegando no Xcode

## Para Outros Membros
Os membros 31, 33, 34 ainda têm tokens APNs antigos (64 chars).
Eles precisam fazer **logout/login** no app para registrar novos tokens FCM.

## Scripts Úteis
- `monitor-token-update.mjs`: Monitora novos tokens
- `test-notification-member-37.mjs`: Envia notificação de teste
- `check-ios-tokens-temp.mjs`: Lista todos os tokens iOS
