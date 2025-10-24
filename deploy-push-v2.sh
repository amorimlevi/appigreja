#!/bin/bash

# Deploy da Edge Function v2 com suporte a iOS e Android via FCM v1

echo "🚀 Deploying send-push-notification function..."

supabase functions deploy send-push-notification --project-ref dvbdvftaklstyhpqznmu

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Verifique se FCM_SERVICE_ACCOUNT está configurado no Supabase Dashboard"
echo "   Dashboard → Edge Functions → send-push-notification → Settings"
echo ""
echo "2. Teste criando um novo aviso no Admin app"
echo "3. Verifique os logs em: Dashboard → Edge Functions → send-push-notification → Logs"
