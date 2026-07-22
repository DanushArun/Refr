---
id: shared-launch-seeker
role: shared
state: launch
sourceComposite: _incoming/seeker/0.png
sourcePanel: 1
referenceStatus: source-export-required
referenceViewport: 390x844
visualThreshold: pending-first-approved-flat-reference
fixture: deterministic-local
---

# Screen: Launch — seeker

## Route
/

## Purpose
Implement the visible catalogue state with no unapproved visual additions.

## Layout
- Flat bezel-free export required before geometry approval.
- Respect device safe areas and fixed navigation/action positions.

## Typography
- Use supplied catalogue font files and weights only.
- Do not synthesize bold or substitute a typeface.

## Components
- LaunchArtwork
- BrandWordmark
- PrimaryButton

## Interactions
- Implement only states visible in the source or approved product rules.
- Keep targets at least 44pt on iOS and 48dp on Android.

## Motion
- Source motion notes required. Respect reduced-motion preferences.

## Responsive behaviour
- Canonical comparison canvas: 390 × 844 logical points.
- Verify 360, 375, 393, and 430 widths for no clipping or overlap.

## Acceptance criteria
- Use supplied assets only; no emoji, generic artwork, or default controls.
- Begin screenshot comparison only after a flat `reference.png` is supplied.
- Resolve all P0 and P1 issues before P2 polish.
