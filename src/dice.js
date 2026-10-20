// Motor de dados: sin dependencias, probado en dice.test.js

export const abilityMod = (score) => Math.floor((Number(score) - 10) / 2);
export const profBonus = (level) => Math.ceil(Math.max(1, Number(level) || 1) / 4) + 1;
export const fmtMod = (n) => (n >= 0 ? `+${n}` : `${n}`);

const MAX_TERMS = 20;
const MAX_COUNT = 100;
const MAX_SIDES = 1000;

// Admite: 1d20+7, d20, 2d10, 8d6, 2d6+1d8-2, 3d4+3 ...
export function parseFormula(input) {
  const src = String(input ?? '').toLowerCase().replace(/\s+/g, '');
  if (!src) return { error: 'Escribe una fórmula, por ejemplo 1d20+5' };

  const re = /([+-]?)(?:(\d*)d(\d+)|(\d+))/y;
  const terms = [];
  let pos = 0;

  while (pos < src.length) {
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) return { error: `No entiendo "${src.slice(pos)}"` };
    if (terms.length > 0 && m[1] === '') {
      return { error: `Falta un + o - antes de "${src.slice(pos)}"` };
    }
    const sign = m[1] === '-' ? -1 : 1;

    if (m[3] !== undefined) {
      const count = m[2] === '' ? 1 : parseInt(m[2], 10);
      const sides = parseInt(m[3], 10);
      if (count < 1 || count > MAX_COUNT) {
        return { error: `La cantidad de dados debe estar entre 1 y ${MAX_COUNT}` };
      }
      if (sides < 2 || sides > MAX_SIDES) {
        return { error: `Los dados deben tener entre 2 y ${MAX_SIDES} caras` };
      }
      terms.push({ kind: 'dice', sign, count, sides });
    } else {
      terms.push({ kind: 'flat', sign, value: parseInt(m[4], 10) });
    }

    pos = re.lastIndex;
    if (terms.length > MAX_TERMS) return { error: 'Demasiados términos en la fórmula' };
  }

  if (!terms.some((t) => t.kind === 'dice')) {
    return { error: 'Incluye al menos un dado, por ejemplo d20' };
  }
  return { terms };
}

const randInt = (sides, rng) => Math.floor(rng() * sides) + 1;

// mode: 'normal' | 'adv' | 'dis'. Ventaja/desventaja solo afecta al primer 1d20 de la fórmula.
export function rollFormula(formula, { mode = 'normal', rng = Math.random } = {}) {
  const parsed = parseFormula(formula);
  if (parsed.error) return { error: parsed.error };
  const { terms } = parsed;

  const d20Index = terms.findIndex(
    (t) => t.kind === 'dice' && t.sides === 20 && t.count === 1 && t.sign === 1,
  );
  const useMode = mode !== 'normal' && d20Index !== -1;

  const groups = [];
  let flat = 0;
  let total = 0;

  terms.forEach((t, i) => {
    if (t.kind === 'flat') {
      flat += t.sign * t.value;
      total += t.sign * t.value;
      return;
    }
    let rolls;
    let all = null;
    if (i === d20Index && useMode) {
      const a = randInt(20, rng);
      const b = randInt(20, rng);
      all = [a, b];
      rolls = [mode === 'adv' ? Math.max(a, b) : Math.min(a, b)];
    } else {
      rolls = Array.from({ length: t.count }, () => randInt(t.sides, rng));
    }
    const subtotal = rolls.reduce((x, y) => x + y, 0);
    total += t.sign * subtotal;
    groups.push({
      label: `${t.count}d${t.sides}`,
      sides: t.sides,
      sign: t.sign,
      rolls,
      all,
      subtotal,
      isD20: i === d20Index,
    });
  });

  let crit = null;
  const d20 = groups.find((g) => g.isD20);
  if (d20) {
    if (d20.rolls[0] === 20) crit = 'crit';
    else if (d20.rolls[0] === 1) crit = 'fumble';
  }

  return {
    formula,
    mode: useMode ? mode : 'normal',
    modeIgnored: mode !== 'normal' && !useMode,
    groups,
    flat,
    total,
    crit,
  };
}

// Texto corto del desglose, p. ej. "1d20 [5, 17 → 17] + 7"
export function formatDetail(r) {
  const parts = r.groups.map((g, i) => {
    const body = g.all ? `${g.all.join(', ')} → ${g.rolls[0]}` : g.rolls.join(' + ');
    const sign = g.sign < 0 ? '− ' : i > 0 ? '+ ' : '';
    return `${sign}${g.label} [${body}]`;
  });
  if (r.flat !== 0) parts.push(`${r.flat > 0 ? '+' : '−'} ${Math.abs(r.flat)}`);
  return parts.join(' ');
}
