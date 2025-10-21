# Guia: Lançar Duas Apps Separadas (Member e Admin)

## 📋 Visão Geral

Você tem um único código-base que contém DUAS aplicações:
1. **Igreja Member** - App para membros da igreja (`/membro`)
2. **Igreja Admin** - App administrativo para líderes (`/`)

Para publicá-las como apps separadas na App Store e Play Store, você precisa criar dois builds independentes.

---

## 🚀 Passos para Preparação

### 1. Build do App Member (Membros)

```bash
# 1.1 Build do código web para Member
npm run build -- --config vite.config.member.js

# 1.2 Sincronizar com Capacitor usando config do Member
npx cap sync --config capacitor.config.member.json

# 1.3 Abrir no Xcode (iOS) ou Android Studio
npx cap open ios --config capacitor.config.member.json
npx cap open android --config capacitor.config.member.json
```

### 2. Build do App Admin (Administração)

```bash
# 2.1 Build do código web para Admin
npm run build -- --config vite.config.admin.js

# 2.2 Sincronizar com Capacitor usando config do Admin
npx cap sync --config capacitor.config.admin.json

# 2.3 Abrir no Xcode (iOS) ou Android Studio
npx cap open ios --config capacitor.config.admin.json
npx cap open android --config capacitor.config.admin.json
```

---

## 📱 Configuração no Xcode (iOS)

### Para CADA app (Member e Admin):

1. **Bundle Identifier**:
   - Member: `com.igreja.member`
   - Admin: `com.igreja.admin`

2. **Display Name**:
   - Member: `Igreja Member`
   - Admin: `Igreja Admin`

3. **Ícones**: Crie ícones diferentes para cada app
   - Use ferramentas: https://www.appicon.co/
   - Adicione em `App > Assets.xcassets > AppIcon`

4. **Team**: Selecione seu Apple Developer Team

5. **Version**: `1.0.0` e Build: `1`

---

## 🤖 Configuração no Android Studio

### Para CADA app:

1. **Abra** o projeto no Android Studio

2. **Build Variants**: 
   - File > Project Structure
   - Verifique que `applicationId` está correto no `build.gradle`:
     - Member: `com.igreja.member`
     - Admin: `com.igreja.admin`

3. **App Name**: 
   - Edite `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="app_name">Igreja Member</string>
   <!-- ou -->
   <string name="app_name">Igreja Admin</string>
   ```

4. **Ícones**: 
   - Gere ícones em: https://icon.kitchen/
   - Substitua em `android/app/src/main/res/mipmap-*/`

---

## 🏪 App Store Connect (iOS)

Para cada app, você precisa criar uma **entrada separada**:

### App 1: Igreja Member
- **Nome**: Igreja Member
- **Bundle ID**: `com.igreja.member`
- **SKU**: `IGREJAMEMBER001`
- **Categoria**: Lifestyle ou Social Networking
- **Screenshots**: Do app de membros
- **Descrição**: Focada em membros (eventos, versículos, avisos)

### App 2: Igreja Admin  
- **Nome**: Igreja Admin
- **Bundle ID**: `com.igreja.admin`
- **SKU**: `IGREJAADMIN001`
- **Categoria**: Productivity ou Business
- **Screenshots**: Do painel administrativo
- **Descrição**: Focada em administração (gestão de membros, eventos, escalas)

---

## 🎮 Google Play Console (Android)

Para cada app, você precisa criar uma **entrada separada**:

### App 1: Igreja Member
1. Crie um novo app no Play Console
2. **Package name**: `com.igreja.member`
3. **Nome**: Igreja Member
4. **Categoria**: Lifestyle
5. Faça upload do APK/AAB gerado

### App 2: Igreja Admin
1. Crie um novo app no Play Console  
2. **Package name**: `com.igreja.admin`
3. **Nome**: Igreja Admin
4. **Categoria**: Productivity
5. Faça upload do APK/AAB gerado

---

## 🎨 Criar Ícones Diferentes

É **crucial** que cada app tenha ícones visualmente distintos:

### Sugestões:
- **Member App**: Ícone com pessoa/comunidade, cor verde
- **Admin App**: Ícone com engrenagem/painel, cor azul

### Ferramentas:
- https://www.appicon.co/ (gera todos os tamanhos)
- https://icon.kitchen/ (específico para Android)
- Canva, Figma, Photoshop

---

## 📸 Screenshots Obrigatórias

### iOS (ambos os apps):
- **6.7"** (iPhone 14 Pro Max): 1290 x 2796 pixels
- **6.5"** (iPhone 11 Pro Max): 1242 x 2688 pixels
- Mínimo: 3 screenshots, máximo: 10

### Android (ambos os apps):
- Mínimo: 2 screenshots
- Recomendado: 8 screenshots
- Tamanhos: 16:9 ou 9:16 (ex: 1080 x 1920)

---

## 🔑 Signing & Certificates

### iOS:
- Você precisa de **2 profiles** separados (um para cada Bundle ID)
- No Xcode: Signing & Capabilities
- Selecione "Automatically manage signing"

### Android:
- Crie um keystore para assinar os APKs:
```bash
keytool -genkey -v -keystore release-key.keystore -alias member-app -keyalg RSA -keysize 2048 -validity 10000
keytool -genkey -v -keystore release-key.keystore -alias admin-app -keyalg RSA -keysize 2048 -validity 10000
```

---

## ✅ Checklist Final

### Antes de submeter:

- [ ] Dois projetos Capacitor configurados (member e admin)
- [ ] Bundle IDs diferentes configurados
- [ ] Ícones diferentes para cada app
- [ ] Screenshots de cada app (mínimo 3 para iOS, 2 para Android)
- [ ] Descrições específicas para cada app
- [ ] Builds testados em dispositivos físicos
- [ ] Política de Privacidade (pode ser a mesma URL para ambos)
- [ ] Conta Apple Developer ativa ($99/ano)
- [ ] Conta Google Play Console ativa (taxa única $25)

---

## 🔄 Workflow de Atualização

Quando precisar atualizar os apps:

```bash
# 1. Faça alterações no código
# 2. Build Member
npm run build -- --config vite.config.member.js
npx cap sync --config capacitor.config.member.json

# 3. Build Admin
npm run build -- --config vite.config.admin.js
npx cap sync --config capacitor.config.admin.json

# 4. Abra cada um no Xcode/Android Studio
# 5. Incremente versão
# 6. Gere archive/AAB
# 7. Faça upload
```

---

## 💰 Custos

- **Apple Developer**: $99/ano (permite múltiplos apps)
- **Google Play Console**: $25 (taxa única, permite múltiplos apps)
- **Total inicial**: ~$124 USD

---

## 📞 Recursos

- Capacitor Multi-Config: https://capacitorjs.com/docs/cli/commands/sync
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Icon Generators:
  - https://www.appicon.co/
  - https://icon.kitchen/
  - https://hotpot.ai/icon-resizer

---

## ⚠️ Importante

1. **Não misture os builds**: Certifique-se de usar o config correto para cada app
2. **Teste antes de publicar**: Instale em dispositivos físicos
3. **Políticas**: Leia as diretrizes de cada loja
4. **Tempo de revisão**: 
   - Apple: 1-3 dias
   - Google: 1-7 dias (primeira vez pode demorar mais)

---

**Próximos Passos Imediatos:**

1. ✅ Criar ícones para Member e Admin
2. ✅ Fazer primeiro build de teste do Member
3. ✅ Fazer primeiro build de teste do Admin
4. ✅ Testar em simuladores/emuladores
5. ✅ Criar contas de desenvolvedor (Apple e Google)
