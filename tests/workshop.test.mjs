import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initial, parseSave, unlockReputation } from '../lib/game.ts';
import {
  seaTrial,
  careerRace,
  careerEligible,
  completeCareer,
} from '../lib/workshop.ts';
import {
  passwordHash,
  verifyPassword,
  validCredentials,
  token,
} from '../api/src/security.js';
test('throttle and engine braces alter estimated loads', () => {
  const d = structuredClone(initial.design);
  const full = seaTrial(d, 1, 5);
  const idle = seaTrial(d, 1, 5, 0);
  assert.equal(idle.speed, 0);
  assert.equal(idle.impact, 0);
  assert.equal(idle.strain, 0);
  assert.ok(full.impact > 0);
  d.panels[d.engineSlot].braced = false;
  const unbraced = seaTrial(d, 0.5, 5);
  d.panels[d.engineSlot].braced = true;
  assert.ok(seaTrial(d, 0.5, 5).strain < unbraced.strain);
});
test('career rivals keep their design and rewards cannot be claimed twice', () => {
  const s = structuredClone(initial);
  const a = careerRace(s, 'pond-wood'),
    b = careerRace(s, 'pond-wood');
  assert.deepEqual(a.opponents, b.opponents);
  assert.equal(a.opponents[0].name, 'Reed Runner');
  assert.equal(careerEligible(s, 'river-braced'), false);
  const rewarded = completeCareer(s, 'pond-wood', 1);
  assert.equal(rewarded.credits, s.credits + 100);
  assert.deepEqual(completeCareer(rewarded, 'pond-wood', 1), rewarded);
  assert.deepEqual(completeCareer(s, 'pond-wood', 2), s);
});
test('old saves work and garage snapshots validate parts and unique identifiers', () => {
  const s = structuredClone(initial);
  assert.deepEqual(parseSave(JSON.stringify(s)), s);
  s.garage = [
    { id: 'boat-1', name: 'Pond boat', design: structuredClone(s.design) },
  ];
  s.lastRun = {
    design: structuredClone(s.design),
    eventId: 1,
    elapsedSeconds: 180,
  };
  assert.equal(parseSave(JSON.stringify(s)).garage[0].name, 'Pond boat');
  s.garage.push(structuredClone(s.garage[0]));
  assert.throws(() => parseSave(JSON.stringify(s)));
  s.garage.pop();
  s.garage[0].design.engine = 2;
  assert.throws(() => parseSave(JSON.stringify(s)));
});
test('hull progression starts earlier than before, with seats sooner still', () => {
  assert.equal(unlockReputation(2, 'hull'), 35);
  assert.ok(unlockReputation(2, 'seats') < 35);
  assert.equal(unlockReputation(4, 'hull'), 140);
});
test('game passwords use salted hashes and validate safely', async () => {
  const password = token();
  const a = await passwordHash(password),
    b = await passwordHash(password);
  assert.notEqual(a.passwordHash, b.passwordHash);
  assert.notEqual(a.salt, b.salt);
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword('wrong password', a), false);
  assert.equal(await verifyPassword(password, null), false);
  assert.equal(validCredentials('boat_builder', password), true);
  assert.equal(validCredentials('bad/name', password), false);
  assert.equal(validCredentials('boat', 'short'), false);
  assert.match(token(), /^[A-Za-z0-9_-]{43}$/);
});
