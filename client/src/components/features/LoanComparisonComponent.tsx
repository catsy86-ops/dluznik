import { useEffect, useState } from 'react';
import type { LoanComparisonResult, Loan } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loans?: Loan[];
  onError?: (error: string) => void;
}

export default function LoanComparisonComponent({ loans = [], onError }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<LoanComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'amount' | 'rate' | 'days'>('amount');

  const handleSelect = (loanId: string) => {
    setSelected(prev => {
      const newSelected = prev.includes(loanId)
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId];
      
      if (newSelected.length > 0) {
        loadComparison(newSelected);
      } else {
        setComparison(null);
      }
      return newSelected;
    });
  };

  const loadComparison = async (loanIds: string[]) => {
    if (loanIds.length === 0) return;
    setLoading(true);
    try {
      const data = await loansApi.compareLoan(loanIds);
      setComparison(data);
    } catch (e: any) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loans.length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

  const sortedLoans = [...loans].sort((a, b) => {
    if (sortBy === 'amount') return Number(b.currentBalance) - Number(a.currentBalance);
    if (sortBy === 'rate') return (b.interestRate || 0) - (a.interestRate || 0);
    return 0;
  });

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>⚖️</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Porównanie pożyczek</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Wybierz pożyczki do porównania</p>
        </div>
      </div>

      {/* Loan selection */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dostępne pożyczki ({selected.length} zaznaczonych)</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ fontSize: '12px', padding: '4px 8px' }}>
            <option value="amount">Sortuj po kwocie</option>
            <option value="rate">Sortuj po oprocentowaniu</option>
            <option value="days">Sortuj po terminie</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {sortedLoans.map(loan => (
            <button
              key={loan.id}
              onClick={() => handleSelect(loan.id)}
              style={{
                padding: '12px', borderRadius: '10px', border: selected.includes(loan.id) ? '2px solid var(--primary)' : '1px solid var(--border2)',
                background: selected.includes(loan.id) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg3)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loan.borrowerName}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                {fmt(Number(loan.currentBalance))}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {loan.interestRate ? `${loan.interestRate}% APR` : 'Bez odsetek'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {loan.status === 'paid' ? '✓ Spłacona' : '◐ Aktywna'}
              </div>
              {selected.includes(loan.id) && <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginTop: '4px', textAlign: 'center' }}>✓ Zaznaczone</div>}
            </button>
          ))}
        </div>
      </div>

      {comparison && (
        <>
          {/* Summary metrics */}
          <div className="divider" />
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Podsumowanie porównania
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Razem pożyczek</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{comparison.summary.totalLoans}</div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Całkowita kwota</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{fmt(comparison.summary.totalCurrentBalance)}</div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Średnie APR</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{comparison.summary.averageInterestRate.toFixed(2)}%</div>
              </div>
              {comparison.summary.mostUrgent && (
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '600', textTransform: 'uppercase' }}>Najpilniejsza</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '4px', color: 'var(--danger)' }}>
                    {comparison.loans.find(l => l.id === comparison.summary.mostUrgent)?.borrowerName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed comparison table */}
          <div className="divider" />
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Szczegółowe porównanie
            </h4>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border2)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600' }}>Pożyczka</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Pozostało</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>APR</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Miesięczna rata</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Dni do terminu</th>
                </tr>
              </thead>
              <tbody>
                {comparison.loans.map((loan, idx) => (
                  <tr key={idx} style={{
                    borderBottom: '1px solid var(--border)',
                    background: idx % 2 === 0 ? 'transparent' : 'var(--bg3)',
                  }}>
                    <td style={{ padding: '10px 4px', fontWeight: '600', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {loan.borrowerName}
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: '700' }}>{fmt(loan.currentBalance)}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>{loan.interestRate ? `${loan.interestRate}%` : '—'}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>{fmt(loan.monthlyInterest)}</td>
                    <td style={{
                      padding: '10px 4px', textAlign: 'right',
                      color: loan.daysToOverdue < 0 ? 'var(--danger)' : loan.daysToOverdue < 30 ? 'var(--warning)' : 'var(--success)',
                      fontWeight: '700',
                    }}>
                      {loan.daysToOverdue < 0 ? `⚠️ ${Math.abs(loan.daysToOverdue)}d` : `${loan.daysToOverdue}d`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interest rate distribution */}
          <div className="divider" style={{ marginTop: '16px' }} />
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📊</span> Rozkład oprocentowania
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px' }}>
              {comparison.loans.map((loan, idx) => (
                <div key={idx} style={{
                  flex: 1, background: 'var(--primary)', borderRadius: '4px 4px 0 0',
                  height: `${Math.max(5, (loan.interestRate || 0) * 3)}px`,
                  position: 'relative', transition: 'all 0.2s', cursor: 'pointer',
                  opacity: 0.8, ':hover': { opacity: 1 },
                }} title={`${loan.borrowerName}: ${loan.interestRate}%`} />
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Min: {comparison.summary.lowestInterestRate}%</span>
              <span>Maks: {comparison.summary.highestInterestRate}%</span>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div style={{ marginTop: '16px', textAlign: 'center', padding: '20px' }}>
          <span className="spinner" />
        </div>
      )}
    </div>
  );
}
