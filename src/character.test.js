import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCharacter } from './data.js';
import { resolveFormula, tokenValues, saveBonus, skillBonus } from './character.js';
import { parseFormula } from './dice.js';

const mago = defaultCharacter(); // nivel 5, INT 18

test('tokenValues del mago de ejemplo', () => {
  const v = tokenValues(mago);
  assert.equal(v.prof, 3);
  assert.equal(v.mod, 4);
  assert.equal(v.atq, 7);
  assert.equal(v.cd, 15);
  assert.equal(v.des, 2);
});

test('resolveFormula sustituye atajos', () => {
  assert.equal(resolveFormula('1d20+@atq', mago), '1d20+7');
  assert.equal(resolveFormula('2d6+@mod', mago), '2d6+4');
  assert.equal(resolveFormula('1d20+@fue', mago), '1d20-1');
  assert.equal(resolveFormula('1d20-@fue', mago), '1d20+1');
  assert.equal(resolveFormula('3d4+3', mago), '3d4+3');
});

test('resolveFormula: atajo desconocido sigue dando error al parsear', () => {
  const out = resolveFormula('1d20+@xyz', mago);
  assert.ok(parseFormula(out).error);
});

test('las fórmulas resueltas son válidas', () => {
  for (const spell of mago.spells) {
    for (const r of spell.rolls) {
      assert.equal(parseFormula(resolveFormula(r.formula, mago)).error, undefined, r.formula);
    }
  }
});

test('salvaciones y habilidades', () => {
  assert.equal(saveBonus(mago, 'int'), 7); // +4 y competencia
  assert.equal(saveBonus(mago, 'str'), -1);
  assert.equal(skillBonus(mago, { key: 'arcana', ability: 'int' }), 7);
  assert.equal(skillBonus(mago, { key: 'stealth', ability: 'dex' }), 2);
});
