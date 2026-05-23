import { useEffect, useState } from 'react';
import type { LoanHealthScoreResponse } from '../api';
import { loansApi } from '../api';

interface LoanHealthScoreComponentProps {
  loanId: string;
}

export default function LoanHealthScoreComponent({ loanId }: LoanHealthScoreComponentProps) {
  const [health, setHealth] = useState<LoanHealthScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.getHealthScore(loanId);
        setHealth(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ color: 'var(--danger)', fontSize: '14px' }}>⚠️ {error || 'Brak danych'}</div>
      </div>
    );
  }

  // SVG Progress Ring
  const radius = 45;
  const circumference = health.progressRing.circumference;
  const offset = health.progressRing.offset;

  return (
    <div className="card">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Progress Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="6"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={health.color}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.6s ease',
                  }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '800', color: health.color }}>
                  {health.score}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  /100
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: `${health.color}20`,
                  color: health.color,
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {health.status === 'healthy'
                  ? '✓ Zdrowotna'
                  : health.status === 'fair'
                  ? '⚠️ Średnia'
                  : health.status === 'atrisk'
                  ? '🔴 Zagrożona'
                  : '🚨 Krytyczna'}
              </div>
            </div>
          </div>

          {/* Component Details */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                Składniki Wyniku
              </div>
              {[
                { ...health.components.overdue, icon: '📅' },
                { ...health.components.balance, icon: '💰' },
                { ...health.components.velocity, icon: '⚡' },
              ].map((component) => (
                <div
                  key={component.label}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '10px',
                    padding: '10px',
                    background: 'var(--bg3)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '16px', flexShrink: 0 }}>{component.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      {component.label}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
                      {component.message}
                    </div>
                    <div style={{ background: 'var(--bg2)', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${component.score}%`,
                          background: 'var(--primary)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    {component.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            background: `${health.color}15`,
            border: `1px solid ${health.color}40`,
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '13px', color: health.color, fontWeight: '700' }}>
            {health.summary}
          </div>
        </div>

        {/* Recommendations */}
        {health.recommendations.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
              💡 Rekomendacje
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {health.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: '6px', listStyle: 'none', paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
