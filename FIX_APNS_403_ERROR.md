# 🔴 Fix: APNs Error 403 - BadEnvironmentKeyInvalidEnvironment

## 🔍 Problema Identificado

Erro nos logs: `APNs error 403: BadEnvironmentKeyInvalidEnvironment`

### O que significa?

Este erro indica que as **credenciais APNs** configuradas no Supabase não são válidas para o ambiente de **produção**.

Possíveis causas:
1. ❌ Usando chave de **desenvolvimento** em servidor de **produção**
2. ❌ Bundle ID incorreto
3. ❌ Key ID ou Team ID incorretos
4. ❌ Chave privada (.p8) incorreta ou corrompida

## 🔧 Solução

### 1. Verificar Credenciais APNs Atuais

Acesse o Supabase Dashboard e verifique as variáveis de ambiente:
- https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions

Variáveis configuradas:
- `APNS_TEAM_ID` - Team ID da Apple
- `APNS_KEY_ID` - ID da chave APNs
- `APNS_PRIVATE_KEY` - Conteúdo do arquivo .p8
- `APNS_BUNDLE_ID` - Bundle ID do app

### 2. Gerar Nova Chave APNs de Produção

#### Passo a Passo:

1. **Acesse o Apple Developer Portal**
   - https://developer.apple.com/account/resources/authkeys/list

2. **Criar Nova Chave** (se necessário)
   - Clique em **"+"** (Create a key)
   - Nome: "App Igreja Push Production"
   - Marque: **Apple Push Notifications service (APNs)**
   - Clique em **Continue** e depois **Register**

3. **Download da Chave**
   - ⚠️ **IMPORTANTE**: Você só pode baixar a chave UMA VEZ!
   - Baixe o arquivo `.p8` (ex: `AuthKey_ABC123XYZ.p8`)
   - Anote o **Key ID** (ex: `ABC123XYZ`)

4. **Obter Team ID**
   - Acesse: https://developer.apple.com/account
   - No canto superior direito, veja seu **Team ID** (ex: `A1B2C3D4E5`)

5. **Verificar Bundle ID**
   - Acesse: https://developer.apple.com/account/resources/identifiers/list
   - Procure pelo app: `com.igrejazoe.member` ou `com.igrejazoe.admin`
   - Verifique se **Push Notifications** está habilitado

### 3. Configurar no Supabase

#### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions
2. Na seção **Edge Functions** > **send-push-notification**
3. Edite ou adicione as variáveis:

```
APNS_TEAM_ID=A1B2C3D4E5
APNS_KEY_ID=ABC123XYZ
APNS_BUNDLE_ID=com.igrejazoe.member
APNS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgE...(conteúdo do .p8)...==\n-----END PRIVATE KEY-----
```

⚠️ **Importante**: No `APNS_PRIVATE_KEY`, use `\n` para quebras de linha.

#### Opção B: Via CLI

Crie um arquivo `.env` local (não commitar!):

```bash
# .env.local
APNS_TEAM_ID=A1B2C3D4E5
APNS_KEY_ID=ABC123XYZ
APNS_BUNDLE_ID=com.igrejazoe.member
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEA...
...conteúdo completo do .p8...
...
=
-----END PRIVATE KEY-----"
```

Deploy com as variáveis:

```bash
supabase secrets set --env-file .env.local
```

### 4. Formato Correto do .p8

O arquivo `.p8` deve estar assim:

```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...várias linhas de texto base64...
...
GCCqGSM49AwEHA0IABP7...==
-----END PRIVATE KEY-----
```

**Para configurar no Supabase**, converta as quebras de linha em `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...\n-----END PRIVATE KEY-----
```

### 5. Script de Conversão

Crie um script para converter o .p8:

```bash
#!/bin/bash
# convert-p8-for-supabase.sh

if [ $# -eq 0 ]; then
    echo "Uso: ./convert-p8-for-supabase.sh AuthKey_ABC123XYZ.p8"
    exit 1
fi

echo "Chave convertida para formato Supabase:"
echo ""
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$1"
echo ""
echo ""
echo "Cole este valor na variável APNS_PRIVATE_KEY no Supabase Dashboard"
```

Uso:
```bash
chmod +x convert-p8-for-supabase.sh
./convert-p8-for-supabase.sh AuthKey_ABC123XYZ.p8
```

## 🧪 Testar a Configuração

### 1. Verificar se as variáveis estão corretas

```bash
# Ver logs em tempo real
supabase functions logs send-push-notification --tail
```

### 2. Criar um aviso de teste

No app admin, crie um novo aviso.

### 3. Verificar resposta esperada

**Sucesso:**
```
✅ Notification sent successfully to iOS device (member 123)
```

**Erro comum:**
```
❌ Failed to send to ios: Error: APNs error 403: BadEnvironmentKeyInvalidEnvironment
```

## 🔍 Troubleshooting

### Erro persiste após configurar credenciais?

1. **Verifique o Bundle ID**
   - Deve ser exatamente o mesmo do Xcode e Apple Developer
   - Ex: `com.igrejazoe.member` (sem espaços)

2. **Verifique a chave .p8**
   - Não pode ter espaços extras
   - Deve começar com `-----BEGIN PRIVATE KEY-----`
   - Deve terminar com `-----END PRIVATE KEY-----`

3. **Verifique Key ID e Team ID**
   - Key ID tem 10 caracteres (ex: `ABC123XYZ`)
   - Team ID tem 10 caracteres (ex: `A1B2C3D4E5`)

4. **Refaça o deploy**
   ```bash
   supabase functions deploy send-push-notification
   ```

### Erro 400: BadDeviceToken

Significa que o token do dispositivo é inválido. Possíveis causas:
- App foi reinstalado (gera novo token)
- Token de sandbox sendo usado em produção
- Token corrompido

**Solução:** O app registrará um novo token automaticamente.

### Erro 410: Unregistered

O token não é mais válido (app desinstalado).

**Solução:** A edge function remove automaticamente tokens inválidos.

## 📋 Checklist Final

- [ ] Chave APNs de produção criada no Apple Developer
- [ ] Arquivo .p8 baixado e salvo com segurança
- [ ] Key ID anotado
- [ ] Team ID anotado
- [ ] Bundle ID verificado
- [ ] Variáveis configuradas no Supabase
- [ ] Deploy da edge function realizado
- [ ] Teste com dispositivo da App Store
- [ ] Teste com dispositivo do TestFlight

## 📚 Referências

- [Apple: Creating APNs Keys](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_token-based_connection_to_apns)
- [Apple: Sending Notifications](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns)
- [Supabase: Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

---

**Próximo passo:** Após configurar as credenciais corretas, teste novamente criando um aviso.
