# Guia: Publicar App Android no Google Play Console

## Pré-requisitos
- Conta no Google Play Console (taxa única de $25)
- Java JDK instalado
- Android Studio (recomendado) ou linha de comando

## Passo 1: Criar Keystore para Assinatura

### Gerar o keystore (apenas na primeira vez):
```bash
keytool -genkey -v -keystore android-member/release-key.keystore -alias member-app -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANTE: Guarde estas informações em local seguro:**
- Senha do keystore
- Senha da key
- Alias: member-app

⚠️ **NUNCA perca o keystore! Sem ele, você não poderá atualizar o app no futuro.**

### Adicione o keystore ao .gitignore:
```
android-member/release-key.keystore
android-member/key.properties
```

## Passo 2: Configurar Assinatura do App

Crie o arquivo `android-member/key.properties`:
```properties
storePassword=SUA_SENHA_DO_KEYSTORE
keyPassword=SUA_SENHA_DA_KEY
keyAlias=member-app
storeFile=release-key.keystore
```

Edite `android-member/app/build.gradle` para adicionar a configuração de assinatura:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Passo 3: Atualizar Versão do App

Edite `android-member/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.igreja.member"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1      // Incrementar a cada nova versão (1, 2, 3...)
    versionName "1.0.0" // Versão legível (1.0.0, 1.0.1, etc.)
    ...
}
```

## Passo 4: Build de Produção

### 1. Sincronizar o projeto:
```bash
npm run cap:sync:member
```

### 2. Gerar o AAB (Android App Bundle):

**Opção A - Via Android Studio (Recomendado):**
1. Abra o Android Studio:
   ```bash
   npm run open:android:member
   ```
2. Menu: Build → Generate Signed Bundle / APK
3. Escolha "Android App Bundle"
4. Selecione o keystore criado
5. Build Type: release
6. O AAB será gerado em: `android-member/app/build/outputs/bundle/release/app-release.aab`

**Opção B - Via Linha de Comando:**
```bash
cd android-member
./gradlew bundleRelease
```

O arquivo será gerado em: `android-member/app/build/outputs/bundle/release/app-release.aab`

## Passo 5: Configurar Google Play Console

### 1. Criar App no Console:
- Acesse: https://play.google.com/console
- Clique em "Criar app"
- Preencha:
  - Nome: "Igreja Member" (ou o nome desejado)
  - Idioma padrão: Português (Brasil)
  - Tipo: App
  - Gratuito/Pago: Gratuito

### 2. Configurar Informações do App:

#### Informações principais:
- **Título**: Igreja Member (máx. 50 caracteres)
- **Descrição curta**: Descrição de até 80 caracteres
- **Descrição completa**: Descrição detalhada (até 4000 caracteres)

#### Exemplo de descrição:
```
Aplicativo oficial para membros da igreja. 

Funcionalidades:
- Consultar eventos e workshops
- Inscrever-se em atividades
- Receber notificações da igreja
- Visualizar escalas de ministérios
- Galeria de fotos dos eventos
- E muito mais!
```

### 3. Recursos Gráficos Necessários:

#### Ícone do app:
- **Tamanho**: 512x512 pixels
- **Formato**: PNG de 32 bits
- **Sem transparência**

#### Imagem de recurso:
- **Tamanho**: 1024x500 pixels
- **Formato**: PNG ou JPEG

#### Capturas de tela (mínimo 2):
- **Telefone**: 16:9 ou 9:16
- **Tamanho mínimo**: 320px no lado menor
- **Tamanho máximo**: 3840px no lado maior
- **Formato**: PNG ou JPEG

### 4. Categorização:
- **Categoria**: Estilo de vida ou Social
- **Tags**: religião, igreja, comunidade

### 5. Classificação de Conteúdo:
- Complete o questionário
- Geralmente: "PEGI 3" / "Livre"

### 6. Países:
- Selecione "Brasil" ou países desejados

## Passo 6: Upload do AAB

1. Acesse: **Produção** → **Criar nova versão**
2. Upload do AAB: Arraste o arquivo `app-release.aab`
3. Preencha as "Notas da versão" (o que há de novo)
4. Clique em "Salvar"
5. Clique em "Revisar versão"
6. Se tudo estiver OK, clique em "Iniciar lançamento para produção"

### Primeira publicação:
- Pode levar de **alguns dias a 1 semana** para aprovação
- Após aprovado, o app estará disponível na Play Store

## Passo 7: Testes Internos (Opcional mas Recomendado)

Antes de publicar em produção, você pode criar uma **faixa de teste interno**:

1. Acesse: **Testes** → **Teste interno**
2. Crie uma nova versão de teste
3. Adicione emails de testadores
4. Upload do AAB
5. Os testadores receberão um link para instalar

## Comandos Úteis

### Build e sync completo:
```bash
npm run build:member && npm run cap:sync:member
```

### Verificar versão atual:
```bash
grep versionCode android-member/app/build.gradle
```

### Limpar build anterior:
```bash
cd android-member
./gradlew clean
```

## Checklist Final

Antes de enviar:
- [ ] versionCode incrementado
- [ ] versionName atualizado
- [ ] Keystore configurado e guardado em segurança
- [ ] Build gerado sem erros
- [ ] AAB testado (se possível)
- [ ] Ícone e screenshots preparados
- [ ] Descrições escritas
- [ ] Política de privacidade pronta (se aplicável)

## Atualizações Futuras

Para atualizar o app:
1. Incremente o `versionCode` em `build.gradle`
2. Atualize o `versionName`
3. Gere novo AAB
4. Crie nova versão no Play Console
5. Upload do novo AAB

## Solução de Problemas

### Erro: "Upload failed"
- Verifique se o versionCode foi incrementado
- Certifique-se de que está usando o mesmo keystore

### Erro: "Key store was tampered"
- Verifique se as senhas em key.properties estão corretas

### Build falha
```bash
cd android-member
./gradlew clean
./gradlew bundleRelease --stacktrace
```

## Links Úteis

- [Google Play Console](https://play.google.com/console)
- [Documentação Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Lista de requisitos gráficos](https://support.google.com/googleplay/android-developer/answer/9866151)

---

**Dica**: Salve todos os arquivos sensíveis (keystore, senhas) em um gerenciador de senhas ou cofre seguro!
