# Configuração Mobile Concluída

## ✅ O que foi feito:

### 1. **Otimização para Mobile**
- Adicionado viewport otimizado para dispositivos móveis
- Configuração `viewport-fit=cover` para iPhones com notch
- Desabilitado zoom do usuário para experiência de app nativo
- Layout já responsivo com Tailwind CSS (grid adaptativo)

### 2. **Plataforma Android Adicionada**
- ✅ @capacitor/android instalado
- ✅ Projeto Android criado em `/android`
- ✅ Build e sync realizados

### 3. **Plataforma iOS Já Configurada**
- ✅ Projeto iOS em `/ios`
- ✅ CocoaPods instalado

---

## 📱 Como Testar no Android

### Opção 1: Android Studio (Emulador)
```bash
npx cap open android
```

No Android Studio:
1. Aguarde o Gradle sync terminar
2. Clique em "Run" (▶️) ou `Shift + F10`
3. Selecione um emulador ou dispositivo conectado

### Opção 2: Dispositivo Físico Android
1. Ative "Depuração USB" no seu Android:
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Volte e ative "Opções do desenvolvedor" > "Depuração USB"
2. Conecte via USB
3. Execute:
```bash
npx cap open android
```
4. No Android Studio, selecione seu dispositivo e clique em Run

---

## 📱 Como Testar no iOS

### Simulador iOS
```bash
npx cap open ios
```

No Xcode:
1. Selecione um simulador (iPhone 15 Pro)
2. **Desabilite User Script Sandboxing:**
   - Clique em "App" na barra lateral
   - Vá em "Build Settings"
   - Busque "User Script Sandboxing"
   - Mude para "No"
3. Clique em Play (▶️) ou `Cmd + R`

### Dispositivo Físico iOS
- Requer conta Apple Developer ($99/ano)
- Conecte o iPhone via cabo
- Selecione o device no Xcode
- Configure o Team em "Signing & Capabilities"

---

## 🔄 Fluxo de Desenvolvimento

Sempre que fizer alterações no código React:

```bash
# 1. Build do projeto
npm run build

# 2. Sincronizar com as plataformas
npx cap sync

# 3. Abrir no Android Studio (opcional)
npx cap open android

# 4. Abrir no Xcode (opcional)  
npx cap open ios
```

---

## 📐 Responsividade

O app já está otimizado para:
- ✅ **Mobile Small** (320px+): iPhone SE, Android pequenos
- ✅ **Mobile Medium** (375px+): iPhone 12/13/14
- ✅ **Mobile Large** (428px+): iPhone Pro Max
- ✅ **Tablet** (768px+): iPads, tablets Android
- ✅ **Desktop** (1024px+): Laptops e desktops

### Classes Tailwind Utilizadas:
- `grid-cols-1`: 1 coluna em mobile
- `md:grid-cols-2`: 2 colunas em tablet
- `lg:grid-cols-4`: 4 colunas em desktop
- `flex-col`: Layout vertical em mobile
- `md:flex-row`: Layout horizontal em tablet+

---

## 🎨 Ajustes Específicos Mobile

### Viewport Configurado:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### Benefícios:
- **viewport-fit=cover**: Safe area para iPhone X+ (notch)
- **user-scalable=no**: Comportamento de app nativo
- **maximum-scale=1.0**: Previne zoom acidental

---

## 🐛 Problemas Conhecidos

### iOS - User Script Sandboxing
**Erro:** `Sandbox: bash deny(1) file-read-data`

**Solução:**
1. Xcode > Projeto "App" > Build Settings
2. Busque "User Script Sandboxing"
3. Mude de "Yes" para "No"

### Android - Primeira Build Lenta
A primeira compilação no Android Studio pode levar 5-10 minutos devido ao Gradle download.

---

## 📦 Requisitos

### Para Android:
- [ ] Android Studio instalado
- [ ] Java JDK 11+ instalado
- [ ] Android SDK instalado (via Android Studio)

### Para iOS:
- [x] macOS
- [x] Xcode instalado
- [x] CocoaPods instalado
- [ ] Conta Apple Developer (apenas para publicar)

---

## 🚀 Publicação

### Google Play Store (Android):
1. Crie uma conta Google Play Console ($25 taxa única)
2. No Android Studio: Build > Generate Signed Bundle/APK
3. Crie um keystore para assinar o app
4. Faça upload do .aab na Play Console
5. Preencha informações e screenshots

### Apple App Store (iOS):
Veja o guia completo em: [PUBLICACAO_APP_STORE.md](file:///Users/user/appigreja/PUBLICACAO_APP_STORE.md)

---

## 📞 Comandos Úteis

```bash
# Rebuild e sync completo
npm run build && npx cap sync

# Sync apenas Android
npx cap sync android

# Sync apenas iOS
npx cap sync ios

# Abrir Android Studio
npx cap open android

# Abrir Xcode
npx cap open ios

# Ver versão do Capacitor
npx cap --version

# Listar plugins instalados
npx cap ls
```

---

**Status:** ✅ App configurado para iOS e Android
**Próximo passo:** Testar no Android Studio ou Xcode
