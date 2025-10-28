#!/bin/bash

echo "📱 Teste de Notificações - iOS Member TestFlight"
echo ""
echo "PASSO 1: No app TestFlight, faça:"
echo "  1️⃣  LOGOUT"
echo "  2️⃣  LOGIN novamente"
echo ""
read -p "Pressione ENTER quando fizer logout/login... "

echo ""
echo "⏳ Aguardando 5 segundos para o token ser registrado..."
sleep 5

echo ""
echo "🔍 Verificando se o token FCM foi registrado..."
node check-ios-tokens-temp.mjs | head -8

echo ""
echo "📤 Enviando notificação de teste..."
node test-notification-member-37.mjs

echo ""
echo "✅ Notificação enviada!"
echo "Aguarde 5-10 segundos e verifique se chegou no TestFlight."
echo ""
echo "Se não chegar, verifique os logs da Edge Function no Supabase Dashboard."
