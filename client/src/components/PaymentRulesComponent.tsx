import { useEffect, useState } from 'react';
import type { PaymentRule, SuggestedRule } from '../api';
import { loansApi } from '../api';
import { useToast } from './Toast';

interface PaymentRulesComponentProps {
  loanId: string;
}

export default function PaymentRulesComponent({ loanId }: PaymentRulesComponentProps) {
  const [rules, setRules] = useState<PaymentRule[]>([]);
  const [suggested, setSuggested] = useState<SuggestedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedRule | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        loansApi.getPaymentRules(loanId),
        loansApi.getSuggestedRules(loanId),
      ]);
      setRules(r as any);
      setSuggested(s as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [loanId]);

  const handleCreateRule = async (suggestion: SuggestedRule) => {
    try {
      await loansApi.createPaymentRule(loanId, {
        type: suggestion.type,
        trigger: suggestion.trigger,
        action: suggestion.action,
        amount: suggestion.amount,
        percentage: suggestion.percentage,
        description: suggestion.description,
      });
      toast('Reguła utworzona ✓', 'success');
      setSelectedSuggestion(null);
      setShowCreate(false);
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę regułę?')) return;
    try {
      await loansApi.deletePaymentRule(ruleId);
      toast('Reguła usunięta ✓', 'success');
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

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

  return (
    <div className="card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '700' }}>
            ⚙️ Reguły Spłaty
          </h3>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            + Nowa reguła
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Active Rules */}
        {rules.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
              Aktywne Reguły ({rules.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    background: 'var(--bg3)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
                      {rule.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {rule.description || 'Bez opisu'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                      <span>🔔 {rule.trigger}</span>
                      <span>📌 {rule.action}</span>
                      {rule.amount && <span>💰 {rule.amount.toFixed(2)} PLN</span>}
                      {rule.percentage && <span>📊 {rule.percentage}%</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--danger-bg)',
                      border: '1px solid var(--danger)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: 'var(--danger)',
                      fontWeight: '700',
                    }}
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggested.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
              💡 Sugerowane Reguły
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {suggested.map((sugg) => (
                <div
                  key={sugg.id}
                  onClick={() => setSelectedSuggestion(sugg)}
                  style={{
                    background: 'var(--bg3)',
                    border: selectedSuggestion?.id === sugg.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedSuggestion?.id === sugg.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
                    {sugg.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {sugg.description}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      background:
                        sugg.priority === 'high'
                          ? 'var(--success)'
                          : sugg.priority === 'medium'
                          ? 'var(--warning)'
                          : 'var(--text-muted)',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {sugg.priority}
                  </div>
                </div>
              ))}
            </div>

            {selectedSuggestion && (
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--primary)15, #7c3aed15)',
                  border: '1px solid var(--primary)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginTop: '14px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                    {selectedSuggestion.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedSuggestion.rationale}
                  </div>
                </div>
                <button
                  onClick={() => handleCreateRule(selectedSuggestion)}
                  style={{
                    padding: '8px 14px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Aktywuj
                </button>
              </div>
            )}
          </div>
        )}

        {rules.length === 0 && suggested.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
            <div style={{ fontSize: '13px' }}>Brak reguł ani sugestii</div>
          </div>
        )}
      </div>
    </div>
  );
}
