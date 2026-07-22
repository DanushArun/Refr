---
id: endorser-01-verify-checking
role: endorser
state: verify-checking
sourceComposite: _incoming/endorser/1.png
sourcePanel: 3
referenceStatus: source-export-required
referenceViewport: 390x844
visualThreshold: pending-first-approved-flat-reference
fixture: deterministic-local
---

# Screen: Verifying work identity

## Route
/endorser-onboarding/work?state=checking

## Purpose
Implement the visible catalogue state with no unapproved visual additions.

## Layout
- Flat bezel-free export required before geometry approval.
- Respect device safe areas and fixed navigation/action positions.

## Typography
- Use supplied catalogue font files and weights only.
- Do not synthesize bold or substitute a typeface.

## Components
- AppHeader
- VerificationTimeline
- PrivacyCard

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
