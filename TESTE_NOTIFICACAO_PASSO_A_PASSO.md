# 🧪 Teste de Notificação Push - Passo a Passo

## ✅ TestFlight Recebe Notificações?

**SIM!** Apps no TestFlight **recebem** notificações quando você usa chave de **produção** (que é o seu caso).

## 🔍 Por que pode não estar chegando?

### Causa #1: App está ABERTO ⚠️ (Mais Comum)

**Comportamento do iOS:**
- ✅ App **FECHADO**: Notificação aparece na tela
- ❌ App **ABERTO**: Notificação NÃO aparece (comportamento padrão do iOS)

**Solução:**
1. Feche **completamente** o app (swipe up)
2. Crie um aviso
3. Aguarde 5-10 segundos
4. A notificação deve aparecer

### Causa #2: Permissões Negadas

**Verificar no iPhone:**
1. Ajustes → [Nome do App]
2. Notificações
3. Verificar se está **LIGADO** e **permitir todas**

### Causa #3: Token Não Registrado

O app precisa ter sido aberto pelo menos uma vez e ter aceitado as permissões.

**Solução:**
1. Abra o app
2. Se aparecer popup de permissão, aceite
3. Faça logout
4. Faça login novamente
5. Isso registra o token

### Causa #4: Bundle ID da Chave APNs

A chave APNs precisa estar associada ao Bundle ID correto no Apple Developer.

**Verificar:**
1. Acesse: https://developer.apple.com/account/resources/authkeys/list
2. Clique na chave: `NR39P4964J`
3. Verifique se está associada ao Bundle ID: `com.igreja.member`

## 📝 Teste Passo a Passo

### Passo 1: Execute este SQL no Supabase

```sql
-- Ver tokens registrados
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 40) || '...' as token_preview,
    created_at,
    updated_at
FROM device_tokens
ORDER BY updated_at DESC
LIMIT 5;
```

**Resultado esperado:**
- Deve ter pelo menos 1 token de iOS
- `updated_at` deve ser recente (últimas horas/dias)

**Se não tiver tokens ou forem antigos:**
- Abra o app no iPhone
- Faça logout e login
- Execute o SQL novamente

### Passo 2: Verifique as Variáveis no Supabase

Execute no terminal:

```bash
supabase secrets list
```

Confirme que tem:
- ✅ `APNS_BUNDLE_ID`
- ✅ `APNS_KEY_ID`
- ✅ `APNS_TEAM_ID`
- ✅ `APNS_PRIVATE_KEY`

### Passo 3: Teste com App Fechado

1. **Feche completamente o app** (swipe up)
2. **Deixe o iPhone desbloqueado** (mais fácil ver a notificação)
3. **No Mac**, abra os logs:
   ```bash
   supabase functions logs send-push-notification --tail
   ```
4. **No app admin**, crie um novo aviso
5. **Aguarde 5-10 segundos**

**Resultado esperado nos logs:**
```
✅ Notification sent successfully to iOS device (member XX)
```

**No iPhone:**
- Banner de notificação deve aparecer
- Som de notificação deve tocar
- Badge no ícone do app

### Passo 4: Se Ainda Não Funcionar

Execute este teste manual via SQL:

```sql
-- Enviar notificação de teste manualmente
SELECT net.http_post(
    url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [SEU-SERVICE-ROLE-KEY]'
    ),
    body := jsonb_build_object(
        'type', 'aviso',
        'title', 'Teste Manual',
        'body', 'Esta é uma notificação de teste enviada manualmente',
        'data', jsonb_build_object('aviso_id', 999, 'type', 'aviso')
    )
);
```

## 🔧 Troubleshooting Avançado

### Ver Logs Detalhados no iPhone

Se você tem o iPhone conectado ao Mac:

1. Abra **Console.app** no Mac
2. Selecione seu iPhone
3. Filtre por: `apns` ou `dasd`
4. Crie um aviso
5. Procure por mensagens de erro

### Verificar Entitlements do App

1. No Xcode, abra o arquivo `.entitlements`
2. Deve ter:
   ```xml
   <key>aps-environment</key>
   <string>production</string>
   ```

Se tiver `development`, mude para `production`.

### Reinstalar o App

Às vezes ajuda:
1. Desinstale completamente o app
2. Reinstale do TestFlight
3. Abra e aceite permissões
4. Faça login
5. Teste novamente

### Verificar Status do APNs

Verifique se o serviço da Apple está funcionando:
- https://developer.apple.com/system-status/

## 📊 Checklist Completo

- [ ] Chave APNs é de **produção** (não sandbox)
- [ ] Bundle ID no Supabase é `com.igreja.member`
- [ ] Chave APNs está associada ao Bundle ID correto no Apple Developer
- [ ] App tem **Push Notifications** capability habilitada no Xcode
- [ ] Entitlements tem `aps-environment: production`
- [ ] Notificações estão **permitidas** no iPhone (Ajustes)
- [ ] Token está registrado (visible no SQL `device_tokens`)
- [ ] Token foi criado recentemente (último 1-2 dias)
- [ ] App está **completamente fechado** durante o teste
- [ ] Logs mostram `✅ Notification sent successfully`
- [ ] Sem erros 400/403/410 nos logs

## 🆘 Última Tentativa

Se absolutamente nada funcionar:

1. **Verifique se o app tem o Bundle ID correto no Xcode**
   - Deve ser exatamente: `com.igreja.member`

2. **Gere uma NOVA chave APNs no Apple Developer**
   - Certifique-se de selecionar o Bundle ID correto
   - Configure no Supabase

3. **Faça novo build do app**
   - Archive
   - Upload para TestFlight
   - Teste com a nova versão

---

**Pergunta importante:** Qual app você está testando?
- [ ] App de Membros (`com.igreja.member`)
- [ ] App Admin (`com.igreja.admin`)

E de onde baixou?
- [ ] TestFlight
- [ ] App Store
