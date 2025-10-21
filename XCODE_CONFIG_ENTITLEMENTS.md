# Configurar Entitlements para Debug e Release no Xcode

## Problema

O Xcode não permite modificar entitlements durante o build. Precisamos ter:
- **Development** para builds locais (Xcode)
- **Production** para TestFlight/App Store

## Solução: Entitlements Separados

Criei dois arquivos:
- `App.entitlements` → development (para Debug)
- `App-Release.entitlements` → production (para Release/Archive)

## Passo a Passo no Xcode

### 1. Adicionar App-Release.entitlements ao Projeto

1. Abra `ios-member/App/App.xcworkspace` no Xcode
2. No Project Navigator (painel esquerdo), clique com botão direito na pasta **App**
3. Selecione **Add Files to "App"...**
4. Navegue até `/Users/user/appigreja/ios-member/App/App/`
5. Selecione `App-Release.entitlements`
6. Certifique-se de que **"Copy items if needed"** está DESMARCADO
7. Certifique-se de que o target **App** está marcado
8. Clique em **Add**

### 2. Configurar Build Settings

1. No Xcode, selecione o **projeto App** (ícone azul no topo do Project Navigator)
2. Selecione o **target App** na lista
3. Vá na aba **Build Settings**
4. Procure por **"Code Signing Entitlements"** (use a busca no topo)
5. Expanda **Code Signing Entitlements** se estiver colapsado
6. Configure os valores:

   - **Debug:** `App/App.entitlements`
   - **Release:** `App/App-Release.entitlements`

Para fazer isso:
- Clique no valor ao lado de **Debug**
- Digite: `App/App.entitlements`
- Clique no valor ao lado de **Release**  
- Digite: `App/App-Release.entitlements`

### 3. Verificar as Configurações

No **Build Settings**, você deve ver algo assim:

```
Code Signing Entitlements
  ▾ Debug                    App/App.entitlements
  ▾ Release                  App/App-Release.entitlements
```

### 4. Limpar e Fazer Archive

1. Menu: **Product** > **Clean Build Folder** (⇧⌘K)
2. Selecione **Any iOS Device (arm64)** ou seu dispositivo conectado
3. Menu: **Product** > **Archive**
4. Aguarde o build terminar

## Verificar se Funcionou

Após o Archive, você pode verificar os entitlements:

1. Quando o **Organizer** abrir, selecione o Archive recém-criado
2. Clique com botão direito > **Show in Finder**
3. Clique com botão direito no arquivo `.xcarchive` > **Show Package Contents**
4. Navegue até `Products/Applications/App.app`
5. Clique com botão direito no `App.app` > **Show Package Contents**
6. Procure por `embedded.mobileprovision`

Ou simplesmente continue o processo de **Distribute App** para TestFlight.

## Alternativa: Automatic Signing (Mais Simples)

Se você usa **Automatically manage signing**, o Xcode pode fazer isso automaticamente:

1. Vá em **Signing & Capabilities**
2. Certifique-se de que **Automatically manage signing** está marcado
3. Na seção **Push Notifications**, o Xcode automaticamente usa:
   - Sandbox para Debug
   - Production para Release/Archive

Neste caso, você pode ignorar os entitlements separados e deixar o Xcode gerenciar.

## Ainda com Erro?

Se continuar com erro, tente:

```bash
cd /Users/user/appigreja/ios-member/App
rm -rf build
rm -rf DerivedData
```

Depois limpe no Xcode (Product > Clean Build Folder) e tente novamente.
