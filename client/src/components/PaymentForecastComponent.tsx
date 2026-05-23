import { useEffect, useState } from 'react';
import type { PaymentForecastResponse } from '../api';
import { loansApi } from '../api';

interface PaymentForecastComponentProps {
  loanId: string;
}

export default function PaymentForecastComponent({ loanId }: PaymentForecastComponentProps) {
  const [forecast, setForecast] = useState<PaymentForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.getPaymentForecast(loanId);
        setForecast(data);
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

  if (error || !forecast) {
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

  const confidenceColors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  const confidenceLabels = {
    high: '✓ Wysoka',
    medium: '⚠️ Średnia',
    low: '❌ Niska',
  };

  return (
    <div className="card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>
          🔮 Prognoza Spłaty
        </h3>
        <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Analiza historii płatności i prognoza zakończenia pożyczki
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Main Forecast */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary)15, #7c3aed15)',
              border: '1px solid var(--primary)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Orientacyjny termin spłaty
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {forecast.completionDate}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text)' }}>
              za {forecast.daysToPayoff} dni
            </div>
          </div>
        </div>

        {/* Confidence Interval */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
            📊 Zakres Pewności
          </div>

          {/* Timeline visualization */}
          <div
            style={{
              background: 'var(--bg2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            {/* Optimistic - Pessimistic range */}
            <div style={{ position: 'relative', height: '40px', marginBottom: '16px' }}>
              {/* Background bar */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'var(--border)',
                  borderRadius: '2px',
                }}
              />

              {/* Optimistic marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${Math.min(90, (forecast.optimisticDays / forecast.pesimisticDays) * 100)}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📉</div>
                <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  Optymistycznie
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {forecast.optimisticDate}
                </div>
              </div>

              {/* Main forecast marker */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '3px solid var(--bg)',
                  }}
                />
                <div style={{ fontSize: '10px', color: 'var(--text)', fontWeight: '700', marginTop: '8px', whiteSpace: 'nowrap' }}>
                  Prognoza
                </div>
              </div>

              {/* Pessimistic marker */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translate(50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📈</div>
                <div style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  Pesymistycznie
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {forecast.pesimisticDate}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Najwcześniej</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', marginTop: '4px' }}>
                  {forecast.optimisticDays} dni
                </div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Prognoza</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginTop: '4px' }}>
                  {forecast.daysToPayoff} dni
                </div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Najpóźniej</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--danger)', marginTop: '4px' }}>
                  {forecast.pesimisticDays} dni
                </div>
              </div>
            </div>
          </div>

          {/* Confidence level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${confidenceColors[forecast.confidence]}20`,
                border: `2px solid ${confidenceColors[forecast.confidence]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: confidenceColors[forecast.confidence],
              }}
            >
              {forecast.confidence === 'high'
                ? '✓'
                : forecast.confidence === 'medium'
                ? '±'
                : '!'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: confidenceColors[forecast.confidence] }}>
                Pewność: {confidenceLabels[forecast.confidence]}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Przewidywalność na podstawie historii płatności
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
            💳 Historia Płatności
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Liczba płatności</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                {forecast.paymentHistory.totalPayments}
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Średnia płatność</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                {fmt(forecast.paymentHistory.averagePayment)}
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trend</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  marginTop: '4px',
                  color:
                    forecast.paymentHistory.trend === 'increasing'
                      ? 'var(--success)'
                      : forecast.paymentHistory.trend === 'decreasing'
                      ? 'var(--danger)'
                      : 'var(--text)',
                }}
              >
                {forecast.paymentHistory.trend === 'increasing'
                  ? '📈 Rosnący'
                  : forecast.paymentHistory.trend === 'decreasing'
                  ? '📉 Spadający'
                  : '➡️ Stabilny'}
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ostatnia płatność</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
                {forecast.paymentHistory.lastPaymentDate
                  ? new Date(forecast.paymentHistory.lastPaymentDate).toLocaleDateString('pl-PL')
                  : 'Brak'}
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {forecast.overdueAlert && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: 'var(--danger)',
              fontSize: '13px',
            }}
          >
            🚨 {forecast.overdueAlert}
          </div>
        )}

        {/* Recommendations */}
        {forecast.recommendations.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
              💡 Rekomendacje
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {forecast.recommendations.map((rec, idx) => (
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
