// Pure-logic data layer for the Constellation onboarding moment.
// No React, no Skia, no native deps. Deterministic — same input, same output.

export interface GalaxyInput {
  userId: string;
  userName: string;
  targetCompanies: { id: string; name: string }[];
  connections: { id: string; name: string; companyId: string; trustScore: number }[];
}

export interface StarNode {
  id: string;
  kind: 'self' | 'target' | 'connection';
  x: number;
  y: number;
  radius: number;
  brightness: number;
  label: string;
}

export interface PathEdge {
  fromId: string;
  toId: string;
  activated: boolean;
}

export interface GalaxyData {
  self: StarNode;
  targets: StarNode[];
  connections: StarNode[];
  paths: PathEdge[];
}

const CENTER_X = 0.5;
const CENTER_Y = 0.5;
const TARGET_RADIUS = 0.4;
const CONNECTION_RADIUS = 0.24;
const SELF_RADIUS_PX = 12;
const TARGET_RADIUS_PX = 8;
const CONNECTION_RADIUS_PX = 6;
const TWO_PI = Math.PI * 2;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Maps any string to a stable angle in [0, 2π) so the same id always lands
// at the same orbital position across renders.
function seededAngleFrom(seed: string): number {
  return (hashStr(seed) % 360) * (Math.PI / 180);
}

function firstNameOf(userName: string): string {
  const space = userName.indexOf(' ');
  return space === -1 ? userName : userName.slice(0, space);
}

function clamp01Exclusive(value: number): number {
  if (value <= 0) return Number.EPSILON;
  if (value > 1) return 1;
  return value;
}

function brightnessFromTrust(trustScore: number): number {
  return clamp01Exclusive(0.4 + (trustScore / 100) * 0.6);
}

function buildSelfNode(input: GalaxyInput): StarNode {
  return {
    id: `self:${input.userId}`,
    kind: 'self',
    x: CENTER_X,
    y: CENTER_Y,
    radius: SELF_RADIUS_PX,
    brightness: 1.0,
    label: firstNameOf(input.userName),
  };
}

function buildTargetNodes(input: GalaxyInput): StarNode[] {
  const total = input.targetCompanies.length;
  if (total === 0) return [];

  const baseAngle = seededAngleFrom(input.userId);

  return input.targetCompanies.map((company, index) => {
    const angle = baseAngle + (index / total) * TWO_PI;
    return {
      id: company.id,
      kind: 'target',
      x: CENTER_X + Math.cos(angle) * TARGET_RADIUS,
      y: CENTER_Y + Math.sin(angle) * TARGET_RADIUS,
      radius: TARGET_RADIUS_PX,
      brightness: 0.85,
      label: company.name,
    };
  });
}

function buildConnectionNodes(input: GalaxyInput): StarNode[] {
  return input.connections.map((connection) => {
    const angle = seededAngleFrom(connection.id);
    return {
      id: connection.id,
      kind: 'connection',
      x: CENTER_X + Math.cos(angle) * CONNECTION_RADIUS,
      y: CENTER_Y + Math.sin(angle) * CONNECTION_RADIUS,
      radius: CONNECTION_RADIUS_PX,
      brightness: brightnessFromTrust(connection.trustScore),
      label: connection.name,
    };
  });
}

function buildPaths(input: GalaxyInput, selfId: string): PathEdge[] {
  const activatedCompanyIds = new Set(input.connections.map((c) => c.companyId));
  return input.targetCompanies.map((company) => ({
    fromId: selfId,
    toId: company.id,
    activated: activatedCompanyIds.has(company.id),
  }));
}

export function buildGalaxy(input: GalaxyInput): GalaxyData {
  const self = buildSelfNode(input);
  return {
    self,
    targets: buildTargetNodes(input),
    connections: buildConnectionNodes(input),
    paths: buildPaths(input, self.id),
  };
}
