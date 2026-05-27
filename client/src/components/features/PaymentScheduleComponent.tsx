// @ts-nocheck
import { useEffect, useState } from 'react';
import type { PaymentScheduleItem } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loanId: string;
  onError?: (error: string) => void;
}

export default function PaymentScheduleComponent({ loanId, onError }: Props) {
  const [schedule, setSchedule] = useState<PaymentScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loansApi.paymentSchedule(loanId);
        setSchedule(data);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

  if (loading) return <div className="card" style={{ padding: '20px', textAlign: 'center' }}><span className="spinner" /></div>;
  if (schedule.length === 0) return null;

  const totalPayments = schedule.reduce((s, item) => s + item.suggestedPayment, 0);
  const totalInterest = schedule.reduce((s, item) => s + item.interest, 0);

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>📅</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Harmonogram spłat</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Plan spłaty na 12 miesięcy</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Całkowita spłata</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{fmt(totalPayments)}</div>
        </div>
        <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Całkowite odsetki</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--warning)', marginTop: '4px' }}>{fmt(totalInterest)}</div>
        </div>
        <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Miesięcznie</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>{fmt(totalPayments / schedule.length)}</div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', marginBottom: '16px', paddingBottom: '8px' }}>
        {schedule.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            style={{
              minWidth: '50px', padding: '8px', borderRadius: '8px',
              background: expanded === idx ? 'var(--primary)' : 'var(--bg3)',
              color: expanded === idx ? '#fff' : 'var(--text)',
              border: expanded === idx ? 'none' : '1px solid var(--border2)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <div>{item.month}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{item.percentageMilestone}%</div>
          </button>
        ))}
      </div>

      {/* Expanded details */}
      {expanded !== null && (
        <div style={{
          background: 'var(--bg3)', padding: '14px', borderRadius: '10px',
          border: '1px solid var(--border2)', animation: 'slideDown 0.2s ease',
        }}>
          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>
            Miesiąc {schedule[expanded].month} · {schedule[expanded].date}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Kapitał</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                {fmt(schedule[expanded].principal)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Odsetki</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--warning)', marginTop: '4px' }}>
                {fmt(schedule[expanded].interest)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Razem do spłaty</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
                {fmt(schedule[expanded].suggestedPayment)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pozostało</div>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>
                {fmt(schedule[expanded].remainingBalance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table view */}
      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table style={{
          width: '100%', fontSize: '12px', borderCollapse: 'collapse',
          display: 'table',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border2)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600' }}>Msc</th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Kapitał</th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Odsetki</th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Razem</th>
              <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600' }}>Pozostało</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, idx) => (
              <tr key={idx} style={{
                borderBottom: '1px solid var(--border)',
                background: idx % 2 === 0 ? 'transparent' : 'var(--bg3)',
              }}>
                <td style={{ padding: '8px 4px', fontWeight: '600' }}>{item.month}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(item.principal)}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--warning)' }}>{fmt(item.interest)}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '700' }}>{fmt(item.suggestedPayment)}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(item.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
