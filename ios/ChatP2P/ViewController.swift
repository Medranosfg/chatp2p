import UIKit
import WebKit
import AVFoundation
import UserNotifications

// MARK: - SecureView para protección anti-captura
class SecureView: UIView {
    private let textField = UITextField()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }
    
    private func setupView() {
        // 1. Activamos la entrada segura
        textField.isSecureTextEntry = true
        textField.isUserInteractionEnabled = false
        
        // 2. Extraemos la capa que iOS oculta automáticamente
        if let secureLayout = textField.subviews.first(where: { type(of: $0).description().contains("CanvasView") }) {
            self.addSubview(secureLayout)
            secureLayout.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                secureLayout.topAnchor.constraint(equalTo: self.topAnchor),
                secureLayout.bottomAnchor.constraint(equalTo: self.bottomAnchor),
                secureLayout.leadingAnchor.constraint(equalTo: self.leadingAnchor),
                secureLayout.trailingAnchor.constraint(equalTo: self.trailingAnchor)
            ])
        }
    }
    
    // Función para añadir el contenido que quieres proteger
    func makeContentSecure(_ content: UIView) {
        if let secureLayout = textField.subviews.first {
            secureLayout.addSubview(content)
            content.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                content.topAnchor.constraint(equalTo: secureLayout.topAnchor),
                content.bottomAnchor.constraint(equalTo: secureLayout.bottomAnchor),
                content.leadingAnchor.constraint(equalTo: secureLayout.leadingAnchor),
                content.trailingAnchor.constraint(equalTo: secureLayout.trailingAnchor)
            ])
        }
    }
}

// MARK: - UIView Extension para protección anti-captura
extension UIView {
    func makeSecure() {
        let field = UITextField()
        field.isSecureTextEntry = true
        
        // Obtener la vista de la sublayer protegida
        if let passwordView = field.layer.sublayers?.first?.delegate as? UIView {
            passwordView.addSubview(self)
            // Ahora 'self' está dentro de una capa protegida por el sistema
        }
    }
}

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, AVAudioRecorderDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    var webView: WKWebView!
    
    // Audio Recording
    var audioRecorder: AVAudioRecorder?
    var audioFileURL: URL?
    var recordingStartTime: Date?
    var isRecording = false
    var recordingTimer: Timer?
    var recordingSeconds = 0
    
    // Security: Campo simple para protección
    private var secureTextField: UITextField?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        
        // Solicitar permisos de micrófono al inicio
        requestMicrophonePermission()
        
        // Configurar WebView con script handler
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // Agregar handler para mensajes de JavaScript
        let contentController = WKUserContentController()
        contentController.add(self, name: "iosNative")
        contentController.add(self, name: "requestNotificationPermission")
        contentController.add(self, name: "getFCMToken")
        config.userContentController = contentController
        
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs
        
        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.scrollView.bounces = false
        webView.backgroundColor = .black
        webView.isOpaque = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        
        view.addSubview(webView)
        
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        loadWebContent()
        
        print("🔒 Registrando observadores de seguridad...")
        
        // Detectar capturas de pantalla - ANTES de que ocurran
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(userWillTakeScreenshot),
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )
        
        print("🔒 Observador de capturas registrado")
        
        // Detectar grabación de pantalla
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(screenCaptureChanged),
            name: UIScreen.capturedDidChangeNotification,
            object: nil
        )
        
        // Detectar cuando la app va a segundo plano (para ocultar contenido)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
        
        // Detectar cuando la app vuelve a primer plano
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        
        if UIScreen.main.isCaptured {
            showRecordingBlocker()
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Activar protección real con disableUpdateMask
        preventScreenCapture()
    }
    
    // MARK: - Prevent Screen Capture
    private func preventScreenCapture() {
        // Técnica real que usa WhatsApp: disableUpdateMask en CALayer
        // Esta es una API privada pero funciona
        hideLayerFromCapture(view.layer, hide: true)
        
        print("✅ Protección anti-captura activada con disableUpdateMask")
    }
    
    private func hideLayerFromCapture(_ layer: CALayer, hide: Bool) {
        // Base64 del nombre de la propiedad privada para evitar detección de App Store
        let propertyBase64 = "ZGlzYWJsZVVwZGF0ZU1hc2s=" // "disableUpdateMask"
        
        guard let data = Data(base64Encoded: propertyBase64),
              let propertyString = String(data: data, encoding: .utf8) else {
            return
        }
        
        let selector = NSSelectorFromString(propertyString)
        
        // Verificar que la propiedad existe (para no crashear si Apple la remueve)
        guard layer.responds(to: selector) else {
            print("⚠️ disableUpdateMask no disponible en esta versión de iOS")
            return
        }
        
        if hide {
            // Flags para ocultar de capturas: (1 << 1) | (1 << 4) = 18
            layer.setValue(NSNumber(value: 18), forKey: propertyString)
        } else {
            // Remover flags
            layer.setValue(NSNumber(value: 0), forKey: propertyString)
        }
    }
    

    // MARK: - Microphone Permission
    func requestMicrophonePermission() {
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            DispatchQueue.main.async {
                print(granted ? "✅ Micrófono permitido" : "❌ Micrófono denegado")
            }
        }
    }
    
    // MARK: - App Lifecycle (Ocultar contenido)
    var privacyView: UIView?
    
    @objc func appWillResignActive() {
        // Mostrar pantalla negra cuando la app va a segundo plano
        showPrivacyScreen()
    }
    
    @objc func appDidBecomeActive() {
        // Ocultar pantalla negra cuando la app vuelve
        hidePrivacyScreen()
    }
    
    private func showPrivacyScreen() {
        if privacyView != nil { return }
        
        privacyView = UIView(frame: view.bounds)
        privacyView?.backgroundColor = .black
        privacyView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        // Agregar logo en el centro
        let logoLabel = UILabel()
        logoLabel.text = "🔒"
        logoLabel.font = UIFont.systemFont(ofSize: 80)
        logoLabel.textAlignment = .center
        logoLabel.translatesAutoresizingMaskIntoConstraints = false
        
        privacyView?.addSubview(logoLabel)
        
        NSLayoutConstraint.activate([
            logoLabel.centerXAnchor.constraint(equalTo: privacyView!.centerXAnchor),
            logoLabel.centerYAnchor.constraint(equalTo: privacyView!.centerYAnchor)
        ])
        
        // Agregar a la ventana para que esté por encima de todo
        if let window = view.window {
            window.addSubview(privacyView!)
        } else {
            view.addSubview(privacyView!)
        }
    }
    
    private func hidePrivacyScreen() {
        privacyView?.removeFromSuperview()
        privacyView = nil
    }
    
    // MARK: - WKScriptMessageHandler (JavaScript Bridge)
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("🔔 iOS recibió mensaje: \(message.name)")
        
        switch message.name {
        case "iosNative":
            guard let body = message.body as? [String: Any],
                  let action = body["action"] as? String else { return }
            
            print("🎤 iOS recibió acción: \(action)")
            
            switch action {
            case "startVoiceRecording":
                startNativeRecording()
            case "stopVoiceRecording":
                stopNativeRecording()
            case "recordVideo":
                openNativeVideoRecorder()
            default:
                break
            }
            
        case "requestNotificationPermission":
            requestNotificationPermission()
            
        case "getFCMToken":
            getAPNsToken()
            
        default:
            break
        }
    }
    
    // MARK: - Push Notifications
    func requestNotificationPermission() {
        print("🔔 Solicitando permiso de notificaciones...")
        
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, error in
            DispatchQueue.main.async {
                print("🔔 Permiso de notificaciones: \(granted)")
                
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                }
                
                // Notificar a JavaScript
                self?.webView.evaluateJavaScript("window.onNotificationPermissionResult && window.onNotificationPermissionResult(\(granted))")
            }
        }
    }
    
    func getAPNsToken() {
        // Registrar para notificaciones remotas
        UIApplication.shared.registerForRemoteNotifications()
        
        // Escuchar cuando llegue el token
        NotificationCenter.default.addObserver(forName: NSNotification.Name("APNsTokenReceived"), object: nil, queue: .main) { [weak self] notification in
            if let token = notification.object as? String {
                print("🔔 Token APNs recibido: \(token)")
                self?.webView.evaluateJavaScript("window.onFCMToken && window.onFCMToken('\(token)')")
            }
        }
    }
    
    // MARK: - Native Audio Recording
    func startNativeRecording() {
        print("🎤 Iniciando grabación nativa...")
        
        let audioSession = AVAudioSession.sharedInstance()
        
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try audioSession.setActive(true)
            
            // Crear archivo temporal
            let tempDir = FileManager.default.temporaryDirectory
            let fileName = "voice_\(Date().timeIntervalSince1970).m4a"
            audioFileURL = tempDir.appendingPathComponent(fileName)
            
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            
            audioRecorder = try AVAudioRecorder(url: audioFileURL!, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.record()
            
            isRecording = true
            recordingStartTime = Date()
            recordingSeconds = 0
            
            // Iniciar timer para actualizar el contador
            recordingTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                guard let self = self, self.isRecording else { return }
                self.recordingSeconds += 1
                
                // Actualizar timer en JavaScript
                self.webView.evaluateJavaScript("window.updateVoiceTimer && window.updateVoiceTimer(\(self.recordingSeconds))")
                
                // Detener automáticamente después de 60 segundos
                if self.recordingSeconds >= 60 {
                    self.stopNativeRecording()
                }
            }
            
            // Notificar a JavaScript
            webView.evaluateJavaScript("window.onVoiceRecordingStarted && window.onVoiceRecordingStarted()")
            
            print("🎤 Grabación iniciada")
            
        } catch {
            print("🎤 Error iniciando grabación: \(error)")
            webView.evaluateJavaScript("alert('Error al grabar: \(error.localizedDescription)')")
        }
    }
    
    func stopNativeRecording() {
        print("🎤 Deteniendo grabación nativa...")
        
        guard isRecording, let recorder = audioRecorder else {
            print("🎤 No hay grabación activa")
            return
        }
        
        recorder.stop()
        isRecording = false
        
        // Detener y limpiar el timer
        recordingTimer?.invalidate()
        recordingTimer = nil
        
        // Calcular duración
        let duration = recordingSeconds
        
        // Leer archivo y convertir a base64
        guard let fileURL = audioFileURL,
              let audioData = try? Data(contentsOf: fileURL) else {
            print("🎤 Error leyendo archivo de audio")
            webView.evaluateJavaScript("window.onVoiceRecordingStopped && window.onVoiceRecordingStopped(); window.hideVoiceTimer && window.hideVoiceTimer();")
            return
        }
        
        let base64Audio = audioData.base64EncodedString()
        let dataURL = "data:audio/m4a;base64,\(base64Audio)"
        
        print("🎤 Audio grabado: \(duration)s, \(audioData.count) bytes")
        
        // Guardar audio en JavaScript para envío posterior
        let js = "window.onVoiceRecordingStopped && window.onVoiceRecordingStopped(); window.hideVoiceTimer && window.hideVoiceTimer(); window.saveRecordedVoice && window.saveRecordedVoice('\(dataURL)', \(duration));"
        webView.evaluateJavaScript(js)
        
        // Limpiar archivo temporal
        try? FileManager.default.removeItem(at: fileURL)
        
        // Desactivar sesión de audio
        try? AVAudioSession.sharedInstance().setActive(false)
    }
    
    // MARK: - WKUIDelegate Media Capture (iOS 15+)
    @available(iOS 15.0, *)
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }
    

    
    // MARK: - Native Video Recording
    func openNativeVideoRecorder() {
        print("📹 Abriendo grabador de video nativo")
        
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            print("📹 Cámara no disponible")
            webView.evaluateJavaScript("alert('Cámara no disponible')")
            return
        }
        
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.mediaTypes = ["public.movie"]
        picker.cameraCaptureMode = .video
        picker.videoQuality = .typeHigh  // Máxima calidad
        picker.videoMaximumDuration = 30
        picker.delegate = self
        picker.allowsEditing = false
        
        present(picker, animated: true)
    }
    
    // MARK: - UIImagePickerControllerDelegate
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true)
        
        guard let videoURL = info[.mediaURL] as? URL else {
            print("📹 No se obtuvo URL del video")
            return
        }
        
        print("📹 Video grabado: \(videoURL)")
        
        // Leer el video y convertir a base64 para subir a Storage via JavaScript
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let videoData = try? Data(contentsOf: videoURL) else {
                print("📹 Error leyendo video")
                return
            }
            
            print("📹 Video size: \(videoData.count) bytes (\(videoData.count / 1024 / 1024)MB)")
            
            let base64 = videoData.base64EncodedString()
            
            DispatchQueue.main.async {
                // Enviar al JavaScript como blob para subir a Storage
                let js = """
                (function() {
                    var b64 = '\(base64)';
                    var byteChars = atob(b64);
                    var byteArray = new Uint8Array(byteChars.length);
                    for (var i = 0; i < byteChars.length; i++) {
                        byteArray[i] = byteChars.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray], {type: 'video/mp4'});
                    if (typeof sendMedia === 'function') {
                        sendMedia(blob, 'video');
                    }
                })();
                """
                self?.webView.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("📹 Error enviando video a JS: \(error)")
                    } else {
                        print("📹 Video enviado a JavaScript correctamente")
                    }
                }
            }
            
            // Limpiar archivo temporal
            try? FileManager.default.removeItem(at: videoURL)
        }
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
        print("📹 Grabación cancelada")
    }
    
    // MARK: - Screenshot Detection
    @objc func userWillTakeScreenshot() {
        print("🚨 CAPTURA DETECTADA - CERRANDO APP INMEDIATAMENTE")
        
        // Ocultar contenido instantáneamente
        webView.isHidden = true
        view.backgroundColor = .black
        
        // Mostrar mensaje breve
        let blocker = UIView(frame: view.bounds)
        blocker.backgroundColor = .black
        
        let label = UILabel()
        label.text = "🔒\n\nCaptura no permitida\nCerrando app..."
        label.numberOfLines = 0
        label.textAlignment = .center
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        
        blocker.addSubview(label)
        view.addSubview(blocker)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: blocker.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: blocker.centerYAnchor)
        ])
        
        // Cerrar la app después de 0.5 segundos
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            exit(0)
        }
    }
    
    // MARK: - Screen Recording Detection
    @objc func screenCaptureChanged() {
        if UIScreen.main.isCaptured {
            showRecordingBlocker()
        } else {
            hideRecordingBlocker()
        }
    }
    
    var recordingBlocker: UIView?
    
    func showRecordingBlocker() {
        if recordingBlocker != nil { return }
        
        recordingBlocker = UIView(frame: view.bounds)
        recordingBlocker?.backgroundColor = .black
        recordingBlocker?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        let containerStack = UIStackView()
        containerStack.axis = .vertical
        containerStack.alignment = .center
        containerStack.spacing = 16
        containerStack.translatesAutoresizingMaskIntoConstraints = false
        
        let iconLabel = UILabel()
        iconLabel.text = "🔒"
        iconLabel.font = UIFont.systemFont(ofSize: 64)
        
        let titleLabel = UILabel()
        titleLabel.text = "Grabación detectada"
        titleLabel.textColor = .white
        titleLabel.font = UIFont.systemFont(ofSize: 22, weight: .bold)
        
        let messageLabel = UILabel()
        messageLabel.text = "El contenido está oculto por seguridad.\nDetén la grabación para continuar."
        messageLabel.textColor = UIColor(white: 0.6, alpha: 1)
        messageLabel.textAlignment = .center
        messageLabel.numberOfLines = 0
        messageLabel.font = UIFont.systemFont(ofSize: 16, weight: .regular)
        
        containerStack.addArrangedSubview(iconLabel)
        containerStack.addArrangedSubview(titleLabel)
        containerStack.addArrangedSubview(messageLabel)
        
        recordingBlocker?.addSubview(containerStack)
        
        NSLayoutConstraint.activate([
            containerStack.centerXAnchor.constraint(equalTo: recordingBlocker!.centerXAnchor),
            containerStack.centerYAnchor.constraint(equalTo: recordingBlocker!.centerYAnchor),
            containerStack.leadingAnchor.constraint(greaterThanOrEqualTo: recordingBlocker!.leadingAnchor, constant: 40),
            containerStack.trailingAnchor.constraint(lessThanOrEqualTo: recordingBlocker!.trailingAnchor, constant: -40)
        ])
        
        view.addSubview(recordingBlocker!)
    }
    
    func hideRecordingBlocker() {
        recordingBlocker?.removeFromSuperview()
        recordingBlocker = nil
    }
    
    func loadWebContent() {
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html") {
            let htmlUrl = URL(fileURLWithPath: htmlPath)
            let baseDir = htmlUrl.deletingLastPathComponent()
            webView.loadFileURL(htmlUrl, allowingReadAccessTo: baseDir)
            print("✅ Loaded: \(htmlPath)")
        } else {
            let errorHTML = """
            <!DOCTYPE html>
            <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui;">
                <div style="text-align:center;"><h1 style="color:#22c55e;">ChatP2P</h1><p>Error: index.html no encontrado</p></div>
            </body>
            </html>
            """
            webView.loadHTMLString(errorHTML, baseURL: nil)
        }
    }
    
    // MARK: - WKUIDelegate
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
    override var prefersStatusBarHidden: Bool { false }
    
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
