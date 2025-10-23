// Edge Function para enviar notificações push via Firebase Cloud Messaging API v1
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SERVICE_ACCOUNT = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

interface PushPayload {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, string>
}

// Gerar JWT para autenticação OAuth2
async function createJWT(): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT"
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  // Importar chave privada
  const privateKeyPem = SERVICE_ACCOUNT.private_key
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  )

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  )

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signatureInput}.${base64Signature}`
}

// Obter Access Token do Google OAuth2
async function getAccessToken(): Promise<string> {
  const jwt = await createJWT()
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  try {
    console.log('📬 Recebendo requisição de notificação push')
    
    const { tokens, title, body, data } = await req.json() as PushPayload

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📤 Enviando notificações para ${tokens.length} dispositivos`)

    if (!SERVICE_ACCOUNT.project_id) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT não configurado')
      return new Response(
        JSON.stringify({ error: 'Firebase service account not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obter access token
    const accessToken = await getAccessToken()
    console.log('✅ Access token obtido')

    // Enviar notificação para cada token
    const promises = tokens.map(async (token) => {
      try {
        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token,
                notification: {
                  title,
                  body,
                },
                data: data || {},
                android: {
                  priority: 'high',
                  notification: {
                    sound: 'default',
                    priority: 'high',
                  }
                },
              }
            }),
          }
        )

        const result = await response.json()
        
        if (!response.ok) {
          console.error(`❌ Erro ao enviar para ${token.substring(0, 20)}...`, result)
          return { success: false, token: token.substring(0, 20), error: result }
        }

        console.log(`✅ Enviado para ${token.substring(0, 20)}...`)
        return { success: true, token: token.substring(0, 20) }
      } catch (error) {
        console.error(`❌ Exceção ao enviar para ${token.substring(0, 20)}:`, error)
        return { success: false, token: token.substring(0, 20), error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length

    console.log(`✅ ${successCount}/${tokens.length} notificações enviadas`)

    return new Response(
      JSON.stringify({
        success: true,
        totalTokens: tokens.length,
        successCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Erro na edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
