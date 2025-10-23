// Edge Function para enviar notificações push via FCM
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')

interface PushNotificationPayload {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, any>
}

serve(async (req) => {
  try {
    const { tokens, title, body, data } = await req.json() as PushNotificationPayload

    console.log('📤 Enviando notificações para', tokens.length, 'dispositivos')

    if (!FCM_SERVER_KEY) {
      console.error('❌ FCM_SERVER_KEY não configurada')
      return new Response(
        JSON.stringify({ error: 'FCM_SERVER_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Enviar notificação para cada token
    const promises = tokens.map(async (token) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FCM_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title,
              body,
              sound: 'default',
              priority: 'high',
            },
            data: data || {},
            android: {
              priority: 'high',
            },
          }),
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('❌ Erro ao enviar para token:', token.substring(0, 20) + '...', result)
          return { success: false, token, error: result }
        }

        console.log('✅ Notificação enviada:', token.substring(0, 20) + '...')
        return { success: true, token }
      } catch (error) {
        console.error('❌ Erro ao enviar notificação:', error)
        return { success: false, token, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length

    console.log(`✅ ${successCount}/${tokens.length} notificações enviadas com sucesso`)

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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
