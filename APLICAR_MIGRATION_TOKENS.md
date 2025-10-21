# Como Aplicar a Migration para Múltiplos Dispositivos

## Passo 1: Executar Migration no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `fix-device-tokens-multiple-devices.sql`
5. Clique em **Run** (▶️)

## Passo 2: Verificar Tokens Atuais

Execute esta query para ver os tokens existentes:

```sql
SELECT 
    id,
    member_id,
    LEFT(token, 20) || '...' as token_preview,
    platform,
    created_at,
    updated_at
FROM device_tokens
ORDER BY updated_at DESC;
```

## Passo 3: Limpar Tokens Inválidos (Opcional)

Se quiser começar do zero, execute:

```sql
-- CUIDADO: Isso apaga todos os tokens!
DELETE FROM device_tokens;
```

## Passo 4: Testar Registro de Novo Token

1. Abra o app no iPhone/simulador
2. Faça login
3. Verifique os logs do console do app (procure por "🔑 Token:")
4. Execute no Supabase para confirmar:

```sql
SELECT COUNT(*) as total_devices, 
       member_id,
       platform
FROM device_tokens
GROUP BY member_id, platform;
```

## O Que Mudou?

**ANTES:**
- ❌ Apenas 1 dispositivo por membro/plataforma
- ❌ Segundo iPhone sobrescrevia o primeiro

**DEPOIS:**
- ✅ Múltiplos dispositivos por membro
- ✅ iPhone 1 + iPhone 2 + iPad = todos recebem notificações
- ✅ Tokens duplicados são bloqueados automaticamente
