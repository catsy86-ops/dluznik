import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Tryb jasny' : 'Tryb ciemny'}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '5px 8px',
        fontSize: '16px',
        cursor: 'pointer',
        lineHeight: 1,
        transition: 'all 0.2s',
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
