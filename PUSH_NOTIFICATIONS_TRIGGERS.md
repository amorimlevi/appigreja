# Sistema de Notificações Push Automáticas

## Status: ✅ FUNCIONANDO

## Arquitetura

### Fluxo Automático
1. Admin cria aviso/evento/escala no app
2. Trigger PostgreSQL dispara automaticamente
3. Trigger chama Edge Function `send-push-notification` via HTTP
4. Edge Function envia push para dispositivos iOS via APNs

### Triggers Instalados

| Trigger | Tabela | Função | Filtro |
|---------|--------|--------|--------|
| `trigger_notify_new_aviso` | `avisos` | `notify_new_aviso()` | Todos os membros |
| `trigger_notify_new_evento` | `events` | `notify_new_evento()` | Todos os membros |
| `trigger_notify_new_escala` | `ministry_schedules` | `notify_new_escala()` | Por ministério |

## Arquivos Importantes

- **Setup inicial**: `setup-notifications-triggers-complete.sql`
- **Atualização de chave**: `fix-service-role-key.sql`
- **Edge Function**: `supabase/functions/send-push-notification/index.ts`

## Manutenção

### Verificar triggers ativos
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers
WHERE trigger_name LIKE 'trigger_notify_%';
```

### Logs da Edge Function
Dashboard → Edge Functions → send-push-notification → Logs

### Erros comuns
- **401**: service_role_key inválida ou expirada
- **APNs 400**: Token de dispositivo inválido (remover automaticamente)
- **APNs 429**: Rate limit da Apple (normal em testes)

## Configuração

A `service_role_key` está armazenada diretamente nas funções PostgreSQL por segurança.

Para atualizar: Execute `fix-service-role-key.sql` com a nova chave.
