# Fix: Push Notifications no TestFlight

## Problema Identificado

❌ **App configurado para `development` mas TestFlight usa `production`**

## Soluções Necessárias

### 1. ✅ FEITO: Atualizar App.entitlements

O arquivo `ios-member/App/App/App.entitlements` foi atualizado para `production`.

### 2. ⚠️ IMPORTANTE: Configurar Variável de Ambiente no Supabase

A Edge Function precisa saber que deve usar o servidor de production da APNs.

**Passo a passo:**

1. Acesse: https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions
2. Vá em **Edge Functions** > **Environment variables**
3. Adicione uma nova variável:
   - **Name:** `APNS_ENVIRONMENT`
   - **Value:** `production`
4. Clique em **Save**

### 3. Redeployar a Edge Function

Após adicionar a variável, a Edge Function precisa ser reimplantada:

```bash
cd /Users/user/appigreja
supabase functions deploy send-push-notification
```

Ou reimplante manualmente no Dashboard:
- Vá em **Edge Functions** > `send-push-notification`
- Clique em **Redeploy**

### 4. Gerar Nova Build para TestFlight

Você precisa gerar uma nova build com o entitlement correto:

#### Opção A: Via Xcode

1. Abra `/Users/user/appigreja/ios-member/App/App.xcworkspace` no Xcode
2. Selecione **Any iOS Device (arm64)**
3. Menu: **Product** > **Archive**
4. Após o Archive, clique em **Distribute App**
5. Escolha **TestFlight & App Store**
6. Siga os passos para upload

#### Opção B: Via CLI (se configurado)

```bash
cd /Users/user/appigreja
npm run build:member
cp dist/index.member.html dist/index.html
npx cap sync ios
# Depois abra o Xcode e faça o Archive
```

### 5. Verificar Certificados APNs

Certifique-se de que você tem o certificado/chave APNs de **PRODUCTION** configurado:

1. Acesse: https://developer.apple.com/account/resources/authkeys/list
2. Verifique se sua chave APNs tem **Apple Push Notifications service (APNs)** habilitado
3. A mesma chave funciona para development E production

### 6. Testar Após Nova Build

Após enviar para TestFlight e instalar a nova versão:

1. Abra o app instalado via TestFlight
2. Faça login
3. Aceite as permissões de notificação
4. Verifique no Supabase se o token foi registrado:

```sql
SELECT 
    id,
    member_id,
    LEFT(token, 20) || '...' as token_preview,
    platform,
    created_at
FROM device_tokens
ORDER BY created_at DESC
LIMIT 5;
```

5. Teste enviando uma notificação (crie um novo aviso no app admin)

## Diferenças entre Development e Production

| Ambiente | APNs Server | Quando Usar |
|----------|-------------|-------------|
| `development` | `api.sandbox.push.apple.com` | Xcode, Simulador, builds de desenvolvimento |
| `production` | `api.push.apple.com` | TestFlight, App Store |

## Troubleshooting

### Token não aparece na tabela device_tokens

1. Verifique o console do Safari Web Inspector conectado ao dispositivo
2. Procure por logs de erro: `❌ Registration error`
3. Verifique se a permissão foi concedida

### Notificação não chega

1. Verifique os logs da Edge Function no Supabase
2. Procure por erros como "BadDeviceToken" ou "Unregistered"
3. Verifique se `APNS_ENVIRONMENT=production` está configurado

### Erro "Invalid token" ou 410

Isso acontece quando:
- O app foi desinstalado
- O token expirou
- O ambiente (dev/prod) está errado

A Edge Function remove automaticamente esses tokens inválidos.
