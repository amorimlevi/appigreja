import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    let sentCount = 0
    const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')

    if (!FCM_SERVER_KEY) {
      console.error('FCM_SERVER_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'FCM_SERVER_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

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
        // Marcar como enviada mesmo sem tokens
        await supabaseClient
          .from('push_notifications_queue')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', notification.id)
        continue
      }

      console.log(`Sending notification to ${tokens.length} devices`)

      // Enviar para cada token
      for (const deviceToken of tokens) {
        try {
          const payload = {
            to: deviceToken.token,
            notification: {
              title: notification.title,
              body: notification.body,
              sound: 'default',
              badge: 1,
            },
            data: notification.data || {},
            priority: 'high',
            content_available: true,
          }

          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${FCM_SERVER_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })

          const result = await response.json()
          
          if (response.ok) {
            console.log(`Notification sent successfully to ${deviceToken.platform} device`)
            sentCount++
          } else {
            console.error(`Failed to send to ${deviceToken.platform}:`, result)
            
            // Se o token é inválido, remover da base
            if (result.error === 'InvalidRegistration' || result.error === 'NotRegistered') {
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
      const { error: updateError } = await supabaseClient
        .from('push_notifications_queue')
        .update({ 
          sent: true, 
          sent_at: new Date().toISOString() 
        })
        .eq('id', notification.id)

      if (updateError) {
        console.error('Error updating notification status:', updateError)
      }
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
