#!/bin/bash

echo "================================================"
echo "Deployment do Sistema de Notificações Completo"
echo "================================================"
echo ""

# 1. Deploy da Edge Function atualizada
echo "1️⃣ Deploying Edge Function com filtro de ministério..."
npx supabase functions deploy send-push-notification

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer deploy da Edge Function"
    exit 1
fi

echo "✅ Edge Function deployed"
echo ""

# 2. Aplicar triggers no banco de dados
echo "2️⃣ Aplicando triggers no banco de dados..."
echo ""
echo "⚠️  IMPORTANTE: Execute este SQL no Supabase SQL Editor:"
echo ""
echo "Arquivo: setup-notifications-triggers-complete.sql"
echo ""
echo "Ou execute manualmente:"
cat setup-notifications-triggers-complete.sql
echo ""
echo "================================================"
echo ""

read -p "Pressione ENTER após executar o SQL no Supabase..."

echo ""
echo "✅ Sistema de notificações configurado!"
echo ""
echo "📱 Notificações agora funcionam para:"
echo "  • Novos avisos → Todos os membros"
echo "  • Novos eventos → Todos os membros"  
echo "  • Novas escalas → Apenas membros do ministério específico"
echo ""
echo "🔔 Ministérios configurados:"
echo "  • Louvor"
echo "  • Diáconia"
echo "  • Kids"
echo "  • Jovens"
echo ""
