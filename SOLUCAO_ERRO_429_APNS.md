# Erro 429: TooManyProviderTokenUpdates

## O que significa
A Apple limita quantas notificações push você pode enviar para o mesmo token em curto período.

## Soluções

### Aguardar 2-3 minutos
O rate limit é temporário. Aguarde alguns minutos e teste novamente.

### Verificar credenciais APNs no Supabase
O erro também pode indicar que faltam as credenciais APNs na Edge Function.

No Supabase Dashboard → Edge Functions → send-push-notification → Secrets:

Verifique se existem:
- `APNS_AUTH_KEY`: Conteúdo do arquivo .p8 (-----BEGIN PRIVATE KEY----- ...)
- `APNS_KEY_ID`: 44UHHU47FR (ou NR39P4964J se mudou)
- `APNS_TEAM_ID`: LU3NTX93ML
- `APNS_ENVIRONMENT`: production (ou sandbox para TestFlight)

Se NÃO existirem, adicione esses secrets.

### Como obter o conteúdo da chave .p8
```bash
cat /Users/user/Downloads/AuthKey_44UHHU47FR.p8
```

Cole TODO o conteúdo (incluindo BEGIN/END) no secret `APNS_AUTH_KEY`.
