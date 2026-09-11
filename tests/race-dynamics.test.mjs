import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initial,
  simulateRace,
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
