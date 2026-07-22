# Flat reference export requirements

Export one `reference.png` into every screen directory named in `screen-registry.json`.

- 390 × 844 logical-point canvas at a consistent pixel density
- No phone bezel, reflection, external presentation background, or perspective transform
- Include the intended status-bar and bottom-safe-area treatment
- One exact static state per file; separate loading, empty, error, keyboard, sheet, and confirmation
  states into separate screen directories or explicitly named state references
- Provide matching real assets and font files in `assets/`, plus crop and licensing rules
- Supply exact color, spacing, radius, shadow, typography, icon, and motion tokens in
  `00-foundation/`

Mark a registry entry `ready` only after its flat export, specification, audit, assets, and font
requirements have been checked. Then `npm run catalogue:validate` must exit successfully.
