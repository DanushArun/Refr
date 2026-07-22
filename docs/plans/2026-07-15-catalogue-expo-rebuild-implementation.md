# Catalogue-Driven Expo Rebuild Implementation Plan

> **For Codex:** Implement one task at a time. For behavior changes, write a failing test,
> observe the failure, make the smallest implementation change, and rerun the focused test.

**Goal:** Replace the expired visual system with the supplied catalogue through an Expo-native,
screen-by-screen implementation and independent screenshot-review loop.

**Architecture:** `design-reference/` is the source-of-truth registry and per-panel contract.
`frontend/src/design-system/` supplies the only tokens and primitives new catalogue screens may
use. Existing navigation and data behavior is retained only behind the new visual composition.

**Tech stack:** Expo 54, React Native 0.81, Expo Router, TypeScript, Jest, native iOS Simulator,
and deterministic local fixtures.

---

## Task 1: Establish a trustworthy baseline

**Files:** Existing TypeScript fixtures and API mock mappers only.

1. Run `npm run typecheck` and `npm test -- --runInBand` from `frontend/`.
2. Fix each missing required fixture field with the actual company name associated with the
   referral; do not weaken shared types.
3. Rerun the focused test, then the full baseline.

## Task 2: Normalize the catalogue

**Files:** `design-reference/00-foundation/`, `design-reference/screen-registry.json`, and one
folder per source panel.

1. Record the supplied source image dimensions and panel mapping.
2. Create a `reference.png` and `specification.md` contract for every flat source export.
3. Preserve the current presentation composites only as inbound evidence. Do not use device-frame
   crops as runtime assets or pixel-diff references.
4. Mark missing fonts, flat exports, icons, illustrations, and undefined states as source gates.

## Task 3: Build the design-system seam

**Files:** `frontend/src/design-system/tokens/`, `frontend/src/design-system/primitives/`, and
`frontend/src/design-system/components/`.

1. Write a failing pure-token/component-contract test.
2. Add semantic tokens and primitives with no legacy-theme imports.
3. Add only components demonstrated by the approved foundation references.
4. Verify strict TypeScript and focused tests.

## Task 4: Add deterministic visual scenarios and screenshot tooling

**Files:** `frontend/src/catalogue/`, `frontend/scripts/catalogue/`, test configuration, and
`artifacts/` ignore rules.

1. Test fixture reset, frozen time, route selection, and asset/font readiness before UI code.
2. Implement the development-only scenario contract using local assets and stable IDs.
3. Add native iOS capture, overlay/diff generation, and P0/P1/P2 report templates.
4. Never approve a screen without native inspection and a separately authored QA report.

## Task 5: Deliver the seeker golden slice

**Files:** Thin Expo Router wrappers, focused `src/screens/catalogue/` components, and their
screen dossier/test/artifact entries.

For each screen, repeat: audit reference → static implementation → native screenshot → diff.
Then correct P0/P1 issues, implement interactions/states, and rerun visual QA. Do not start the
next screen while the current screen has unresolved P0/P1 discrepancies.

## Task 6: Scale only after the golden slice passes

Implement remaining seeker panels, then endorser panels. Preserve stable list IDs, bounded media
prefetch, reduced-motion behavior, safe-area rules, accessibility labels, and no blank route scene
regression. Add Maestro coverage after the golden journey is stable.

## Required final checks

Run `npm run catalogue:validate`, lint, `npm run typecheck`, `npm test -- --runInBand`, native
iOS screenshot comparison, responsive checks at 360/375/390/393/430 widths, and manual tab/chat/
back-navigation verification. Report remaining discrepancies explicitly.
