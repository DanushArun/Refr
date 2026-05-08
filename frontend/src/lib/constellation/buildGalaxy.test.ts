// Pure-logic tests for buildGalaxy — the data layer behind the Constellation
// onboarding moment. No React, no Skia, no native deps. Tests describe behavior
// (where stars sit, which paths light up) — never internal trig formulas.

import { buildGalaxy, GalaxyInput } from './buildGalaxy';

const CENTER_X = 0.5;
const CENTER_Y = 0.5;

const distanceFromCenter = (x: number, y: number): number =>
  Math.sqrt((x - CENTER_X) ** 2 + (y - CENTER_Y) ** 2);

const baseTargets: GalaxyInput['targetCompanies'] = [
  { id: 'co_razorpay', name: 'Razorpay' },
  { id: 'co_zepto', name: 'Zepto' },
  { id: 'co_google', name: 'Google' },
  { id: 'co_flipkart', name: 'Flipkart' },
];

const baseConnections: GalaxyInput['connections'] = [
  { id: 'usr_nivrant', name: 'Nivrant Goswami', companyId: 'co_razorpay', trustScore: 92 },
  { id: 'usr_anita', name: 'Anita Desai', companyId: 'co_zepto', trustScore: 78 },
];

const buildInput = (overrides: Partial<GalaxyInput> = {}): GalaxyInput => ({
  userId: 'usr_danush',
  userName: 'Danush Arun',
  targetCompanies: baseTargets,
  connections: baseConnections,
  ...overrides,
});

describe('buildGalaxy — self node', () => {
  it('places_self_at_center_with_full_brightness', () => {
    const result = buildGalaxy(buildInput());

    expect(result.self.kind).toBe('self');
    expect(result.self.x).toBeCloseTo(0.5, 6);
    expect(result.self.y).toBeCloseTo(0.5, 6);
    expect(result.self.brightness).toBe(1.0);
    expect(result.self.radius).toBeGreaterThanOrEqual(10);
  });

  it('uses_first_name_as_self_label_when_full_name_given', () => {
    const result = buildGalaxy(buildInput({ userName: 'Danush Arun' }));

    expect(result.self.label).toBe('Danush');
  });

  it('uses_full_name_as_self_label_when_no_space_in_name', () => {
    const result = buildGalaxy(buildInput({ userName: 'Danush' }));

    expect(result.self.label).toBe('Danush');
  });
});

describe('buildGalaxy — target stars', () => {
  it('returns_one_target_node_per_input_company', () => {
    const result = buildGalaxy(buildInput());

    expect(result.targets).toHaveLength(baseTargets.length);
  });

  it('places_every_target_in_outer_ring_between_0_30_and_0_48', () => {
    const result = buildGalaxy(buildInput());

    for (const target of result.targets) {
      const distance = distanceFromCenter(target.x, target.y);
      expect(distance).toBeGreaterThanOrEqual(0.30);
      expect(distance).toBeLessThanOrEqual(0.48);
    }
  });

  it('marks_every_target_node_with_kind_target', () => {
    const result = buildGalaxy(buildInput());

    for (const target of result.targets) {
      expect(target.kind).toBe('target');
    }
  });

  it('distributes_four_targets_to_distinct_angular_positions', () => {
    const result = buildGalaxy(buildInput());

    const positions = result.targets.map(t => `${t.x.toFixed(6)},${t.y.toFixed(6)}`);
    const unique = new Set(positions);

    expect(unique.size).toBe(positions.length);
  });
});

describe('buildGalaxy — connection stars', () => {
  it('returns_one_connection_node_per_input_connection', () => {
    const result = buildGalaxy(buildInput());

    expect(result.connections).toHaveLength(baseConnections.length);
  });

  it('places_every_connection_in_mid_ring_between_0_18_and_0_30', () => {
    const result = buildGalaxy(buildInput());

    for (const connection of result.connections) {
      const distance = distanceFromCenter(connection.x, connection.y);
      expect(distance).toBeGreaterThanOrEqual(0.18);
      expect(distance).toBeLessThanOrEqual(0.30);
    }
  });

  it('marks_every_connection_node_with_kind_connection', () => {
    const result = buildGalaxy(buildInput());

    for (const connection of result.connections) {
      expect(connection.kind).toBe('connection');
    }
  });

  it('gives_higher_trust_score_higher_brightness', () => {
    const result = buildGalaxy(
      buildInput({
        connections: [
          { id: 'usr_high', name: 'High Trust', companyId: 'co_razorpay', trustScore: 90 },
          { id: 'usr_low', name: 'Low Trust', companyId: 'co_zepto', trustScore: 30 },
        ],
      }),
    );

    const high = result.connections.find(c => c.id === 'usr_high')!;
    const low = result.connections.find(c => c.id === 'usr_low')!;

    expect(high.brightness).toBeGreaterThan(low.brightness);
  });

  it('clamps_connection_brightness_into_zero_to_one_inclusive', () => {
    const result = buildGalaxy(
      buildInput({
        connections: [
          { id: 'usr_max', name: 'Maxed', companyId: 'co_razorpay', trustScore: 100 },
          { id: 'usr_min', name: 'Minned', companyId: 'co_zepto', trustScore: 0 },
        ],
      }),
    );

    for (const connection of result.connections) {
      expect(connection.brightness).toBeGreaterThan(0);
      expect(connection.brightness).toBeLessThanOrEqual(1);
    }
  });
});

describe('buildGalaxy — paths', () => {
  it('emits_one_path_per_target_company', () => {
    const result = buildGalaxy(buildInput());

    expect(result.paths).toHaveLength(baseTargets.length);
  });

  it('roots_every_path_at_self_id', () => {
    const result = buildGalaxy(buildInput());

    for (const path of result.paths) {
      expect(path.fromId).toBe(result.self.id);
    }
  });

  it('terminates_every_path_at_a_known_target_id', () => {
    const result = buildGalaxy(buildInput());

    const targetIds = new Set(result.targets.map(t => t.id));
    for (const path of result.paths) {
      expect(targetIds.has(path.toId)).toBe(true);
    }
  });

  it('activates_path_when_a_connection_works_at_that_target_company', () => {
    const result = buildGalaxy(buildInput());

    const razorpayPath = result.paths.find(p => p.toId === 'co_razorpay')!;
    expect(razorpayPath.activated).toBe(true);
  });

  it('deactivates_path_when_no_connection_works_at_that_target_company', () => {
    const result = buildGalaxy(buildInput());

    const googlePath = result.paths.find(p => p.toId === 'co_google')!;
    expect(googlePath.activated).toBe(false);
  });
});

describe('buildGalaxy — determinism and seeding', () => {
  it('produces_deeply_equal_output_when_called_twice_with_same_input', () => {
    const input = buildInput();

    const first = buildGalaxy(input);
    const second = buildGalaxy(input);

    expect(first).toEqual(second);
  });

  it('rotates_target_positions_when_only_user_id_changes', () => {
    const danushResult = buildGalaxy(buildInput({ userId: 'usr_danush' }));
    const nivrantResult = buildGalaxy(buildInput({ userId: 'usr_nivrant' }));

    const danushPositions = danushResult.targets
      .map(t => `${t.x.toFixed(6)},${t.y.toFixed(6)}`)
      .sort();
    const nivrantPositions = nivrantResult.targets
      .map(t => `${t.x.toFixed(6)},${t.y.toFixed(6)}`)
      .sort();

    expect(danushPositions).not.toEqual(nivrantPositions);
  });
});

describe('buildGalaxy — empty inputs', () => {
  it('returns_empty_arrays_without_throwing_when_no_targets_or_connections', () => {
    const result = buildGalaxy(
      buildInput({ targetCompanies: [], connections: [] }),
    );

    expect(result.self.kind).toBe('self');
    expect(result.targets).toEqual([]);
    expect(result.connections).toEqual([]);
    expect(result.paths).toEqual([]);
  });
});
