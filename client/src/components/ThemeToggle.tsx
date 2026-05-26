import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
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
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
