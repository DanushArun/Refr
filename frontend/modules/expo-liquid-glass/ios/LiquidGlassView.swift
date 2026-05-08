import UIKit
import ExpoModulesCore

public class LiquidGlassView: ExpoView {
  private var visualEffectView: UIVisualEffectView?
  private let tintLayer = CALayer()
  private var currentTint: String = "regular"

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .clear
    layer.cornerCurve = .continuous
    layer.masksToBounds = true
    layer.addSublayer(tintLayer)
    tintLayer.opacity = 0
    rebuildEffect()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    visualEffectView?.frame = bounds
    tintLayer.frame = bounds
  }

  func applyTint(_ value: String) {
    currentTint = value
    rebuildEffect()
  }

  func applyTintColor(_ hex: String?) {
    guard let hex, let color = UIColor(hex: hex) else {
      tintLayer.backgroundColor = nil
      tintLayer.opacity = 0
      return
    }
    tintLayer.backgroundColor = color.cgColor
    tintLayer.opacity = 0.20
  }

  func applyCornerRadius(_ radius: CGFloat) {
    layer.cornerRadius = radius
  }

  func applyInteractive(_ interactive: Bool) {
    // iOS 26+ glass interactivity — guarded so older iOS doesn't crash
    if #available(iOS 26.0, *) {
      // Apply via KVC if exposed at runtime
      if let effect = visualEffectView?.effect {
        (effect as AnyObject).setValue?(interactive, forKey: "isInteractive")
      }
    }
  }

  private func rebuildEffect() {
    visualEffectView?.removeFromSuperview()
    if currentTint == "identity" {
      visualEffectView = nil
      return
    }

    let effect: UIVisualEffect
    if #available(iOS 26.0, *), let cls = NSClassFromString("UIGlassEffect") as? UIVisualEffect.Type {
      // iOS 26+ — real UIGlassEffect
      effect = cls.init()
    } else {
      // Fallback: ultra-thin material dark
      effect = UIBlurEffect(style: currentTint == "clear" ? .systemUltraThinMaterial : .systemUltraThinMaterialDark)
    }

    let v = UIVisualEffectView(effect: effect)
    v.frame = bounds
    v.translatesAutoresizingMaskIntoConstraints = true
    v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    insertSubview(v, at: 0)
    visualEffectView = v
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
