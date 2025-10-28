# Verificar Ambiente APNs

## No Supabase Dashboard:

1. **Edge Functions** → `send-push-notification` → **Secrets**
2. Procure por: `APNS_ENVIRONMENT`
3. Deve estar:
   - `production` - para apps da App Store
   - `sandbox` - para TestFlight e desenvolvimento

## Qual usar?
- Se o app foi instalado via **TestFlight**: use `sandbox`
- Se o app foi instalado via **App Store**: use `production`
- Se está testando no Xcode: use `sandbox`

## Como está seu app?
O membro 37 está usando o app de qual forma?
