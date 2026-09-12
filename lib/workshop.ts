import {
  stats,
  compareFinish,
  raceHandling,
  engineSpec,
  runEvent,
  initial,
  type Design,
  type Save,
} from './game.ts';

export function seaTrial(d: Design, waves: number, wind: number, throttle = 1) {
  const s = stats(d, waves, wind);
  const power = Math.max(0, Math.min(1, throttle));
  const speed =
    s.knots * raceHandling(d, s, waves).roughPace * Math.cbrt(power);
  const heel = Math.max(
    -25,
    Math.min(25, (s.lateral * 0.22) / Math.max(0.3, s.physics.gm + 0.3)),
  );
  const impact = Math.min(
    100,
    waves *
      speed *
      (d.hull === 'v' ? 1.4 : 3.1) *
      (1 + Math.max(0, s.trim) / 100),
  );
  const strain = Math.min(
    100,
    engineSpec(d).hp *
      power *
      (0.35 + waves) *
      (s.engineSupported ? 0.22 : 1.1),
  );
  const margin = s.physics.freeboard - waves * 0.35;
  return {
    speed,
    heel,
    impact,
    strain,
    margin,
    freeboard: s.physics.freeboard,
    warnings: [
      Math.abs(heel) > 5
        ? 'Uneven weight is leaning the boat. Move heavy panels or the engine toward the centerline.'
        : 'Weight is balanced across the hull.',
      impact > 35
        ? 'The hull is pounding into waves. Try a deeper V or reduce throttle.'
        : 'Wave impacts are manageable at this throttle.',
      margin < 0.15
        ? 'Little clearance above the water. Deepen the hull or reduce weight before rough-water events.'
        : 'The hull has useful clearance above the water.',
      strain > 35
        ? 'The engine mount is under strain. Add a brace beneath the engine or reduce power.'
        : 'The engine mount is carrying the estimated load.',
    ],
  };
}

export const career = [
  {
    id: 'pond-wood',
    name: 'Timber Trophy',
    className: 'Rookie · 25 HP stock class',
    eventId: 1,
    engine: 0,
    xp: 0,
    reward: 100,
    reputation: 20,
    rival: 'Reed Runner',
    quote: 'Good wood and a clean line. That is all I need.',
    goal: 'Beat Reed Runner on the pond with every hull panel made of plywood or bamboo.',
  },
  {
    id: 'river-braced',
    name: 'River Reliability Cup',
    className: 'Club · 60 HP stock class',
    eventId: 4,
    engine: 1,
    xp: 60,
    reward: 220,
    reputation: 40,
    rival: 'Harbor Fox',
    quote: 'Power means nothing if the mount cannot take it.',
    goal: 'Beat Harbor Fox on the fast river with a braced engine mount.',
  },
  {
    id: 'ocean-v',
    name: 'Bluewater Championship',
    className: 'Open · 100 HP stock class',
    eventId: 5,
    engine: 2,
    xp: 180,
    reward: 400,
    reputation: 70,
    rival: 'Blue Heron',
    quote: 'Build for the waves, and the speed will follow.',
    goal: 'Beat Blue Heron on the ocean in a deep-V hull.',
  },
] as const;

export function careerEligible(s: Save, id: string) {
  const c = career.find((v) => v.id === id);
  if (!c || s.xp < c.xp || s.design.engine > c.engine) return false;
  if (id === 'pond-wood')
    return s.design.panels.every((p) => !p || [0, 6].includes(p.material));
  if (id === 'river-braced')
    return !!s.design.panels[s.design.engineSlot]?.braced;
  return s.design.hull === 'v';
}

export function careerRace(s: Save, id: string) {
  const c = career.find((v) => v.id === id);
  if (!c || !careerEligible(s, id))
    throw new Error('Meet the challenge requirements first.');
  let seed = c.eventId * 9127 + 53;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  // A fixed seed and class engine give each returning rival the same boat.
  const reference = structuredClone(initial.design);
  reference.engine = c.engine;
  const r = runEvent(reference, c.eventId, 1, c.xp, random);
  const player = runEvent(s.design, c.eventId, 0, s.xp);
  const rival = { ...r.opponents[0], name: c.rival };
  const standings = [
    {
      name: 'Your boat',
      isPlayer: true,
      elapsedSeconds: player.elapsedSeconds,
      courseKnots: player.courseKnots,
      color: s.design.color,
      outcome: player.dynamics.outcome,
      distance: player.dynamics.distance,
    },
    {
      name: rival.name,
      isPlayer: false,
      elapsedSeconds: rival.elapsedSeconds,
      courseKnots: rival.courseKnots,
      color: rival.design.color,
      outcome: rival.dynamics.outcome,
      distance: rival.dynamics.distance,
    },
  ].sort(compareFinish);
  const place = standings.findIndex((v) => v.isPlayer) + 1;
  return {
    ...player,
    opponents: [rival],
    standings,
    place,
    credits:
      player.dynamics.outcome !== 'finished' ? 0 : place === 1 ? 100 : 40,
    xp: player.dynamics.outcome !== 'finished' ? 0 : place === 1 ? 25 : 15,
  };
}

export function completeCareer(
  s: Save,
  id: string | null,
  place: number,
): Save {
  const c = career.find((v) => v.id === id);
  if (
    !c ||
    place !== 1 ||
    !careerEligible(s, c.id) ||
    s.challenges?.includes(c.id)
  )
    return s;
  return {
    ...s,
    credits: s.credits + c.reward,
    xp: s.xp + c.reputation,
    challenges: [...(s.challenges || []), c.id],
  };
}
