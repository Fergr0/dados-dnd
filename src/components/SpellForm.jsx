import { useState } from 'react';
import { parseFormula } from '../dice.js';
import { resolveFormula } from '../character.js';
import { uid } from '../data.js';
import Icon from './Icon.jsx';

export default function SpellForm({ initial, character, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(() =>
    initial
      ? JSON.parse(JSON.stringify(initial))
      : {
          id: uid(),
          name: '',
          level: 0,
          note: '',
          rolls: [{ id: uid(), label: 'Ataque', formula: '1d20+@atq' }],
        },
  );

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setRoll = (id, patch) =>
    setDraft((d) => ({ ...d, rolls: d.rolls.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const addRoll = () =>
    setDraft((d) => ({ ...d, rolls: [...d.rolls, { id: uid(), label: 'Daño', formula: '' }] }));
  const removeRoll = (id) =>
    setDraft((d) => ({ ...d, rolls: d.rolls.filter((r) => r.id !== id) }));

  const errors = draft.rolls.map((r) => parseFormula(resolveFormula(r.formula, character)).error || null);
  const canSave = draft.name.trim().length > 0 && errors.every((e) => e === null);

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      note: draft.note.trim(),
      level: Number(draft.level),
      rolls: draft.rolls.map((r) => ({ ...r, label: r.label.trim() || 'Tirada', formula: r.formula.trim() })),
    });
  };

  const remove = () => {
    if (window.confirm(`¿Eliminar "${draft.name || 'este hechizo'}"?`)) onDelete(draft.id);
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <form
        className="sheet tall"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Editar hechizo' : 'Nuevo hechizo'}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <span className="grabber" />
        <h2>{initial ? 'Editar hechizo' : 'Nuevo hechizo'}</h2>

        <label className="field">
          <span>Nombre</span>
          <input value={draft.name} onChange={(e) => set({ name: e.target.value })} autoFocus={!initial} />
        </label>

        <div className="grid2">
          <label className="field">
            <span>Nivel</span>
            <select value={draft.level} onChange={(e) => set({ level: e.target.value })}>
              <option value={0}>Truco</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  Nivel {n}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Nota</span>
            <input
              value={draft.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="Salvación DES, área…"
            />
          </label>
        </div>

        <h3 className="sub">Tiradas</h3>
        {draft.rolls.map((r, i) => (
          <div className="roll-edit" key={r.id}>
            <input
              aria-label="Nombre de la tirada"
              value={r.label}
              onChange={(e) => setRoll(r.id, { label: e.target.value })}
              placeholder="Daño"
            />
            <input
              className="mono"
              aria-label="Fórmula"
              value={r.formula}
              onChange={(e) => setRoll(r.id, { formula: e.target.value })}
              placeholder="2d10+@mod"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="icon-btn ghost"
              aria-label="Quitar tirada"
              onClick={() => removeRoll(r.id)}
            >
              <Icon name="x" size={18} stroke={2.4} />
            </button>
            {errors[i] && <p className="err">{errors[i]}</p>}
          </div>
        ))}
        <button type="button" className="btn dashed" onClick={addRoll}>
          <Icon name="plus" size={18} stroke={2.4} /> Añadir tirada
        </button>
        <p className="hint">
          Atajos: @atq (ataque de conjuro), @mod (mod. de conjuros), @prof (competencia), @nivel,
          @fue @des @con @int @sab @car. Se actualizan solos al subir de nivel.
        </p>

        <div className="btn-row">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn primary grow" disabled={!canSave}>
            Guardar
          </button>
        </div>
        {initial && (
          <button type="button" className="btn danger wide" onClick={remove}>
            <Icon name="trash" size={18} /> Eliminar hechizo
          </button>
        )}
      </form>
    </div>
  );
}
