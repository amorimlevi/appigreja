import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper para base64url encoding
function base64url(u8: Uint8Array): string {
  let bin = ''
  for (const b of u8) bin += String.fromCharCode(b)
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// Converter assinatura para formato JOSE (ES256)
function signatureToJose(sig: ArrayBuffer): string {
  const bytes = new Uint8Array(sig)
  
  // WebCrypto no Deno retorna assinatura em formato RAW (64 bytes) para P-256
  if (bytes.length === 64) {
    console.log('Signature already in RAW format (64 bytes)')
    return base64url(bytes)
  }
  
  // Se não, tentar DER
  console.log('Converting from DER format, length:', bytes.length)
  let i = 0
  if (bytes[i++] !== 0x30) throw new Error(`Invalid DER: expected 0x30, got 0x${bytes[0].toString(16)}`)
  
  // Skip sequence length
  let seqLen = bytes[i++]
  if (seqLen & 0x80) {
    const lenBytes = seqLen & 0x7f
    seqLen = 0
    for (let j = 0; j < lenBytes; j++) {
      seqLen = (seqLen << 8) | bytes[i++]
    }
  }
  
  if (bytes[i++] !== 0x02) throw new Error(`Invalid DER (r)`)
  let rLen = bytes[i++]
  let r = bytes.slice(i, i + rLen)
  i += rLen
  
  if (bytes[i++] !== 0x02) throw new Error(`Invalid DER (s)`)
  let sLen = bytes[i++]
  let s = bytes.slice(i, i + sLen)
  
  // Remove leading zeros
  while (r.length > 32 && r[0] === 0) r = r.slice(1)
  while (s.length > 32 && s[0] === 0) s = s.slice(1)
  
  // Pad to 32 bytes
  const rPad = new Uint8Array(32)
  rPad.set(r, 32 - r.length)
  const sPad = new Uint8Array(32)
  sPad.set(s, 32 - s.length)
  
  const raw = new Uint8Array(64)
  raw.set(rPad, 0)
  raw.set(sPad, 32)
  return base64url(raw)
}

// Enviar notificação via APNs usando JWT
async function sendApnsNotification(
  deviceToken: string,
  title: string,
  body: string,
  data: any
): Promise<boolean> {
  const teamId = Deno.env.get('APNS_TEAM_ID') // Seu Team ID
  const keyId = Deno.env.get('APNS_KEY_ID') // Key ID do .p8
  const privateKeyPem = Deno.env.get('APNS_PRIVATE_KEY') // Conteúdo do .p8
  const bundleId = Deno.env.get('APNS_BUNDLE_ID') ?? 'com.igrejazoe.member' // Bundle ID do app

  if (!teamId || !keyId || !privateKeyPem) {
    throw new Error('APNs credentials not configured')
  }

  // Criar JWT para autenticação com APNs
  const header = {
    alg: "ES256",
    kid: keyId,
    typ: "JWT"
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: teamId,
    iat: now
  }

  const encoder = new TextEncoder()
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${headerBase64}.${payloadBase64}`

  // Importar chave privada (ES256 = ECDSA P-256)
  const pemKey = privateKeyPem.replace(/\\n/g, '\n')
  const pemContents = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    encoder.encode(signatureInput)
  )

  // Converter assinatura para JOSE (formato exigido por APNs)
  const signatureBase64 = signatureToJose(signature)
  const jwt = `${signatureInput}.${signatureBase64}`

  // Payload da notificação APNs
  const notification = {
    aps: {
      alert: {
        title,
        body
      },
      sound: 'default',
      badge: 1
    },
    ...data
  }

  // Sempre usar produção - funciona tanto para App Store quanto TestFlight
  // Certificados de produção da Apple funcionam em ambos os ambientes
  const apnsServer = 'https://api.push.apple.com'

  // Enviar para APNs
  const response = await fetch(
    `${apnsServer}/3/device/${deviceToken}`,
    {
      method: 'POST',
      headers: {
        'authorization': `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json'
      },
      body: JSON.stringify(notification)
    }
  )

  if (!response.ok) {
    const text = await response.text()
    let reason = text
    try {
      reason = JSON.parse(text).reason ?? text
    } catch {}
    throw new Error(`APNs error ${response.status}: ${reason}`)
  }

  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, title, body, data } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar todos os tokens de dispositivos
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('device_tokens')
      .select('*')

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError)
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found')
      return new Response(
        JSON.stringify({ success: true, message: 'No devices to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending notification to ${tokens.length} devices`)

    let sentCount = 0
    let failedCount = 0

    // Enviar para cada token
    for (const deviceToken of tokens) {
      try {
        if (deviceToken.platform === 'ios') {
          await sendApnsNotification(
            deviceToken.token,
            title,
            body,
            data
          )
          console.log(`✅ Notification sent successfully to iOS device (member ${deviceToken.member_id})`)
          sentCount++
        } else {
          // Android (FCM) - implementar depois se necessário
          console.log(`⏭️ Skipping Android device (member ${deviceToken.member_id}) - not implemented yet`)
        }
      } catch (error) {
        console.error(`❌ Failed to send to ${deviceToken.platform}:`, error)
        failedCount++
        
        // Remover tokens definitivamente inválidos
        // 400 BadDeviceToken, 410 Unregistered, ou outros erros de token inválido
        if (error.message.includes('400') || 
            error.message.includes('410') || 
            error.message.includes('BadDeviceToken') || 
            error.message.includes('Unregistered')) {
          console.log(`Removing invalid token for member ${deviceToken.member_id}`)
          await supabaseClient
            .from('device_tokens')
            .delete()
            .eq('id', deviceToken.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: tokens.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
