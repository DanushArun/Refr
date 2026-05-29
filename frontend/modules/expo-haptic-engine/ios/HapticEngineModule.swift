import ExpoModulesCore
import CoreHaptics

public class HapticEngineModule: Module {
  private var engine: CHHapticEngine?
  private var supported: Bool {
    CHHapticEngine.capabilitiesForHardware().supportsHaptics
  }

  public func definition() -> ModuleDefinition {
    Name("HapticEngine")

    Function("isSupported") { () -> Bool in
      return self.supported
    }

    Function("play") { (pattern: String) in
      self.playBundled(name: pattern)
    }

    Function("playAhap") { (json: String) in
      self.playInlineJson(json)
    }
  }

  private func ensureEngine() throws -> CHHapticEngine {
    if let e = engine { return e }
    let e = try CHHapticEngine()
    e.resetHandler = { [weak self] in
      try? self?.engine?.start()
    }
    e.stoppedHandler = { _ in /* swallow */ }
    try e.start()
    engine = e
    return e
  }

  private func playBundled(name: String) {
    guard supported else { return }
    do {
      let bundle = Bundle(for: type(of: self))
      // Try resource bundle (CocoaPods resource_bundles wraps in .bundle)
      let resourceBundle = Bundle(url: bundle.url(forResource: "ExpoHapticEngine", withExtension: "bundle") ?? bundle.bundleURL)
      guard let url = (resourceBundle ?? bundle).url(forResource: name, withExtension: "ahap") else { return }
      let pattern = try CHHapticPattern(contentsOf: url)
      let engine = try ensureEngine()
      let player = try engine.makePlayer(with: pattern)
      try player.start(atTime: 0)
    } catch {
      // silent fail — haptics should never crash
    }
  }

  private func playInlineJson(_ json: String) {
    guard supported, let data = json.data(using: .utf8) else { return }
    do {
      let dict = try JSONSerialization.jsonObject(with: data, options: []) as? [CHHapticPattern.Key.RawValue: Any] ?? [:]
      // Convert string keys to CHHapticPattern.Key
      let pattern = try CHHapticPattern(dictionary: dict.reduce(into: [CHHapticPattern.Key: Any]()) { acc, kv in
        if let key = CHHapticPattern.Key(rawValue: kv.key) {
          acc[key] = kv.value
        }
      })
      let engine = try ensureEngine()
      let player = try engine.makePlayer(with: pattern)
      try player.start(atTime: 0)
    } catch {
      // silent fail
    }
  }
}
