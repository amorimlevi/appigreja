# 🔧 Configurar Chave APNs no Firebase Console

## Problema
- Erro 401: "Auth error from APNS or Web Push Service"
- O Firebase precisa da chave APNs (.p8) para enviar notificações iOS
- Mesmo usando tokens FCM, o Firebase usa APNs por baixo dos panos

## Solução: Upload da Chave APNs

### Passo 1: Localizar sua chave APNs
Você já tem a chave:
- **Key ID**: `44UHHU47FR`
- **Team ID**: `LU3NTX93ML`
- **Arquivo**: AuthKey_44UHHU47FR.p8 (procure no seu computador)

### Passo 2: Fazer upload no Firebase Console

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. **Project Settings** (ícone de engrenagem) → **Cloud Messaging**
4. Na seção **Apple app configuration**:
   - Clique em **Upload** (ou **Configure** se já tiver algo)
   - Escolha **APNs Authentication Key** (.p8)
   
5. Preencha:
   - **APNs auth key**: Faça upload do arquivo `.p8`
   - **Key ID**: `44UHHU47FR`
   - **Team ID**: `LU3NTX93ML`

6. Clique em **Upload** ou **Save**

### Passo 3: Verificar
Após fazer upload, você deve ver:
- ✅ APNs certificate/key uploaded
- Key ID: 44UHHU47FR
- Team ID: LU3NTX93ML

### Passo 4: Testar
Após configurar, aguarde 1-2 minutos e teste enviando uma notificação novamente.

---

## Se não encontrar o arquivo .p8

Você pode gerar uma nova chave no Apple Developer:

1. Acesse: https://developer.apple.com/account/resources/authkeys/list
2. Clique em **+** para criar nova chave
3. Marque **Apple Push Notifications service (APNs)**
4. Clique em **Continue** → **Register**
5. **Download** o arquivo `.p8`
6. Anote o **Key ID** (será diferente)
7. Faça upload no Firebase conforme Passo 2

**IMPORTANTE**: O Team ID sempre será `LU3NTX93ML` (não muda).
