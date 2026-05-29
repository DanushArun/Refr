import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const STAGE_LABELS = ['MATCHED', 'SUBMITTED', 'INTERVIEW', 'HIRED'] as const;
const STAGE_COUNT = STAGE_LABELS.length;

// Matrix + wave config
// Tuned for 60-120fps across 4-7 visible cards. Coarser grid, fewer paths.
// MATRIX_PAD is 0 — the dot grid runs the full card width. Any sub-cell
// remainder is split evenly left/right via `matrixOffsetX` below so the grid
// reads as visually centered AND edge-to-edge.
const MATRIX_PAD = 0;
const BOAT_PAD = 36;
const CELL = 8;              // dot grid cell size (bigger = fewer dots)
const DOT_R = 0.95;          // dim background grid radius
const DOT_R_FUTURE = 1.7;    // future-ocean fill dot radius
const DOT_R_PAST = 2.2;      // past-ocean fill dot radius (the lit wake)
const WAVE_AMP = 30;         // peak rise above baseline
const BASELINE_FRAC = 0.5;
const WAVES_VISIBLE = 3.0;
const WAVE_PERIOD_MS = 4200;
const LABEL_SLOT_W = 84;

// Ship config
const SHIP_W = 26;
const SHIP_H = 16;

// Palette
const GOLD = '#D4A744';
const GOLD_BRIGHT = '#FFE08A';
// Future ocean — the SHADOW of the wave ahead. Lighter brass than the
// prior #B7892A so the un-traversed leg reads clearly without competing
// with the past wake.
const GOLD_FUTURE = '#CCA049';
const DIM_DOT = 'rgba(15, 17, 21, 0.10)';
const DIM_DOT_DARK = 'rgba(250, 250, 247, 0.10)';
const NAVY = '#0A1F44';
const BLACK = '#0F1115';
const BLACK_38 = 'rgba(15, 17, 21, 0.38)';
const BLACK_55 = 'rgba(15, 17, 21, 0.55)';
const TEXT_DARK = '#FAFAF7';
const TEXT_DARK_38 = 'rgba(250, 250, 247, 0.38)';
const TEXT_DARK_55 = 'rgba(250, 250, 247, 0.55)';

interface Props {
  /** Stage index 0..STAGE_COUNT-1, or -1 for off-track. */
  current: number;
  /** The paper tone sits on cream cards; dark tone sits on glass cards. */
  tone?: 'paper' | 'dark';
  /** Pauses per-frame Skia path work while the owning screen is off-focus. */
  active?: boolean;
}

export function BoatVoyage({ current, tone = 'paper', active = true }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const isDark = tone === 'dark';

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const { w, h } = size;
  // Dot grid spans the full card width. Boat lane is inset so labels fit.
  const matrixUsable = Math.max(0, w - MATRIX_PAD * 2);
  const boatUsable = Math.max(0, w - BOAT_PAD * 2);
  const cols = Math.floor(matrixUsable / CELL);
  const rows = Math.floor(h / CELL);
  // Center the dot grid horizontally so the sub-cell remainder is split
  // evenly on both sides — gives true edge-to-edge appearance instead of a
  // visible gutter on the right when (w / CELL) isn't an integer.
  const matrixOffsetX = MATRIX_PAD + (matrixUsable - cols * CELL) / 2;
  const baseY = h * BASELINE_FRAC;
  const wavelength = Math.max(50, w / WAVES_VISIBLE);
  // Lowest possible topY = baseY - WAVE_AMP. Below that y, dots are
  // never submerged → safe to skip those rows in the per-frame loop.
  const minTopY = baseY - WAVE_AMP;
  const startRow = Math.max(0, Math.floor(minTopY / CELL));

  // ─────────── animations ───────────
  // Drive the wave phase via useFrameCallback so it ticks every animation
  // frame regardless of withRepeat scheduling — this makes every card
  // animate reliably (some cards were stuck on withRepeat-only).
  const phase = useSharedValue(0);
  const frameCallback = useFrameCallback((info) => {
    if (!active) return;
    phase.value = ((info.timeSinceFirstFrame ?? 0) / WAVE_PERIOD_MS) * Math.PI * 2;
  }, active);

  useEffect(() => {
    frameCallback.setActive(active && w > 0 && h > 0);
  }, [active, frameCallback, h, w]);

  const progress = useSharedValue(0);
  // litExtension: 0 normally (lit zone ends at the ship), 1 when reaching the
  // final stage (lit zone extends past the ship to the matrix edge so the
  // ENTIRE ocean glows on HIRED).
  const litExtension = useSharedValue(0);
  useEffect(() => {
    const t = current >= 0 && STAGE_COUNT > 1 ? current / (STAGE_COUNT - 1) : 0;
    progress.value = withSpring(t, { stiffness: 60, damping: 14, mass: 0.9 });
    const ext = current === STAGE_COUNT - 1 ? 1 : 0;
    litExtension.value = withSpring(ext, { stiffness: 60, damping: 14, mass: 0.9 });
  }, [current, progress, litExtension]);

  // ─────────── static dim grid ───────────
  const gridPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (cols === 0 || rows === 0) return p;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = matrixOffsetX + c * CELL + CELL / 2;
        const y = r * CELL + CELL / 2;
        p.addCircle(x, y, DOT_R);
      }
    }
    return p;
  }, [cols, rows, matrixOffsetX]);

  // Lit-dot paths (filled ocean)
  // The wave is the top boundary of a SOLID FILLED ocean. Every dot from
  // topY(x) downward is lit — like real water. The wave shape reads as the
  // irregular top edge against the empty "sky" above.
  //   topY(x) = baseY − WAVE_AMP · (0.5 + 0.5 · sin(kx − phase))
  //
  // Three paths:
  //   • litPastPath:    body of ocean, x ≤ shipX (the lit wake)
  //   • litFuturePath:  body of ocean, x > shipX (dimmer, ahead)
  //   • surfacePath:    topmost row of submerged dots — the bright crest

  // Right edge of the dot field — used by the lit-extension calculation so
  // the "fully hired" glow reaches the very last column.
  const matrixRight = w > 0 ? matrixOffsetX + cols * CELL : 0;

  const litPastPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    if (cols === 0 || rows === 0) return p;
    const shipX = BOAT_PAD + boatUsable * progress.value;
    const litMaxX = shipX + (matrixRight - shipX) * litExtension.value;
    const k = (Math.PI * 2) / wavelength;
    for (let c = 0; c < cols; c++) {
      const x = matrixOffsetX + c * CELL + CELL / 2;
      if (x > litMaxX) continue;
      const topY = baseY - WAVE_AMP * (0.5 + 0.5 * Math.sin(k * x - phase.value));
      for (let r = startRow; r < rows; r++) {
        const y = r * CELL + CELL / 2;
        if (y >= topY) p.addCircle(x, y, DOT_R_PAST);
      }
    }
    return p;
  }, [cols, rows, boatUsable, baseY, wavelength, startRow, matrixRight, matrixOffsetX]);

  const litFuturePath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    if (cols === 0 || rows === 0) return p;
    const shipX = BOAT_PAD + boatUsable * progress.value;
    const litMaxX = shipX + (matrixRight - shipX) * litExtension.value;
    const k = (Math.PI * 2) / wavelength;
    for (let c = 0; c < cols; c++) {
      const x = matrixOffsetX + c * CELL + CELL / 2;
      if (x <= litMaxX) continue;
      const topY = baseY - WAVE_AMP * (0.5 + 0.5 * Math.sin(k * x - phase.value));
      for (let r = startRow; r < rows; r++) {
        const y = r * CELL + CELL / 2;
        if (y >= topY) p.addCircle(x, y, DOT_R_FUTURE);
      }
    }
    return p;
  }, [cols, rows, boatUsable, baseY, wavelength, startRow, matrixRight, matrixOffsetX]);

  // ─────────── ship ───────────
  // Hull bottom locks to topY(shipX) — strictly on the surface, never above
  // or below. Tilt follows the slope of the surface at the ship's X.
  const shipStyle = useAnimatedStyle(() => {
    const x = BOAT_PAD + boatUsable * progress.value;
    const k = (Math.PI * 2) / wavelength;
    const topY = baseY - WAVE_AMP * (0.5 + 0.5 * Math.sin(k * x - phase.value));
    const slope = -WAVE_AMP * 0.5 * k * Math.cos(k * x - phase.value);
    const tiltDeg = (Math.atan(slope) * 180) / Math.PI;
    return {
      transform: [
        { translateX: x - SHIP_W / 2 },
        { translateY: topY - SHIP_H }, // hull bottom EXACTLY on the surface
        { rotate: `${tiltDeg}deg` },
      ],
    };
  });

  const showShip = current >= 0 && w > 0;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.labelRow}>
        {w > 0 &&
          STAGE_LABELS.map((label, i) => {
            const done = current >= 0 && i < current;
            const active = i === current;
            const stageX = BOAT_PAD + boatUsable * (i / (STAGE_COUNT - 1));
            return (
              <View
                key={label}
                style={[
                  styles.labelSlot,
                  { left: stageX - LABEL_SLOT_W / 2 },
                ]}
              >
                <Text
                  style={[
                    styles.stageLabel,
                    isDark && styles.stageLabelDark,
                    active &&
                      (isDark ? styles.stageLabelActiveDark : styles.stageLabelActive),
                    !active &&
                      !done &&
                      (isDark ? styles.stageLabelPendingDark : styles.stageLabelPending),
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            );
          })}
      </View>

      <View style={styles.trackZone}>
        {w > 0 && cols > 0 && (
          <Canvas style={StyleSheet.absoluteFillObject}>
            {/* dim background grid (sky / above water) */}
            <Path path={gridPath} color={isDark ? DIM_DOT_DARK : DIM_DOT} />

            {/* future ocean — the SHADOW of the wave ahead. Sharp brown
                dots, no glow, low opacity so the un-traversed leg reads as
                a faded silhouette of where the wave is going, not as a
                second active wave. The gold body behind the ship is the
                real progress wave; this is its echo. */}
            <Path path={litFuturePath} color={GOLD_FUTURE} opacity={0.45} />

            {/* past ocean — sharp bright gold dots, no glow anywhere. */}
            <Path path={litPastPath} color={GOLD_BRIGHT} />
          </Canvas>
        )}

        {showShip && (
          <Animated.View style={[styles.shipBox, shipStyle]} pointerEvents="none">
            <Yacht tone={tone} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Yacht({ tone }: { tone: NonNullable<Props['tone']> }) {
  const hullColor = tone === 'dark' ? TEXT_DARK : NAVY;
  const hullCabin = useMemo(() => {
    const p = Skia.Path.Make();
    // Iconic yacht silhouette in 26 × 16, hull bottom at y=16.
    p.moveTo(0, 11);
    p.lineTo(26, 11);
    p.lineTo(22, 16);
    p.lineTo(3, 16);
    p.close();
    p.moveTo(3, 11);
    p.lineTo(6, 7);
    p.lineTo(18, 7);
    p.lineTo(22, 11);
    p.close();
    p.moveTo(8, 7);
    p.lineTo(9, 3);
    p.lineTo(14, 3);
    p.lineTo(15, 7);
    p.close();
    return p;
  }, []);

  const mast = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(11.5, 3);
    p.lineTo(11.5, 0);
    return p;
  }, []);

  return (
    <Canvas style={styles.yachtCanvas}>
      <Path path={hullCabin} color={hullColor} />
      <Path path={mast} color={hullColor} style="stroke" strokeWidth={1} strokeCap="round" />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  labelRow: {
    height: 18,
    position: 'relative',
    marginBottom: 2,
  },
  labelSlot: {
    position: 'absolute',
    top: 0,
    width: LABEL_SLOT_W,
    alignItems: 'center',
  },
  stageLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 9.5,
    letterSpacing: 1.1,
    color: BLACK_55,
    textAlign: 'center',
  },
  stageLabelActive: {
    fontFamily: 'Outfit-Bold',
    color: BLACK,
  },
  stageLabelPending: {
    color: BLACK_38,
  },
  stageLabelDark: {
    color: TEXT_DARK_55,
  },
  stageLabelActiveDark: {
    fontFamily: 'Outfit-Bold',
    color: TEXT_DARK,
  },
  stageLabelPendingDark: {
    color: TEXT_DARK_38,
  },
  trackZone: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  shipBox: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SHIP_W,
    height: SHIP_H,
  },
  yachtCanvas: {
    width: SHIP_W,
    height: SHIP_H,
  },
});
