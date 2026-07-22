# Endorsly catalogue source

This directory is the implementation authority for the replacement interface. The supplied image
package contains 98 app panels: 2 shared launch panels, 52 seeker panels, and 44 endorser panels.

`_incoming/` stores the supplied presentation composites. They are visual evidence only: almost all
contain four perspective-rendered phones and are not valid `reference.png` files. A screen becomes
eligible for pixel-level implementation only after its folder has a supplied flat, bezel-free
`reference.png` at the declared reference viewport.

Each screen folder contains `specification.md` and `screen-audit.md`. The registry maps every panel
to its source composite, phone position, route, state, and visible component inventory.

## Required source handoff

- Flat reference PNG per screen state, without device hardware, presentation background, or OS
  chrome
- Exact font files and supported weights
- Brand mark, icon family, illustrations, portraits, company images, and source usage rights
- Asset aspect-ratio and crop rules
- Motion, keyboard, loading, error, empty, and offline state specifications

Do not use screenshots, generated art, emoji, stock imagery, or substitute fonts as runtime assets.
