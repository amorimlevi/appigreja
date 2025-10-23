# Solução Final: Push Notifications

## Situação Atual

✅ **Android:** Funcionando perfeitamente  
⚠️ **iOS:** Token inválido (precisa corrigir conforme `FIX_IOS_PUSH_TOKENS.md`)  
❌ **Trigger Automático:** Database Webhooks e pg_net não estão funcionando

## Problema dos Triggers Automáticos

Tentamos 2 métodos:
1. **Database Webhooks** - Não está disponível ou não funcionou
2. **pg_net SQL Trigger** - Falha com erro de DNS

## Solução: Chamar Edge Function do Frontend

Como os triggers automáticos não funcionam, vamos chamar a Edge Function **diretamente do frontend** quando:
- Admin cria um novo aviso
- Admin cria um novo evento
- Qualquer ação que deva gerar notificação

### Vantagens
✅ Funciona imediatamente  
✅ Não depende de infraestrutura do Supabase  
✅ Controle total sobre quando enviar  
✅ Pode adicionar lógica customizada  

### Como Implementar

#### 1. Criar helper para enviar notificações

Crie o arquivo: `src/services/sendPushNotification.js`

```javascript
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
        const { data: session } = await supabase.auth.getSession();
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g';
        
        const response = await fetch(
            'https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification',
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
            console.error('❌ Error calling Edge Function:', await response.text());
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
```

#### 2. Usar no componente de Admin

Exemplo: Quando criar um aviso

```javascript
import { notifyNewAviso } from '../services/sendPushNotification';

// Dentro do componente AdminApp.jsx
const handleCreateAviso = async (avisoData) => {
    try {
        // 1. Criar o aviso
        const { data: aviso, error } = await supabase
            .from('avisos')
            .insert(avisoData)
            .select()
            .single();
        
        if (error) throw error;
        
        // 2. Enviar notificação push
        await notifyNewAviso(aviso.titulo, aviso.id);
        
        // 3. Mostrar sucesso
        alert('Aviso criado e notificação enviada!');
    } catch (error) {
        console.error('Error:', error);
    }
};
```

#### 3. Usar no componente de Eventos

```javascript
import { notifyNewEvent } from '../services/sendPushNotification';

const handleCreateEvent = async (eventData) => {
    try {
        // 1. Criar o evento
        const { data: event, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();
        
        if (error) throw error;
        
        // 2. Enviar notificação push
        await notifyNewEvent(event.nome, event.id);
        
        // 3. Mostrar sucesso
        alert('Evento criado e notificação enviada!');
    } catch (error) {
        console.error('Error:', error);
    }
};
```

## Solução Temporária: Processar Notificações Manualmente

Se houver notificações pendentes na fila, você pode processá-las manualmente:

### Via Dashboard
1. Vá para: https://dvbdvftakl5tyhpqznmu.supabase.co/project/default/functions/send-push-notification
2. Clique em "Invoke" ou "Test"
3. Envie `{}`
4. As notificações pendentes serão processadas

### Via curl (terminal)
```bash
curl -X POST \
  "https://dvbdvftakl5tyhpqznmu.supabase.co/functions/v1/send-push-notification" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmR2ZnRha2w1dHlocHF6bm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTA5MTg2MSwiZXhwIjoyMDQ0NjY3ODYxfQ.qRyFe7CuZ9-GEuB2dWWs_kLhf8-OTjzK_xXAg2RXY3g" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Via SQL (ver pendentes)
```sql
SELECT COUNT(*) as notificacoes_pendentes 
FROM push_notifications_queue 
WHERE sent = false;
```

## Próximos Passos

1. ✅ **Implementar helper no frontend** (sendPushNotification.js)
2. ✅ **Integrar nos componentes de Admin** (avisos e eventos)
3. ⚠️ **Corrigir tokens iOS** (seguir FIX_IOS_PUSH_TOKENS.md)
4. ✅ **Testar fluxo completo**

## Resumo da Configuração Atual

| Componente | Status | Ação Necessária |
|------------|--------|-----------------|
| Edge Function `send-push-notification` | ✅ Funcionando | Nenhuma |
| Notificações Android | ✅ Funcionando | Nenhuma |
| Notificações iOS | ⚠️ Token inválido | Corrigir conforme FIX_IOS_PUSH_TOKENS.md |
| Trigger Automático | ❌ Não funciona | Usar solução frontend |
| Firebase Service Account | ✅ Configurado | Nenhuma |
| Tabela push_notifications_queue | ✅ Funcionando | Nenhuma |
| Tabela device_tokens | ✅ Funcionando | Nenhuma |
