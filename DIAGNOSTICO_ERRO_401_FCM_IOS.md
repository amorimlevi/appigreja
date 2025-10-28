# 🔍 Diagnóstico: Erro 401 FCM iOS

## Situação Atual
- ✅ Token FCM válido (142 chars)
- ✅ Chave APNs configurada no Firebase (44UHHU47FR)
- ✅ Android funciona
- ❌ iOS retorna erro 401: "Auth error from APNS"

## Causa Provável

O erro 401 ao enviar via FCM para iOS indica que **a chave APNs no Firebase está incorreta ou expirou**.

## Possíveis Problemas

### 1. Chave APNs Expirou
Chaves APNs não expiram, mas podem ser **revogadas** no Apple Developer.

**Verificar:**
1. Acesse: https://developer.apple.com/account/resources/authkeys/list
2. Veja se a chave `44UHHU47FR` está **ativa**
3. Se estiver revogada ou não aparecer, crie uma nova

### 2. Team ID ou Key ID Incorretos
No Firebase Console, verifique se:
- Key ID = `44UHHU47FR`
- Team ID = `LU3NTX93ML`

**Se estiver diferente**, exclua e faça upload novamente.

### 3. App iOS não está registrado no Firebase
**Verificar:**
1. Firebase Console → Project Settings → General
2. Na seção "Your apps", deve ter um app iOS
3. Bundle ID deve ser **exatamente**: `com.igreja.member`

**Se não tiver**, adicione:
1. Clique em "Add app" → iOS
2. Bundle ID: `com.igreja.member`
3. Download do `GoogleService-Info.plist`
4. Substitua no projeto iOS

### 4. Ambiente APNs Incorreto
Se o app foi instalado via:
- **Xcode/TestFlight**: Precisa de certificado de **desenvolvimento/sandbox**
- **App Store**: Precisa de certificado de **produção**

No Firebase, você tem "Chave de autenticação de APNs de **produção**".

**Se o app está em TestFlight/Desenvolvimento:**
Você também precisa fazer upload da chave para desenvolvimento (é a mesma chave .p8, mas em outro campo).

## Solução Recomendada

### Teste 1: Verificar chave no Apple Developer
```bash
# Abra no navegador
open https://developer.apple.com/account/resources/authkeys/list
```

Se a chave `44UHHU47FR` não aparecer ou estiver revogada:
1. Crie uma nova chave APNs
2. Download do .p8
3. Faça upload no Firebase novamente

### Teste 2: Usar a outra chave
Você tem outra chave: `AuthKey_NR39P4964J.p8`

Tente fazer upload desta no Firebase e veja se resolve.

### Teste 3: Reconfigurar do zero
1. Firebase Console → Cloud Messaging
2. **Exclua** a chave APNs atual
3. Faça **upload novamente** do `AuthKey_44UHHU47FR.p8`
4. Key ID: `44UHHU47FR`
5. Team ID: `LU3NTX93ML`
6. Clique em **Upload**

Aguarde 2-3 minutos e teste novamente.
