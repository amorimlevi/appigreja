# Guia: Configurar Logo no Supabase

## 1. Criar Tabela e Storage no Supabase

Execute o SQL no Supabase SQL Editor:
```bash
# Abra o arquivo e execute no Supabase:
create-church-settings-table.sql
```

## 2. Verificar se foi criado

No Supabase Dashboard:
1. Vá em **Database** → **Tables** → Verifique se existe `church_settings`
2. Vá em **Storage** → Verifique se existe bucket `church-logos`

## 3. Integrar no Admin Dashboard

No arquivo `ChurchAdminDashboard.jsx`, adicione uma nova aba "Configurações" com o uploader de logo:

### 3.1. Importar componentes necessários
```javascript
import ChurchLogoUploader from './ChurchLogoUploader';
import { useChurchSettings } from '../hooks/useChurchSettings';
```

### 3.2. Usar o hook no componente
```javascript
const ChurchAdminDashboard = ({ onLogout }) => {
    const { settings, loading: settingsLoading } = useChurchSettings();
    // ... resto do código
```

### 3.3. Adicionar item de menu
```javascript
const menuItems = [
    // ... itens existentes
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
];
```

### 3.4. Criar renderizador de configurações
```javascript
const renderConfiguracoes = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Configurações da Igreja
                </h2>
            </div>

            <div className="card">
                <ChurchLogoUploader
                    currentLogoUrl={settings.church_logo_url}
                    onLogoChange={(newUrl) => {
                        // Atualizar estado local se necessário
                        window.location.reload(); // Recarregar para atualizar todas as logos
                    }}
                />
            </div>
        </div>
    );
};
```

### 3.5. Adicionar no switch de tabs
```javascript
{activeTab === 'configuracoes' && renderConfiguracoes()}
```

## 4. Atualizar componentes para usar a logo do Supabase

### 4.1. Em MemberLogin.jsx
```javascript
import { useChurchLogo } from '../hooks/useChurchSettings';

// No componente:
const { value: logoUrl } = useChurchLogo();

// No JSX:
<img src={logoUrl} alt="Logo da Igreja" />
```

### 4.2. Em Login.jsx (mesmo processo)
```javascript
import { useChurchLogo } from '../hooks/useChurchSettings';

const { value: logoUrl } = useChurchLogo();

<img src={logoUrl} alt="Logo da Igreja" />
```

### 4.3. Em ChurchAdminDashboard.jsx
Substituir todas as ocorrências de:
```javascript
// De:
src="https://res.cloudinary.com/..."

// Para:
src={settings.church_logo_url || 'https://res.cloudinary.com/...'}
```

## 5. Fazer Upload da Logo

1. Faça login como admin
2. Vá na aba **Configurações**
3. Clique em **Escolher Nova Logo**
4. Selecione a imagem da logo
5. Aguarde o upload
6. A logo será atualizada automaticamente em todo o app

## 6. Testar

- [ ] Logo aparece no login de admin
- [ ] Logo aparece no login de membro
- [ ] Logo aparece no dashboard do admin
- [ ] Logo é atualizada em tempo real após upload
- [ ] Políticas de acesso funcionam (público pode ver, só admin pode alterar)

## Benefícios

✅ Logo armazenada no seu próprio Supabase
✅ Sem dependência de serviços externos (Cloudinary)
✅ Fácil de atualizar pela interface
✅ Versionamento automático
✅ Backup junto com o banco de dados
✅ URL pública e acessível

## Observações

- O bucket `church-logos` é público para leitura
- Apenas usuários autenticados podem fazer upload
- Tamanho máximo: 5MB
- Formatos aceitos: PNG, JPG, WEBP, SVG
