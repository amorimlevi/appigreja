# Configuração iOS com FCM

## ✅ O que foi feito

1. **Edge Function atualizada** para enviar iOS via FCM (não APNs direto)
2. **Deploy realizado** com sucesso

## ⚙️ Pré-requisitos

Para FCM funcionar no iOS, você precisa ter:

### 1. GoogleService-Info.plist nos apps iOS

Verifique se os arquivos existem:
- `ios-admin/App/App/GoogleService-Info.plist`
- `ios-member/App/App/GoogleService-Info.plist`

✅ **Já existem!** (confirmado)

### 2. APNs Key configurada no Firebase Console

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Project Settings** (⚙️) → **Cloud Messaging**
4. Na seção **Apple app configuration**:
   - Clique em **Upload** (APNs Authentication Key)
   - Faça upload do arquivo `.p8` (chave APNs)
   - Preencha:
     - **Key ID**: (do nome do arquivo)
     - **Team ID**: (da conta Apple Developer)

**Importante:** Ambos os apps (Admin e Member) precisam estar registrados no Firebase com seus Bundle IDs corretos.

### 3. Firebase Service Account no Supabase

✅ Você já tem configurado: `FIREBASE_SERVICE_ACCOUNT`

## 🧪 Teste

1. **Crie um aviso** no app Admin
2. **Verifique os logs** da Edge Function:
   ```bash
   npx supabase functions logs send-push-notification --tail
   ```

3. **Logs esperados:**
   ```
   📤 Sending to ios device (member X) via FCM...
   ✅ Sent successfully to ios device (member X)
   ```

## 🔧 Se não funcionar

### Erro: "Requested entity was not found"
**Causa:** App iOS não está registrado no Firebase
**Solução:** 
1. No Firebase Console, adicione os apps iOS
2. Baixe novos `GoogleService-Info.plist`
3. Substitua nos projetos iOS
4. Build novamente

### Erro: "Invalid APNs credentials"
**Causa:** Chave APNs não está configurada no Firebase
**Solução:** Faça upload da chave .p8 no Firebase Console (passo 2 acima)

### Notificação não chega
**Causa:** Token FCM não é válido
**Solução:** 
1. Faça logout/login no app
2. Verifique no Xcode Console se aparece "FCM Token:"
3. Execute a query para ver se token foi salvo:
   ```sql
   SELECT member_id, platform, LENGTH(token), LEFT(token, 20)
   FROM device_tokens 
   WHERE platform = 'ios' 
   ORDER BY updated_at DESC;
   ```

## 📝 Benefícios desta abordagem

- ✅ Um único provedor (FCM) para iOS e Android
- ✅ Não precisa gerenciar APNs diretamente
- ✅ Firebase gerencia ambiente (sandbox/production) automaticamente
- ✅ Código mais simples na Edge Function
