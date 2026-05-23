import { useEffect, useState } from 'react';
import type { PaymentSuggestion } from '../api';
import { loansApi } from '../api';

interface PaymentSuggestionComponentProps {
  loanId: string;
  onSelect?: (amount: number, type: 'minimum' | 'recommended' | 'full') => void;
}

export default function PaymentSuggestionComponent({
  loanId,
  onSelect,
}: PaymentSuggestionComponentProps) {
  const [suggestion, setSuggestion] = useState<PaymentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<'minimum' | 'recommended' | 'full' | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.getPaymentSuggestion(loanId);
        setSuggestion(data);
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

  if (error || !suggestion) {
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

  const options = [
    {
      type: 'minimum' as const,
      amount: suggestion.minimumPayment,
      title: '💪 Minimum',
      message: suggestion.minimumPaymentMessage,
      color: '#ef4444',
    },
    {
      type: 'recommended' as const,
      amount: suggestion.recommendedPayment,
      title: '⭐ Rekomendowane',
      message: suggestion.recommendedMessage,
      color: '#f59e0b',
    },
    {
      type: 'full' as const,
      amount: suggestion.fullPaymentOption,
      title: '🎉 Pełna spłata',
      message: 'Spłać całą pożyczkę dzisiaj',
      color: '#10b981',
    },
  ];

  const handleSelect = (type: 'minimum' | 'recommended' | 'full', amount: number) => {
    setSelected(type);
    onSelect?.(amount, type);
  };

  return (
    <div className="card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>💡 Sugestie Spłaty</h3>
        <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Wybierz opcję spłaty, która pasuje Ci najlepiej
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {options.map((option) => (
            <div
              key={option.type}
              onClick={() => handleSelect(option.type, option.amount)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: selected === option.type ? `2px solid ${option.color}` : '1px solid var(--border)',
                background: selected === option.type ? `${option.color}15` : 'var(--bg3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: selected === option.type ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: option.color }}>
                {option.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {option.message}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: option.color }}>
                {fmt(option.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Savings highlight */}
        {suggestion.interestSavings > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #10b98115, #34d39915)',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: '24px' }}>💰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--success)' }}>
                Zaoszczędź {fmt(suggestion.interestSavings)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {suggestion.interestSavingsMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
