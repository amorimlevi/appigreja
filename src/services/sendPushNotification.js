import { supabase } from '../lib/supabaseClient';

/**
 * Envia uma notificação push para todos os dispositivos
 * @param {string} type - Tipo da notificação (aviso, evento, etc)
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {object} data - Dados adicionais (opcional)
 * @returns {Promise<boolean>} True se enviado com sucesso
 */
export const sendPushNotification = async (type, title, body, data = {}) => {
    try {
        console.log('📤 Sending push notification:', { type, title });
        
        // 1. Inserir na fila
        const { data: notification, error: insertError } = await supabase
            .from('push_notifications_queue')
            .insert({
                type,
                title,
                body,
                data,
                sent: false
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Error inserting notification:', insertError);
            return false;
        }
        
        console.log('✅ Notification inserted:', notification.id);
        
       // 2. Chamar Edge Function para processar imediatamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2xzdHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1Njg0NiwiZXhwIjoyMDc1NTMyODQ2fQ.wyd5_VkLNe8aRhXw1lDUZLzDhsh0Kl6CJt1WBa2X7eA';

const response = await fetch(
    `${supabaseUrl}/functions/v1/send-push-notification`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error calling Edge Function:', errorText);
            return false;
        }
        
        const result = await response.json();
        console.log('✅ Push notification sent:', result);
        
        return true;
    } catch (error) {
        console.error('❌ Error sending push notification:', error);
        return false;
    }
};

/**
 * Envia notificação quando um novo aviso é criado
 */
export const notifyNewAviso = async (titulo, avisoId) => {
    return sendPushNotification(
        'aviso',
        'Novo Aviso',
        titulo,
        { aviso_id: avisoId, type: 'aviso' }
    );
};

/**
 * Envia notificação quando um novo evento é criado
 */
export const notifyNewEvent = async (nomeEvento, eventoId) => {
    return sendPushNotification(
        'evento',
        'Novo Evento',
        nomeEvento,
        { evento_id: eventoId, type: 'evento' }
    );
};
