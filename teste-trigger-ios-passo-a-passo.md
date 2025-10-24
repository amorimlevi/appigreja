# Teste: Por que trigger não dispara do iOS?

## Problema
- Trigger funciona quando inserimos aviso manualmente no SQL
- Trigger NÃO funciona quando criamos aviso pelo app iOS admin
- Ambos fazem INSERT direto na tabela `avisos`

## Teste Passo a Passo

### 1. Verificar se trigger de LOG está ativo
Execute no Supabase SQL Editor:
```sql
SELECT tgname, tgenabled 
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'avisos' 
AND tgname = 'log_avisos_insert';
```
**Esperado:** tgenabled = 'O' (enabled)

### 2. Criar aviso pelo app iOS
- Abra o app iOS (Admin)
- Vá em Avisos
- Crie um novo aviso com título: "TESTE iOS - [hora atual]"
- Envie o aviso

### 3. IMEDIATAMENTE verificar logs do PostgreSQL
No Supabase Dashboard:
- Vá em **Logs** (menu lateral esquerdo)
- Selecione **Database** 
- Filtre por "WARNING" ou busque por "🚨"
- Procure pela mensagem: `🚨 AVISO INSERIDO: ID=...`

### 4. Analisar resultados

**CENÁRIO A:** Aparece "🚨 AVISO INSERIDO"
- ✅ Trigger `log_avisos_insert` funcionou
- ❌ Trigger `trigger_notify_new_aviso` está falhando
- **Solução:** Problema está na função `notify_new_aviso()` ou na Edge Function

**CENÁRIO B:** NÃO aparece "🚨 AVISO INSERIDO"
- ❌ INSERT do iOS não está disparando triggers
- **Possíveis causas:**
  1. App iOS está usando transação que faz rollback
  2. App iOS está usando algum método que bypassa triggers
  3. Há alguma configuração no Supabase que desabilita triggers para authenticated users

### 5. Query de verificação rápida
Execute isso logo após criar o aviso do iOS:
```sql
-- Ver últimos avisos e verificar se foi inserido
SELECT 
    id,
    titulo,
    created_at,
    AGE(NOW(), created_at) as tempo_atras
FROM avisos
WHERE titulo LIKE '%TESTE iOS%'
ORDER BY created_at DESC
LIMIT 5;
```

Se o aviso aparecer aqui mas NÃO aparecer o log 🚨, temos um problema sério: o INSERT funcionou mas os triggers não dispararam.

### 6. Próximos passos baseado no resultado
Me informe qual cenário aconteceu (A ou B) e eu vou te ajudar a resolver.
