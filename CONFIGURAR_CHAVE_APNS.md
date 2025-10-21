# 🔑 Configurar Chave APNs de Produção

## Passo a Passo

### 1. Converter o arquivo .p8

Se você salvou o arquivo .p8 (ex: `AuthKey_NR39P4964J.p8`), execute:

```bash
./convert-p8-for-supabase.sh AuthKey_NR39P4964J.p8
```

Copie todo o output (começando com `-----BEGIN PRIVATE KEY-----\n`).

**OU** abra o arquivo .p8 em um editor de texto e copie o conteúdo.

### 2. Anotar as informações

Você precisa de:
- ✅ **Key ID**: `NR39P4964J` (da imagem que você mostrou)
- ✅ **Team ID**: Encontre em https://developer.apple.com/account (canto superior direito)
- ✅ **Bundle ID**: `com.igrejazoe.member` ou `com.igrejazoe.admin`
- ✅ **Chave privada**: Conteúdo do arquivo .p8

### 3. Configurar no Supabase

1. **Acesse o dashboard:**
   https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions

2. **Encontre a seção "Edge Functions"**

3. **Clique em "send-push-notification"**

4. **Adicione/Edite as variáveis de ambiente:**

#### APNS_KEY_ID
```
NR39P4964J
```

#### APNS_TEAM_ID
```
[SEU-TEAM-ID]
```
(Exemplo: `A1B2C3D4E5` - encontre em https://developer.apple.com/account)

#### APNS_BUNDLE_ID
```
com.igrejazoe.member
```

#### APNS_PRIVATE_KEY

**Se você usou o script de conversão**, cole o output:
```
-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49...\n...\n-----END PRIVATE KEY-----
```

**Se você abriu o .p8 no editor**, precisa converter manualmente:
- Cole o conteúdo completo
- Substitua todas as quebras de linha por `\n`
- Deve ficar em uma única linha com `\n` no lugar das quebras

### 4. Salvar e Deploy

Após configurar todas as variáveis:

1. **Salve as configurações** no Supabase Dashboard
2. **Refaça o deploy** (para aplicar as novas variáveis):

```bash
supabase functions deploy send-push-notification
```

### 5. Testar

1. **Veja os logs em tempo real:**
```bash
supabase functions logs send-push-notification --tail
```

2. **No app admin, crie um novo aviso**

3. **Verifique se aparece nos logs:**
```
✅ Notification sent successfully to iOS device (member 123)
```

## ⚠️ Formato da Chave Privada

A chave privada deve estar assim **NO SUPABASE**:

```
-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...\nGCCqGSM49AwEHA0IABP7...==\n-----END PRIVATE KEY-----
```

(Tudo em uma linha, com `\n` representando quebras de linha)

## 🔍 Troubleshooting

### Ainda dá erro 403?
- Verifique se o Bundle ID está correto
- Verifique se o Key ID tem 10 caracteres
- Verifique se o Team ID está correto

### Erro: "Invalid key format"?
- A chave privada deve começar com `-----BEGIN PRIVATE KEY-----`
- Deve terminar com `-----END PRIVATE KEY-----`
- Não deve ter espaços extras no início ou fim

### Como ver meu Team ID?
1. Acesse https://developer.apple.com/account
2. No canto superior direito, abaixo do seu nome
3. Exemplo: `Team ID: A1B2C3D4E5`

---

**Próximo:** Após configurar, teste criando um novo aviso! 🎉
