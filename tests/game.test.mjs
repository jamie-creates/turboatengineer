import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initial,
  stats,
  race,
  runEvent,
  generateOpponents,
  engineSpec,
  purchaseUpgrade,
  unlockReputation,
  parseSave,
  readSave,
  panelWeight,
} from '../lib/game.ts';
const design = () => structuredClone(initial.design);
test('a complete starter hull floats and runs faster in calm water', () => {
  const d = design();
  assert.equal(stats(d).missing, 0);
  assert.equal(stats(d).unsafe, false);
  assert.ok(stats(d, 0.03, 0.5).knots > stats(d, 1.2, 10).knots);
  assert.ok(stats(d).physics.freeboard > 0);
});
test('a missing structural panel blocks launch', () => {
  const d = design();
  d.panels[7] = null;
  assert.equal(stats(d).missing, 1);
  assert.throws(() => race(d, 0), /gaps/);
  assert.equal(stats(d).knots, 0);
});
test('shape changes affect actual panel mass and hydrostatics', () => {
  const d = design(),
    a = panelWeight(d, 7),
    draft = stats(d).physics.draft;
  d.widths[2] = 100;
  d.depths[2] = 1;
  assert.notEqual(panelWeight(d, 7), a);
  assert.notEqual(stats(d).physics.draft, draft);
});
test('asymmetric mass affects stability and speed', () => {
  const d = design(),
    a = stats(d);
  d.engineSlot = 14;
  const b = stats(d);
  assert.ok(Math.abs(b.lateral) > Math.abs(a.lateral));
  assert.ok(b.knots < a.knots);
});
test('engine upgrades charge once and persist per engine', () => {
  const s = structuredClone(initial);
  const upgraded = purchaseUpgrade(s, 0);
  assert.equal(upgraded.credits, s.credits - 90);
  assert.ok(engineSpec(upgraded.design).hp > engineSpec(s.design).hp);
  assert.equal(purchaseUpgrade(upgraded, 0), upgraded);
  upgraded.design.engine = 1;
  assert.equal(engineSpec(upgraded.design).hp, 60);
  upgraded.design.engine = 0;
  assert.ok(engineSpec(upgraded.design).hp > 25);
});
test('locked upgrades and unaffordable purchases do nothing', () => {
  assert.equal(purchaseUpgrade(initial, 3), initial);
  const s = { ...structuredClone(initial), credits: 0 };
  assert.equal(purchaseUpgrade(s, 0), s);
});
test('premium seats unlock before structural panels', () => {
  assert.equal(unlockReputation(4, 'seats'), 48);
  assert.equal(unlockReputation(4, 'hull'), 240);
  assert.ok(unlockReputation(4, 'stern') > unlockReputation(4, 'seats'));
});
test('save validation rejects corrupt part references', () => {
  assert.deepEqual(parseSave(JSON.stringify(initial)), initial);
  const bad = structuredClone(initial);
  bad.design.panels[7].material = 999;
  assert.throws(() => parseSave(JSON.stringify(bad)));
  assert.deepEqual(readSave('{bad'), initial);
});
test('opponent counts are bounded at three', () => {
  for (const n of [-1, 4, 1.5, NaN])
    assert.throws(() => generateOpponents(design(), 0, n, 0));
  assert.equal(generateOpponents(design(), 0, 0, 0).length, 0);
  assert.equal(generateOpponents(design(), 0, 3, 0).length, 3);
});
test('random opponents have sealed hulls and use the same course physics', () => {
  const opponents = generateOpponents(design(), 4, 3, 180);
  assert.equal(new Set(opponents.map((o) => o.name)).size, 3);
  for (const o of opponents) {
    assert.equal(stats(o.design).missing, 0);
    assert.equal(o.elapsedSeconds, race(o.design, 4).elapsedSeconds);
  }
});
test('head-to-head finish order and rewards match times', () => {
  const r = runEvent(design(), 0, 3, 0);
  assert.equal(r.standings.length, 4);
  assert.equal(r.place, r.standings.findIndex((s) => s.isPlayer) + 1);
  assert.equal(r.opponents.length, 3);
  for (let i = 1; i < 4; i++)
    assert.ok(
      r.standings[i].elapsedSeconds >= r.standings[i - 1].elapsedSeconds,
    );
});

test('rivals have distinct silhouettes even when random draws repeat', () => {
  for (const draw of [0, 0.5, 0.999]) {
    for (const xp of [0, 180, 500]) {
      const player = design();
      player.widths = [100, 100, 100, 100, 100];
      const before = structuredClone(player);
      const rivals = generateOpponents(player, 5, 3, xp, () => draw);
      assert.equal(new Set(rivals.map((o) => o.style)).size, 3);
      assert.equal(new Set(rivals.map((o) => JSON.stringify(o.design.widths))).size, 3);
      assert.equal(new Set(rivals.map((o) => o.design.color)).size, 3);
      for (const rival of rivals) {
        assert.notDeepEqual(rival.design.widths, player.widths);
        assert.equal(stats(rival.design).unsafe, false);
        assert.ok(Number.isFinite(rival.elapsedSeconds) && rival.elapsedSeconds > 0);
      }
      assert.deepEqual(player, before);
    }
  }
});
test('river current contributes to course speed without inflating through-water speed', () => {
  const r = race(design(), 3);
  assert.ok(r.courseKnots > r.knots);
  assert.ok(r.elapsedSeconds > 0);
});
