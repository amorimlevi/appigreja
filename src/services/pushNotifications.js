import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';

export const initializePushNotifications = async (memberId) => {
    if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only work on native platforms');
        return;
    }

    console.log('🔔 Initializing push notifications for member:', memberId);

    try {
        const platform = Capacitor.getPlatform();
        
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();
        console.log('📱 Permission status:', permStatus);
        
        if (permStatus.receive === 'prompt') {
            console.log('🔔 Requesting permissions...');
            permStatus = await PushNotifications.requestPermissions();
            console.log('📱 Permission after request:', permStatus);
        }
        
        if (permStatus.receive !== 'granted') {
            console.log('❌ Push notification permission denied');
            return;
        }

        // Setup listeners BEFORE registering
        console.log('🎧 Setting up push notification listeners...');
        
        // Para iOS, usar Firebase Messaging para obter token FCM
        if (platform === 'ios') {
            // Listener para token FCM no iOS
            await FirebaseMessaging.addListener('tokenReceived', async (event) => {
                console.log('✅ FCM Token received (iOS):', event.token);
                if (memberId) {
                    console.log('💾 Saving FCM token to Supabase...');
                    await saveDeviceToken(memberId, event.token);
                }
            });
            
            // Obter token FCM
            const { token } = await FirebaseMessaging.getToken();
            console.log('✅ FCM Token obtained (iOS):', token);
            if (memberId && token) {
                console.log('💾 Saving FCM token to Supabase...');
                await saveDeviceToken(memberId, token);
            }
        } else {
            // Para Android, usar PushNotifications normalmente
            await PushNotifications.addListener('registration', async (token) => {
                console.log('✅ Push registration success (Android)!');
                console.log('🔑 Token:', token.value);
                
                if (memberId) {
                    console.log('💾 Saving token to Supabase...');
                    await saveDeviceToken(memberId, token.value);
                }
            });
        }

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error) => {
            console.error('🔴 Registration error:', JSON.stringify(error));
        });

        // Listen for push notifications
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('📬 Push notification received:', notification);
            // Notificação recebida enquanto o app está aberto (foreground)
            // No iOS, é preciso mostrar manualmente
            if (Capacitor.getPlatform() === 'ios') {
                // Mostrar um alert ou toast
                alert(`${notification.title}\n\n${notification.body}`);
            }
        });

        // Listen for notification actions
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('👆 Push notification action performed:', notification);
            // Usuário clicou na notificação
            handleNotificationClick(notification);
        });

        console.log('✅ Registering with APNs/FCM...');
        // Register with Apple / Google (after listeners are set)
        await PushNotifications.register();

    } catch (error) {
        console.error('Error initializing push notifications:', error);
    }
};

const saveDeviceToken = async (memberId, token) => {
    try {
        const platform = Capacitor.getPlatform(); // 'ios' or 'android'
        
        // Obter Bundle ID para iOS
        let bundleId = null;
        if (platform === 'ios') {
            const { App } = await import('@capacitor/app');
            const appInfo = await App.getInfo();
            bundleId = appInfo.id;
        }
        
        console.log('📱 Platform:', platform);
        console.log('👤 Member ID:', memberId);
        console.log('🔑 Token:', token);
        console.log('📦 Bundle ID:', bundleId);
        
        // Verifica se este token específico já existe
        const { data: existingToken, error: selectError } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (selectError) {
            console.error('❌ Error checking existing token:', selectError);
            throw selectError;
        }

        if (existingToken) {
            // Token já existe - atualiza apenas o timestamp e member_id (se mudou)
            console.log('🔄 Token already exists, updating...');
            const { error: updateError } = await supabase
                .from('device_tokens')
                .update({ 
                    member_id: memberId,
                    platform,
                    bundle_id: bundleId,
                    updated_at: new Date().toISOString()
                })
                .eq('token', token);
            
            if (updateError) {
                console.error('❌ Error updating token:', updateError);
                throw updateError;
            }
            console.log('✅ Token updated successfully!');
        } else {
            // Insere novo token (permite múltiplos dispositivos por membro)
            console.log('➕ Inserting new token...');
            const { error: insertError } = await supabase
                .from('device_tokens')
                .insert({
                    member_id: memberId,
                    token,
                    platform,
                    bundle_id: bundleId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            
            if (insertError) {
                console.error('❌ Error inserting token:', insertError);
                throw insertError;
            }
            console.log('✅ New device token saved successfully!');
        }
    } catch (error) {
        console.error('❌ Error saving device token:', error);
    }
};

const handleNotificationClick = (notification) => {
    const data = notification.notification.data;
    
    // Redireciona baseado no tipo de notificação
    if (data.type === 'aviso') {
        // Navegar para a tela de avisos
        window.location.hash = '#avisos';
    } else if (data.type === 'evento') {
        // Navegar para a tela de eventos
        window.location.hash = '#eventos';
    }
};

export const removeDeviceToken = async (memberId) => {
    try {
        const platform = Capacitor.getPlatform();
        
        await supabase
            .from('device_tokens')
            .delete()
            .eq('member_id', memberId)
            .eq('platform', platform);
        
        console.log('Device token removed successfully');
    } catch (error) {
        console.error('Error removing device token:', error);
    }
};
