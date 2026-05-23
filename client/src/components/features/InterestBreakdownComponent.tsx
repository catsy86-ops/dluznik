import { useEffect, useState } from 'react';
import type { InterestBreakdownResponse, RealTimeAccrualResponse } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loanId: string;
  onError?: (error: string) => void;
}

export default function InterestBreakdownComponent({ loanId, onError }: Props) {
  const [breakdown, setBreakdown] = useState<InterestBreakdownResponse | null>(null);
  const [accrual, setAccrual] = useState<RealTimeAccrualResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'breakdown' | 'accrual'>('breakdown');

  useEffect(() => {
    const load = async () => {
      try {
        const [b, a] = await Promise.all([
          loansApi.interestBreakdown(loanId),
          loansApi.interestAccrual(loanId),
        ]);
        setBreakdown(b);
        setAccrual(a);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) return <div className="card" style={{ padding: '20px', textAlign: 'center' }}><span className="spinner" /></div>;
  if (!breakdown) return null;

  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

  const PieChart = ({ principal, interest }: { principal: number; interest: number }) => {
    const total = principal + interest;
    const principalAngle = (principal / total) * 360;
    
    return (
      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute' }}>
          {/* Principal segment */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="30"
            strokeDasharray={`${(principalAngle / 360) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
            transform="rotate(-90 80 80)"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(59,130,246,0.3))' }}
          />
          {/* Interest segment */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#ef4444"
            strokeWidth="30"
            strokeDasharray={`${((360 - principalAngle) / 360) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
            strokeDashoffset={`-${(principalAngle / 360) * 2 * Math.PI * 60}`}
            transform="rotate(-90 80 80)"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(239,68,68,0.3))' }}
          />
          <circle cx="80" cy="80" r="40" fill="var(--bg2)" />
          <text x="80" y="75" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">
            {breakdown.principalPercentage.toFixed(0)}%
          </text>
          <text x="80" y="92" textAnchor="middle" fontSize="11" fill="var(--text-muted)">
            główne
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>📊</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Rozkład odsetek</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Analiza naliczonych odsetek</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg3)', padding: '4px', borderRadius: '8px' }}>
        <button
          onClick={() => setTab('breakdown')}
          style={{
            flex: 1, padding: '8px', borderRadius: '6px',
            background: tab === 'breakdown' ? 'var(--bg2)' : 'transparent',
            border: tab === 'breakdown' ? '1px solid var(--border)' : 'none',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Rozkład
        </button>
        <button
          onClick={() => setTab('accrual')}
          style={{
            flex: 1, padding: '8px', borderRadius: '6px',
            background: tab === 'accrual' ? 'var(--bg2)' : 'transparent',
            border: tab === 'accrual' ? '1px solid var(--border)' : 'none',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Naliczanie
        </button>
      </div>

      {tab === 'breakdown' && breakdown && (
        <>
          {/* Pie chart */}
          <div style={{ marginBottom: '16px' }}>
            <PieChart principal={breakdown.pieChart.principal.value} interest={breakdown.pieChart.interest.value} />
          </div>

          {/* Legend and details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Główne zobowiązanie
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                {fmt(breakdown.pieChart.principal.value)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {breakdown.principalPercentage.toFixed(1)}% całości
              </div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Naliczone odsetki
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>
                {fmt(breakdown.interestAccrued)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {breakdown.interestPercentage.toFixed(1)}% całości
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
              Podsumowanie
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Pierwotna kwota</div>
                <div style={{ fontWeight: '700' }}>{fmt(breakdown.originalBalance)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Spłacone</div>
                <div style={{ fontWeight: '700', color: 'var(--success)' }}>{fmt(breakdown.paymentsMade)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Bieżące saldo</div>
                <div style={{ fontWeight: '700' }}>{fmt(breakdown.currentBalance)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Oprocentowanie</div>
                <div style={{ fontWeight: '700' }}>{breakdown.interestRate}% APR</div>
              </div>
            </div>
          </div>

          {/* Projections */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Projekcje na przyszłość
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
              {breakdown.projections.map((proj, idx) => (
                <div key={idx} style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Za {proj.months} m-cy
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px', color: 'var(--warning)' }}>
                    +{fmt(proj.projectedInterest)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    razem: {fmt(proj.projectedBalance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'accrual' && accrual && (
        <>
          {/* Daily rate card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.1))',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
              Bieżące naliczanie odsetek
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
              {fmt(accrual.dailyInterest)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>na dzień</div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.2)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {accrual.accrualMessage}
            </div>
          </div>

          {/* Accrual rates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Tygodniowo</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>{fmt(accrual.weeklyInterest)}</div>
            </div>
            <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Miesięcznie</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>{fmt(accrual.monthlyInterest)}</div>
            </div>
            <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Rocznie</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>{fmt(accrual.yearlyInterest)}</div>
            </div>
          </div>

          {/* Break-even info */}
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
              Kwota wyrównawcza
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)', marginBottom: '6px' }}>
              {fmt(accrual.breakEvenPayment)}/msc
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Minimalna spłata aby nie rosnęły odsetki
            </div>
          </div>

          {/* Since last payment */}
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⏱️</span> Od ostatniej spłaty
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Dni</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{accrual.daysSinceLastPayment}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Odsetki naliczone</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: 'var(--warning)' }}>
                  {fmt(accrual.accruedSinceLastPayment)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
