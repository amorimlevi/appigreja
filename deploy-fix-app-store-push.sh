#!/bin/bash

# ============================================
# Deploy: Fix Push Notifications App Store
# ============================================
# Este script faz deploy da edge function corrigida
# que envia notificações para App Store e TestFlight

echo "🚀 Fazendo deploy da edge function corrigida..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Fazer deploy da função
echo "📦 Fazendo deploy de send-push-notification..."
supabase functions deploy send-push-notification

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Teste criando um novo aviso no app admin"
    echo "2. Verifique se dispositivos da App Store recebem a notificação"
    echo "3. Verifique os logs da função em:"
    echo "   https://supabase.com/dashboard/project/[PROJECT-ID]/functions/send-push-notification/logs"
    echo ""
    echo "🔍 Para ver os logs em tempo real:"
    echo "   supabase functions logs send-push-notification"
else
    echo ""
    echo "❌ Erro no deploy!"
    echo "Verifique sua conexão e credenciais do Supabase"
    exit 1
fi
