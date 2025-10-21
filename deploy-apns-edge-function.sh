#!/bin/bash

echo "🚀 Deploy APNs Edge Function"
echo "=============================="
echo ""

# Deploy da Edge Function
echo "📦 Deploying Edge Function..."
supabase functions deploy send-push-notification

echo ""
echo "🔐 Configurando variáveis de ambiente APNs..."
echo ""
echo "Você precisa fornecer as seguintes informações do Apple Developer:"
echo ""

# Team ID
read -p "📱 Team ID (10 caracteres): " TEAM_ID

# Key ID
read -p "🔑 Key ID do .p8 file (10 caracteres): " KEY_ID

# Private Key
echo "📄 Cole o conteúdo completo do arquivo .p8 (incluindo BEGIN/END) e pressione CTRL+D quando terminar:"
PRIVATE_KEY=$(cat)

# Ambiente
echo ""
echo "🌍 Ambiente APNs:"
echo "1) development (sandbox) - para testar com Xcode/TestFlight"
echo "2) production - para App Store"
read -p "Escolha (1 ou 2): " ENV_CHOICE

if [ "$ENV_CHOICE" == "2" ]; then
  APNS_ENV="production"
else
  APNS_ENV="development"
fi

echo ""
echo "💾 Salvando secrets no Supabase..."

# Configurar secrets
echo "$TEAM_ID" | supabase secrets set APNS_TEAM_ID --stdin
echo "$KEY_ID" | supabase secrets set APNS_KEY_ID --stdin
echo "$PRIVATE_KEY" | supabase secrets set APNS_PRIVATE_KEY --stdin
echo "$APNS_ENV" | supabase secrets set APNS_ENVIRONMENT --stdin

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie um novo aviso no app admin"
echo "2. Verifique se a notificação chegou no iPhone"
echo "3. Confira os logs: supabase functions logs send-push-notification"
