# Instruções para Configurar Logos (Modo Claro e Escuro)

## ✅ O que já está pronto

1. ✅ A estrutura de banco de dados já suporta duas logos (`church_logo_url` e `church_logo_url_dark`)
2. ✅ O código React detecta automaticamente o tema (claro/escuro) e carrega a logo correspondente
3. ✅ Funciona em **Login.jsx** (Admin App) e **MemberLogin.jsx** (Member App)

## 📝 Passo A: Configurar Logo Modo Claro (Logo Preta)

### A1: Salvar a Imagem
Salve a logo preta "IGREJA ZOE CAMAÇARI" localmente.

### A2: Upload no Supabase Storage

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Vá em **Storage** no menu lateral
3. Clique no bucket **church-logos**
4. Clique em **Upload file**
5. Faça upload da logo preta (exemplo: `logo-zoe-preta.png`)
6. Após o upload, clique na imagem e copie a **URL pública**

### A3: Atualizar no Banco

1. Vá em **SQL Editor** no Supabase
2. Abra `update-light-mode-logo.sql`
3. Substitua `COLE_AQUI_A_URL_DA_LOGO_PRETA_DO_SUPABASE_STORAGE` pela URL copiada
4. Execute o SQL

```sql
UPDATE church_settings
SET setting_value = 'https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/logo-zoe-preta.png',
    updated_at = NOW()
WHERE setting_key = 'church_logo_url';
```

---

## 📝 Passo B: Configurar Logo Modo Escuro (Logo Branca - CAMAÇARI)

### B1: ✅ Já Configurado
A logo branca "CAMAÇARI" já foi configurada:
```
https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/novo%20logo%20zoeBRANCO.png.png
```

Caso precise atualizar, siga os passos abaixo:

### B2: Upload no Supabase Storage (Opcional)

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Vá em **Storage** no menu lateral
3. Clique no bucket **church-logos**
4. Clique em **Upload file**
5. Faça upload da logo CAMAÇARI (exemplo: `logo-camacari-dark.png`)
6. Após o upload, clique na imagem e copie a **URL pública**

A URL será algo como:
```
https://seu-projeto.supabase.co/storage/v1/object/public/church-logos/logo-camacari-dark.png
```

### Passo 3: Atualizar a Configuração no Banco

1. Vá em **SQL Editor** no dashboard do Supabase
2. Abra o arquivo `update-dark-mode-logo.sql` (ou copie o código abaixo)
3. Substitua `COLE_AQUI_A_URL_DA_LOGO_ESCURA_DO_SUPABASE_STORAGE` pela URL que você copiou no Passo 2
4. Execute o SQL

```sql
UPDATE church_settings
SET setting_value = 'https://seu-projeto.supabase.co/storage/v1/object/public/church-logos/logo-camacari-dark.png',
    updated_at = NOW()
WHERE setting_key = 'church_logo_url_dark';
```

### Passo 4: Testar

1. Abra o **Member App** ou **Admin App**
2. Ative o modo escuro no dispositivo/navegador
3. A logo CAMAÇARI deve aparecer automaticamente
4. Desative o modo escuro → deve voltar para a logo original (colorida)

## 🔄 Como Funciona

O código detecta automaticamente quando o app está em dark mode através de:
- `document.documentElement.classList.contains('dark')`
- Um `MutationObserver` que monitora mudanças no tema
- Carrega dinamicamente a logo correta: `church_logo_url` (claro) ou `church_logo_url_dark` (escuro)

## 📱 Locais Afetados

As logos diferentes aparecem nos seguintes componentes:
- ✅ **Login.jsx** - Tela de login do Admin App
- ✅ **MemberLogin.jsx** - Tela de login do Member App

## 🎨 Configuração Atual

- **Logo Modo Claro**: Logo PRETA "Igreja Zoe Camaçari" (para fundos brancos)
- **Logo Modo Escuro**: Logo BRANCA "CAMAÇARI" outline (para fundos escuros)

## 📋 Resumo das URLs

Após configuração completa:

| Modo | Key no Banco | URL |
|------|-------------|-----|
| **Claro** | `church_logo_url` | URL da logo preta que você vai fazer upload |
| **Escuro** | `church_logo_url_dark` | `https://dvbdvftaklstyhpqznmu.supabase.co/storage/v1/object/public/church-logos/novo%20logo%20zoeBRANCO.png.png` |
