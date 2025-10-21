# 🔍 Diagnóstico: Notificação Enviada mas Não Chega

## ✅ Status Atual

Logs mostram: `✅ Notification sent successfully to iOS device (member 15)`

Isso significa que:
- ✅ Edge function funcionou
- ✅ Credenciais APNs corretas
- ✅ Apple aceitou a notificação (HTTP 200)
- ❌ **MAS** não está chegando no dispositivo

## 🔍 Possíveis Causas

### 1. Bundle ID Incorreto ⚠️

**Problema mais comum!**

Verifique se o `APNS_BUNDLE_ID` no Supabase é **EXATAMENTE** o mesmo do Xcode.

#### Como verificar:

**No Xcode:**
1. Abra o projeto do app
2. Selecione o target (ex: "Igreja Zoe Member")
3. Aba **Signing & Capabilities**
4. Veja o **Bundle Identifier** (ex: `com.igrejazoe.member`)

**No Supabase:**
- Deve ser: `com.igrejazoe.member`
- **Não** pode ser: `com.igrejazoe.admin` (se for app member)

### 2. Push Notifications Capability Não Habilitada

**No Xcode:**
1. Selecione o target
2. Aba **Signing & Capabilities**
3. Clique no **+ Capability**
4. Adicione **Push Notifications**
5. Faça novo build e envie para App Store/TestFlight

### 3. Permissões Negadas no iOS

**No dispositivo:**
1. Ajustes → [Nome do App]
2. Notificações
3. Verificar se está **LIGADO**

### 4. App Fechado vs App Aberto

**Comportamento normal do iOS:**
- **App fechado/background**: Notificação aparece na barra
- **App aberto**: Notificação **não** aparece (comportamento padrão)

### 5. Token Expirado ou Inválido

O token pode estar desatualizado.

**Solução:**
1. Feche completamente o app (swipe up)
2. Abra novamente
3. Faça logout e login
4. Isso registra um novo token

### 6. Ambiente Sandbox vs Production

Verifique se está usando o certificado correto para o ambiente.

## 🛠️ Checklist de Diagnóstico

Execute este SQL no Supabase para ver os tokens:

```sql
-- Ver tokens registrados
SELECT 
    id,
    member_id,
    platform,
    LEFT(token, 30) || '...' as token_preview,
    created_at,
    updated_at
FROM device_tokens
WHERE member_id = 15
ORDER BY created_at DESC;
```

Verifique:
- [ ] Há tokens para o membro 15?
- [ ] Token foi criado recentemente?
- [ ] Platform é 'ios'?

## 🧪 Teste Manual

Vamos testar diretamente via SQL:

```sql
-- Trigger manual de notificação
INSERT INTO avisos (titulo, mensagem, destinatarios)
VALUES ('Teste Push', 'Esta é uma notificação de teste', ARRAY['todos']);
```

## 🔧 Soluções

### Solução 1: Verificar e Corrigir Bundle ID

1. Abra o Xcode
2. Veja o Bundle Identifier exato
3. Configure no Supabase:
   - https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions
   - Edite `APNS_BUNDLE_ID`
4. Redeploy:
   ```bash
   supabase functions deploy send-push-notification
   ```

### Solução 2: Reabilitar Push Notifications

**No Xcode:**
1. Target → Signing & Capabilities
2. Remova **Push Notifications**
3. Adicione novamente **Push Notifications**
4. Build → Archive → Upload para App Store Connect

### Solução 3: Resetar Token no Dispositivo

**No app:**
1. Logout completo
2. Feche o app (swipe up)
3. Reabra
4. Faça login novamente
5. Aceite permissão de notificações se aparecer

### Solução 4: Verificar no Console do Dispositivo

**No Mac:**
1. Conecte o iPhone via USB
2. Abra **Console.app**
3. Selecione o iPhone
4. Filtre por: `apns` ou `notification`
5. Crie um aviso
6. Veja os logs - procure por erros

## 📱 Teste Definitivo

Para ter certeza que está funcionando:

1. **Feche completamente o app** no iPhone
2. **No app admin**, crie um novo aviso
3. **Aguarde 5-10 segundos**
4. A notificação deve aparecer na tela de bloqueio

**Se aparecer:** ✅ Funcionando!  
**Se não aparecer:** Veja checklist abaixo

## 🔍 Checklist Final

- [ ] Bundle ID no Supabase = Bundle ID no Xcode
- [ ] Push Notifications capability habilitada no Xcode
- [ ] Notificações permitidas no iOS (Ajustes → App → Notificações)
- [ ] App está fechado (não aberto) durante o teste
- [ ] Token foi registrado recentemente (faça logout/login)
- [ ] Certificado APNs é de produção (não sandbox)
- [ ] Key ID e Team ID estão corretos

## 🆘 Ainda Não Funciona?

Se ainda não funcionar após tudo isso, o problema pode ser:

1. **Provisioning Profile desatualizado**
   - Baixe novo perfil no Apple Developer
   - Configure no Xcode
   - Faça novo build

2. **App não tem entitlements corretos**
   - Verifique arquivo `.entitlements`
   - Deve ter: `aps-environment` = `production`

3. **Problema com a Apple**
   - Às vezes demora até 15 minutos
   - Tente reiniciar o iPhone

---

**Próximo passo:** Execute o checklist e reporte qual item está falhando.
