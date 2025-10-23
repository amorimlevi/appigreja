# Teste Final: Notificações Push Funcionando

## ✅ O que foi implementado

1. **Edge Function** `send-push-notification` - Processa fila e envia notificações via FCM v1
2. **Service** `sendPushNotification.js` - Helper para enviar notificações do frontend
3. **Integração Admin (Avisos)** - Notificação automática ao criar aviso
4. **Integração Admin (Eventos)** - Notificação automática ao criar evento

## 📱 Status por Plataforma

| Plataforma | Token | Envio | Status |
|------------|-------|-------|--------|
| Android | ✅ FCM válido | ✅ Funcionando | Pronto para produção |
| iOS | ❌ APNs nativo | ❌ Token inválido | Precisa correção (ver FIX_IOS_PUSH_TOKENS.md) |

## 🧪 Como Testar

### Preparação

1. Execute o script de limpeza:
   ```sql
   -- No SQL Editor
   \i limpar-notificacoes-antigas.sql
   ```

2. Tenha o app Android aberto e logado em um dispositivo

3. Abra o console do navegador (F12) para ver logs

### Teste 1: Criar Aviso

1. Faça login como Admin no navegador
2. Vá para "Avisos"
3. Clique em "Novo Aviso"
4. Preencha:
   - **Título:** "Teste de Notificação Push"
   - **Mensagem:** "Esta é uma notificação de teste"
   - **Destinatários:** "Todos"
5. Clique em "Criar Aviso"
6. **Verifique o console do navegador** - deve mostrar:
   ```
   📤 Sending push notification: {type: 'aviso', title: 'Novo Aviso'}
   ✅ Notification inserted: XX
   ✅ Push notification sent: {success: true, processed: 1, sent: 2}
   ```
7. **Verifique o celular Android** - A notificação deve aparecer em ~2 segundos!

### Teste 2: Criar Evento

1. No Admin, vá para "Eventos"
2. Clique em "Novo Evento"
3. Preencha os dados do evento
4. Clique em "Criar Evento"
5. **Verifique o console** - mesmos logs
6. **Verifique o celular** - Notificação deve chegar!

### Teste 3: Verificar no Banco

Execute no SQL Editor:

```sql
-- Ver últimas notificações enviadas
SELECT 
    id,
    type,
    title,
    body,
    sent,
    sent_at,
    created_at,
    EXTRACT(EPOCH FROM (sent_at - created_at)) as segundos_para_enviar
FROM push_notifications_queue
ORDER BY created_at DESC
LIMIT 5;
```

Deve mostrar `sent = true` e `segundos_para_enviar` em torno de 1-3 segundos.

## 🐛 Troubleshooting

### Notificação não chegou no Android

1. **Verificar token:**
   ```sql
   SELECT * FROM device_tokens WHERE platform = 'android';
   ```
   Deve haver pelo menos 1 token.

2. **Verificar logs da Edge Function:**
   - Vá para: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/functions/send-push-notification/logs
   - Procure por erros

3. **Verificar se notificação foi marcada como enviada:**
   ```sql
   SELECT * FROM push_notifications_queue WHERE sent = false;
   ```

### Console mostra erro ao criar aviso/evento

1. Verifique se o arquivo `src/services/sendPushNotification.js` existe
2. Verifique se não há erros de compilação no terminal onde roda `npm run dev`
3. Verifique permissões da service role key

### Notificação foi enviada mas não aparece

1. Verifique se o app Android tem permissão de notificações
2. Verifique se o token não foi removido (tokens inválidos são deletados automaticamente)
3. Teste fechar e abrir o app novamente

## 📊 Monitoramento

### Ver estatísticas de envio

```sql
SELECT 
    DATE(created_at) as data,
    type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE sent = true) as enviadas,
    COUNT(*) FILTER (WHERE sent = false) as pendentes,
    ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - created_at))), 2) as tempo_medio_segundos
FROM push_notifications_queue
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), type
ORDER BY data DESC, type;
```

### Ver dispositivos ativos

```sql
SELECT 
    platform,
    COUNT(*) as total_tokens,
    COUNT(DISTINCT member_id) as usuarios_unicos
FROM device_tokens
GROUP BY platform;
```

## ✅ Checklist de Produção

- [ ] Android funcionando
- [ ] iOS funcionando (após aplicar FIX_IOS_PUSH_TOKENS.md)
- [ ] Testar com múltiplos dispositivos
- [ ] Testar com app em background
- [ ] Testar com app fechado
- [ ] Remover `console.log` de produção do sendPushNotification.js
- [ ] Mover service_role_key para variável de ambiente segura
- [ ] Configurar monitoramento de falhas
- [ ] Documentar no README

## 🎯 Próximos Passos

1. **Corrigir iOS** (urgente)
2. **Adicionar retry logic** - Se envio falhar, tentar novamente
3. **Adicionar scheduling** - Agendar notificações para envio futuro
4. **Adicionar segmentação** - Enviar apenas para grupos específicos
5. **Adicionar analytics** - Tracking de entregas e cliques
