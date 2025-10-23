# Correção: iOS Push Tokens

## Problema
O app iOS está salvando tokens APNs nativos em vez de tokens FCM, causando erro:
`"The registration token is not a valid FCM registration token"`

## Solução
Atualizar o AppDelegate.swift para obter o FCM token do Firebase Messaging.

## Passos

### 1. Atualizar AppDelegate.swift

Substitua o conteúdo do arquivo:
`ios-member/App/App/AppDelegate.swift`

```swift
import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool { 
        // Initialize Firebase
        FirebaseApp.configure()
        
        // Set Firebase Messaging delegate
        Messaging.messaging().delegate = self
        
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused while the application was inactive
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Push Notifications (APNs)
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("📱 APNs token received")
        
        // Pass the APNs token to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Pass APNs token to Firebase Messaging (required for FCM to work)
        Messaging.messaging().apnsToken = deviceToken
        
        // Request FCM token (will be delivered via messaging:didReceiveRegistrationToken)
        Messaging.messaging().token { token, error in
            if let error = error {
                print("❌ Error fetching FCM token: \(error)")
            } else if let token = token {
                print("🔑 FCM Token: \(token)")
                // Send FCM token to JavaScript layer
                self.sendFCMTokenToCapacitor(token)
            }
        }
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
    
    // MARK: - Firebase Messaging Delegate
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("🔑 Firebase registration token: \(String(describing: fcmToken))")
        
        if let token = fcmToken {
            // Send FCM token to JavaScript layer
            sendFCMTokenToCapacitor(token)
        }
    }
    
    // Send FCM token to Capacitor/JavaScript
    private func sendFCMTokenToCapacitor(_ token: String) {
        print("📤 Sending FCM token to Capacitor: \(token)")
        
        // Create a custom notification with FCM token
        NotificationCenter.default.post(
            name: Notification.Name("FCMTokenReceived"),
            object: nil,
            userInfo: ["token": token]
        )
    }
}
```

### 2. Atualizar pushNotifications.js

Adicione listener para o token FCM do Firebase:

No arquivo `src/services/pushNotifications.js`, **após a linha 64** (depois de `await PushNotifications.register();`), adicione:

```javascript
        // Para iOS: também escutar o token FCM do Firebase
        if (platform === 'ios') {
            console.log('📱 iOS detected - setting up FCM token listener');
            
            // Escutar o token FCM do Firebase (enviado pelo AppDelegate)
            window.addEventListener('FCMTokenReceived', (event) => {
                const fcmToken = event.detail?.token || event.token;
                if (fcmToken && memberId) {
                    console.log('🔑 FCM Token received from Firebase:', fcmToken);
                    console.log('💾 Saving FCM token to Supabase...');
                    saveDeviceToken(memberId, fcmToken);
                }
            });
        }
```

### 3. Recompilar o app iOS

```bash
# No terminal
cd ios-member/App
pod install
```

Depois abra no Xcode e faça um novo build.

### 4. Testar

1. Desinstale o app iOS do dispositivo
2. Instale a nova versão
3. Faça login
4. Verifique os logs no Xcode - deve mostrar:
   - `📱 APNs token received`
   - `🔑 FCM Token: ...` (token diferente, mais longo)
   - `📤 Sending FCM token to Capacitor`
5. Verifique no banco se o token foi salvo corretamente
6. Teste enviar notificação via Dashboard

## Verificar se funcionou

Execute no SQL Editor:

```sql
SELECT 
    id,
    member_id,
    platform,
    LENGTH(token) as token_length,
    LEFT(token, 50) as token_preview,
    created_at
FROM device_tokens
WHERE platform = 'ios'
ORDER BY created_at DESC;
```

**Token válido FCM para iOS geralmente tem ~152+ caracteres.**
**Token APNs nativo tem ~64 caracteres (hexadecimal).**
