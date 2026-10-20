import { useEffect, useState } from 'react';

// Campo numérico que permite borrar y escribir sin saltos raros.
export default function NumberField({ value, min, max, onChange, label, className }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      className={className}
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseInt(e.target.value, 10);
        if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
      }}
      onBlur={() => setText(String(value))}
    />
  );
}
