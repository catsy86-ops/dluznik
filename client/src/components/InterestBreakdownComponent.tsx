import { useEffect, useState } from 'react';
import type { InterestBreakdownResponse, RealTimeAccrualResponse } from '../api';
import { loansApi } from '../api';

interface InterestBreakdownComponentProps {
  loanId: string;
}

export default function InterestBreakdownComponent({ loanId }: InterestBreakdownComponentProps) {
  const [breakdown, setBreakdown] = useState<InterestBreakdownResponse | null>(null);
  const [accrual, setAccrual] = useState<RealTimeAccrualResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'breakdown' | 'accrual'>('breakdown');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bd, ac] = await Promise.all([
          loansApi.getInterestBreakdown(loanId),
          loansApi.getRealTimeAccrual(loanId),
        ]);
        setBreakdown(bd);
        setAccrual(ac);
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

  if (error || !breakdown || !accrual) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ color: 'var(--danger)', fontSize: '14px' }}>⚠️ {error || 'Brak danych'}</div>
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(n);

  return (
    <div className="card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '700' }}>📊 Rozkład Odsetek</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setViewMode('breakdown')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: viewMode === 'breakdown' ? 'var(--primary)' : 'var(--bg3)',
                color: viewMode === 'breakdown' ? '#fff' : 'var(--text)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Rozkład
            </button>
            <button
              onClick={() => setViewMode('accrual')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: viewMode === 'accrual' ? 'var(--primary)' : 'var(--bg3)',
                color: viewMode === 'accrual' ? '#fff' : 'var(--text)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Na bieżąco
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {viewMode === 'breakdown' ? (
          <div>
            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pożyczka</div>
                <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
                  {fmt(breakdown.originalBalance)}
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spłacone</div>
                <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px', color: 'var(--success)' }}>
                  {fmt(breakdown.paymentsMade)}
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pozostało</div>
                <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
                  {fmt(breakdown.currentBalance)}
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Odsetki</div>
                <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
                  {fmt(breakdown.interestAccrued)}
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 150px' }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <defs>
                    <linearGradient id="pieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={breakdown.pieChart.principal.color} />
                      <stop offset="100%" stopColor={breakdown.pieChart.interest.color} />
                    </linearGradient>
                  </defs>
                  {/* Principal segment */}
                  <circle
                    cx="75"
                    cy="75"
                    r="50"
                    fill="none"
                    stroke={breakdown.pieChart.principal.color}
                    strokeWidth="40"
                    strokeDasharray={`${(breakdown.pieChart.principal.percentage / 100) * Math.PI * 100} ${Math.PI * 100}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 75 75)"
                  />
                  {/* Interest segment */}
                  <circle
                    cx="75"
                    cy="75"
                    r="50"
                    fill="none"
                    stroke={breakdown.pieChart.interest.color}
                    strokeWidth="40"
                    strokeDasharray={`${(breakdown.pieChart.interest.percentage / 100) * Math.PI * 100} ${Math.PI * 100}`}
                    strokeDashoffset={`-${(breakdown.pieChart.principal.percentage / 100) * Math.PI * 100}`}
                    transform="rotate(-90 75 75)"
                  />
                  {/* Center text */}
                  <text x="75" y="75" textAnchor="middle" dy="0.3em" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {breakdown.pieChart.principal.percentage.toFixed(1)}%
                  </text>
                </svg>
              </div>

              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: breakdown.pieChart.principal.color,
                      }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {breakdown.pieChart.principal.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>
                    {fmt(breakdown.pieChart.principal.value)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: breakdown.pieChart.interest.color,
                      }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {breakdown.pieChart.interest.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: breakdown.pieChart.interest.color }}>
                    {fmt(breakdown.pieChart.interest.value)}
                  </div>
                </div>
              </div>
            </div>

            {/* Projections */}
            {breakdown.projections.length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
                  📈 Prognoza Odsetek
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {breakdown.projections.map((proj) => (
                    <div
                      key={proj.months}
                      style={{
                        background: 'var(--bg3)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Za {proj.months} {proj.months === 1 ? 'miesiąc' : 'miesięcy'}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '6px', color: 'var(--danger)' }}>
                        +{fmt(proj.projectedInterest)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {fmt(proj.projectedBalance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline message */}
            {breakdown.timelineMessage && (
              <div
                style={{
                  background: '#f59e0b15',
                  border: '1px solid #f59e0b40',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px',
                  fontSize: '13px',
                  color: 'var(--text)',
                }}
              >
                ⏰ {breakdown.timelineMessage}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Real-time accrual */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
                ⏱️ Naliczanie na bieżąco
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                }}
              >
                <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dziennie</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
                    {fmt(accrual.dailyInterest)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tygodniowo</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
                    {fmt(accrual.weeklyInterest)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Miesięcznie</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
                    {fmt(accrual.monthlyInterest)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rocznie</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
                    {fmt(accrual.yearlyInterest)}
                  </div>
                </div>
              </div>
            </div>

            {/* Since last payment */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #ef444415, #f5970015)',
                  border: '1px solid #ef444440',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Od ostatniej spłaty ({accrual.daysSinceLastPayment} dni)
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--danger)' }}>
                  +{fmt(accrual.accruedSinceLastPayment)}
                </div>
              </div>
            </div>

            {/* Break even payment */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                🎯 Spłata wyrównawcza
              </div>
              <div
                style={{
                  background: 'var(--bg3)',
                  borderRadius: '8px',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Wystarczy, aby pokryć odsetki z tego miesiąca
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '8px', color: 'var(--primary)' }}>
                  {fmt(accrual.breakEvenPayment)}
                </div>
              </div>
            </div>

            {/* Message */}
            {accrual.accrualMessage && (
              <div
                style={{
                  background: '#3b82f615',
                  border: '1px solid #3b82f640',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                💡 {accrual.accrualMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
