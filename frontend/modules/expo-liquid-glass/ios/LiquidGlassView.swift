import UIKit
import ExpoModulesCore

public class LiquidGlassView: ExpoView {
  private var visualEffectView: UIVisualEffectView?
  private let tintLayer = CALayer()
  private let highlightLayer = CAGradientLayer()
  private var currentTint: String = "regular"
  private var interactiveEnabled: Bool = false
  private var tintHex: String?
  private var tintIntensity: CGFloat = 0.20

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .clear
    layer.cornerCurve = .continuous
    layer.masksToBounds = true

    // Tint overlay sits above the glass effect so a colored hue can bleed through
    layer.addSublayer(tintLayer)
    tintLayer.opacity = 0

    // Specular highlight — a thin top-down gradient that mimics a glass rim under light.
    highlightLayer.colors = [
      UIColor.white.withAlphaComponent(0.22).cgColor,
      UIColor.white.withAlphaComponent(0.0).cgColor,
    ]
    highlightLayer.locations = [0.0, 0.55]
    highlightLayer.startPoint = CGPoint(x: 0.5, y: 0)
    highlightLayer.endPoint = CGPoint(x: 0.5, y: 1)
    layer.addSublayer(highlightLayer)

    rebuildEffect()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    visualEffectView?.frame = bounds
    tintLayer.frame = bounds
    highlightLayer.frame = bounds
    tintLayer.cornerRadius = layer.cornerRadius
    highlightLayer.cornerRadius = layer.cornerRadius
  }

  func applyTint(_ value: String) {
    currentTint = value
    rebuildEffect()
  }

  func applyTintColor(_ hex: String?) {
    tintHex = hex
    refreshTintLayer()
  }

  func applyTintIntensity(_ intensity: CGFloat) {
    tintIntensity = max(0, min(1, intensity))
    refreshTintLayer()
  }

  func applyCornerRadius(_ radius: CGFloat) {
    layer.cornerRadius = radius
    tintLayer.cornerRadius = radius
    highlightLayer.cornerRadius = radius
  }

  func applyInteractive(_ interactive: Bool) {
    interactiveEnabled = interactive
    rebuildEffect()
  }

  private func refreshTintLayer() {
    guard let hex = tintHex, let color = UIColor(hex: hex) else {
      tintLayer.backgroundColor = nil
      tintLayer.opacity = 0
      return
    }
    tintLayer.backgroundColor = color.cgColor
    tintLayer.opacity = Float(tintIntensity)
  }

  private func rebuildEffect() {
    visualEffectView?.removeFromSuperview()
    if currentTint == "identity" {
      visualEffectView = nil
      return
    }

    let effect: UIVisualEffect = makeEffect()

    let v = UIVisualEffectView(effect: effect)
    v.frame = bounds
    v.translatesAutoresizingMaskIntoConstraints = true
    v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    v.layer.cornerCurve = .continuous
    v.layer.cornerRadius = layer.cornerRadius
    v.clipsToBounds = true

    // Insert the glass *below* tint + highlight layers so they read as part of
    // the glass surface rather than being blurred away.
    insertSubview(v, at: 0)
    visualEffectView = v
  }

  private func makeEffect() -> UIVisualEffect {
    if #available(iOS 26.0, *), let cls = NSClassFromString("UIGlassEffect") as? UIVisualEffect.Type {
      let effect = cls.init()
      // UIGlassEffect.isInteractive — toggles the OS-level press/scale response.
      // Set via KVC because the symbol may not be statically available at build time.
      (effect as AnyObject).setValue?(interactiveEnabled, forKey: "isInteractive")
      return effect
    }
    let style: UIBlurEffect.Style = (currentTint == "clear")
      ? .systemUltraThinMaterial
      : .systemUltraThinMaterialDark
    return UIBlurEffect(style: style)
  }
}

private extension UIColor {
  convenience init?(hex: String) {
    var s = hex.replacingOccurrences(of: "#", with: "")
    if s.count == 3 { s = s.map { "\($0)\($0)" }.joined() }
    guard s.count == 6, let v = UInt32(s, radix: 16) else { return nil }
    let r = CGFloat((v & 0xFF0000) >> 16) / 255
    let g = CGFloat((v & 0x00FF00) >> 8) / 255
    let b = CGFloat(v & 0x0000FF) / 255
    self.init(red: r, green: g, blue: b, alpha: 1)
  }
}
