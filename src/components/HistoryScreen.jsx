import { useState } from 'react';
import Die from './Die.jsx';
import Icon from './Icon.jsx';

const MODE_LABEL = { adv: 'Ventaja', dis: 'Desventaja' };

function when(ts) {
  const d = new Date(ts);
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${time}`;
}

export default function HistoryScreen({ state, setState, roll }) {
  const [who, setWho] = useState('');
  const names = [...new Set(state.history.map((h) => h.who))];
  const list = who ? state.history.filter((h) => h.who === who) : state.history;

  const clear = () => {
    if (window.confirm('¿Borrar todo el historial?')) {
      setState((s) => ({ ...s, history: [] }));
      setWho('');
    }
  };

  if (state.history.length === 0) {
    return (
      <div className="empty">
        <span className="empty-icon">
          <Icon name="clock" size={40} />
        </span>
        <p>Todavía no has hecho ninguna tirada.</p>
        <p className="hint">Prueba el botón d20 de abajo.</p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        {names.length > 1 && (
          <select aria-label="Filtrar por personaje" value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="">Todos los personajes</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}
        <span className="hint grow">Toca una tirada para repetirla</span>
        <button type="button" className="icon-btn danger" aria-label="Borrar historial" onClick={clear}>
          <Icon name="trash" size={20} />
        </button>
      </div>

      <div className="hist-list">
        {list.map((h) => (
          <button
            type="button"
            className={`hist ${h.crit || ''}`}
            key={h.id}
            onClick={() => roll({ label: h.label, formula: h.formula, mode: h.mode })}
          >
            <Die sides={20} className="hist-total">
              {h.total}
            </Die>
            <span className="hist-body">
              <span className="hist-title">
                <strong>{h.label}</strong>
                {h.crit === 'crit' && <span className="tag crit">Crítico</span>}
                {h.crit === 'fumble' && <span className="tag fumble">Pifia</span>}
                {MODE_LABEL[h.mode] && <span className={`tag ${h.mode}`}>{MODE_LABEL[h.mode]}</span>}
              </span>
              <small className="mono">{h.detail}</small>
              <small className="muted">
                {h.who} · {when(h.ts)}
              </small>
            </span>
            <span className="hist-again">
              <Icon name="refresh" size={20} />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
