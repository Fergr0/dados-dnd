import { useState } from 'react';
import Die from './Die.jsx';
import Icon from './Icon.jsx';
import { fmtMod } from '../dice.js';

const DICE = [4, 6, 8, 10, 12, 20, 100];

export default function DiceScreen({ roll }) {
  const [pool, setPool] = useState({});
  const [mod, setMod] = useState(0);
  const [custom, setCustom] = useState('');

  const parts = DICE.filter((s) => pool[s] > 0).map((s) => `${pool[s]}d${s}`);
  const formula = parts.length ? parts.join('+') + (mod ? fmtMod(mod) : '') : '';

  const add = (s) => setPool((p) => ({ ...p, [s]: Math.min(20, (p[s] || 0) + 1) }));
  const remove = (s) => setPool((p) => ({ ...p, [s]: Math.max(0, (p[s] || 0) - 1) }));
  const clear = () => {
    setPool({});
    setMod(0);
  };
  const bump = (n) => setMod((m) => Math.max(-30, Math.min(30, m + n)));

  return (
    <>
      <section className="card">
        <h2 className="section-title">Elige tus dados</h2>
        <div className="dice-grid">
          {DICE.map((s) => (
            <button
              type="button"
              className={`die-pick ${pool[s] ? 'has' : ''}`}
              key={s}
              aria-label={`Añadir un d${s}${pool[s] ? `, llevas ${pool[s]}` : ''}`}
              onClick={() => add(s)}
            >
              <Die sides={s}>{s === 100 ? '%' : s}</Die>
              <span className="die-pick-name">d{s}</span>
              {pool[s] > 0 && <span className="count">×{pool[s]}</span>}
            </button>
          ))}
        </div>

        <div className="pool" aria-live="polite">
          {parts.length === 0 ? (
            <span className="hint">Toca un dado para añadirlo a la tirada.</span>
          ) : (
            DICE.filter((s) => pool[s] > 0).map((s) => (
              <button
                type="button"
                className="pool-chip"
                key={s}
                aria-label={`Quitar un d${s}`}
                onClick={() => remove(s)}
              >
                {pool[s]}d{s}
                <Icon name="x" size={14} stroke={2.6} />
              </button>
            ))
          )}
        </div>

        <div className="stepper">
          <span>Modificador</span>
          <button type="button" className="step" aria-label="Restar 1" onClick={() => bump(-1)}>
            <Icon name="minus" size={20} stroke={2.4} />
          </button>
          <strong className={mod > 0 ? 'pos' : mod < 0 ? 'neg' : ''}>{fmtMod(mod)}</strong>
          <button type="button" className="step" aria-label="Sumar 1" onClick={() => bump(1)}>
            <Icon name="plus" size={20} stroke={2.4} />
          </button>
        </div>

        <div className="btn-row">
          <button type="button" className="btn" onClick={clear} disabled={!formula && !mod}>
            Limpiar
          </button>
          <button
            type="button"
            className="btn primary grow"
            disabled={!formula}
            onClick={() => roll({ label: 'Dados libres', formula })}
          >
            <Icon name="d20" size={22} />
            {formula ? `Tirar ${formula}` : 'Tirar'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Escribir fórmula</h2>
        <form
          className="toolbar"
          onSubmit={(e) => {
            e.preventDefault();
            roll({ label: 'Fórmula', formula: custom });
          }}
        >
          <input
            className="mono"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="2d6+1d8+3"
            aria-label="Fórmula de tirada"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit" className="btn primary" disabled={!custom.trim()}>
            Tirar
          </button>
        </form>
        <p className="hint">También vale @atq, @mod, @prof, @fue, @des…</p>
      </section>
    </>
  );
}
