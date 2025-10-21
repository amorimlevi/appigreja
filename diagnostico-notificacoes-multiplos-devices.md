# Diagnóstico: Notificações não chegam em todos os dispositivos

## Problema
- 2 celulares com app instalado via TestFlight
- Aviso aparece em ambos os apps (dados sincronizados ✅)
- Notificação push só chega em 1 celular ❌

## Causas Possíveis

### 1. Token não registrado para um dos devices
Execute no Supabase SQL Editor:
```sql
-- Ver quantos tokens você tem registrados
SELECT 
    member_id,
    platform,
    LEFT(token, 40) || '...' as token_preview,
    created_at,
    updated_at
FROM device_tokens
WHERE member_id = 'SEU_MEMBER_ID_AQUI'
ORDER BY updated_at DESC;
```

**Esperado**: 2 linhas (1 para cada celular)
**Se aparecer apenas 1**: Um dos celulares não registrou o token corretamente

### 2. Token inválido ou expirado
Tokens APNs podem expirar se:
- App foi reinstalado
- Certificado/chave APNs foi trocado
- Device foi resetado

**Solução**: No celular que não recebe notificações:
1. Desinstalar o app completamente
2. Reinstalar via TestFlight
3. Fazer login novamente (isso registra um novo token)

### 3. Erro silencioso no envio APNs
A edge function pode estar falhando para um dos tokens mas não logando o erro.

Execute no Supabase para ver logs da edge function:
```bash
# Ver logs recentes da função
supabase functions logs send-push-notification
```

Procure por linhas como:
- `✅ Notification sent successfully to iOS device (member XXX)`
- `❌ Failed to send to ios: ...`

### 4. Permissões de notificação
Verifique em **ambos** os celulares:

**iOS Settings → Notifications → ZOE Membro**
- [ ] Allow Notifications: ON
- [ ] Lock Screen: ON
- [ ] Notification Center: ON
- [ ] Banners: ON
- [ ] Sounds: ON

## Testes Passo a Passo

### Teste 1: Verificar tokens registrados
```sql
-- Copie o resultado e me envie
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 50) || '...' as token_preview,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > NOW() - INTERVAL '1 hour' THEN '🟢 Muito recente'
        WHEN updated_at > NOW() - INTERVAL '1 day' THEN '🟡 Hoje'
        WHEN updated_at > NOW() - INTERVAL '7 days' THEN '🟠 Esta semana'
        ELSE '🔴 Antigo (pode estar expirado)'
    END as status
FROM device_tokens
ORDER BY updated_at DESC
LIMIT 10;
```

### Teste 2: Enviar notificação de teste manualmente
```sql
-- Chamar a edge function manualmente
SELECT net.http_post(
    url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer SEU_SERVICE_ROLE_KEY_AQUI'
    ),
    body := jsonb_build_object(
        'type', 'aviso',
        'title', 'Teste Manual',
        'body', 'Esta é uma notificação de teste para todos os dispositivos',
        'data', jsonb_build_object('aviso_id', '1', 'type', 'aviso')
    )
) as request_id;
```

### Teste 3: Ver logs em tempo real
```bash
# Terminal 1: Monitorar logs
supabase functions logs send-push-notification --follow

# Terminal 2: Criar um aviso novo (dispara notificação)
# Ou executar o SQL do Teste 2
```

## Solução Rápida
Se ambos os tokens estão registrados mas só 1 recebe:

1. **No celular que NÃO recebe notificações**:
   - Abra o app
   - Vá em Safari e abra: `https://dvbdvftaklstyhpqznmu.supabase.co/rest/v1/device_tokens?select=*`
   - Procure seu `member_id` e anote o `id` do token
   
2. **Delete e re-registre**:
   ```sql
   -- Delete o token problemático
   DELETE FROM device_tokens WHERE id = 'ID_DO_TOKEN_AQUI';
   
   -- Feche e reabra o app no celular
   -- O app vai registrar um novo token automaticamente
   ```

## Me envie estes dados:
1. Resultado do **Teste 1** (quantos tokens aparecem?)
2. Resultado dos logs da edge function (Teste 3)
3. Confirme que ambos os celulares têm permissões ativadas
