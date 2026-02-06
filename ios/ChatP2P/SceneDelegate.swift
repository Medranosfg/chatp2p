import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = ViewController()
        window.makeKeyAndVisible()
        window.makeSecure()           // ← aquí va la protección
        self.window = window
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Reactivar protección cuando la app se vuelve activa
        window?.makeSecure()
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Mantener protección cuando la app va a ser inactiva
        window?.makeSecure()
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Reactivar protección al volver al primer plano
        window?.makeSecure()
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Mantener protección en segundo plano
        window?.makeSecure()
    }
}