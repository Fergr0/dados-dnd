import NumberField from './NumberField.jsx';
import Icon from './Icon.jsx';
import { ABILITIES, SKILLS } from '../data.js';
import { abilityMod, fmtMod } from '../dice.js';
import { saveBonus, skillBonus, tokenValues } from '../character.js';

const PROF_NAME = ['sin competencia', 'competente', 'pericia'];

export default function CharacterScreen({ character: c, update, roll, state, setState }) {
  const vals = tokenValues(c);

  const setAbility = (key, v) =>
    update((cur) => ({ abilities: { ...cur.abilities, [key]: Math.min(30, Math.max(1, v)) } }));

  const toggleSave = (key) =>
    update((cur) => ({
      saves: cur.saves.includes(key) ? cur.saves.filter((k) => k !== key) : [...cur.saves, key],
    }));

  const cycleSkill = (key) =>
    update((cur) => ({
      skillProf: { ...cur.skillProf, [key]: ((cur.skillProf[key] || 0) + 1) % 3 },
    }));

  const setSetting = (key, value) =>
    setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));

  return (
    <>
      <p className="legend">
        <span className="legend-dot" /> Todo lo naranja se puede tocar para tirar
      </p>

      <section className="quick">
        <div className="qstat">
          <Icon name="shield" size={20} />
          <strong>{fmtMod(vals.prof)}</strong>
          <small>Competencia</small>
        </div>
        <button
          type="button"
          className="qstat roll"
          onClick={() => roll({ label: 'Ataque de conjuro', formula: `1d20${fmtMod(vals.atq)}` })}
        >
          <Icon name="target" size={20} />
          <strong>{fmtMod(vals.atq)}</strong>
          <small>Ataque conj.</small>
        </button>
        <div className="qstat">
          <Icon name="star" size={20} />
          <strong>{vals.cd}</strong>
          <small>CD conjuros</small>
        </div>
        <button
          type="button"
          className="qstat roll"
          onClick={() => roll({ label: 'Iniciativa', formula: `1d20${fmtMod(vals.des)}` })}
        >
          <Icon name="bolt" size={20} />
          <strong>{fmtMod(vals.des)}</strong>
          <small>Iniciativa</small>
        </button>
      </section>

      <section>
        <h2 className="section-title">Características</h2>
        <div className="abilities">
          {ABILITIES.map((a) => {
            const score = c.abilities[a.key];
            const mod = abilityMod(score);
            return (
              <div className={`ability ab-${a.key}`} key={a.key}>
                <span className="ability-name">{a.name}</span>
                <button
                  type="button"
                  className="ability-mod"
                  aria-label={`Prueba de ${a.name} ${fmtMod(mod)}`}
                  onClick={() =>
                    roll({ label: `Prueba de ${a.name}`, formula: `1d20${fmtMod(mod)}` })
                  }
                >
                  {fmtMod(mod)}
                </button>
                <div className="score">
                  <button
                    type="button"
                    aria-label={`Bajar ${a.name}`}
                    onClick={() => setAbility(a.key, score - 1)}
                  >
                    <Icon name="minus" size={16} stroke={2.4} />
                  </button>
                  <NumberField
                    label={`Valor de ${a.name}`}
                    value={score}
                    min={1}
                    max={30}
                    onChange={(v) => setAbility(a.key, v)}
                  />
                  <button
                    type="button"
                    aria-label={`Subir ${a.name}`}
                    onClick={() => setAbility(a.key, score + 1)}
                  >
                    <Icon name="plus" size={16} stroke={2.4} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Salvaciones</h2>
        <div className="saves">
          {ABILITIES.map((a) => {
            const bonus = saveBonus(c, a.key);
            const proficient = c.saves.includes(a.key);
            return (
              <div className={`save ab-${a.key} ${proficient ? 'prof' : ''}`} key={a.key}>
                <button
                  type="button"
                  className="pip"
                  data-level={proficient ? 1 : 0}
                  aria-pressed={proficient}
                  aria-label={`Competencia en salvación de ${a.name}`}
                  onClick={() => toggleSave(a.key)}
                />
                <button
                  type="button"
                  className="save-roll"
                  onClick={() =>
                    roll({ label: `Salvación de ${a.name}`, formula: `1d20${fmtMod(bonus)}` })
                  }
                >
                  <span className="abbr">{a.abbr}</span>
                  <strong className="bonus">{fmtMod(bonus)}</strong>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Habilidades</h2>
        <p className="hint pips-legend">
          <span className="pip mini" data-level="0" /> nada
          <span className="pip mini" data-level="1" /> competente
          <span className="pip mini" data-level="2" /> pericia
        </p>
        <div className="list">
          {SKILLS.map((s) => {
            const bonus = skillBonus(c, s);
            const level = c.skillProf[s.key] || 0;
            const abbr = ABILITIES.find((a) => a.key === s.ability).abbr;
            return (
              <div className={`skill ab-${s.ability}`} key={s.key}>
                <button
                  type="button"
                  className="pip"
                  data-level={level}
                  aria-label={`${s.name}: ${PROF_NAME[level]}. Toca para cambiar`}
                  onClick={() => cycleSkill(s.key)}
                />
                <button
                  type="button"
                  className="skill-roll"
                  onClick={() => roll({ label: s.name, formula: `1d20${fmtMod(bonus)}` })}
                >
                  <span className="skill-name">{s.name}</span>
                  <span className="ab-tag">{abbr}</span>
                  <strong className="bonus">{fmtMod(bonus)}</strong>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <details className="card fold">
        <summary>
          <Icon name="gear" size={20} />
          <span>Ajustes</span>
          <Icon name="chevron" size={18} />
        </summary>
        <label className="switch">
          <span>Animación del dado</span>
          <input
            type="checkbox"
            checked={state.settings.animation}
            onChange={(e) => setSetting('animation', e.target.checked)}
          />
        </label>
        <label className="switch">
          <span>Vibrar al tirar</span>
          <input
            type="checkbox"
            checked={state.settings.vibration}
            onChange={(e) => setSetting('vibration', e.target.checked)}
          />
        </label>
        <p className="hint">Los datos se guardan solo en este dispositivo.</p>
      </details>
    </>
  );
}
