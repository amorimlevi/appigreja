# 🚀 Build iOS Member para TestFlight com FCM

## Pré-requisitos
✅ Código já usa `@capacitor-firebase/messaging`
✅ `GoogleService-Info.plist` configurado
✅ Firebase Console tem chave APNs (desenvolvimento + produção)

## Passos no Xcode

### 1. Abrir projeto
```bash
cd ios-member/App
open App.xcworkspace
```

### 2. Selecionar configuração
- Selecione o target: **App**
- Em "Signing & Capabilities":
  - Team: Selecione seu team (LU3NTX93ML)
  - Bundle ID: `com.igreja.member`
  - Provisioning Profile: Selecione o profile correto

### 3. Verificar Push Notifications
Em **Signing & Capabilities**:
- ✅ Push Notifications (deve estar habilitado)
- ✅ Background Modes → Remote notifications (deve estar marcado)

### 4. Incrementar Build Number
Em **General** → **Identity**:
- Incremente a **Build** (exemplo: de 1.0.0 (1) para 1.0.0 (2))

### 5. Build para Archive
1. Menu: **Product** → **Destination** → Selecione **Any iOS Device (arm64)**
2. Menu: **Product** → **Archive**
3. Aguarde o build compilar

### 6. Upload para TestFlight
1. Quando o Organizer abrir, selecione o archive
2. Clique em **Distribute App**
3. Selecione **App Store Connect**
4. Clique em **Upload**
5. Deixe as opções padrão e clique em **Next**
6. Revise e clique em **Upload**
7. Aguarde o upload (pode demorar 5-10 minutos)

### 7. Processar no TestFlight
1. Acesse: https://appstoreconnect.apple.com
2. My Apps → Igreja Membro
3. TestFlight
4. Aguarde processamento (10-30 minutos)
5. Quando processar, distribua para testadores

## Depois do Build

### 1. Instalar no device via TestFlight
Abra o app TestFlight no iPhone e atualize o app.

### 2. Fazer logout/login
No app atualizado:
1. Faça logout
2. Faça login novamente
3. O app vai registrar token FCM automaticamente

### 3. Testar notificação
```bash
node test-notification-member-37.mjs
```

## Troubleshooting

### Erro de assinatura
- Verifique se o Provisioning Profile está válido
- Pode precisar criar novo profile no Apple Developer

### Build falha
- Rode: `pod install` no diretório `ios-member/App`
- Limpe: Product → Clean Build Folder

### GoogleService-Info.plist não encontrado
- Verifique se está em: `ios-member/App/App/GoogleService-Info.plist`
- Deve estar adicionado ao target no Xcode
