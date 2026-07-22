# Foundation source manifest

Checked: 2026-07-15

## Input package

- `design-reference/_incoming/seeker/0.png`: seeker launch export, 853 × 1844 pixels.
- `design-reference/_incoming/endorser/0.png`: endorser launch export, 853 × 1844 pixels.
- Seeker composites `1.png` through `13.png`: four perspective-rendered panels per image.
- Endorser composites `1.png` through `11.png`: four perspective-rendered panels per image.
- Total catalogue states: 98.

## Usable evidence

The source package establishes each state, copy hierarchy, visible component inventory, and broad
light-interface direction. The matching entries in `screen-registry.json` identify every source
file and panel.

## Not supplied

- Flat, bezel-free references for all 98 states
- Exact colors, spacing, radii, shadows, and typography tokens
- Font files and permitted weights
- Brand, icon, illustration, portrait, company-image, and crop assets
- Motion, keyboard, loading, empty, error, offline, pressed, and disabled specifications

## Decision

Perspective-composite slicing, dewarping, or screenshot tracing was rejected. It would manufacture
geometry and device chrome rather than implement a reliable visual specification. No screen may
be marked `ready` or visually approved until the missing source handoff is supplied.
