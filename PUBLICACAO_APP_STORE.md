# Guia de Publicação na App Store

## ✅ Configuração Concluída

O Capacitor foi instalado e configurado com sucesso! O projeto agora está pronto para ser compilado como um app iOS.

## 📱 Próximos Passos

### 1. Abrir o Projeto no Xcode
```bash
npx cap open ios
```

### 2. Configurar o Projeto no Xcode

Quando o Xcode abrir, você precisa configurar:

#### a) Bundle Identifier
- Clique no projeto "App" no navegador da esquerda
- Na aba "General", veja o campo "Bundle Identifier"
- Está configurado como: `com.igreja.admin`
- **IMPORTANTE**: Altere se necessário para um identificador único da sua organização

#### b) Team de Desenvolvimento
- No mesmo painel "General"
- Em "Signing & Capabilities"
- Selecione seu Apple Developer Team
- **REQUISITO**: Você precisa de uma conta Apple Developer ($99/ano)

#### c) Nome e Versão do App
- Display Name: `Igreja Admin`
- Version: `1.0.0`
- Build: `1`

#### d) Ícones do App
- Clique em "App" > "Assets.xcassets" > "AppIcon"
- Adicione os ícones nos tamanhos requeridos:
  - 1024x1024 (App Store)
  - 180x180 (iPhone)
  - 167x167 (iPad Pro)
  - 152x152 (iPad)
  - 120x120 (iPhone)
  - 87x87 (iPhone)
  - 80x80 (iPhone)
  - 76x76 (iPad)
  - 60x60 (iPhone)
  - 58x58 (iPhone)
  - 40x40 (iPhone/iPad)
  - 29x29 (iPhone/iPad)
  - 20x20 (iPhone/iPad)

### 3. Testar no Simulador
- Selecione um simulador iOS no menu superior
- Clique no botão Play (▶️) ou pressione `Cmd + R`
- O app deve abrir no simulador

### 4. Testar em Dispositivo Físico (Opcional mas Recomendado)
- Conecte seu iPhone/iPad via cabo USB
- Selecione o dispositivo no Xcode
- Clique em Play para instalar e executar
- Pode ser necessário confiar no certificado de desenvolvedor nas configurações do dispositivo

### 5. Criar um Archive para Publicação
- No menu superior do Xcode: **Product > Destination > Any iOS Device (arm64)**
- Depois: **Product > Archive**
- Aguarde o processo de build (pode levar alguns minutos)

### 6. Validar o Archive
- Quando terminar, a janela "Organizer" abrirá automaticamente
- Selecione o archive criado
- Clique em **Validate App**
- Resolva quaisquer erros que apareçam

### 7. Fazer Upload para App Store Connect
- Na mesma janela "Organizer"
- Clique em **Distribute App**
- Selecione **App Store Connect**
- Siga o assistente e faça upload

### 8. Configurar na App Store Connect
Acesse https://appstoreconnect.apple.com

#### a) Criar um Novo App
- Clique em "My Apps" > "+" > "New App"
- Preencha:
  - Platform: iOS
  - Name: Igreja Admin - Gestão Pastoral
  - Primary Language: Portuguese (Brazil)
  - Bundle ID: com.igreja.admin (o mesmo do Xcode)
  - SKU: pode ser qualquer código único (ex: IGREJAADMIN001)

#### b) Preencher Informações do App
- **Description**: Descreva o que o app faz
- **Keywords**: Palavras-chave para busca
- **Screenshots**: Capturas de tela obrigatórias
  - iPhone 6.7" (iPhone 14 Pro Max ou similar)
  - iPhone 6.5" (iPhone 11 Pro Max ou similar)
- **App Preview** (opcional): Vídeos de demonstração
- **Promotional Text**: Texto promocional curto
- **Privacy Policy URL**: Link para sua política de privacidade (OBRIGATÓRIO)

#### c) Adicionar o Build
- Na seção "Build", clique em "+"
- Selecione o build que você fez upload
- Aguarde o processamento (pode levar até 1 hora)

#### d) Configurar Privacidade
- Responda às perguntas sobre coleta de dados
- **IMPORTANTE**: Seu app usa localStorage, então pode precisar declarar "Dados do Usuário"

#### e) Informações de Classificação Etária
- Responda ao questionário de conteúdo
- Provavelmente será classificado como 4+

### 9. Submeter para Revisão
- Após preencher tudo
- Clique em **Submit for Review**
- Aguarde a revisão da Apple (normalmente 1-3 dias)

## 🔄 Fluxo de Atualização (Após Primeira Publicação)

Quando precisar atualizar o app:

```bash
# 1. Faça suas alterações no código
# 2. Gere novo build
npm run build

# 3. Sincronize com Capacitor
npx cap sync ios

# 4. Abra no Xcode
npx cap open ios

# 5. Incremente a versão em Xcode
# - Vá em General > Identity
# - Aumente o número da Version (1.0.0 -> 1.0.1) ou Build (1 -> 2)

# 6. Repita os passos 5-9 acima
```

## 📋 Requisitos

- ✅ Mac com macOS
- ✅ Xcode instalado (disponível na App Store)
- ❌ Conta Apple Developer ($99/ano) - **VOCÊ PRECISA CRIAR**
- ❌ Ícones do app em todos os tamanhos - **VOCÊ PRECISA CRIAR**
- ❌ Screenshots do app - **VOCÊ PRECISA TIRAR**
- ❌ Política de Privacidade (URL pública) - **VOCÊ PRECISA ESCREVER**

## 🎨 Criar Ícones

Use ferramentas como:
- https://www.appicon.co/
- https://icon.kitchen/
- Figma/Photoshop/Sketch

Comece com uma imagem de 1024x1024px e essas ferramentas geram todos os tamanhos automaticamente.

## 📸 Screenshots

Use o simulador do Xcode:
- Abra o app no simulador
- Use `Cmd + S` para capturar a tela
- Ou: Window > Screenshot

Tamanhos necessários:
- 6.7" display (1290 x 2796 pixels) - iPhone 14 Pro Max
- 6.5" display (1242 x 2688 pixels) - iPhone 11 Pro Max

## 🆘 Problemas Comuns

### "No signing certificate found"
- Você precisa ter uma conta Apple Developer
- Configure o Team no Xcode

### "Pod install failed"
- Instale CocoaPods: `sudo gem install cocoapods`
- Execute: `cd ios && pod install`

### "App crashes on launch"
- Verifique o console do Xcode para erros
- Certifique-se de que `npm run build` foi executado
- Execute `npx cap sync ios` novamente

## 📞 Suporte

- Documentação Capacitor: https://capacitorjs.com/docs
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple Developer Support: https://developer.apple.com/support/

---

**Status**: ✅ Projeto configurado e pronto para abrir no Xcode
**Próximo comando**: `npx cap open ios`
