#!/bin/bash

echo "🧪 Testando notificação push manualmente..."

curl -X POST \
  'https://prlxzjmctjxlczbwlbvh.supabase.co/functions/v1/send-push-notification' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh6am1jdGp4bGN6YndsYnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg0Mzg1NCwiZXhwIjoyMDQyNDE5ODU0fQ.lTewEf00PN_QFZQdAoG0QFNM1QjE4YcK2PfHaZ_TiFs' \
  -d '{
    "type": "aviso",
    "title": "Teste Manual",
    "body": "Esta é uma notificação de teste",
    "data": {"test": "true"}
  }'

echo ""
echo "✅ Requisição enviada! Verifique se a notificação chegou no iPhone."
