# 🔔 Guia Visual: Configurar Push Notifications no Xcode

## Passo 1: Abrir o Projeto no Xcode

O projeto já deve estar aberto. Se não estiver:

```bash
npm run open:ios:member
```

Ou abra manualmente:
```
ios-member/App/App.xcworkspace
```

⚠️ **IMPORTANTE**: Sempre abra o `.xcworkspace`, não o `.xcodeproj`!

---

## Passo 2: Selecionar o Target

```
┌─────────────────────────────────────────────┐
│ Project Navigator (lado esquerdo)          │
│                                             │
│  📁 App                                     │
│    ├─ 📱 App (← CLIQUE AQUI)               │
│    ├─ 📁 App                                │
│    ├─ 📁 Pods                               │
│    └─ ...                                   │
└─────────────────────────────────────────────┘
```

1. No painel esquerdo (Project Navigator), clique no **ícone azul "App"** (primeiro item)
2. No painel central, verifique se o target **"App"** está selecionado (não "Pods" ou outros)

---

## Passo 3: Ir para Signing & Capabilities

```
┌─────────────────────────────────────────────┐
│ Abas no topo (painel central):             │
│                                             │
│  General | Signing & Capabilities | ...    │
│            ↑                                │
│            CLIQUE AQUI                      │
└─────────────────────────────────────────────┘
```

1. Clique na aba **"Signing & Capabilities"**
2. Certifique-se de estar na aba **"Debug"** (ou "All")

---

## Passo 4: Verificar Capabilities Existentes

Você deve ver algo assim:

```
┌──────────────────────────────────────────────────┐
│ Signing & Capabilities                           │
│                                                   │
│ ┌──────────────────────────────────────────┐     │
│ │ + Capability                             │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ ┌──────────────────────────────────────────┐     │
│ │ Signing (Automatic)                      │     │
│ │ Team: [seu time]                         │     │
│ │ Bundle ID: com.igreja.member             │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ ┌──────────────────────────────────────────┐     │
│ │ Background Modes                         │     │
│ │ ☑ Remote notifications                   │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Passo 5: Adicionar Push Notifications Capability

Se você **NÃO ver** um card com **"Push Notifications"**, precisa adicionar:

```
1. Clique no botão "+ Capability" (canto superior esquerdo)

   ┌─────────────────────────┐
   │  + Capability           │  ← CLIQUE AQUI
   └─────────────────────────┘

2. Na janela que aparece, digite "push" na busca

   ┌──────────────────────────────────┐
   │  🔍 push                         │
   │                                  │
   │  Push Notifications              │  ← DUPLO CLIQUE
   │  Background Modes                │
   │  ...                             │
   └──────────────────────────────────┘

3. Dê um DUPLO CLIQUE em "Push Notifications"
```

---

## Passo 6: Verificar Background Modes (Opcional)

Se você quiser receber notificações quando o app estiver fechado ou em background:

```
┌──────────────────────────────────────────┐
│ Background Modes                         │
│                                          │
│ ☑ Remote notifications   ← DEVE ESTAR   │
│ ☐ Background fetch       MARCADO         │
│ ☐ Audio, AirPlay...                      │
└──────────────────────────────────────────┘
```

---

## Passo 7: Verificar Entitlements

```
┌──────────────────────────────────────────┐
│ Push Notifications                       │
│                                          │
│ [Capability adicionada]                  │
│                                          │
│ Entitlements:                            │
│   aps-environment: development           │
│                                          │
└──────────────────────────────────────────┘
```

Você deve ver um novo card **"Push Notifications"** com:
- `aps-environment: development` (para testes)

---

## Passo 8: Verificar Signing

Role para cima e verifique a seção **"Signing"**:

```
┌──────────────────────────────────────────┐
│ Signing (Automatic)                      │
│                                          │
│ ✓ Automatically manage signing           │
│                                          │
│ Team: [Seu Time] (LU3NTX93ML)           │
│ Bundle Identifier: com.igreja.member     │
│                                          │
│ Provisioning Profile: iOS Team           │
│ Signing Certificate: Apple Development   │
│                                          │
│ ✓ Status: Ready to Run                   │
└──────────────────────────────────────────┘
```

⚠️ **Se aparecer algum erro** (triângulo amarelo ou vermelho):
- Clique em "Try Again" ou "Fix Issue"
- Pode precisar fazer login na sua Apple ID (Xcode > Preferences > Accounts)

---

## Passo 9: Build e Run

1. **Conecte um iPhone físico** (cabo USB)
   - Simulador NÃO funciona para push notifications!

2. **Selecione o dispositivo** no topo:
   ```
   ┌────────────────────────────┐
   │ App > [Seu iPhone] ▼       │  ← CLIQUE E SELECIONE SEU IPHONE
   └────────────────────────────┘
   ```

3. **Clique no botão Play** (▶️) ou pressione `Cmd + R`

---

## Passo 10: Testar

Quando o app abrir no iPhone:

1. **Faça login** como membro
2. **Aceite as permissões** de notificação quando aparecer o popup
3. **Verifique os logs** no Xcode:
   ```
   🔔 Initializing push notifications for member: [id]
   📱 Permission status: ...
   🔔 Requesting permissions...
   🎧 Setting up push notification listeners...
   ✅ Registering with APNs/FCM...
   ✅ Push registration success!
   🔑 Token: [seu token]
   💾 Saving token to Supabase...
   ```

4. **Se der erro**, você verá:
   ```
   🔴 Registration error: {...}
   ```
   E um alerta aparecerá na tela do iPhone

---

## ✅ Checklist Final

Antes de testar, confirme:

- [ ] Projeto aberto: `App.xcworkspace`
- [ ] Target selecionado: **App**
- [ ] Aba: **Signing & Capabilities**
- [ ] Capability adicionada: **Push Notifications** ✓
- [ ] Background Modes: **Remote notifications** ✓
- [ ] Entitlements: `aps-environment: development` ✓
- [ ] Signing: Sem erros, status "Ready to Run" ✓
- [ ] Dispositivo: **iPhone físico conectado** (não simulador!)
- [ ] Build: Sem erros de compilação ✓

---

## 🐛 Problemas Comuns

### "No aps-environment entitlement"
- Verifique se a capability "Push Notifications" foi adicionada
- Verifique se o arquivo `App.entitlements` está correto
- Faça Clean Build Folder: `Cmd + Shift + K`, depois `Cmd + B`

### "Invalid provisioning profile"
- Xcode > Preferences > Accounts
- Faça login com sua Apple ID
- Em Signing, clique em "Download Manual Profiles"
- Tente "Try Again" na seção Signing

### "Notification permission denied"
- No iPhone: Settings > [Nome do App] > Notifications
- Ative "Allow Notifications"
- Delete o app e instale novamente para pedir permissão de novo

### Token não aparece nos logs
- Verifique se está testando em **dispositivo físico**
- Verifique se aceitou as permissões quando solicitado
- Verifique os logs completos no Console do Xcode

---

## 📚 Recursos Adicionais

- [Apple Docs: Registering Your App with APNs](https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- Arquivo: `PUSH_NOTIFICATIONS_SETUP.md` (neste projeto)

---

## 🎯 Próximos Passos

Depois que conseguir o token:

1. **Configure o backend** para enviar notificações
2. **Teste com Firebase Cloud Messaging** ou APNs direto
3. **Para produção**: Mude `aps-environment` para `production`

**Precisa de ajuda?** Compartilhe os logs do Xcode Console!
