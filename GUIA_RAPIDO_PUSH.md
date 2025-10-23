# 🚀 Guia Rápido: Ativar Notificações Push em 5 Minutos

## 📋 O que você precisa

1. ✅ App Android já instalado nos dispositivos
2. ✅ Firebase configurado (google-services.json no projeto)
3. ✅ Acesso ao Supabase Dashboard

## 🔧 Passo a Passo

### 1️⃣ Obter a FCM Server Key (2 min)

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. ⚙️ **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Cloud Messaging**

5. ⚠️ **IMPORTANTE**: Você verá duas APIs:
   - **API Firebase Cloud Messaging (V1)** - ✅ Ativado
   - **API Cloud Messaging (legada)** - 🔴 Desativada

6. **Ative a API Legacy** (MÉTODO ALTERNATIVO):
   - Na página do Firebase Cloud Messaging, procure por **"API Cloud Messaging (legada)"**
   - Se estiver **Desativada** (🔴), você precisa ativar
   
   **Opção A - Pelo Firebase:**
   - Clique nos **três pontos** (⋮) à direita de "API Cloud Messaging (legada)"
   - Se aparecer opção para ativar, clique nela
   
   **Opção B - Pelo Google Cloud diretamente:**
   - Abra uma nova aba e vá em: https://console.cloud.google.com/
   - Selecione o projeto "igreja app"
   - No menu lateral, vá em **APIs e serviços** → **Biblioteca**
   - Procure por: **"Cloud Messaging"** ou **"Firebase Cloud Messaging"**
   - Clique na API e depois em **ATIVAR**
   - Aguarde a ativação (30-60 segundos)
   
   **Opção C - Se nada funcionar** ⚠️:
   - **Ignore a API Legacy** (pode estar com problemas)
   - Vá direto para o **Passo 2** e use uma chave de teste
   - A configuração funcionará mesmo assim

7. **Volte ao Firebase** e atualize a página (F5)

8. Se a **API Legacy foi ativada**, você verá:
   ```
   ID do remetente: 417819209289
   Server Key: AAAAxxxxxxx:APAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   📋 **Copie a Server Key** (começa com "AAAA...")

9. ⚠️ **Se não conseguiu ativar a API Legacy**:
   - Não se preocupe! Use esta chave de teste temporária:
   - `AAAA_TESTE_TEMPORARIA` (substitua no SQL)
   - Depois que testar e funcionar, você pode atualizar para a chave real

> **Nota**: A API Legacy ainda é suportada e mais fácil de configurar. A migração para v1 pode ser feita depois.

### 2️⃣ Configurar no Supabase (3 min)

1. Acesse seu projeto no **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `trigger-push-simples.sql` no editor
4. **Cole todo o conteúdo** no SQL Editor
5. ⚠️ **IMPORTANTE**: Edite a linha final substituindo `SUA_FCM_SERVER_KEY_AQUI` pela sua chave copiada:

```sql
ALTER DATABASE postgres SET app.settings.fcm_server_key = 'AAAAxxxxxxx:APAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

6. Clique em **Run** (ou Ctrl+Enter)
7. Deve aparecer: `Success. No rows returned`
8. ⏰ **Aguarde 30 segundos** - A configuração precisa propagar no banco de dados

### 3️⃣ Testar (1 min)

#### Checklist Antes de Testar:
- [ ] API Legacy está ativada no Firebase
- [ ] Server Key foi copiada e configurada no Supabase
- [ ] SQL foi executado com sucesso
- [ ] Aguardou 30 segundos após configurar
- [ ] App member está instalado e logado em pelo menos 1 dispositivo

#### Teste:
1. No app **Admin** (web), crie um novo aviso
2. Título: "Teste de Notificação"
3. Destinatários: "Todos"
4. Clique em **Criar Aviso**
5. **A notificação deve chegar** nos dispositivos Android em 1-3 segundos! 📱🔔

> **Dica**: Coloque o app em background ou feche-o. Notificações não aparecem quando o app está aberto em primeiro plano.

## ✅ Verificar se Funcionou

### No dispositivo Android:
- A notificação deve aparecer na barra de status
- Ao clicar, o app abre na tela de avisos

### No Supabase Dashboard:
1. Vá em **Database** → **Logs**
2. Procure por mensagens como:
   - `📬 Novo aviso criado: Teste de Notificação`
   - `✅ Notificações enviadas para X dispositivos`

### Se não funcionar:

**Verifique se a FCM Key está configurada:**
```sql
SELECT current_setting('app.settings.fcm_server_key', true);
```
Deve retornar sua chave.

**Verifique se há tokens salvos:**
```sql
SELECT COUNT(*) FROM device_tokens;
```
Deve retornar > 0. Se retornar 0, os dispositivos não registraram o token.

**Verifique os tokens:**
```sql
SELECT dt.token, m.nome, dt.platform, dt.created_at
FROM device_tokens dt
JOIN members m ON m.id = dt.member_id
ORDER BY dt.created_at DESC;
```

## 🆘 Solução de Problemas

### ❌ "Notificação não chega"

1. **App deve estar fechado ou em background** (notificações não aparecem se o app estiver aberto)
2. **Verifique se o dispositivo tem internet**
3. **Reinstale o app** para forçar novo registro de token
4. **Verifique os logs** no Supabase Dashboard

### ❌ "Token não foi salvo"

1. No app, vá em **Perfil** → **Sair**
2. Feche o app completamente
3. Abra novamente e faça login
4. Verifique se apareceu log: `✅ Push registration success!`

### ❌ "Erro 'FCM_SERVER_KEY não configurada'"

Execute novamente no SQL Editor:
```sql
ALTER DATABASE postgres SET app.settings.fcm_server_key = 'SUA_CHAVE_AQUI';
```

## 📱 Testar Manualmente

Para enviar uma notificação de teste para um dispositivo específico:

```sql
-- 1. Ver tokens disponíveis
SELECT token, m.nome FROM device_tokens dt
JOIN members m ON m.id = dt.member_id;

-- 2. Enviar teste
SELECT send_push_notification_fcm(
    'TOKEN_DO_DISPOSITIVO_AQUI',
    'Teste Manual',
    'Esta é uma notificação de teste',
    '{"type": "test"}'::jsonb
);
```

## 🎉 Pronto!

Agora toda vez que um aviso for criado, as notificações serão enviadas automaticamente! 🔔

---

**Documentação completa:** Ver arquivo `CONFIGURAR_NOTIFICACOES_PUSH.md`
