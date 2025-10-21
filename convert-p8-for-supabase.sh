#!/bin/bash

# ============================================
# Conversor de Chave APNs .p8 para Supabase
# ============================================
# Este script converte o arquivo .p8 da Apple
# para o formato aceito pelo Supabase (com \n)

if [ $# -eq 0 ]; then
    echo "❌ Erro: Arquivo .p8 não especificado"
    echo ""
    echo "Uso:"
    echo "  ./convert-p8-for-supabase.sh AuthKey_ABC123XYZ.p8"
    echo ""
    exit 1
fi

P8_FILE="$1"

if [ ! -f "$P8_FILE" ]; then
    echo "❌ Erro: Arquivo '$P8_FILE' não encontrado"
    exit 1
fi

echo "🔑 Convertendo chave APNs para formato Supabase..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Converter o arquivo substituindo quebras de linha por \n
CONVERTED=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$P8_FILE")

echo "$CONVERTED"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Conversão concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Copie o texto acima (começando com -----BEGIN)"
echo "2. Acesse: https://supabase.com/dashboard/project/dvbdvftaklstyhpqznmu/settings/functions"
echo "3. Edite a função 'send-push-notification'"
echo "4. Cole na variável APNS_PRIVATE_KEY"
echo ""
