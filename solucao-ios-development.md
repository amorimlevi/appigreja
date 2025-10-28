# 🔧 Solução: Notificações iOS em Desenvolvimento (Xcode)

## Problema
- App rodando no Xcode (ambiente development)
- Chave APNs configurada apenas para PRODUÇÃO no Firebase
- Erro 401 ao enviar notificação

## Soluções Possíveis

### Opção 1: Testar com TestFlight (RECOMENDADO)
Apps no TestFlight usam ambiente de produção.

1. Build do app para TestFlight
2. Instale no dispositivo via TestFlight
3. As notificações devem funcionar ✅

### Opção 2: Adicionar chave para Desenvolvimento no Firebase

No Firebase Console, existe um campo separado para:
- "Chave de autenticação de APNs de **desenvolvimento**"

**Passos:**
1. Firebase Console → Cloud Messaging
2. Role até "Apple app configuration"
3. Procure por campo de **desenvolvimento/sandbox**
4. Faça upload da **mesma chave** (.p8)
   - Arquivo: AuthKey_44UHHU47FR.p8
   - Key ID: 44UHHU47FR
   - Team ID: LU3NTX93ML

### Opção 3: Build de Produção Local
Criar um build de produção (Archive) e instalar no device:

1. No Xcode: Product → Archive
2. Distribute App → Ad Hoc ou Development
3. Instalar no device via Xcode

## Teste Rápido

Para testar se é isso mesmo:
- Instale o app via TestFlight (se já tiver build lá)
- Teste a notificação
- Se funcionar, confirma que é problema de ambiente dev vs prod
