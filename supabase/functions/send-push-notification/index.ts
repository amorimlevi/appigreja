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

// Enviar notificação via APNs HTTP/2 (para iOS)
async function sendAPNsNotification(token: string, title: string, body: string, data: any, bundleId: string) {
  const apnsAuthKey = Deno.env.get('APNS_AUTH_KEY')
  const apnsKeyId = Deno.env.get('APNS_KEY_ID')
  const apnsTeamId = Deno.env.get('APNS_TEAM_ID')
  const apnsBundleId = bundleId || Deno.env.get('APNS_BUNDLE_ID') || 'com.igreja.admin'
  
  if (!apnsAuthKey || !apnsKeyId || !apnsTeamId) {
    console.error('❌ APNs credentials not configured')
    throw new Error('APNs credentials missing')
  }

  // Gerar JWT para APNs
  const header = { alg: "ES256", kid: apnsKeyId, typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: apnsTeamId,
    iat: now
  }

  const encoder = new TextEncoder()
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${headerBase64}.${payloadBase64}`

  // Importar chave APNS (ES256)
  const pemKey = apnsAuthKey.replace(/\\n/g, '\n')
  const binaryKey = pemToBinaryES256(pemKey)
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  )

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    encoder.encode(signatureInput)
  )

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${signatureBase64}`

  // Preparar payload APNs
  const apnsPayload = {
    aps: {
      alert: { title, body },
      sound: 'default',
      badge: 1
    },
    ...data
  }

  // Enviar via APNs HTTP/2
  // Usar sandbox para desenvolvimento/TestFlight, production para App Store
  const apnsEnvironment = Deno.env.get('APNS_ENVIRONMENT') || 'sandbox'
  const apnsHost = apnsEnvironment === 'production' 
    ? 'api.push.apple.com' 
    : 'api.sandbox.push.apple.com'
  const apnsUrl = `https://${apnsHost}/3/device/${token}`
  
  const response = await fetch(apnsUrl, {
    method: 'POST',
    headers: {
      'authorization': `bearer ${jwt}`,
      'apns-topic': apnsBundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10'
    },
    body: JSON.stringify(apnsPayload)
  })

  return response
}

function pemToBinaryES256(pem: string): ArrayBuffer {
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

// Gerar JWT para autenticação com Firebase (para Android)
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" }
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

  const pemKey = serviceAccount.private_key.replace(/\\n/g, '\n')
  const binaryKey = pemToBinary(pemKey)
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(signatureInput)
  )

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${signatureBase64}`

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
    const { type, ministerio, title, body, data, aviso_id, titulo, mensagem } = await req.json()
    
    // Padronizar campos
    const notificationTitle = title || titulo || 'Notificação'
    const notificationBody = body || mensagem || ''
    
    console.log(`📤 Received push notification request:`, { type, ministerio, title: notificationTitle })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://dvbdvftaklstyhpqznmu.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Buscar tokens de dispositivos
    let tokensQuery = supabaseClient.from('device_tokens').select('*')
    
    if (type === 'escala' && ministerio) {
      console.log(`🔍 Filtering by ministerio: ${ministerio}`)
      const { data: members } = await supabaseClient
        .from('members')
        .select('id')
        .contains('ministerios', [ministerio])
      
      if (members && members.length > 0) {
        const memberIds = members.map(m => m.id)
        tokensQuery = tokensQuery.in('member_id', memberIds)
      }
    }

    const { data: tokens, error: tokensError } = await tokensQuery

    if (tokensError) {
      console.error('❌ Error fetching tokens:', tokensError)
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️  No device tokens found')
      return new Response(
        JSON.stringify({ success: true, message: 'No tokens found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📱 Found ${tokens.length} device tokens`)

    let sentCount = 0
    const dataPayload = data || { type: type || 'aviso', aviso_id }

    // Enviar para todos os dispositivos via FCM (iOS e Android)
    if (tokens.length > 0) {
      const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || Deno.env.get('FCM_SERVICE_ACCOUNT')
      if (!serviceAccountJson) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT not configured')
      } else {
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson)
        const projectId = serviceAccount.project_id
        const accessToken = await getAccessToken(serviceAccount)
        console.log(`🔑 Using Firebase project: ${projectId}`)

        for (const deviceToken of tokens) {
          try {
            const platform = deviceToken.platform || 'unknown'
            const token = deviceToken.token
            const isApnsToken = token.length === 64 && /^[0-9A-Fa-f]+$/.test(token)
            
            // Se for token APNs (64 chars hexadecimais), enviar via APNs direto
            if (platform === 'ios' && isApnsToken) {
              console.log(`📤 Sending to iOS device (member ${deviceToken.member_id}) via APNs...`)
              const bundleId = deviceToken.bundle_id || 'com.igreja.member'
              const response = await sendAPNsNotification(
                token,
                notificationTitle,
                notificationBody,
                dataPayload,
                bundleId
              )
              
              if (response.ok) {
                console.log(`✅ Sent successfully to iOS device (member ${deviceToken.member_id})`)
                sentCount++
              } else {
                const errorText = await response.text()
                console.error(`❌ Failed to send to iOS (member ${deviceToken.member_id}):`, response.status, errorText)
                
                if (response.status === 400 || response.status === 410) {
                  console.log(`🗑️  Removing invalid APNs token for member ${deviceToken.member_id}`)
                  await supabaseClient.from('device_tokens').delete().eq('id', deviceToken.id)
                }
              }
              continue
            }
            
            // Para tokens FCM (iOS e Android), enviar via FCM
            const fcmDataPayload: Record<string, string> = {}
            for (const [key, value] of Object.entries(dataPayload)) {
              fcmDataPayload[key] = typeof value === 'string' ? value : JSON.stringify(value)
            }
            
            const message: any = {
              message: {
                token: deviceToken.token,
                notification: { title: notificationTitle, body: notificationBody },
                data: fcmDataPayload
              }
            }

            // Configuração específica por plataforma
            if (platform === 'android') {
              message.message.android = {
                priority: 'high',
                notification: { sound: 'default' }
              }
            } else if (platform === 'ios') {
              message.message.apns = {
                payload: {
                  aps: {
                    sound: 'default',
                    badge: 1
                  }
                }
              }
            }

            console.log(`📤 Sending to ${platform} device (member ${deviceToken.member_id}) via FCM...`)

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
              console.log(`✅ Sent successfully to ${platform} device (member ${deviceToken.member_id})`)
              sentCount++
            } else {
              console.error(`❌ Failed to send to ${platform} (member ${deviceToken.member_id}):`, JSON.stringify(result))
              
              if (result.error?.code === 404 || result.error?.status === 'NOT_FOUND') {
                console.log(`🗑️  Removing invalid token for member ${deviceToken.member_id}`)
                await supabaseClient.from('device_tokens').delete().eq('id', deviceToken.id)
              }
            }
          } catch (error) {
            console.error(`❌ Error sending to device ${deviceToken.id}:`, error.message)
          }
        }
      }
    }

    console.log(`\n📊 Summary: ${sentCount} notifications sent successfully out of ${tokens.length} tokens`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        total: tokens.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in send-push-notification:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
