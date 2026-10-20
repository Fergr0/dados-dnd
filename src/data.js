export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export const ABILITIES = [
  { key: 'str', abbr: 'FUE', name: 'Fuerza' },
  { key: 'dex', abbr: 'DES', name: 'Destreza' },
  { key: 'con', abbr: 'CON', name: 'Constitución' },
  { key: 'int', abbr: 'INT', name: 'Inteligencia' },
  { key: 'wis', abbr: 'SAB', name: 'Sabiduría' },
  { key: 'cha', abbr: 'CAR', name: 'Carisma' },
];

export const SKILLS = [
  { key: 'acrobatics', name: 'Acrobacias', ability: 'dex' },
  { key: 'arcana', name: 'Arcanos', ability: 'int' },
  { key: 'athletics', name: 'Atletismo', ability: 'str' },
  { key: 'stealth', name: 'Sigilo', ability: 'dex' },
  { key: 'history', name: 'Historia', ability: 'int' },
  { key: 'performance', name: 'Interpretación', ability: 'cha' },
  { key: 'intimidation', name: 'Intimidación', ability: 'cha' },
  { key: 'investigation', name: 'Investigación', ability: 'int' },
  { key: 'sleight', name: 'Juego de manos', ability: 'dex' },
  { key: 'medicine', name: 'Medicina', ability: 'wis' },
  { key: 'nature', name: 'Naturaleza', ability: 'int' },
  { key: 'perception', name: 'Percepción', ability: 'wis' },
  { key: 'insight', name: 'Perspicacia', ability: 'wis' },
  { key: 'persuasion', name: 'Persuasión', ability: 'cha' },
  { key: 'religion', name: 'Religión', ability: 'int' },
  { key: 'survival', name: 'Supervivencia', ability: 'wis' },
  { key: 'animal', name: 'Trato con animales', ability: 'wis' },
  { key: 'deception', name: 'Engaño', ability: 'cha' },
];

// En las fórmulas se pueden usar: @atq @mod @prof @nivel @fue @des @con @int @sab @car
export function defaultCharacter() {
  return {
    id: 'mago-ejemplo',
    name: 'Mago de ejemplo',
    className: 'Mago',
    level: 5,
    castAbility: 'int',
    abilities: { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 },
    saves: ['int', 'wis'],
    skillProf: { arcana: 1, history: 1, investigation: 1 },
    spells: [
      {
        id: 'rayo-fuego',
        name: 'Rayo de fuego',
        level: 0,
        note: 'Ataque de conjuro a distancia',
        rolls: [
          { id: 'rf-1', label: 'Ataque', formula: '1d20+@atq' },
          { id: 'rf-2', label: 'Daño', formula: '2d10' },
        ],
      },
      {
        id: 'proyectil-magico',
        name: 'Proyectil mágico',
        level: 1,
        note: 'Tres dardos, impacto automático',
        rolls: [{ id: 'pm-1', label: 'Daño (3 dardos)', formula: '3d4+3' }],
      },
      {
        id: 'manos-ardientes',
        name: 'Manos ardientes',
        level: 1,
        note: 'Salvación de Destreza',
        rolls: [{ id: 'ma-1', label: 'Daño', formula: '3d6' }],
      },
      {
        id: 'bola-fuego',
        name: 'Bola de fuego',
        level: 3,
        note: 'Salvación de Destreza, área',
        rolls: [{ id: 'bf-1', label: 'Daño', formula: '8d6' }],
      },
    ],
  };
}

export function newCharacter() {
  return {
    id: uid(),
    name: 'Nuevo personaje',
    className: '',
    level: 1,
    castAbility: 'int',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saves: [],
    skillProf: {},
    spells: [],
  };
}
