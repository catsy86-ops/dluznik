// @ts-nocheck
import { useEffect, useState } from 'react';
import type { PaymentForecastResponse } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loanId: string;
  onError?: (error: string) => void;
}

export default function PaymentForecastComponent({ loanId, onError }: Props) {
  const [forecast, setForecast] = useState<PaymentForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loansApi.paymentForecast(loanId);
        setForecast(data);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) return <div className="card" style={{ padding: '20px', textAlign: 'center' }}><span className="spinner" /></div>;
  if (!forecast) return null;

  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Brak danych';
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getConfidenceColor = (level: string) => {
    if (level === 'high') return 'var(--success)';
    if (level === 'medium') return 'var(--warning)';
    return 'var(--danger)';
  };

  const getConfidenceLabel = (level: string) => {
    if (level === 'high') return 'Wysoka';
    if (level === 'medium') return 'Średnia';
    return 'Niska';
  };

  const daysToCompletion = forecast.daysToPayoff;
  const monthsToCompletion = Math.ceil(daysToCompletion / 30);

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🔮</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Prognoza spłaty</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Przewidywana data zakończenia</p>
        </div>
      </div>

      {/* Alert banner */}
      {forecast.overdueAlert && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '10px',
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--danger)', marginBottom: '2px' }}>Uwaga!</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{forecast.overdueAlert}</div>
          </div>
        </div>
      )}

      {/* Completion timeline */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.1))',
        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
          Prognozowana data spłaty
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
          {formatDate(forecast.completionDate)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Za {daysToCompletion} dni (~{monthsToCompletion} miesięcy)
        </div>

        {/* Confidence indicator */}
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(99,102,241,0.2)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: getConfidenceColor(forecast.confidence),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '700', fontSize: '12px',
          }}>
            {forecast.confidence === 'high' ? '✓' : forecast.confidence === 'medium' ? '−' : '!'}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: getConfidenceColor(forecast.confidence) }}>
              Zaufanie: {getConfidenceLabel(forecast.confidence)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {forecast.confidence === 'high' ? 'Wysoka pewność prognozy' : forecast.confidence === 'medium' ? 'Umiarkowana pewność' : 'Niska pewność - historia płatności krótka'}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence interval */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Przedział ufności
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Optymistycznie
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '2px' }}>
              {formatDate(forecast.optimisticDate)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {forecast.optimisticDays} dni
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Średnio
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '2px' }}>
              {formatDate(forecast.completionDate)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {forecast.daysToPayoff} dni
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--warning)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Pesymistycznie
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '2px' }}>
              {formatDate(forecast.pesimisticDate)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {forecast.pesimisticDays} dni
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Historia płatności
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Całkowita liczba</div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{forecast.paymentHistory.totalPayments}</div>
          </div>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Średnia płatność</div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{fmt(forecast.paymentHistory.averagePayment)}</div>
          </div>
          <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Ostatnia płatność</div>
            <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
              {fmt(forecast.paymentHistory.lastPaymentAmount || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Trend analysis */}
      <div style={{
        background: 'var(--bg3)', padding: '12px', borderRadius: '10px', marginBottom: '16px',
        border: '1px solid var(--border2)',
      }}>
        <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{forecast.paymentHistory.trend === 'increasing' ? '📈' : forecast.paymentHistory.trend === 'decreasing' ? '📉' : '➡️'}</span>
          Trend płatności
        </div>
        <div style={{
          fontSize: '12px', fontWeight: '700',
          color: forecast.paymentHistory.trend === 'increasing' ? 'var(--success)' : forecast.paymentHistory.trend === 'decreasing' ? 'var(--danger)' : 'var(--text-muted)',
        }}>
          {forecast.paymentHistory.trend === 'increasing' ? 'Rosnące' : forecast.paymentHistory.trend === 'decreasing' ? 'Malejące' : 'Stabilne'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Odchylenie standardowe: {fmt(forecast.paymentHistory.standardDeviation)}
        </div>
      </div>

      {/* Recommendations */}
      {forecast.recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            💡 Rekomendacje
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {forecast.recommendations.map((rec, idx) => (
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
