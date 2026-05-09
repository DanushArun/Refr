import ExpoModulesCore

public class LiquidGlassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiquidGlass")

    View(LiquidGlassView.self) {
      Prop("tint") { (view: LiquidGlassView, value: String) in
        view.applyTint(value)
      }
      Prop("tintColor") { (view: LiquidGlassView, value: String?) in
        view.applyTintColor(value)
      }
      Prop("tintIntensity") { (view: LiquidGlassView, value: CGFloat) in
        view.applyTintIntensity(value)
      }
      Prop("cornerRadius") { (view: LiquidGlassView, value: CGFloat) in
        view.applyCornerRadius(value)
      }
      Prop("interactive") { (view: LiquidGlassView, value: Bool) in
        view.applyInteractive(value)
      }
    }
  }
}
