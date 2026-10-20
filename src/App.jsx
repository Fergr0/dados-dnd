import { useState } from 'react';
import { useStore } from './store.js';
import { resolveFormula } from './character.js';
import { rollFormula, formatDetail } from './dice.js';
import { uid, newCharacter } from './data.js';
import CharacterScreen from './components/CharacterScreen.jsx';
import SpellsScreen from './components/SpellsScreen.jsx';
import DiceScreen from './components/DiceScreen.jsx';
import HistoryScreen from './components/HistoryScreen.jsx';
import RollSheet from './components/RollSheet.jsx';
import CharacterForm from './components/CharacterForm.jsx';
import Icon from './components/Icon.jsx';

const TABS = [
  { id: 'character', label: 'Personaje', icon: 'user' },
  { id: 'spells', label: 'Conjuros', icon: 'spark' },
  { id: 'dice', label: 'Dados', icon: 'dice' },
  { id: 'history', label: 'Historial', icon: 'clock' },
];

const MODES = [
  { id: 'normal', label: 'Normal', icon: 'equal' },
  { id: 'adv', label: 'Ventaja', icon: 'up' },
  { id: 'dis', label: 'Desventaja', icon: 'down' },
];

export default function App() {
  const [state, setState] = useStore();
  const [tab, setTab] = useState('character');
  const [sheet, setSheet] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | 'edit'

  const character =
    state.characters.find((c) => c.id === state.activeId) || state.characters[0];

  const update = (patch) =>
    setState((s) => ({
      ...s,
      characters: s.characters.map((c) =>
        c.id === character.id
          ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) }
          : c,
      ),
    }));

  const roll = ({ label, formula, mode }) => {
    const resolved = resolveFormula(formula, character);
    const result = rollFormula(resolved, { mode: mode || state.mode });
    if (result.error) {
      setSheet({ key: uid(), error: result.error, label });
      return;
    }
    const entry = {
      id: uid(),
      ts: Date.now(),
      who: character.name,
      label,
      formula: resolved,
      mode: result.mode,
      total: result.total,
      detail: formatDetail(result),
      crit: result.crit,
    };
    setState((s) => ({ ...s, history: [entry, ...s.history].slice(0, 100) }));
    setSheet({ ...entry, key: entry.id, result });
    if (state.settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(result.crit === 'crit' ? [40, 40, 80] : 25);
    }
  };

  const addCharacter = () => {
    const created = newCharacter();
    setState((s) => ({ ...s, characters: [...s.characters, created], activeId: created.id }));
    setTab('character');
    setEditing('new');
  };

  const removeCharacter = () => {
    setState((s) => {
      const rest = s.characters.filter((x) => x.id !== character.id);
      return rest.length ? { ...s, characters: rest, activeId: rest[0].id } : s;
    });
    setEditing(null);
  };

  const shared = { character, update, roll, state, setState };
  const name = character.name || 'Sin nombre';
  const subtitle = [character.className, `Nivel ${character.level}`].filter(Boolean).join(' · ');

  return (
    <div className={`app mode-${state.mode}`}>
      <header className="top">
        <div className="hero">
          <div className="avatar" aria-hidden="true">
            {name.trim().charAt(0).toUpperCase() || '?'}
          </div>
          <label className="hero-info">
            <span className="hero-name">
              {name}
              {state.characters.length > 1 && <Icon name="chevron" size={18} stroke={2.4} />}
            </span>
            <span className="hero-sub">{subtitle}</span>
            <select
              aria-label="Cambiar de personaje"
              value={character.id}
              onChange={(e) => setState((s) => ({ ...s, activeId: e.target.value }))}
            >
              {state.characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || 'Sin nombre'}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="icon-btn ghost"
            aria-label="Editar personaje"
            onClick={() => setEditing('edit')}
          >
            <Icon name="edit" />
          </button>
          <button type="button" className="icon-btn" aria-label="Nuevo personaje" onClick={addCharacter}>
            <Icon name="plus" />
          </button>
        </div>

        <div className="modes" role="group" aria-label="Modo de tirada">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`mode-btn ${m.id} ${state.mode === m.id ? 'on' : ''}`}
              aria-pressed={state.mode === m.id}
              onClick={() => setState((s) => ({ ...s, mode: m.id }))}
            >
              <Icon name={m.icon} size={18} stroke={2.2} />
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <main className="screen" key={tab}>
        {tab === 'character' && <CharacterScreen {...shared} />}
        {tab === 'spells' && <SpellsScreen {...shared} />}
        {tab === 'dice' && <DiceScreen {...shared} />}
        {tab === 'history' && <HistoryScreen {...shared} />}
      </main>

      <nav className="tabbar" aria-label="Secciones">
        {TABS.slice(0, 2).map((t) => (
          <TabButton key={t.id} t={t} on={tab === t.id} onClick={() => setTab(t.id)} />
        ))}
        <button
          type="button"
          className="fab"
          aria-label="Tirar un d20"
          onClick={() => roll({ label: 'd20', formula: '1d20' })}
        >
          <span className="fab-die">
            <Icon name="d20" size={30} stroke={2} />
          </span>
          <span className="fab-label">d20</span>
        </button>
        {TABS.slice(2).map((t) => (
          <TabButton key={t.id} t={t} on={tab === t.id} onClick={() => setTab(t.id)} />
        ))}
      </nav>

      {editing && (
        <CharacterForm
          character={character}
          isNew={editing === 'new'}
          canDelete={state.characters.length > 1}
          update={update}
          onDelete={removeCharacter}
          onClose={() => setEditing(null)}
        />
      )}

      <RollSheet
        sheet={sheet}
        animate={state.settings.animation}
        onClose={() => setSheet(null)}
        onReroll={() =>
          sheet &&
          !sheet.error &&
          roll({ label: sheet.label, formula: sheet.formula, mode: sheet.mode })
        }
      />
    </div>
  );
}

function TabButton({ t, on, onClick }) {
  return (
    <button
      type="button"
      className={`tab ${on ? 'on' : ''}`}
      aria-current={on ? 'page' : undefined}
      onClick={onClick}
    >
      <span className="tab-icon">
        <Icon name={t.icon} size={22} />
      </span>
      <span>{t.label}</span>
    </button>
  );
}
