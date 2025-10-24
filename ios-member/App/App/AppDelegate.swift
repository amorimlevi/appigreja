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
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
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
        
        // Enviar via JavaScript bridge do Capacitor
        DispatchQueue.main.async {
            if let bridge = (self.window?.rootViewController as? CAPBridgeViewController)?.bridge {
                bridge.triggerJSEvent(eventName: "FCMTokenReceived", target: "window", data: "{\"token\": \"\(token)\"}")
                print("✅ FCM token sent to JS bridge")
            } else {
                print("❌ Bridge not found")
            }
        }
        
        // Também enviar via NotificationCenter (fallback)
        NotificationCenter.default.post(
            name: Notification.Name("FCMTokenReceived"),
            object: nil,
            userInfo: ["token": token]
        )
    }
}
