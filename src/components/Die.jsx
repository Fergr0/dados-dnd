// Silueta de cada dado en un lienzo de 100x100
const SHAPES = {
  4: <polygon points="50,8 94,88 6,88" />,
  6: <rect x="12" y="12" width="76" height="76" rx="14" />,
  8: <polygon points="50,4 94,50 50,96 6,50" />,
  10: <polygon points="50,4 94,42 50,96 6,42" />,
  12: <polygon points="50,5 95,38 78,92 22,92 5,38" />,
  20: <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />,
};

export default function Die({ sides = 20, className = '', children }) {
  return (
    <span className={`dshape s${sides} ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {SHAPES[sides] || <circle cx="50" cy="50" r="44" />}
      </svg>
      <span className="dshape-v">{children}</span>
    </span>
  );
}
