import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServiceAccount {
  project_id: string
  private_key: string
  client_email: string
}

// Gerar JWT para autenticação com Firebase
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT"
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging"
  }

  const encoder = new TextEncoder()
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${headerBase64}.${payloadBase64}`

  // Importar chave privada
  const pemKey = serviceAccount.private_key.replace(/\\n/g, '\n')
  const binaryKey = pemToBinary(pemKey)
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  )

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${signatureBase64}`

  // Trocar JWT por access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const data = await response.json()
  return data.access_token
}

function pemToBinary(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Usar variáveis de ambiente automáticas do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://dvbdvftakl5tyhpqznmu.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    console.log('🔧 Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Buscar notificações pendentes
    const { data: notifications, error: notifError } = await supabaseClient
      .from('push_notifications_queue')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(50)

    if (notifError) throw notifError

    console.log(`Found ${notifications?.length || 0} pending notifications`)

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No pending notifications', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Carregar service account do Firebase
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson)
    const projectId = serviceAccount.project_id

    // Obter access token
    const accessToken = await getAccessToken(serviceAccount)

    let sentCount = 0

    for (const notification of notifications) {
      // Buscar todos os tokens de dispositivos
      const { data: tokens, error: tokensError } = await supabaseClient
        .from('device_tokens')
        .select('*')

      if (tokensError) {
        console.error('Error fetching tokens:', tokensError)
        continue
      }

      if (!tokens || tokens.length === 0) {
        console.log('No device tokens found')
        await supabaseClient
          .from('push_notifications_queue')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', notification.id)
        continue
      }

      console.log(`Sending notification to ${tokens.length} devices`)

      // Enviar para cada token usando FCM V1 API
      for (const deviceToken of tokens) {
        try {
          // Converter todos os valores de data para string (FCM V1 requirement)
          const dataPayload: Record<string, string> = {}
          if (notification.data) {
            for (const [key, value] of Object.entries(notification.data)) {
              dataPayload[key] = typeof value === 'string' ? value : JSON.stringify(value)
            }
          }
          
          const message = {
            message: {
              token: deviceToken.token,
              notification: {
                title: notification.title,
                body: notification.body,
              },
              data: dataPayload,
              apns: {
                payload: {
                  aps: {
                    alert: {
                      title: notification.title,
                      body: notification.body,
                    },
                    sound: 'default',
                    badge: 1,
                    'content-available': 1,
                    'mutable-content': 1,
                  }
                }
              },
              android: {
                priority: 'high',
                notification: {
                  sound: 'default',
                }
              }
            }
          }

          const response = await fetch(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(message)
            }
          )

          const result = await response.json()
          
          if (response.ok) {
            console.log(`✅ Notification sent successfully to ${deviceToken.platform} device (member ${deviceToken.member_id})`)
            console.log(`   FCM Response:`, JSON.stringify(result))
            sentCount++
          } else {
            console.error(`❌ Failed to send to ${deviceToken.platform} (member ${deviceToken.member_id}):`, result)
            console.error(`   Full error details:`, JSON.stringify(result, null, 2))
            
            // Remover tokens inválidos
            if (result.error?.code === 404 || result.error?.status === 'NOT_FOUND' || 
                result.error?.status === 'INVALID_ARGUMENT') {
              console.log(`Removing invalid token for member ${deviceToken.member_id}`)
              await supabaseClient
                .from('device_tokens')
                .delete()
                .eq('id', deviceToken.id)
            }
          }
        } catch (error) {
          console.error(`Error sending to device ${deviceToken.id}:`, error)
        }
      }

      // Marcar notificação como enviada
      await supabaseClient
        .from('push_notifications_queue')
        .update({ 
          sent: true, 
          sent_at: new Date().toISOString() 
        })
        .eq('id', notification.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: notifications.length,
        sent: sentCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
