# Configurar APNs na Edge Function

## Problema
- iOS usa tokens **APNs** (nativos da Apple)
- Android usa tokens **FCM** (Firebase)
- Edge Function atual só suporta FCM

## Solução
Modificar Edge Function para suportar **ambos**:
- iOS → enviar via APNs HTTP/2
- Android → continuar via FCM (não muda nada)

## Passos

### 1. Obter credenciais APNs

No Apple Developer:
1. Vá em **Certificates, Identifiers & Profiles**
2. Clique em **Keys** (menu lateral)
3. Crie uma nova chave (+)
   - Nome: "APNs Push Notification Key"
   - Marque: **Apple Push Notifications service (APNs)**
4. Baixe o arquivo `.p8` (ex: `AuthKey_ABC123XYZ.p8`)
5. Anote:
   - **Key ID**: ABC123XYZ (aparece no nome do arquivo)
   - **Team ID**: encontre em "Membership" no Apple Developer

### 2. Configurar variáveis de ambiente no Supabase

No Supabase Dashboard > Project Settings > Edge Functions > Manage Secrets:

```bash
APNS_AUTH_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEH...
[conteúdo completo do arquivo .p8]
...
-----END PRIVATE KEY-----

APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=DEF456UVW
APNS_BUNDLE_ID=com.igreja.admin
```

**Importante**: O `APNS_AUTH_KEY` deve incluir as linhas BEGIN/END e todas as quebras de linha.

### 3. Fazer backup e substituir index.ts

```bash
# Backup
cp supabase/functions/send-push-notification/index.ts supabase/functions/send-push-notification/index-old.ts

# Substituir
cp supabase/functions/send-push-notification/index-with-apns.ts supabase/functions/send-push-notification/index.ts
```

### 4. Deploy da Edge Function

```bash
npx supabase functions deploy send-push-notification
```

### 5. Testar

Crie um aviso no app admin iOS e verifique os logs:
```bash
npx supabase functions logs send-push-notification
```

Deve aparecer:
- `🍎 Sending to iOS device via APNs...`
- `✅ Sent successfully to iOS device`
- `✅ Sent successfully to Android device` (se houver Android)

## Verificação

Execute no SQL Editor:
```sql
-- Ver tokens por plataforma
SELECT 
    platform,
    COUNT(*) as total,
    AVG(LENGTH(token)) as tamanho_medio_token
FROM device_tokens
GROUP BY platform;
```

Resultado esperado:
- iOS: 142 caracteres (APNs)
- Android: 142-160 caracteres (FCM)

## Rollback

Se algo der errado:
```bash
cp supabase/functions/send-push-notification/index-old.ts supabase/functions/send-push-notification/index.ts
npx supabase functions deploy send-push-notification
```
