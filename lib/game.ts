export const materials = [
  {
    name: 'Plywood',
    tag: 'Light & affordable',
    mass: 150,
    strength: 42,
    beauty: 55,
    cost: 0,
    xp: 0,
    color: '#b87943',
  },
  {
    name: 'Mild steel',
    tag: 'Tough, but heavy',
    mass: 255,
    strength: 78,
    beauty: 43,
    cost: 120,
    xp: 0,
    color: '#758b99',
  },
  {
    name: 'Fiberglass',
    tag: 'Smooth all-rounder',
    mass: 125,
    strength: 66,
    beauty: 79,
    cost: 300,
    xp: 35,
    color: '#e6e9df',
  },
  {
    name: 'Aluminum',
    tag: 'Light alloy',
    mass: 112,
    strength: 72,
    beauty: 65,
    cost: 450,
    xp: 70,
    color: '#b8c9d3',
  },
  {
    name: 'Carbon fiber',
    tag: 'Race-bred composite',
    mass: 72,
    strength: 83,
    beauty: 88,
    cost: 800,
    xp: 140,
    color: '#33434d',
  },
  {
    name: 'Titanium',
    tag: 'Elite alloy',
    mass: 105,
    strength: 97,
    beauty: 86,
    cost: 1100,
    xp: 240,
    color: '#839ba7',
  },
  {
    name: 'Laminated bamboo',
    tag: 'Light natural laminate',
    mass: 118,
    strength: 48,
    beauty: 82,
    cost: 160,
    xp: 15,
    color: '#d2b65e',
  },
  {
    name: 'Recycled HDPE',
    tag: 'Impact-tolerant plastic',
    mass: 175,
    strength: 57,
    beauty: 52,
    cost: 210,
    xp: 25,
    color: '#638f7c',
  },
  {
    name: 'Cork-core sandwich',
    tag: 'Light composite sandwich',
    mass: 88,
    strength: 61,
    beauty: 71,
    cost: 380,
    xp: 50,
    color: '#bc9469',
  },
  {
    name: 'Basalt fiber',
    tag: 'Volcanic fiber composite',
    mass: 112,
    strength: 85,
    beauty: 75,
    cost: 620,
    xp: 100,
    color: '#69667b',
  },
  {
    name: 'Aramid composite',
    tag: 'Impact-focused laminate',
    mass: 85,
    strength: 92,
    beauty: 73,
    cost: 950,
    xp: 180,
    color: '#c3a94e',
  },
] as const;
export const engines = [
  { name: 'Harbor 25', hp: 25, cost: 0, mass: 45 },
  { name: 'Sport 60', hp: 60, cost: 240, mass: 85 },
  { name: 'Racing 100', hp: 100, cost: 550, mass: 125 },
];
export const events = [
  {
    name: 'Harbor sprint',
    description: 'Sheltered turns and short wind chop.',
    waves: 0.15,
    wind: 2,
    current: 0,
    distance: 1200,
    weights: [0.65, 0.1, 0.1, 0.15],
    target: 53,
    reward: 130,
  },
  {
    name: 'Pond dash',
    description: 'Glass-flat water. A pure acceleration test.',
    waves: 0.03,
    wind: 0.5,
    current: 0,
    distance: 600,
    weights: [0.7, 0.1, 0.1, 0.1],
    target: 53,
    reward: 100,
  },
  {
    name: 'Lake circuit',
    description: 'Open fetch, steady wind, rolling chop.',
    waves: 0.4,
    wind: 5,
    current: 0,
    distance: 2500,
    weights: [0.5, 0.1, 0.2, 0.2],
    target: 59,
    reward: 160,
  },
  {
    name: 'River run',
    description: 'A downstream run with a helpful current.',
    waves: 0.25,
    wind: 3,
    current: 1,
    distance: 3000,
    weights: [0.5, 0.1, 0.2, 0.2],
    target: 60,
    reward: 160,
  },
  {
    name: 'Fast river',
    description: 'Fast downstream water with standing waves.',
    waves: 0.7,
    wind: 4,
    current: 2.5,
    distance: 3500,
    weights: [0.35, 0.05, 0.25, 0.35],
    target: 65,
    reward: 210,
  },
  {
    name: 'Ocean challenge',
    description: 'Exposed water, headwind, and heavy seas.',
    waves: 1.2,
    wind: 10,
    current: 0,
    distance: 5000,
    weights: [0.3, 0.1, 0.3, 0.3],
    target: 63,
    reward: 230,
  },
  {
    name: 'Marina showcase',
    description: 'A judged cruise. Style meets comfort.',
    waves: 0.1,
    wind: 1,
    current: 0,
    distance: 800,
    weights: [0.1, 0.5, 0.3, 0.1],
    target: 65,
    reward: 150,
  },
] as const;
export const upgrades = [
  {
    name: 'Performance exhaust',
    description: 'Freer exhaust flow; a little more output.',
    gain: 0.04,
    mass: 1,
    reliability: -1,
    cost: 90,
    xp: 0,
  },
  {
    name: 'Cold-air intake',
    description: 'Improved breathing, with marine splash protection.',
    gain: 0.035,
    mass: 1,
    reliability: -1,
    cost: 120,
    xp: 20,
  },
  {
    name: 'Fresh spark plugs',
    description: 'A small tune-up that improves consistency.',
    gain: 0.01,
    mass: 0,
    reliability: 3,
    cost: 55,
    xp: 0,
  },
  {
    name: 'Forged pistons',
    description: 'A higher-output internal build.',
    gain: 0.1,
    mass: 1.5,
    reliability: -5,
    cost: 420,
    xp: 120,
  },
  {
    name: 'Forged crankshaft',
    description: 'A stronger rotating assembly for a tuned engine.',
    gain: 0.02,
    mass: 2,
    reliability: 6,
    cost: 520,
    xp: 180,
  },
  {
    name: 'Rotating assembly balance',
    description: 'Less vibration and better durability.',
    gain: 0.015,
    mass: 0,
    reliability: 8,
    cost: 290,
    xp: 90,
  },
  {
    name: 'Port & polish',
    description: 'Reworked ports improve high-load breathing.',
    gain: 0.07,
    mass: -0.5,
    reliability: -3,
    cost: 360,
    xp: 150,
  },
] as const;
export function engineSpec(d: Design) {
  const fitted = d.engineMods[d.engine],
    base = engines[d.engine];
  return {
    ...base,
    hp:
      Math.round(
        base.hp * (1 + fitted.reduce((s, i) => s + upgrades[i].gain, 0)) * 10,
      ) / 10,
    mass: base.mass + fitted.reduce((s, i) => s + upgrades[i].mass, 0),
    reliability: Math.min(
      100,
      85 + fitted.reduce((s, i) => s + upgrades[i].reliability, 0),
    ),
  };
}
export function purchaseUpgrade(s: Save, i: number): Save {
  const u = upgrades[i],
    engine = s.design.engine;
  if (
    !u ||
    s.xp < u.xp ||
    s.credits < u.cost ||
    s.design.engineMods[engine].includes(i)
  )
    return s;
  const engineMods = s.design.engineMods.map((a) => a.slice());
  engineMods[engine].push(i);
  return {
    ...s,
    credits: s.credits - u.cost,
    design: { ...s.design, engineMods },
  };
}
export type Panel = { material: number; braced: boolean };
export const slots = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
export type Design = {
  material: number;
  engine: number;
  hull: 'skiff' | 'v';
  finish: number;
  color: string;
  panels: (Panel | null)[];
  widths: number[];
  depths: number[];
  engineSlot: number;
  seatMaterial: number;
  sternMaterial: number;
  engineMods: number[][];
};
export type Save = {
  version: 2;
  credits: number;
  xp: number;
  races: number;
  ownedMaterials: number[];
  ownedEngines: number[];
  ownedSeatMaterials: number[];
  ownedSternMaterials: number[];
  design: Design;
  garage?: { id: string; name: string; design: Design }[];
  challenges?: string[];
  lastRun?: { design: Design; eventId: number; elapsedSeconds: number };
};
export const initial: Save = {
  version: 2,
  credits: 360,
  xp: 0,
  races: 0,
  ownedMaterials: [0],
  ownedEngines: [0],
  ownedSeatMaterials: [0],
  ownedSternMaterials: [0],
  design: {
    material: 0,
    engine: 0,
    hull: 'skiff',
    finish: 60,
    color: '#f5a524',
    panels: Array.from({ length: 15 }, (_, i) =>
      slots.includes(i) ? { material: 0, braced: false } : null,
    ),
    widths: [35, 65, 85, 85, 80],
    depths: [0.5, 0.55, 0.6, 0.6, 0.55],
    engineSlot: 13,
    seatMaterial: 0,
    sternMaterial: 0,
    engineMods: [[], [], []],
  },
};
export type MaterialRole = 'hull' | 'seats' | 'stern';
export function unlockReputation(material: number, role: MaterialRole) {
  return Math.round(
    materials[material].xp *
      (role === 'seats' ? 0.2 : role === 'stern' ? 0.75 : 1),
  );
}
export function materialCost(material: number, role: MaterialRole) {
  return Math.round(
    materials[material].cost *
      (role === 'seats' ? 0.25 : role === 'stern' ? 0.5 : 1),
  );
}
export function ownedFor(s: Save, role: MaterialRole) {
  return role === 'hull'
    ? s.ownedMaterials
    : role === 'seats'
      ? s.ownedSeatMaterials
      : s.ownedSternMaterials;
}
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
export function panelWeight(d: Design, i: number) {
  const p = d.panels[i];
  if (!p) return 0;
  const row = Math.floor(i / 3),
    col = i % 3,
    ratio = d.hull === 'v' ? 0.04 : 0.45;
  const section = (r: number): number[][] =>
    r < 0
      ? Array.from({ length: 4 }, () => [0, 0, 0])
      : [
          [-d.widths[r] / 100, 0, r + 1],
          [(-d.widths[r] / 100) * ratio, -d.depths[r], r + 1],
          [(d.widths[r] / 100) * ratio, -d.depths[r], r + 1],
          [d.widths[r] / 100, 0, r + 1],
        ];
  const front = section(row - 1),
    back = section(row);
  const triangle = (a: number[], b: number[], c: number[]) => {
    const u = b.map((v, j) => v - a[j]),
      v = c.map((n, j) => n - a[j]);
    return (
      Math.hypot(
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ) / 2
    );
  };
  const area = (c: number) =>
    triangle(front[c], back[c], back[c + 1]) +
    triangle(front[c], back[c + 1], front[c + 1]);
  return (
    ((row === 0 ? [0, 1, 2].reduce((s, c) => s + area(c), 0) : area(col)) *
      materials[p.material].mass) /
      9 +
    (p.braced ? 9 : 0)
  );
}
export function hydrostatics(d: Design, mass: number) {
  const rho = 1025,
    length = 5,
    g = 9.80665,
    depths = d.depths;
  const beam = (i: number) => d.widths[i] / 50;
  const bottomRatio = d.hull === 'v' ? 0.04 : 0.45;
  function area(i: number, draft: number) {
    const t = Math.max(
      0,
      Math.min(depths[i], draft - (Math.max(...depths) - depths[i])),
    );
    return (
      beam(i) *
      (bottomRatio * t + ((1 - bottomRatio) * t * t) / (2 * depths[i]))
    );
  }
  function volume(draft: number) {
    let volume = 0,
      prev = 0;
    for (let i = 0; i < 5; i++) {
      const a = area(i, draft);
      volume += (prev + a) / 2;
      prev = a;
    }
    return volume;
  }
  const maxDraft = Math.max(...depths),
    capacity = volume(maxDraft) * rho;
  let lo = 0,
    hi = maxDraft;
  for (let i = 0; i < 35; i++) {
    const mid = (lo + hi) / 2;
    if (volume(mid) * rho < mass) lo = mid;
    else hi = mid;
  }
  const draft = (lo + hi) / 2,
    freeboard = maxDraft - draft;
  const waterlineBeams = d.widths.map(
    (_, i) =>
      beam(i) *
      (bottomRatio +
        ((1 - bottomRatio) * Math.max(0, depths[i] - freeboard)) / depths[i]),
  );
  let wettedArea = 0,
    waterplane = 0,
    wpMoment = 0;
  for (let i = 0; i < 5; i++) {
    const b = beam(i),
      bottom = b * bottomRatio,
      side = Math.hypot(
        Math.max(0, depths[i] - freeboard),
        (waterlineBeams[i] - bottom) / 2,
      ),
      perimeter = bottom + 2 * side;
    wettedArea += perimeter * (i === 0 ? 0.5 : 1);
    waterplane += waterlineBeams[i] * (i === 0 ? 0.5 : 1);
    wpMoment += (Math.pow(waterlineBeams[i], 3) / 12) * (i === 0 ? 0.5 : 1);
  }
  const volumeDisplaced = mass / rho;
  // Estimated vertical center of gravity includes engine and seated driver above the keel.
  const kg = 0.28 + (d.hull === 'v' ? 0.04 : 0);
  const gm = draft * 0.55 + wpMoment / Math.max(0.05, volumeDisplaced) - kg;
  return {
    rho,
    length,
    g,
    draft,
    freeboard,
    capacity,
    wettedArea,
    waterplane,
    gm,
    beam: Math.max(...d.widths) / 50,
  };
}
export function estimateSpeed(
  d: Design,
  mass: number,
  imbalance: number,
  smoothness: number,
  waveHeight: number,
  wind: number,
) {
  const h = hydrostatics(d, mass),
    hp = engineSpec(d).hp,
    nu = 1.19e-6;
  const propEfficiency = 0.52,
    availablePower = hp * 745.7 * propEfficiency;
  function resistance(v: number) {
    if (v <= 0) return { total: 0, friction: 0, wave: 0, air: 0, planing: 0 };
    const re = Math.max(1e5, (v * h.length) / nu),
      cf = 0.075 / Math.pow(Math.log10(re) - 2, 2);
    const roughness = d.finish >= 90 ? 1 : 1.22,
      friction = 0.5 * h.rho * v * v * h.wettedArea * cf * roughness;
    const fn = v / Math.sqrt(h.g * h.length);
    // Empirical residuary hump; this is not a calibrated CFD or towing-tank model.
    const wave =
      mass * h.g * (0.004 + 0.09 * Math.exp(-Math.pow((fn - 0.46) / 0.19, 2)));
    const planingBlend = Math.max(0, Math.min(1, (fn - 0.6) / 0.55));
    const liftDrag = d.hull === 'v' ? 4.7 : 6.2;
    const planing = ((mass * h.g) / liftDrag) * planingBlend;
    const waveAdded =
      mass *
      h.g *
      (waveHeight / h.length) *
      0.35 *
      Math.min(2, v / 5) *
      (d.hull === 'v' ? 0.7 : 1);
    const air = 0.5 * 1.225 * 0.8 * (h.beam * 0.4) * Math.pow(v + wind, 2);
    const hull =
      (friction * (1 - 0.4 * planingBlend) +
        wave * (1 - planingBlend) +
        planing +
        waveAdded) *
      (1 + imbalance / 100 + smoothness / 150);
    return {
      total: hull + air,
      friction,
      wave: wave * (1 - planingBlend) + waveAdded,
      air,
      planing,
    };
  }
  let lo = 0,
    hi = 35;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (resistance(mid).total * mid < availablePower) lo = mid;
    else hi = mid;
  }
  const speed = (lo + hi) / 2,
    drag = resistance(speed);
  return {
    ...h,
    speed,
    knots: Math.round(speed * 1.94384 * 10) / 10,
    dragNewtons: Math.round(drag.total),
    effectivePower: Math.round(availablePower / 100) / 10,
    planing: speed / Math.sqrt(h.g * h.length) > 0.8,
  };
}
export function stats(d: Design, waves = 0.15, wind = 2) {
  const e = engineSpec(d),
    placed = slots.filter((i) => d.panels[i]),
    coverage = placed.length / slots.length;
  const panelMass = slots.reduce((a, i) => a + panelWeight(d, i), 0),
    mass = Math.round(
      panelMass +
        e.mass +
        100 +
        materials[d.seatMaterial].mass * 0.1 +
        materials[d.sternMaterial].mass * 0.13 +
        (d.hull === 'v' ? 25 : 0),
    );
  let mx = 0,
    mz = -materials[d.sternMaterial].mass * 0.26;
  slots.forEach((i) => {
    mx +=
      (panelWeight(d, i) * ((i % 3) - 1) * d.widths[Math.floor(i / 3)]) / 150;
    mz += panelWeight(d, i) * (2 - Math.floor(i / 3));
  });
  mx +=
    (e.mass *
      ((d.engineSlot % 3) - 1) *
      d.widths[Math.floor(d.engineSlot / 3)]) /
    150;
  mz += e.mass * (2 - Math.floor(d.engineSlot / 3));
  const lateral = Math.abs(mx / mass),
    longitudinal = mz / mass,
    imbalance = lateral * 60 + Math.abs(longitudinal + 0.15) * 30;
  const smoothness = d.widths
    .slice(1)
    .reduce((a, v, i) => a + Math.max(0, Math.abs(v - d.widths[i]) - 30), 0);
  const structure = placed.length
    ? placed.reduce(
        (a, i) =>
          a +
          materials[d.panels[i]!.material].strength +
          (d.panels[i]!.braced ? 25 : 0),
        0,
      ) / placed.length
    : 0;
  const beauty = placed.length
    ? placed.reduce((a, i) => a + materials[d.panels[i]!.material].beauty, 0) /
      placed.length
    : 0;
  const engineSupported = !!d.panels[d.engineSlot]?.braced;
  const physics = estimateSpeed(d, mass, imbalance, smoothness, waves, wind);
  const unsafe = mass > physics.capacity * 0.85;
  const knots = coverage === 1 && !unsafe ? physics.knots : 0;
  const scores = [
    clamp(knots * 1.8),
    clamp(
      (beauty * 0.4 +
        materials[d.seatMaterial].beauty * 0.15 +
        d.finish * 0.35 +
        15 -
        smoothness * 0.2) *
        coverage,
    ),
    clamp(
      50 +
        Math.min(25, physics.gm * 30) +
        (d.hull === 'v' ? 15 : 0) -
        waves * (d.hull === 'v' ? 12 : 25) -
        imbalance,
    ),
    clamp(
      (structure * 0.55 +
        materials[d.sternMaterial].strength * 0.15 +
        e.reliability * 0.1 +
        12 -
        waves * e.hp * (engineSupported ? 0.03 : 0.13) -
        imbalance * 0.3) *
        coverage,
    ),
  ];
  return {
    mass,
    knots,
    scores,
    coverage,
    missing: 13 - placed.length,
    lateral: Math.round((mx / mass) * 100),
    trim: Math.round(longitudinal * 100),
    engineSupported,
    imbalance,
    smoothness,
    physics,
    unsafe,
  };
}
export function race(d: Design, eventId: number) {
  const event = events[eventId];
  if (!event) throw new Error('Unknown event');
  const result = stats(d, event.waves, event.wind);
  if (result.missing) throw new Error('Close all hull gaps before racing.');
  if (result.unsafe)
    throw new Error('Increase buoyancy or reduce weight before racing.');
  const courseKnots =
    Math.round(
      Math.max(0, result.physics.speed + event.current) * 1.94384 * 10,
    ) / 10;
  const elapsedSeconds = Math.round(
    event.distance / Math.max(0.1, result.physics.speed + event.current),
  );
  const score = Math.round(
    result.scores.reduce((sum, v, i) => sum + v * event.weights[i], 0),
  );
  const place =
    score >= event.target + 8
      ? 1
      : score >= event.target
        ? 2
        : score >= event.target - 9
          ? 3
          : 4;
  const credits = Math.round(event.reward * [1, 0.75, 0.5, 0.3][place - 1]),
    xp = [35, 25, 20, 15][place - 1],
    tips = [];
  if (result.imbalance > 12)
    tips.push(
      'Move the engine or redistribute heavy panels to bring the center of mass closer to the centerline and slightly aft.',
    );
  if (!result.engineSupported)
    tips.push(
      'Brace the panel under your engine to handle its concentrated load.',
    );
  if (result.smoothness > 10)
    tips.push(
      'Smooth the change in width between hull stations to reduce drag.',
    );
  if (event.waves > 0.5 && d.hull === 'skiff')
    tips.push('A deep-V cross section softens wave impacts on this course.');
  if (result.scores[0] < 55)
    tips.push(
      'Replace heavy panels with lighter material, or try more engine power.',
    );
  if (result.scores[3] < 60)
    tips.push('Brace weak hull sections or replace them with stronger panels.');
  if (!tips.length)
    tips.push(
      'This design handled the course well. Try another event to test its limits.',
    );
  return {
    ...result,
    score,
    place,
    credits,
    xp,
    tips,
    courseKnots,
    elapsedSeconds,
  };
}
export function parseSave(raw: string): Save {
  const s = JSON.parse(raw),
    d = s.design;
  const index = (v: unknown, max: number) =>
    Number.isInteger(v) && Number(v) >= 0 && Number(v) < max;
  const list = (a: unknown, max: number) =>
    Array.isArray(a) && a.length > 0 && a.every((v) => index(v, max));
  if (
    s.version !== 2 ||
    ![s.credits, s.xp, s.races].every(
      (v) => Number.isSafeInteger(v) && v >= 0,
    ) ||
    !list(s.ownedMaterials, materials.length) ||
    !list(s.ownedEngines, engines.length) ||
    !list(s.ownedSeatMaterials, materials.length) ||
    !list(s.ownedSternMaterials, materials.length) ||
    !d ||
    !index(d.seatMaterial, materials.length) ||
    !index(d.sternMaterial, materials.length) ||
    !s.ownedSeatMaterials.includes(d.seatMaterial) ||
    !s.ownedSternMaterials.includes(d.sternMaterial) ||
    !index(d.material, materials.length) ||
    !index(d.engine, engines.length) ||
    !s.ownedMaterials.includes(d.material) ||
    !s.ownedEngines.includes(d.engine) ||
    !['skiff', 'v'].includes(d.hull) ||
    !Number.isFinite(d.finish) ||
    d.finish < 0 ||
    d.finish > 100 ||
    !/^#[0-9a-f]{6}$/i.test(d.color) ||
    !slots.includes(d.engineSlot) ||
    !Array.isArray(d.widths) ||
    d.widths.length !== 5 ||
    !d.widths.every(
      (v: unknown) => Number.isFinite(v) && Number(v) >= 25 && Number(v) <= 100,
    ) ||
    !Array.isArray(d.engineMods) ||
    d.engineMods.length !== engines.length ||
    !d.engineMods.every(
      (a: unknown) =>
        Array.isArray(a) &&
        new Set(a).size === a.length &&
        a.every((v) => index(v, upgrades.length)),
    ) ||
    !Array.isArray(d.depths) ||
    d.depths.length !== 5 ||
    !d.depths.every(
      (v: unknown) =>
        Number.isFinite(v) && Number(v) >= 0.25 && Number(v) <= 1.2,
    ) ||
    !Array.isArray(d.panels) ||
    d.panels.length !== 15 ||
    !d.panels.every(
      (p: Panel | null, i: number) =>
        p === null ||
        (slots.includes(i) &&
          index(p.material, materials.length) &&
          s.ownedMaterials.includes(p.material) &&
          typeof p.braced === 'boolean'),
    )
  )
    throw new Error('Invalid boatyard save');
  const validateDesign = (design: Design) =>
    parseSave(
      JSON.stringify({
        ...s,
        design,
        garage: undefined,
        challenges: undefined,
        lastRun: undefined,
      }),
    ).design;
  if (s.garage !== undefined) {
    if (!Array.isArray(s.garage) || s.garage.length > 12)
      throw new Error('Invalid garage');
    const ids = new Set();
    for (const boat of s.garage) {
      if (
        !boat ||
        typeof boat.id !== 'string' ||
        boat.id.length > 80 ||
        ids.has(boat.id) ||
        typeof boat.name !== 'string' ||
        !boat.name.trim() ||
        boat.name.length > 40
      )
        throw new Error('Invalid saved boat');
      ids.add(boat.id);
      validateDesign(boat.design);
    }
  }
  if (
    s.challenges !== undefined &&
    (!Array.isArray(s.challenges) ||
      s.challenges.length > 20 ||
      s.challenges.some(
        (v: unknown) => typeof v !== 'string' || v.length > 50,
      ) ||
      new Set(s.challenges).size !== s.challenges.length)
  )
    throw new Error('Invalid career');
  if (s.lastRun !== undefined) {
    if (
      !index(s.lastRun.eventId, events.length) ||
      !Number.isFinite(s.lastRun.elapsedSeconds) ||
      s.lastRun.elapsedSeconds <= 0
    )
      throw new Error('Invalid previous run');
    validateDesign(s.lastRun.design);
  }
  return s;
}
export function readSave(raw: string | null): Save {
  try {
    return raw ? parseSave(raw) : structuredClone(initial);
  } catch {
    return structuredClone(initial);
  }
}

export type Opponent = {
  name: string;
  style: string;
  design: Design;
  elapsedSeconds: number;
  courseKnots: number;
};
export function generateOpponents(
  player: Design,
  eventId: number,
  count: number,
  xp: number,
  random = Math.random,
): Opponent[] {
  if (!Number.isInteger(count) || count < 0 || count > 3)
    throw new Error('Choose zero to three opponents.');
  const names = [
    'Copper Comet',
    'Reed Runner',
    'Blue Heron',
    'Wake Bandit',
    'Harbor Fox',
    'Silver Minnow',
  ];
  const palette = ['#ea7051', '#71cfb2', '#a899ec'];
  // Separate silhouettes, sampled without replacement, rather than copies of
  // the player's hull. Small variations keep repeat races from looking identical.
  const profiles = [
    {
      label: 'Needle racer',
      hull: 'v' as const,
      widths: [26, 43, 59, 62, 47],
      depths: [0.55, 0.7, 0.85, 0.85, 0.75],
    },
    {
      label: 'Wide skiff',
      hull: 'skiff' as const,
      widths: [60, 88, 98, 95, 90],
      depths: [0.4, 0.45, 0.5, 0.5, 0.45],
    },
    {
      label: 'Wave cutter',
      hull: 'v' as const,
      widths: [32, 61, 82, 78, 64],
      depths: [0.75, 0.9, 1.05, 1.05, 0.95],
    },
  ];
  for (let j = profiles.length - 1; j > 0; j--) {
    const k = Math.min(j, Math.floor(random() * (j + 1)));
    [profiles[j], profiles[k]] = [profiles[k], profiles[j]];
  }
  const pick = <T>(items: readonly T[]): T =>
    items[Math.min(items.length - 1, Math.floor(random() * items.length))];
  const pool = materials.map((_, i) => i).filter((i) => materials[i].xp <= xp);
  const shuffled = names
    .map((name) => ({ name, sort: random() }))
    .sort((a, b) => a.sort - b.sort);
  return Array.from({ length: count }, (_, i) => {
    const d: Design = structuredClone(initial.design);
    const profile = profiles[i];
    const material = pick(pool);
    d.material = material;
    d.hull = profile.hull;
    d.color = palette[i];
    // Match the player's engine class, while generating independent tuning.
    // Copying the player's upgrades would cancel the benefit of tuning.
    d.engine = random() < 0.8 ? player.engine : Math.max(0, player.engine - 1);
    d.engineMods = engines.map(() =>
      upgrades.flatMap((upgrade, index) =>
        upgrade.xp <= xp && random() < 0.2 ? [index] : [],
      ),
    );
    d.widths = profile.widths.map((w) =>
      Math.max(25, Math.min(100, Math.round(w + (random() - 0.5) * 4))),
    );
    d.depths = profile.depths.map((v) =>
      Math.max(
        0.35,
        Math.min(1.2, Math.round((v + (random() - 0.5) * 0.06) * 100) / 100),
      ),
    );
    d.panels = Array.from({ length: 15 }, (_, slot) =>
      slots.includes(slot)
        ? {
            material: random() < 0.8 ? material : pick(pool),
            braced: random() < 0.25,
          }
        : null,
    );
    d.engineSlot = pick([7, 10, 13]);
    d.finish = pick([60, 90]);
    d.seatMaterial = pick(
      materials
        .map((_, n) => n)
        .filter((n) => unlockReputation(n, 'seats') <= xp),
    );
    d.sternMaterial = pick(
      materials
        .map((_, n) => n)
        .filter((n) => unlockReputation(n, 'stern') <= xp),
    );
    if (stats(d).unsafe) {
      // Lighten the structure rather than replacing every silhouette with the
      // same fallback hull. Preserve the visible design and calculate it again.
      d.material = 0;
      d.panels = d.panels.map((p) => p && { material: 0, braced: false });
      d.seatMaterial = 0;
      d.sternMaterial = 0;
    }
    const result = race(d, eventId);
    return {
      name: shuffled[i].name,
      style: profile.label,
      design: d,
      elapsedSeconds: result.elapsedSeconds,
      courseKnots: result.courseKnots,
    };
  });
}
export function runEvent(
  design: Design,
  eventId: number,
  count: number,
  xp: number,
  random = Math.random,
) {
  const base = race(design, eventId),
    opponents = generateOpponents(design, eventId, count, xp, random);
  const standings = [
    {
      name: 'Your boat',
      isPlayer: true,
      elapsedSeconds: base.elapsedSeconds,
      courseKnots: base.courseKnots,
      color: design.color,
    },
    ...opponents.map((o) => ({
      name: o.name,
      isPlayer: false,
      elapsedSeconds: o.elapsedSeconds,
      courseKnots: o.courseKnots,
      color: o.design.color,
    })),
  ].sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
  const place = count ? standings.findIndex((s) => s.isPlayer) + 1 : base.place;
  return {
    ...base,
    place,
    credits: count
      ? Math.round(events[eventId].reward * [1, 0.75, 0.5, 0.3][place - 1])
      : base.credits,
    xp: count ? [35, 25, 20, 15][place - 1] : base.xp,
    opponents,
    standings,
  };
}
