import { useEffect } from 'react';
import NumberField from './NumberField.jsx';
import Icon from './Icon.jsx';
import { ABILITIES } from '../data.js';

// Los cambios se aplican al momento; "Listo" solo cierra la hoja.
export default function CharacterForm({ character: c, isNew, canDelete, update, onDelete, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const remove = () => {
    if (window.confirm(`¿Eliminar a ${c.name || 'este personaje'} y todos sus hechizos?`)) onDelete();
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <form
        className="sheet tall"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Nuevo personaje' : 'Editar personaje'}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <span className="grabber" />
        <h2>{isNew ? 'Nuevo personaje' : 'Editar personaje'}</h2>

        <label className="field">
          <span>Nombre</span>
          <input
            value={c.name}
            onChange={(e) => update({ name: e.target.value })}
            onFocus={(e) => isNew && e.target.select()}
            placeholder="Nombre del personaje"
            autoFocus
          />
        </label>
        <div className="grid3">
          <label className="field">
            <span>Clase</span>
            <input
              value={c.className}
              onChange={(e) => update({ className: e.target.value })}
              placeholder="Mago"
            />
          </label>
          <label className="field">
            <span>Nivel</span>
            <NumberField
              label="Nivel"
              value={c.level}
              min={1}
              max={20}
              onChange={(v) => update({ level: v })}
            />
          </label>
          <label className="field">
            <span>Conjuros con</span>
            <select value={c.castAbility} onChange={(e) => update({ castAbility: e.target.value })}>
              {ABILITIES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.abbr}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isNew && (
          <p className="hint">
            Las características y competencias se ajustan después en la pantalla de Personaje.
          </p>
        )}

        <button type="submit" className="btn primary wide">
          Listo
        </button>
        {canDelete && (
          <button type="button" className="btn danger wide" onClick={remove}>
            <Icon name="trash" size={18} /> Eliminar personaje
          </button>
        )}
      </form>
    </div>
  );
}
