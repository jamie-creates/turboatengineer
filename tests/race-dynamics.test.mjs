import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initial,
  simulateRace,
  race,
  compareFinish,
  raceRisk,
  raceFrame,
  coursePoint,
  events,
  runEvent,
} from '../lib/game.ts';
test('trajectory starts at rest, accelerates, and finishes at the course line', () => {
  const r = simulateRace(initial.design, 0);
  assert.equal(r.frames[0].speed, 0);
  assert.ok(r.frames[8].speed > r.frames[1].speed);
  assert.equal(r.frames.at(-1).distance, events[0].distance);
  assert.equal(raceFrame(r, r.duration + 10).phase, 'Finished');
  for (let i = 1; i < r.frames.length; i++) {
    assert.ok(r.frames[i].distance >= r.frames[i - 1].distance);
    assert.ok(Number.isFinite(r.frames[i].speed));
  }
  assert.deepEqual(simulateRace(initial.design, 0), r);
});
test('bends alter heading and boats lose speed then accelerate out', () => {
  const r = simulateRace(initial.design, 1);
  assert.notEqual(coursePoint(300, 1).heading, coursePoint(0, 1).heading);
  const turns = r.frames.filter(
    (f) => Math.abs(coursePoint(f.distance, 1).curve) > 0.01,
  );
  assert.ok(turns.length > 0);
  assert.ok(r.turnLoss > 0);
  assert.ok(turns.some((f) => Math.abs(f.heel) > 0.01));
  assert.ok(
    r.frames.some((f, i) => i > 0 && f.speed < r.frames[i - 1].speed - 0.01),
  );
});
test('mass slows the launch and deep V reduces rough-water impacts', () => {
  const d = structuredClone(initial.design),
    light = simulateRace(d, 5);
  d.panels = d.panels.map((p) => p && { ...p, material: 1 });
  const heavy = simulateRace(d, 5);
  assert.ok(heavy.frames[8].speed < light.frames[8].speed);
  d.panels = structuredClone(initial.design.panels);
  d.hull = 'v';
  const v = simulateRace(d, 5);
  assert.ok(v.impactSeconds < light.impactSeconds);
});
test('all finish times and placing agree with recorded opponent trajectories', () => {
  const r = runEvent(initial.design, 0, 3, 0, () => 0.5);
  assert.equal(r.elapsedSeconds, r.dynamics.duration);
  for (const o of r.opponents)
    assert.equal(o.elapsedSeconds, o.dynamics.duration);
  for (const d of [r.dynamics, ...r.opponents.map((o) => o.dynamics)])
    assert.equal(raceFrame(d, d.duration).distance, events[0].distance);
  assert.equal(r.place, r.standings.findIndex((s) => s.isPlayer) + 1);
});

function fiberglass(d) {
  d.panels = d.panels.map((p) => p && { ...p, material: 2 });
  d.sternMaterial = 2;
  return d;
}
function ranked(d, eventId) {
  const r = simulateRace(d, eventId);
  return { ...r, elapsedSeconds: r.duration };
}

test('small low-freeboard boats win calm sprints but lose to a seaworthy hull offshore', () => {
  const small = {
    ...structuredClone(initial.design),
    widths: [25, 35, 45, 45, 40],
    depths: [0.4, 0.4, 0.4, 0.4, 0.4],
  };
  const roomy = {
    ...structuredClone(initial.design),
    hull: 'v',
    widths: [32, 61, 82, 78, 64],
    depths: [0.75, 0.9, 1.05, 1.05, 0.95],
  };
  fiberglass(small);
  fiberglass(roomy);
  assert.ok(simulateRace(small, 1).duration < simulateRace(roomy, 1).duration);
  assert.ok(compareFinish(ranked(small, 4), ranked(roomy, 4)) > 0);
  assert.ok(compareFinish(ranked(small, 5), ranked(roomy, 5)) > 0);
  assert.ok(
    simulateRace(small, 5).roughWaterReduction >
      simulateRace(roomy, 5).roughWaterReduction,
  );
  assert.equal(simulateRace(small, 1).roughWaterReduction, 0);
});
test('even two V hulls trade places between pond and ocean with equal engines and materials', () => {
  const compact = {
    ...structuredClone(initial.design),
    hull: 'v',
    widths: [26, 43, 59, 62, 47],
    depths: [0.55, 0.7, 0.85, 0.85, 0.75],
  };
  const roomy = {
    ...structuredClone(initial.design),
    hull: 'v',
    widths: [32, 61, 82, 78, 64],
    depths: [0.75, 0.9, 1.05, 1.05, 0.95],
  };
  fiberglass(compact);
  fiberglass(roomy);
  assert.ok(
    simulateRace(compact, 1).duration < simulateRace(roomy, 1).duration,
  );
  assert.ok(compareFinish(ranked(roomy, 5), ranked(compact, 5)) < 0);
});

test('plywood survives sheltered courses but ocean fatigue breaks it, even braced', () => {
  const d = structuredClone(initial.design);
  assert.equal(simulateRace(d, 0).outcome, 'finished');
  assert.equal(simulateRace(d, 1).outcome, 'finished');
  d.panels = d.panels.map((p) => p && { ...p, braced: true });
  const r = race(d, 5);
  assert.equal(r.dynamics.outcome, 'broken');
  assert.equal(r.credits, 0);
  assert.equal(r.xp, 0);
  assert.ok(raceRisk(d, 5).some((s) => s.includes('plywood')));
  const reinforced = fiberglass(d);
  assert.equal(simulateRace(reinforced, 5).outcome, 'finished');
  reinforced.sternMaterial = 0;
  assert.equal(simulateRace(reinforced, 5).outcome, 'broken');
});
test('a small boat can finish sheltered water but capsize with too much engine', () => {
  const d = fiberglass({
    ...structuredClone(initial.design),
    widths: [25, 35, 45, 45, 40],
    depths: [0.4, 0.4, 0.4, 0.4, 0.4],
  });
  assert.equal(simulateRace(d, 0).outcome, 'finished');
  d.engine = 2;
  assert.equal(simulateRace(d, 0).outcome, 'capsized');
  const r = runEvent(d, 0, 3, 0, () => 0.5);
  assert.equal(r.credits, 0);
  assert.equal(r.xp, 0);
  assert.ok(
    compareFinish(
      { outcome: 'finished', distance: 1200, elapsedSeconds: 100 },
      { outcome: 'capsized', distance: 100, elapsedSeconds: 5 },
    ) < 0,
  );
});
