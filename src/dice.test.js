import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, rollFormula, formatDetail, abilityMod, profBonus } from './dice.js';

// Devuelve un rng que produce exactamente la cara pedida en cada tirada
const faces = (sides, ...values) => {
  let i = 0;
  return () => (values[i++ % values.length] - 0.5) / sides;
};

test('parseFormula: fórmulas válidas', () => {
  assert.equal(parseFormula('1d20+7').terms.length, 2);
  assert.equal(parseFormula('d20').terms[0].count, 1);
  assert.equal(parseFormula(' 2D6 + 1d8 - 2 ').terms.length, 3);
  assert.equal(parseFormula('3d4+3').terms[1].value, 3);
});

test('parseFormula: errores', () => {
  assert.ok(parseFormula('').error);
  assert.ok(parseFormula('hola').error);
  assert.ok(parseFormula('1d20+').error);
  assert.ok(parseFormula('1d1').error);
  assert.ok(parseFormula('0d6').error);
  assert.ok(parseFormula('101d6').error);
  assert.ok(parseFormula('5').error);
  assert.ok(parseFormula('@atq').error);
});

test('rollFormula: suma dados y modificador', () => {
  const r = rollFormula('1d20+7', { rng: faces(20, 14) });
  assert.equal(r.total, 21);
  assert.equal(r.crit, null);
  assert.equal(formatDetail(r), '1d20 [14] + 7');
});

test('rollFormula: modificador negativo y varios dados', () => {
  assert.equal(rollFormula('1d20-1', { rng: faces(20, 10) }).total, 9);
  assert.equal(rollFormula('3d4+3', { rng: faces(4, 1, 2, 4) }).total, 10);
  assert.equal(rollFormula('2d6-1d4', { rng: (() => { const v = [6, 6, 4]; const s = [6, 6, 4]; let i = 0; return () => (v[i] - 0.5) / s[i++]; })() }).total, 8);
});

test('rollFormula: ventaja y desventaja', () => {
  const adv = rollFormula('1d20+5', { mode: 'adv', rng: faces(20, 5, 17) });
  assert.deepEqual(adv.groups[0].all, [5, 17]);
  assert.equal(adv.total, 22);
  assert.equal(adv.mode, 'adv');

  const dis = rollFormula('1d20+5', { mode: 'dis', rng: faces(20, 5, 17) });
  assert.equal(dis.total, 10);
  assert.equal(formatDetail(dis), '1d20 [5, 17 → 5] + 5');
});

test('rollFormula: ventaja se ignora sin 1d20', () => {
  const r = rollFormula('2d10', { mode: 'adv', rng: faces(10, 3, 4) });
  assert.equal(r.total, 7);
  assert.equal(r.mode, 'normal');
  assert.equal(r.modeIgnored, true);
});

test('rollFormula: crítico y pifia en el d20', () => {
  assert.equal(rollFormula('1d20+3', { rng: faces(20, 20) }).crit, 'crit');
  assert.equal(rollFormula('1d20+3', { rng: faces(20, 1) }).crit, 'fumble');
  assert.equal(rollFormula('2d10', { rng: faces(10, 10, 10) }).crit, null);
});

test('rollFormula: fórmula inválida devuelve error', () => {
  assert.ok(rollFormula('xyz').error);
});

test('rollFormula: distribución razonable de 1d6', () => {
  let sum = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const t = rollFormula('1d6').total;
    assert.ok(t >= 1 && t <= 6);
    sum += t;
  }
  const mean = sum / n;
  assert.ok(mean > 3.4 && mean < 3.6, `media ${mean}`);
});

test('modificadores y competencia', () => {
  assert.equal(abilityMod(18), 4);
  assert.equal(abilityMod(10), 0);
  assert.equal(abilityMod(8), -1);
  assert.equal(abilityMod(9), -1);
  assert.equal(profBonus(1), 2);
  assert.equal(profBonus(5), 3);
  assert.equal(profBonus(9), 4);
  assert.equal(profBonus(17), 6);
});
