# Build e Teste iOS - Correção Push Notifications

## Problema
Os tokens iOS ainda são FCM (142 chars) porque o código antigo está instalado nos dispositivos.

## Solução

### 1. Sync e Build iOS

**Para o app Admin:**
```bash
# Sync do código web para iOS
npx cap sync ios --config capacitor.config.admin.json

# Abrir no Xcode
npx cap open ios --config capacitor.config.admin.json

# No Xcode:
# 1. Selecione o target "App"
# 2. Selecione seu dispositivo/simulador
# 3. Clique em "Run" (▶️) ou Product > Run
```

**Para o app Member:**
```bash
# Sync do código web para iOS
npx cap sync ios --config capacitor.config.member.json

# Abrir no Xcode
npx cap open ios --config capacitor.config.member.json

# No Xcode:
# 1. Selecione o target "App"
# 2. Selecione seu dispositivo/simulador
# 3. Clique em "Run" (▶️) ou Product > Run
```

### 2. Configurar ambiente APNs no Supabase

No Supabase Dashboard → Settings → Edge Functions → Secrets:

**Se está testando em desenvolvimento/TestFlight:**
```
APNS_ENVIRONMENT=sandbox
```

**Se está testando em App Store:**
```
APNS_ENVIRONMENT=production
```

### 3. Testar

1. **Abra o app iOS** (Admin ou Member)
2. **Faça login**
3. Veja os logs no Xcode Console - deve aparecer:
   ```
   ✅ Push registration success!
   🔑 Token: [64 caracteres hexadecimais]
   📦 Bundle ID: com.igreja.admin (ou com.igreja.member)
   💾 Saving token to Supabase...
   ```

4. **Verifique no Supabase** (execute a query):
   ```sql
   SELECT member_id, platform, bundle_id, LENGTH(token) as token_length
   FROM device_tokens 
   WHERE platform = 'ios' 
   ORDER BY updated_at DESC;
   ```
   - `token_length` deve ser **64** (não 142)
   - `bundle_id` deve estar preenchido

5. **Crie um aviso** no app Admin
6. **Verifique os logs** da Edge Function:
   ```bash
   npx supabase functions logs send-push-notification --tail
   ```
   - Deve aparecer: `✅ Sent successfully to iOS device`

## Checklist

- [ ] Build app Admin iOS
- [ ] Build app Member iOS  
- [ ] Configurar APNS_ENVIRONMENT no Supabase
- [ ] Login nos apps e verificar tokens (64 chars)
- [ ] Criar aviso e verificar se notificação chega
- [ ] Verificar logs (sem erros 400 BadDeviceToken)

## Se ainda der erro 400 BadDeviceToken

Verifique:
1. **Ambiente correto:**
   - Token de TestFlight → `APNS_ENVIRONMENT=sandbox`
   - Token de App Store → `APNS_ENVIRONMENT=production`

2. **Credenciais APNs corretas no Supabase:**
   - `APNS_AUTH_KEY` (conteúdo completo do .p8)
   - `APNS_KEY_ID` (do nome do arquivo)
   - `APNS_TEAM_ID` (da conta Apple Developer)

3. **Bundle ID correto:**
   - Chave APNs deve estar habilitada para ambos Bundle IDs no Apple Developer
