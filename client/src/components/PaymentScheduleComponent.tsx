import { useEffect, useState } from 'react';
import type { PaymentScheduleItem } from '../api';
import { loansApi } from '../api';

interface PaymentScheduleComponentProps {
  loanId: string;
  borrowerName: string;
  months?: number;
}

export default function PaymentScheduleComponent({
  loanId,
  borrowerName: _borrowerName,
  months = 12,
}: PaymentScheduleComponentProps) {
  const [schedule, setSchedule] = useState<PaymentScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.getPaymentSchedule(loanId, months);
        setSchedule(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId, months]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ color: 'var(--danger)', fontSize: '14px' }}>⚠️ {error}</div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Brak danych harmonogramu
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(n);

  const totalPayments = schedule.reduce((s, m) => s + m.suggestedPayment, 0);
  const totalInterest = schedule.reduce((s, m) => s + m.interest, 0);

  return (
    <div className="card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>📅 Harmonogram Spłat</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: viewMode === 'timeline' ? 'var(--primary)' : 'var(--bg3)',
                color: viewMode === 'timeline' ? '#fff' : 'var(--text)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: viewMode === 'table' ? 'var(--primary)' : 'var(--bg3)',
                color: viewMode === 'table' ? '#fff' : 'var(--text)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Tabela
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Łączna spłata</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {fmt(totalPayments)}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Łącznie odsetek</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>
              {fmt(totalInterest)}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Miesięcy</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', marginTop: '4px' }}>
              {schedule.length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {viewMode === 'timeline' ? (
          <div>
            {schedule.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
                {/* Timeline dot and line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: item.percentageMilestone === 100 ? 'var(--success)' : 'var(--primary)',
                      border: '3px solid var(--bg)',
                      boxShadow: '0 0 0 2px var(--primary)',
                    }}
                  />
                  {idx < schedule.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        flex: 1,
                        background: 'var(--border)',
                        marginTop: '4px',
                        minHeight: '60px',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Miesiąc {item.month}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.date}</div>
                  </div>

                  <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Spłata:</span>
                        <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{fmt(item.suggestedPayment)}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Główna:</span>
                        <div style={{ fontWeight: '700' }}>{fmt(item.principal)}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Odsetki:</span>
                        <div style={{ fontWeight: '700', color: 'var(--danger)' }}>{fmt(item.interest)}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Pozostało:</span>
                        <div style={{ fontWeight: '700', color: 'var(--text)' }}>{fmt(item.remainingBalance)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: 'var(--bg2)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentageMilestone}%`,
                        background: item.percentageMilestone === 100 ? 'var(--success)' : 'var(--primary)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    {item.percentageMilestone}% spłacone
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700' }}>Miesiąc</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700' }}>Data</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Spłata</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Główna</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Odsetki</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Pozostało</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{item.month}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{item.date}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                      {fmt(item.suggestedPayment)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{fmt(item.principal)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--danger)' }}>{fmt(item.interest)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>
                      {fmt(item.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
