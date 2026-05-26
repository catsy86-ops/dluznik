import type { PasswordStrength } from '../hooks/usePasswordValidation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  requirements: Array<{ id: string; label: string; met: boolean }>;
  score: number;
}

export default function PasswordStrengthIndicator({
  strength,
  requirements,
  score,
}: PasswordStrengthIndicatorProps) {
  const getStrengthColor = () => {
    switch (strength) {
      case 'Słabe':
        return '#ef4444';
      case 'Średnie':
        return '#f59e0b';
      case 'Silne':
        return '#10b981';
    }
  };

  const progressPercentage = (score / requirements.length) * 100;

  return (
    <div style={{ marginTop: '12px' }}>
      {/* Strength label and progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
            Siła hasła:
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: getStrengthColor(),
            }}
          >
            {strength}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg3)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: getStrengthColor(),
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {requirements.map(req => (
          <div
            key={req.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: req.met ? '#10b981' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '14px' }}>{req.met ? '✓' : '○'}</span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
