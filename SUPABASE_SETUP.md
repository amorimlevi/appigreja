# Configuração do Supabase

## ✅ Passos Concluídos

1. **Instalação do cliente Supabase** ✓
2. **Criação do schema SQL** ✓
3. **Configuração dos arquivos** ✓

## 🔧 Configuração das Credenciais

1. Abra `/src/lib/supabaseClient.js`
2. Substitua os valores:

```javascript
const supabaseUrl = 'SUA_URL_AQUI'  // Exemplo: https://xxxxx.supabase.co
const supabaseAnonKey = 'SUA_KEY_AQUI'  // Sua anon public key
```

### Onde encontrar suas credenciais:

1. Acesse seu projeto no Supabase
2. Vá em **Settings** (⚙️) > **API**
3. Copie:
   - **Project URL** → `supabaseUrl`
   - **anon public** key → `supabaseAnonKey`

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

- ✅ `members` - Membros da igreja
- ✅ `families` - Famílias
- ✅ `events` - Eventos e cultos
- ✅ `event_foods` - Comidas para eventos
- ✅ `workshops` - Oficinas
- ✅ `avisos` - Avisos
- ✅ `prayer_requests` - Pedidos de oração
- ✅ `workshop_registrations` - Inscrições em oficinas
- ✅ `event_participants` - Participantes de eventos

### Dados de Exemplo

O schema já inclui 3 membros de exemplo:
- Levi Amorim (pastor)
- João da Silva (jovem)
- Maria Santos (louvor)

Senha padrão: `senha123`

## 🚀 Testando a Aplicação

1. Configure as credenciais conforme acima
2. Inicie o servidor:
   ```bash
   npm run dev
   ```

3. Acesse:
   - **Admin**: http://localhost:5173
   - **Membros**: http://localhost:5173/membro

4. Login de teste:
   - Nome/Email: `Levi Amorim` ou `levi@igreja.com`
   - Senha: `senha123`

## 📝 Funcionalidades Implementadas

### App Admin:
- ✅ Criar, editar e deletar membros
- ✅ Criar e gerenciar eventos
- ✅ Criar famílias
- ✅ Enviar avisos
- ✅ Múltiplas funções por membro

### App Membros:
- ✅ Login com nome/email
- ✅ Visualizar eventos
- ✅ Selecionar comidas para eventos
- ✅ Ver avisos
- ✅ Criar família
- ✅ Adicionar membros à família

## 🔐 Segurança

O RLS (Row Level Security) está habilitado com políticas básicas:
- Eventos são públicos
- Membros autenticados podem ver outros membros
- Avisos são públicos
- Workshops são públicos

**Importante**: Ajuste as políticas de segurança conforme suas necessidades!

## 🐛 Resolução de Problemas

### Erro: "Connection string is missing"
- Verifique se as credenciais estão corretas em `supabaseClient.js`

### Erro ao criar membro
- Verifique se o campo `funcoes` é um array
- Certifique-se de que pelo menos uma função foi selecionada

### Dados não aparecem
1. Verifique o console do navegador para erros
2. Confirme que o Supabase está online
3. Verifique as políticas RLS no painel do Supabase

## 📚 Próximos Passos

- [ ] Implementar autenticação real do Supabase (Auth)
- [ ] Adicionar upload de imagens
- [ ] Implementar notificações em tempo real
- [ ] Criar relatórios e dashboards
- [ ] Adicionar mais funcionalidades de ministérios
