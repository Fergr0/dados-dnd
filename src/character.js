import { ABILITIES } from './data.js';
import { abilityMod, profBonus } from './dice.js';

// Valores que se pueden usar en las fórmulas con @
export function tokenValues(c) {
  const mods = Object.fromEntries(
    ABILITIES.map((a) => [a.abbr.toLowerCase(), abilityMod(c.abilities[a.key])]),
  );
  const prof = profBonus(c.level);
  const mod = abilityMod(c.abilities[c.castAbility]);
  return { ...mods, prof, nivel: Number(c.level) || 1, mod, atq: prof + mod, cd: 8 + prof + mod };
}

// "1d20+@atq" -> "1d20+7". Así las tiradas se actualizan solas al subir de nivel.
export function resolveFormula(formula, c) {
  const text = String(formula ?? '');
  if (!c) return text;
  const vals = tokenValues(c);
  const out = text.replace(/@([a-záéíóúñ]+)/gi, (match, key) => {
    const v = vals[key.toLowerCase()];
    if (v === undefined) return match;
    return v >= 0 ? `+${v}` : `${v}`;
  });
  return out.replace(/\+\+/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/--/g, '+');
}

export const saveBonus = (c, key) =>
  abilityMod(c.abilities[key]) + (c.saves.includes(key) ? profBonus(c.level) : 0);

export const skillBonus = (c, skill) =>
  abilityMod(c.abilities[skill.ability]) + profBonus(c.level) * (c.skillProf[skill.key] || 0);
