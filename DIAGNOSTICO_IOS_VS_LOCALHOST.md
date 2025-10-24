# 🔍 Diagnóstico: Localhost Funciona, iOS Não

## Situação

- ✅ **Localhost (web):** Avisos geram logs de notificação
- ❌ **App iOS:** Avisos NÃO geram logs de notificação

## Ambos usam o mesmo código

```javascript
// src/lib/supabaseService.js linha 677
await supabase.from('avisos').insert([avisoData])
```

---

## 🎯 Possíveis Causas

### 1️⃣ Trigger não dispara por permissões/RLS (MAIS PROVÁVEL)

**Problema:**
- RLS (Row Level Security) pode estar bloqueando o trigger
- O trigger usa `AFTER INSERT`, mas se a inserção falhar parcialmente, não dispara

**Como verificar:**
```sql
-- Ver políticas RLS da tabela avisos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'avisos';
```

### 2️⃣ Função net.http_post falha silenciosamente

**Problema:**
- O trigger pode estar falhando ao chamar `net.http_post`
- Mas não mostra erro porque tem `EXCEPTION ... RETURN NEW`

**Como verificar:**
```sql
-- Habilitar extensão pg_net se não estiver
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Se não existir:
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 3️⃣ Contexto de autenticação diferente

**Problema:**
- Localhost pode estar usando `service_role` key
- iOS pode estar usando `anon` key
- O trigger precisa de permissões específicas

**Como verificar:**
Ver qual API key o app iOS está usando em:
- `src/lib/supabaseClient.js` ou similar

### 4️⃣ Trigger desabilitado para role específica

**Problema:**
- Trigger pode estar configurado para disparar apenas para certas roles
- iOS pode estar usando role diferente do localhost

---

## 🔧 Diagnóstico Passo a Passo

### Passo 1: Verificar se avisos do iOS estão sendo inseridos

```sql
-- Execute ANTES de criar aviso no iOS
SELECT COUNT(*) as antes FROM avisos;

-- Crie aviso no iOS

-- Execute DEPOIS
SELECT COUNT(*) as depois FROM avisos;

-- Ver o aviso criado
SELECT * FROM avisos ORDER BY created_at DESC LIMIT 1;
```

**Se o aviso FOI inserido:**
→ Problema é no trigger (não disparou)

**Se o aviso NÃO foi inserido:**
→ Problema é antes do trigger (RLS ou permissões)

---

### Passo 2: Verificar logs do PostgreSQL

```
Dashboard > Database > Logs

Procure por:
- "Trigger notify_new_aviso disparado"
- "Webhook chamado"
- "Erro no trigger"
```

**Se NÃO aparecer "Trigger notify_new_aviso disparado":**
→ Trigger não está sendo acionado!

---

### Passo 3: Testar trigger manualmente

```sql
-- Simular inserção como se fosse do iOS
-- (usando mesma estrutura de dados)

BEGIN;

INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES (
    'TESTE Manual iOS', 
    'Simulando inserção do app iOS',
    ARRAY['todos']::text[],
    CURRENT_DATE
);

-- Aguarde 2 segundos
-- Verifique logs: Dashboard > Edge Functions > send-push-notification

ROLLBACK; -- Desfaz o teste
```

**Se o teste manual FUNCIONAR:**
→ Trigger está OK, problema é no app iOS

---

### Passo 4: Verificar RLS (Row Level Security)

```sql
-- Ver se RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'avisos';

-- Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'avisos';
```

**Se RLS estiver habilitado MAS sem política para INSERT:**
→ Inserções podem estar falhando silenciosamente!

---

### Passo 5: Testar com logging detalhado

```sql
-- Adicionar mais logs ao trigger
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE '🔵 TRIGGER INICIADO - Aviso ID: %, Titulo: %', NEW.id, NEW.titulo;
    RAISE NOTICE '🔵 DADOS: mensagem=%, destinatarios=%', NEW.mensagem, NEW.destinatarios;
    
    BEGIN
        PERFORM net.http_post(
            url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
            ),
            body := jsonb_build_object(
                'type', 'aviso',
                'title', 'Novo Aviso',
                'body', COALESCE(NEW.mensagem, NEW.titulo),
                'data', jsonb_build_object(
                    'aviso_id', NEW.id,
                    'titulo', NEW.titulo
                )
            )
        );
        RAISE NOTICE '🟢 WEBHOOK CHAMADO COM SUCESSO';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '🔴 ERRO NO WEBHOOK: %, DETAIL: %', SQLERRM, SQLSTATE;
    END;
    
    RAISE NOTICE '🔵 TRIGGER FINALIZADO';
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '🔴 ERRO NO TRIGGER: %, DETAIL: %', SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Depois:
1. Crie aviso do iOS
2. Vá em Dashboard > Database > Logs
3. Procure pelos emojis 🔵🟢🔴

---

## ✅ Soluções Possíveis

### Solução 1: Garantir que extensão pg_net está habilitada

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Solução 2: Dar permissões ao trigger

```sql
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO anon;
GRANT EXECUTE ON FUNCTION notify_new_aviso() TO service_role;
```

### Solução 3: Garantir que RLS não bloqueia

```sql
-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'avisos';

-- Adicionar política de INSERT se não existir
CREATE POLICY "Allow insert avisos for authenticated" 
ON avisos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

### Solução 4: Forçar trigger a usar SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER -- Executa com permissões do owner
SET search_path = public
AS $$
BEGIN
    -- ... resto do código ...
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Teste Final

Execute este SQL completo:

```sql
-- 1. Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Recriar trigger com logs detalhados
CREATE OR REPLACE FUNCTION notify_new_aviso()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE NOTICE '🔵 TRIGGER INICIADO para aviso: %', NEW.titulo;
    
    PERFORM net.http_post(
        url := 'https://dvbdvftaklstyhpqznmu.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        ),
        body := jsonb_build_object(
            'type', 'aviso',
            'title', 'Novo Aviso',
            'body', COALESCE(NEW.mensagem, NEW.titulo),
            'data', jsonb_build_object('aviso_id', NEW.id, 'titulo', NEW.titulo)
        )
    );
    
    RAISE NOTICE '🟢 WEBHOOK CHAMADO';
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '🔴 ERRO: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Testar
INSERT INTO avisos (titulo, mensagem, destinatarios, data_envio)
VALUES ('TESTE Final', 'Se funcionar, problema resolvido!', ARRAY['todos']::text[], CURRENT_DATE);

-- 4. Ver logs
-- Dashboard > Database > Logs (procure por 🔵🟢)
-- Dashboard > Edge Functions > send-push-notification > Logs
```

---

## 📊 Checklist de Verificação

Antes de testar no iOS:

- [ ] Extensão `pg_net` habilitada
- [ ] Trigger tem `SECURITY DEFINER`
- [ ] Função tem logs detalhados (🔵🟢🔴)
- [ ] Teste manual funciona
- [ ] Logs aparecem no Dashboard > Database > Logs

Se TODOS acima OK, teste no iOS:
- [ ] Criar aviso no app iOS
- [ ] Ver logs do PostgreSQL
- [ ] Ver logs da edge function
- [ ] Notificação deve chegar! 🎉
