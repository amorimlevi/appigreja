# 🔍 Diagnóstico: Erro 401 no FCM para iOS

## Problema
- **Erro 401**: Autenticação falhou ao enviar para iOS via FCM
- Android funciona ✅
- iOS member 37 tem token FCM válido mas recebe 401

## Causa Provável
O `FIREBASE_SERVICE_ACCOUNT` no Supabase Edge Function pode estar:
1. Incorreto ou expirado
2. Não ter permissões para iOS
3. Ser de um projeto Firebase diferente

## Solução

### Passo 1: Verificar projeto Firebase
No Firebase Console (https://console.firebase.google.com):
1. Vá em **Project Settings** (ícone de engrenagem)
2. Aba **General** → veja o **Project ID**
3. Deve ser o mesmo que está na credencial

### Passo 2: Gerar nova credencial
1. Firebase Console → **Project Settings**
2. Aba **Service accounts**
3. Clique em **Generate new private key**
4. Salve o arquivo JSON

### Passo 3: Atualizar no Supabase
1. Supabase Dashboard → **Edge Functions**
2. Selecione `send-push-notification`
3. **Secrets** → Edite `FIREBASE_SERVICE_ACCOUNT`
4. Cole TODO o conteúdo do JSON (deve incluir `project_id`, `private_key`, `client_email`)

### Passo 4: Verificar se o app iOS está no Firebase
1. Firebase Console → **Project Settings** → **General**
2. Na seção **Your apps**, deve ter:
   - ☑️ App Android (com pacote `com.igreja.admin` ou similar)
   - ☑️ **App iOS** (com bundle ID `com.igreja.member`)
   
**SE NÃO TIVER APP iOS REGISTRADO:**
1. Clique em **Add app** → **iOS**
2. Bundle ID: `com.igreja.member`
3. Baixe o `GoogleService-Info.plist` e adicione ao projeto Xcode

## Testar
Após atualizar, rode novamente o teste de notificação.
