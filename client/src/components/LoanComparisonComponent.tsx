import { useEffect, useState } from 'react';
import type { LoanComparisonResult } from '../api';
import { loansApi } from '../api';

interface LoanComparisonComponentProps {
  loanIds: string[];
  onClose?: () => void;
}

export default function LoanComparisonComponent({
  loanIds,
  onClose,
}: LoanComparisonComponentProps) {
  const [comparison, setComparison] = useState<LoanComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loanIds.length === 0) {
      setError('Brak wybranych pożyczek do porównania');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.compareLoanS(loanIds);
        setComparison(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanIds]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ color: 'var(--danger)', fontSize: '14px' }}>⚠️ {error || 'Brak danych'}</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Zamknij
          </button>
        )}
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>
          ⚖️ Porównanie Pożyczek
        </h3>
        <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Porównanie side-by-side {comparison.loans.length} pożyczek
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Liczba pożyczek</div>
            <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
              {comparison.summary.totalLoans}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Razem pożyczki</div>
            <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
              {fmt(comparison.summary.totalOriginalAmount)}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Razem pozostało</div>
            <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
              {fmt(comparison.summary.totalCurrentBalance)}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Średnie %</div>
            <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
              {comparison.summary.averageInterestRate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
            📊 Szczegóły Porównania
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700' }}>Pożyczka</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Poczta</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>%</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Pozostało</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Dni</th>
              </tr>
            </thead>
            <tbody>
              {comparison.loans.map((loan, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loan.borrowerName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {fmt(loan.originalAmount)}
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>
                    {loan.interestRate.toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--bg3)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {loan.percentagePaid.toFixed(0)}%
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--primary)' }}>
                    {fmt(loan.currentBalance)}
                  </td>
                  <td style={{
                    padding: '10px',
                    textAlign: 'right',
                    color: loan.daysToOverdue < 0 ? 'var(--danger)' : loan.daysToOverdue < 30 ? 'var(--warning)' : 'var(--text)',
                    fontWeight: '700',
                  }}>
                    {loan.daysToOverdue < 0
                      ? `⚠️ ${Math.abs(loan.daysToOverdue)}`
                      : loan.daysToOverdue === Infinity
                      ? '∞'
                      : loan.daysToOverdue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {comparison.summary.highestInterestRate > 0 && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '700' }}>
                🔴 Najwyższe oprocentowanie
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--danger)', marginTop: '6px' }}>
                {comparison.summary.highestInterestRate.toFixed(2)}%
              </div>
            </div>
          )}

          {comparison.summary.lowestInterestRate > 0 && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>
                🟢 Najniższe oprocentowanie
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--success)', marginTop: '6px' }}>
                {comparison.summary.lowestInterestRate.toFixed(2)}%
              </div>
            </div>
          )}

          {comparison.summary.mostUrgent && (
            <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: '700' }}>
                ⏰ Najpilniejsza
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginTop: '6px' }}>
                Wymaga natychmiastowej uwagi
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            background: 'var(--bg2)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontWeight: '700', marginBottom: '8px' }}>Legenda:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            <div>• <strong>Poczta</strong> = oprocentowanie roczne</div>
            <div>• <strong>%</strong> = procent już spłacony</div>
            <div>• <strong>Pozostało</strong> = aktualne saldo</div>
            <div>• <strong>Dni</strong> = dni do terminu (- = przeterminowane)</div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              width: '100%',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            Zamknij porównanie
          </button>
        )}
      </div>
    </div>
  );
}
