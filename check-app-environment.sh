#!/bin/bash

echo "🔍 Verificando ambiente do app iOS Member..."
echo ""

# Verificar se tem .mobileprovision no projeto
PROVISION=$(find ios-member/App -name "*.mobileprovision" 2>/dev/null | head -1)

if [ -n "$PROVISION" ]; then
  echo "📱 Provisioning Profile encontrado:"
  echo "   $PROVISION"
  echo ""
  
  # Extrair informações
  security cms -D -i "$PROVISION" > /tmp/provision.plist 2>/dev/null
  
  if [ -f /tmp/provision.plist ]; then
    ENVIRONMENT=$(/usr/libexec/PlistBuddy -c "Print :Entitlements:aps-environment" /tmp/provision.plist 2>/dev/null)
    echo "🎯 Ambiente APNs: $ENVIRONMENT"
    
    if [ "$ENVIRONMENT" = "development" ]; then
      echo "   ⚠️  App está em DESENVOLVIMENTO"
      echo "   No Firebase, você precisa configurar a chave para DESENVOLVIMENTO também"
    elif [ "$ENVIRONMENT" = "production" ]; then
      echo "   ✅ App está em PRODUÇÃO"
      echo "   A chave no Firebase está correta"
    else
      echo "   ❓ Ambiente desconhecido"
    fi
    
    rm /tmp/provision.plist
  fi
else
  echo "⚠️  Provisioning profile não encontrado localmente"
  echo ""
  echo "Como você está testando o app?"
  echo "  1) Rodando no Xcode? → Ambiente: development"
  echo "  2) TestFlight? → Ambiente: production (mas pode precisar de sandbox)"
  echo "  3) App Store? → Ambiente: production"
fi

echo ""
echo "📋 Verifique também no Firebase Console:"
echo "   Project Settings → General → Your apps"
echo "   Deve ter um app iOS com bundle ID: com.igreja.member"
