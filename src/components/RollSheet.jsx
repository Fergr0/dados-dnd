import { useEffect, useState } from 'react';
import Die from './Die.jsx';
import Icon from './Icon.jsx';

const MODE_LABEL = { adv: 'Ventaja', dis: 'Desventaja' };

export default function RollSheet({ sheet, animate, onClose, onReroll }) {
  const [shown, setShown] = useState(0);
  const [doneKey, setDoneKey] = useState(null);

  const reduce =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animating = !!sheet && !sheet.error && animate && !reduce && doneKey !== sheet.key;

  const key = sheet ? sheet.key : null;
  useEffect(() => {
    if (!sheet || sheet.error || !animate || reduce) return undefined;
    const span = Math.max(20, Math.abs(sheet.total) * 2);
    const iv = setInterval(() => setShown(1 + Math.floor(Math.random() * span)), 60);
    const to = setTimeout(() => {
      clearInterval(iv);
      setDoneKey(sheet.key);
    }, 650);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, onClose]);

  if (!sheet) return null;

  if (sheet.error) {
    return (
      <div className="backdrop" onClick={onClose}>
        <div
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Error en la fórmula"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="grabber" />
          <span className="empty-icon err-icon">
            <Icon name="x" size={36} stroke={2.4} />
          </span>
          <h2>No se pudo tirar</h2>
          <p className="err">{sheet.error}</p>
          <button type="button" className="btn primary wide" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const r = sheet.result;
  const state = animating ? 'rolling' : `settled ${r.crit || ''}`;

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className={`sheet result ${animating ? '' : r.crit || ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Resultado de ${sheet.label}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="grabber" />
        <p className="sheet-label">{sheet.label}</p>
        <p className="sheet-formula">
          <span className="mono">{sheet.formula}</span>
          {MODE_LABEL[r.mode] && <span className={`tag ${r.mode}`}>{MODE_LABEL[r.mode]}</span>}
        </p>

        <div className={`big-roll ${state}`} key={sheet.key} aria-live="polite">
          {!animating && r.crit && <span className="burst" aria-hidden="true" />}
          <Die sides={20} className="big-die">
            {animating ? shown : r.total}
          </Die>
        </div>

        <div className="tags">
          {!animating && r.crit === 'crit' && <span className="banner crit">¡Crítico!</span>}
          {!animating && r.crit === 'fumble' && <span className="banner fumble">¡Pifia!</span>}
        </div>

        {!animating && (
          <div className="breakdown">
            {r.groups.map((g, gi) => {
              const keptIdx = g.all ? g.all.indexOf(g.rolls[0]) : -1;
              return (
                <div className="dice-line" key={gi}>
                  <span className="dice-label">
                    {g.sign < 0 ? '−' : gi > 0 ? '+' : ''}
                    {g.label}
                  </span>
                  {(g.all || g.rolls).map((v, i) => (
                    <Die
                      key={i}
                      sides={g.sides}
                      className={`mini-die ${g.all && i !== keptIdx ? 'dropped' : ''} ${
                        v === g.sides ? 'max' : ''
                      } ${v === 1 ? 'min' : ''}`}
                    >
                      {v}
                    </Die>
                  ))}
                </div>
              );
            })}
            {r.flat !== 0 && (
              <div className="dice-line">
                <span className="flat">
                  {r.flat > 0 ? '+' : '−'} {Math.abs(r.flat)}
                </span>
              </div>
            )}
            {r.modeIgnored && (
              <p className="hint">Ventaja y desventaja solo afectan a las tiradas con 1d20.</p>
            )}
          </div>
        )}

        <div className="btn-row">
          <button type="button" className="btn" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn primary grow" onClick={onReroll} disabled={animating}>
            <Icon name="refresh" size={20} /> Otra vez
          </button>
        </div>
      </div>
    </div>
  );
}
