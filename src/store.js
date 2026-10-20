import { useEffect, useState } from 'react';
import { defaultCharacter } from './data.js';

const KEY = 'dados-dnd:v1';

function initialState() {
  const first = defaultCharacter();
  return {
    characters: [first],
    activeId: first.id,
    history: [],
    mode: 'normal',
    settings: { animation: true, vibration: true },
  };
}

function load() {
  const base = initialState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.characters) || saved.characters.length === 0) return base;
    return {
      ...base,
      ...saved,
      settings: { ...base.settings, ...(saved.settings || {}) },
      history: Array.isArray(saved.history) ? saved.history : [],
    };
  } catch {
    return base;
  }
}

// Todo se guarda en el propio dispositivo (localStorage), sin servidor.
export function useStore() {
  const [state, setState] = useState(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // almacenamiento lleno o bloqueado: la app sigue funcionando sin guardar
    }
  }, [state]);
  return [state, setState];
}
