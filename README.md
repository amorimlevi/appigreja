# Igreja PWA - Dashboard Administrativo

Sistema completo de gestão pastoral com dashboard administrativo, construído com React + Vite + Tailwind CSS.

## 🚀 Funcionalidades Implementadas

### ✅ **Dashboard com Estatísticas**
- Total de membros com filtros por gênero e faixa etária
- Contadores visuais e distribuições detalhadas
- Busca em tempo real de membros
- Aniversários do mês e eventos futuros

### ✅ **Barra Lateral Colapsável**
- Menu responsivo (Dashboard, Membros, Eventos, Aniversários, Configurações)
- Botão toggle para expandir/retrair
- Design moderno com ícones Lucide React

### ✅ **Gestão de Membros (Lista)**
- Visualização em tabela (não cards como solicitado)
- ID único gerado (MBR0001, MBR0002...)
- Iniciais em círculos, gênero, idade calculada
- Dados completos: email, telefone, status

### ✅ **Gestão de Eventos**
- **Duas visualizações**: Lista e Calendário estilo Google
- Eventos futuros/passados separados
- Filtros por ano e semestre (1º: Jan-Jun / 2º: Jul-Dez)
- Lista dos 5 próximos e 5 passados

### ✅ **Seção de Aniversários**
- Aniversários do mês atual
- Aniversários da última semana (até 7 dias atrás)
- Destaque especial para aniversários de hoje

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e desenvolvimento
- **Tailwind CSS** - Estilização responsiva
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas
- **vite-plugin-pwa** - Progressive Web App

## 📦 Estrutura do Projeto

```
igreja-pwa/
├── src/
│   ├── components/
│   │   └── ChurchAdminDashboard.jsx  # Componente principal ⭐
│   ├── App.jsx                       # Configuração da aplicação
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Estilos Tailwind + customizações
├── public/                           # Assets estáticos
├── vite.config.js                    # Configuração Vite + PWA
├── tailwind.config.js               # Configuração Tailwind
└── package.json                      # Dependências
```

## 📱 Instalação

### Pré-requisitos
- Node.js 16+ instalado

### Comandos
```bash
cd igreja-pwa
npm install
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção
```bash
npm run build
npm run preview
```

## 💡 Dados de Exemplo

O sistema vem com dados de exemplo pré-configurados:
- **10 membros** com informações completas
- **10 eventos** (futuros e passados)
- **Aniversários** distribuídos ao longo do ano
- **Diferentes gêneros e idades** para testes dos filtros

## 🎨 Interface

### Dashboard
- Estatísticas visuais com cards coloridos
- Filtros interativos (gênero, idade, busca)
- Distribuições por gênero e faixa etária
- Contadores em tempo real

### Membros
- Tabela responsiva com scroll horizontal
- Avatar com iniciais do nome
- Idade calculada automaticamente
- Status visual com badges
- Informações de contato organizadas

### Eventos
- **Vista Lista**: Eventos futuros/passados separados
- **Vista Calendário**: Navegação mensal estilo Google
- Filtros por ano e semestre
- Detalhes completos (data, local, tipo)

### Aniversários
- **Mês atual**: Todos os aniversários do mês
- **Última semana**: Aniversários que já passaram
- **Destaque TODAY**: Para aniversários de hoje
- Cálculo automático da idade

## 🔄 Próximos Passos

Para expandir o sistema:
- **Backend** com API REST/GraphQL
- **Banco de dados** (PostgreSQL, MongoDB)
- **Autenticação** de usuários
- **CRUD completo** nos modais
- **Relatórios** em PDF
- **Notificações** push
- **Sincronização** em tempo real

## 📞 Suporte

Sistema completamente funcional e responsivo. Todos os requisitos solicitados foram implementados:

✅ Dashboard administrativo completo
✅ Barra lateral colapsável
✅ Estatísticas com filtros
✅ Visualização em lista para membros
✅ Calendário estilo Google para eventos
✅ Seção de aniversários
✅ React + Vite + Tailwind + PWA

---

**🎯 Componente Principal**: `src/components/ChurchAdminDashboard.jsx`
**🔧 Props**: `members` (array) e `events` (array)
**📱 PWA**: Instalável e funciona offline
**⚡ Performance**: Otimizado com React hooks
