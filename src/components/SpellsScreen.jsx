import { useMemo, useState } from 'react';
import SpellForm from './SpellForm.jsx';
import Icon from './Icon.jsx';
import { resolveFormula } from '../character.js';

const levelName = (n) => (n === 0 ? 'Trucos' : `Nivel ${n}`);

// Las tiradas con d20 son ataques; el resto, daño o efectos
const isAttack = (formula) => /(^|[^\d])1?d20/i.test(formula);

export default function SpellsScreen({ character: c, update, roll }) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | spell

  const levels = useMemo(
    () => [...new Set(c.spells.map((s) => s.level))].sort((a, b) => a - b),
    [c.spells],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = c.spells.filter(
      (s) => s.name.toLowerCase().includes(q) && (level === null || s.level === level),
    );
    const present = [...new Set(list.map((s) => s.level))].sort((a, b) => a - b);
    return present.map((l) => ({ level: l, spells: list.filter((s) => s.level === l) }));
  }, [c.spells, query, level]);

  const saveSpell = (spell) => {
    update((cur) => {
      const exists = cur.spells.some((s) => s.id === spell.id);
      return {
        spells: exists
          ? cur.spells.map((s) => (s.id === spell.id ? spell : s))
          : [...cur.spells, spell],
      };
    });
    setEditing(null);
  };

  const deleteSpell = (id) => {
    update((cur) => ({ spells: cur.spells.filter((s) => s.id !== id) }));
    setEditing(null);
  };

  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={20} />
          <input
            type="search"
            placeholder="Buscar hechizo"
            aria-label="Buscar hechizo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="button" className="btn primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={20} stroke={2.4} /> Nuevo
        </button>
      </div>

      {levels.length > 1 && (
        <div className="filters" role="group" aria-label="Filtrar por nivel">
          <button
            type="button"
            className={level === null ? 'on' : ''}
            aria-pressed={level === null}
            onClick={() => setLevel(null)}
          >
            Todos
          </button>
          {levels.map((l) => (
            <button
              type="button"
              key={l}
              className={level === l ? 'on' : ''}
              aria-pressed={level === l}
              onClick={() => setLevel(level === l ? null : l)}
            >
              {l === 0 ? 'Trucos' : `Nv ${l}`}
            </button>
          ))}
        </div>
      )}

      {c.spells.length === 0 && (
        <div className="empty">
          <span className="empty-icon">
            <Icon name="spark" size={40} />
          </span>
          <p>Aún no hay hechizos.</p>
          <button type="button" className="btn primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={20} stroke={2.4} /> Añadir el primero
          </button>
        </div>
      )}
      {c.spells.length > 0 && groups.length === 0 && (
        <p className="empty">Ningún hechizo coincide con la búsqueda.</p>
      )}

      {groups.map((g) => (
        <section key={g.level} className="spell-group">
          <h2 className="section-title">
            <span className="lvl-badge" data-lvl={g.level}>
              {g.level === 0 ? '∞' : g.level}
            </span>
            {levelName(g.level)}
          </h2>
          {g.spells.map((s) => (
            <article className="spell" key={s.id} data-lvl={s.level}>
              <header>
                <div>
                  <h3>{s.name}</h3>
                  {s.note && <p className="note">{s.note}</p>}
                </div>
                <button
                  type="button"
                  className="icon-btn ghost"
                  aria-label={`Editar ${s.name}`}
                  onClick={() => setEditing(s)}
                >
                  <Icon name="edit" size={20} />
                </button>
              </header>
              {s.rolls.length === 0 ? (
                <p className="hint">Sin tiradas guardadas.</p>
              ) : (
                <div className="actions">
                  {s.rolls.map((r) => {
                    const resolved = resolveFormula(r.formula, c);
                    const attack = isAttack(resolved);
                    return (
                      <button
                        type="button"
                        className={`action ${attack ? 'attack' : 'damage'}`}
                        key={r.id}
                        onClick={() => roll({ label: `${s.name} · ${r.label}`, formula: r.formula })}
                      >
                        <span className="action-icon">
                          <Icon name={attack ? 'target' : 'flame'} size={22} />
                        </span>
                        <span className="action-text">
                          <span>{r.label}</span>
                          <small>{resolved}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </section>
      ))}

      {editing && (
        <SpellForm
          initial={editing === 'new' ? null : editing}
          character={c}
          onSave={saveSpell}
          onDelete={deleteSpell}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
