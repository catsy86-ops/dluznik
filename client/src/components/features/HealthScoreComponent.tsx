// @ts-nocheck
import { useEffect, useState } from 'react';
import type { LoanHealthScoreResponse } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loanId: string;
  onError?: (error: string) => void;
}

export default function HealthScoreComponent({ loanId, onError }: Props) {
  const [healthScore, setHealthScore] = useState<LoanHealthScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loansApi.healthScore(loanId);
        setHealthScore(data);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) return <div className="card" style={{ padding: '20px', textAlign: 'center' }}><span className="spinner" /></div>;
  if (!healthScore) return null;

  const ProgressRing = ({ score, maxScore }: { score: number; maxScore: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = ((maxScore - score) / maxScore) * circumference;
    
    const getColor = () => {
      if (score >= 81) return '#10b981';
      if (score >= 61) return '#f59e0b';
      if (score >= 31) return '#f97316';
      return '#ef4444';
    };

    return (
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--bg3)"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 8px ${getColor()}33)`,
          }}
        />
        <text x="70" y="70" textAnchor="middle" dy="0.3em" fontSize="32" fontWeight="800" fill="var(--text)">
          {score}
        </text>
        <text x="70" y="90" textAnchor="middle" fontSize="12" fill="var(--text-muted)">
          {healthScore.status === 'healthy' ? 'Zdrowa' : healthScore.status === 'fair' ? 'Uczciwa' : healthScore.status === 'atrisk' ? 'Zagrożona' : 'Krytyczna'}
        </text>
      </svg>
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') return '✓';
    if (status === 'fair') return '!';
    if (status === 'atrisk') return '⚠';
    return '✕';
  };

  const getStatusEmoji = (status: string) => {
    if (status === 'healthy') return '🟢';
    if (status === 'fair') return '🟡';
    if (status === 'atrisk') return '🟠';
    return '🔴';
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>❤️</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Kondycja pożyczki</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Analiza zdrowotności</p>
        </div>
      </div>

      {/* Large score ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <ProgressRing score={healthScore.score} maxScore={100} />
      </div>

      {/* Summary message */}
      <div style={{
        background: healthScore.color + '15',
        border: `1px solid ${healthScore.color}40`,
        borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: healthScore.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <span>{getStatusEmoji(healthScore.status)}</span>
          {healthScore.status === 'healthy' ? 'Pożyczka jest zdrowa' : healthScore.status === 'fair' ? 'Pożyczka wymaga uwagi' : healthScore.status === 'atrisk' ? 'Pożyczka jest zagrożona' : 'Pożyczka jest krytyczna'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {healthScore.summary}
        </div>
      </div>

      {/* Component scores */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Składniki wyniku
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
          {[
            { key: 'overdue' as const, label: 'Termin', data: healthScore.components.overdue, icon: '📅' },
            { key: 'balance' as const, label: 'Saldo', data: healthScore.components.balance, icon: '💰' },
            { key: 'velocity' as const, label: 'Tempo', data: healthScore.components.velocity, icon: '⚡' },
          ].map(component => (
            <div key={component.key} style={{
              background: 'var(--bg3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border2)',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>{component.icon}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                {component.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
                {component.data.score}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {component.data.weight}% wagi
              </div>
              {/* Mini progress bar */}
              <div style={{ background: 'var(--bg2)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{
                  background: 'var(--primary)', height: '100%',
                  width: `${component.data.score}%`, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed breakdown */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Szczegóły
        </h4>
        
        {/* Overdue status */}
        <div style={{
          background: 'var(--bg3)', padding: '12px', borderRadius: '10px', marginBottom: '10px',
          border: '1px solid var(--border2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px' }}>📅 Termin spłaty</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
              {healthScore.components.overdue.daysToOverdue} dni
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {healthScore.components.overdue.message}
          </div>
        </div>

        {/* Balance status */}
        <div style={{
          background: 'var(--bg3)', padding: '12px', borderRadius: '10px', marginBottom: '10px',
          border: '1px solid var(--border2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px' }}>💰 Saldo</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
              {healthScore.components.balance.percentageRemaining.toFixed(1)}%
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {healthScore.components.balance.message}
          </div>
        </div>

        {/* Payment velocity */}
        <div style={{
          background: 'var(--bg3)', padding: '12px', borderRadius: '10px',
          border: '1px solid var(--border2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px' }}>⚡ Tempo spłaty</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
              {healthScore.components.velocity.paymentVelocity.toFixed(1)}%/msc
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {healthScore.components.velocity.message}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {healthScore.recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            🎯 Rekomendacje
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {healthScore.recommendations.map((rec, idx) => (
              <div key={idx} style={{
                background: 'var(--bg3)', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid var(--border2)', fontSize: '12px', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
              }}>
                <span style={{ flexShrink: 0, marginTop: '2px' }}>•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
