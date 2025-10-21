#!/bin/bash

echo "🚀 Deploy Push Notifications Setup"
echo "===================================="
echo ""

# Verificar se supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
    echo "✅ Supabase CLI instalado!"
else
    echo "✅ Supabase CLI encontrado"
fi

echo ""
echo "📋 Informações necessárias:"
echo ""

# Pedir project-ref
read -p "Project Ref (da URL do Supabase Dashboard): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project Ref é obrigatório!"
    exit 1
fi

# Pedir FCM Server Key
read -p "FCM Server Key (do Firebase Cloud Messaging): " FCM_KEY

if [ -z "$FCM_KEY" ]; then
    echo "❌ FCM Server Key é obrigatória!"
    exit 1
fi

echo ""
echo "🔗 Fazendo login no Supabase..."
supabase login

echo ""
echo "🔗 Linkando projeto..."
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "📦 Fazendo deploy da Edge Function..."
supabase functions deploy send-push-notifications

echo ""
echo "🔐 Configurando FCM Server Key..."
supabase secrets set FCM_SERVER_KEY="$FCM_KEY"

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Teste criando um novo aviso no app admin"
echo "2. Execute a Edge Function manualmente:"
echo "   curl -X POST \\"
echo "     'https://$PROJECT_REF.supabase.co/functions/v1/send-push-notifications' \\"
echo "     -H 'Authorization: Bearer [SEU-SERVICE-ROLE-KEY]' \\"
echo "     -H 'Content-Type: application/json'"
echo ""
echo "3. Configure execução automática (webhook ou cron) - veja DEPLOY_PUSH_NOTIFICATIONS.md"
echo ""
