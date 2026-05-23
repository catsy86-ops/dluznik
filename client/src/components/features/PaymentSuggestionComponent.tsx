import { useEffect, useState } from 'react';
import type { PaymentSuggestion } from '../../api';
import { loansApi } from '../../api';

interface Props {
  loanId: string;
  onError?: (error: string) => void;
  onSuggestPayment?: (amount: number) => void;
}

export default function PaymentSuggestionComponent({ loanId, onError, onSuggestPayment }: Props) {
  const [suggestion, setSuggestion] = useState<PaymentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<'minimum' | 'recommended' | 'full'>('recommended');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loansApi.suggestPayment(loanId);
        setSuggestion(data);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) return <div className="card" style={{ padding: '20px', textAlign: 'center' }}><span className="spinner" /></div>;
  if (!suggestion) return null;

  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

  const getAmount = () => {
    if (selected === 'minimum') return suggestion.minimumPayment;
    if (selected === 'recommended') return suggestion.recommendedPayment;
    return suggestion.fullPaymentOption;
  };

  const handleSelect = (option: 'minimum' | 'recommended' | 'full') => {
    setSelected(option);
    onSuggestPayment?.(option === 'minimum' ? suggestion.minimumPayment : option === 'recommended' ? suggestion.recommendedPayment : suggestion.fullPaymentOption);
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>💡</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Inteligentne sugestie spłaty</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Wybierz optymalną kwotę spłaty</p>
        </div>
      </div>

      {/* Savings alert */}
      {suggestion.interestSavings > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(34,197,94,0.1))',
          border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px',
          padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success)' }}>
              Oszczędź {fmt(suggestion.interestSavings)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {suggestion.interestSavingsMessage}
            </div>
          </div>
        </div>
      )}

      {/* Three options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { key: 'minimum' as const, label: 'Minimum', amount: suggestion.minimumPayment, message: suggestion.minimumPaymentMessage, color: 'var(--warning)' },
          { key: 'recommended' as const, label: 'Rekomendowana', amount: suggestion.recommendedPayment, message: suggestion.recommendedMessage, color: 'var(--primary)' },
          { key: 'full' as const, label: 'Pełna spłata', amount: suggestion.fullPaymentOption, message: suggestion.fullPaymentOption === suggestion.recommendedPayment ? '' : 'Całkowita spłata pożyczki', color: 'var(--success)' },
        ].map(option => (
          <button
            key={option.key}
            onClick={() => handleSelect(option.key)}
            style={{
              background: selected === option.key ? option.color : 'var(--bg3)',
              color: selected === option.key ? '#fff' : 'var(--text)',
              border: selected === option.key ? 'none' : '1px solid var(--border2)',
              borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', opacity: selected === option.key ? 0.9 : 0.7 }}>
              {option.label}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>{fmt(option.amount)}</div>
            <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'center' }}>{option.message}</div>
          </button>
        ))}
      </div>

      {/* Selected option details */}
      <div style={{
        background: 'var(--bg3)', borderRadius: '12px', padding: '16px',
        border: '2px solid ' + (selected === 'minimum' ? 'var(--warning)' : selected === 'recommended' ? 'var(--primary)' : 'var(--success)'),
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
          Wybrana opcja
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {fmt(getAmount())}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {selected === 'minimum' && 'Minimalna kwota, aby uniknąć przeterminowania i pokryć odsetki'}
          {selected === 'recommended' && 'Zalecana kwota - dobry postęp w spłacie'}
          {selected === 'full' && 'Pełna spłata całej pożyczki'}
        </div>

        {/* Impact info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pozostanie do spłaty</div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
              {fmt(Math.max(0, getAmount() - getAmount()))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Zaoszczędzisz</div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: 'var(--success)' }}>
              {fmt(suggestion.interestSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Info text */}
      <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg3)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
        <div>Te sugestie są obliczane na podstawie bieżącego salda i oprocentowania. Rzeczywiste kwoty mogą się różnić.</div>
      </div>
    </div>
  );
}
