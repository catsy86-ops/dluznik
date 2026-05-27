// @ts-nocheck
import { useEffect, useState } from 'react';
import type { SuggestedRule } from '../../api';
import { loansApi } from '../../api';

interface PaymentRule {
  id: string;
  type: string;
  trigger: string;
  action: string;
  amount?: number;
  percentage?: number;
  description: string;
  isActive: boolean;
}

interface Props {
  loanId: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export default function PaymentRulesComponent({ loanId, onError, onSuccess }: Props) {
  const [rules, setRules] = useState<PaymentRule[]>([]);
  const [suggested, setSuggested] = useState<SuggestedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'suggested'>('active');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'fixed_amount',
    trigger: 'monthly',
    action: 'pay_amount',
    amount: '',
    percentage: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [rulesData, suggestionsData] = await Promise.all([
          loansApi.getPaymentRules(loanId),
          loansApi.suggestedPaymentRules(loanId),
        ]);
        setRules(rulesData);
        setSuggested(suggestionsData);
      } catch (e: any) {
        onError?.(e.message);
      } finally {
        setLoading(false);
        setSuggestionsLoading(false);
      }
    };
    load();
  }, [loanId]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        trigger: formData.trigger,
        action: formData.action,
        amount: formData.amount ? Number(formData.amount) : undefined,
        percentage: formData.percentage ? Number(formData.percentage) : undefined,
        description: formData.description || undefined,
      };
      await loansApi.createPaymentRule(loanId, payload);
      onSuccess?.('Reguła utworzona ✓');
      setShowForm(false);
      setFormData({ type: 'fixed_amount', trigger: 'monthly', action: 'pay_amount', amount: '', percentage: '', description: '' });
      // Reload rules
      const rulesData = await loansApi.getPaymentRules(loanId);
      setRules(rulesData);
    } catch (e: any) {
      onError?.(e.message);
    }
  };

  const handleApplySuggestion = async (suggestion: SuggestedRule) => {
    try {
      const payload = {
        type: suggestion.type,
        trigger: suggestion.trigger,
        action: suggestion.action,
        amount: suggestion.amount,
        percentage: suggestion.percentage,
        description: suggestion.description,
      };
      await loansApi.createPaymentRule(loanId, payload);
      onSuccess?.('Reguła zaproponowana zastosowana ✓');
      // Reload rules
      const rulesData = await loansApi.getPaymentRules(loanId);
      setRules(rulesData);
    } catch (e: any) {
      onError?.(e.message);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await loansApi.deletePaymentRule(ruleId);
      onSuccess?.('Reguła usunięta');
      setRules(rules.filter(r => r.id !== ruleId));
    } catch (e: any) {
      onError?.(e.message);
    }
  };

  const fmt = (n?: number) => {
    if (!n) return '—';
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
  };

  const getRuleLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixed_amount: 'Kwota stała',
      percentage: 'Procent balansu',
      on_date: 'Na konkretny dzień',
      on_event: 'Na zdarzenie',
    };
    return labels[type] || type;
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      daily: 'Codziennie',
      weekly: 'Co tydzień',
      monthly: 'Co miesiąc',
      on_date: 'Na konkretny dzień',
      on_event: 'Na zdarzenie',
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>⚙️</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Reguły spłaty</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Automatyzacja płatności</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg3)', padding: '4px', borderRadius: '8px' }}>
        <button
          onClick={() => setTab('active')}
          style={{
            flex: 1, padding: '8px', borderRadius: '6px',
            background: tab === 'active' ? 'var(--bg2)' : 'transparent',
            border: tab === 'active' ? '1px solid var(--border)' : 'none',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Aktywne ({rules.filter(r => r.isActive).length})
        </button>
        <button
          onClick={() => setTab('suggested')}
          style={{
            flex: 1, padding: '8px', borderRadius: '6px',
            background: tab === 'suggested' ? 'var(--bg2)' : 'transparent',
            border: tab === 'suggested' ? '1px solid var(--border)' : 'none',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Sugestie ({suggested.length})
        </button>
      </div>

      {tab === 'active' && (
        <>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
              background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px',
            }}
          >
            <span>+</span> Nowa reguła
          </button>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><span className="spinner" /></div>
          ) : rules.filter(r => r.isActive).length === 0 ? (
            <div style={{
              background: 'var(--bg3)', padding: '20px', textAlign: 'center', borderRadius: '10px',
              border: '1px solid var(--border2)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>📋</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Brak aktywnych reguł</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Utwórz nową regułę lub zastosuj sugestię</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rules.filter(r => r.isActive).map(rule => (
                <div key={rule.id} style={{
                  background: 'var(--bg3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
                      {getRuleLabel(rule.type)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>📅 {getTriggerLabel(rule.trigger)}</span>
                      {rule.amount && <span>💰 {fmt(rule.amount)}</span>}
                      {rule.percentage && <span>📊 {rule.percentage}%</span>}
                    </div>
                    {rule.description && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        {rule.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      padding: '6px 10px', fontSize: '11px',
                      background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer',
                    }}
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'suggested' && (
        <>
          {suggestionsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><span className="spinner" /></div>
          ) : suggested.length === 0 ? (
            <div style={{
              background: 'var(--bg3)', padding: '20px', textAlign: 'center', borderRadius: '10px',
              border: '1px solid var(--border2)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>✓</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Brak sugestii</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggested.map((suggestion, idx) => (
                <div key={idx} style={{
                  background: suggestion.priority === 'high' ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
                  border: suggestion.priority === 'high' ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border2)',
                  padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{suggestion.name}</div>
                      {suggestion.priority === 'high' && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--success)', background: 'rgba(16,185,129,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                          Rekomendowana
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {suggestion.description}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      💡 {suggestion.rationale}
                    </div>
                  </div>
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    style={{
                      padding: '6px 12px', fontSize: '11px', fontWeight: '700',
                      background: suggestion.priority === 'high' ? 'var(--success)' : 'var(--primary)',
                      color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Zastosuj
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create rule form */}
      {showForm && (
        <div style={{
          background: 'var(--bg3)', padding: '16px', borderRadius: '10px', marginTop: '16px',
          border: '1px solid var(--border2)', animation: 'slideDown 0.2s ease',
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Utwórz nową regułę
          </h4>
          <form onSubmit={handleCreateRule}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Typ</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px', fontSize: '12px' }}
                >
                  <option value="fixed_amount">Kwota stała</option>
                  <option value="percentage">Procent balansu</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Wyzwalacz</label>
                <select
                  value={formData.trigger}
                  onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px', fontSize: '12px' }}
                >
                  <option value="monthly">Co miesiąc</option>
                  <option value="weekly">Co tydzień</option>
                  <option value="daily">Codziennie</option>
                </select>
              </div>
            </div>

            {formData.type === 'fixed_amount' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kwota</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="500"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px', fontSize: '12px' }}
                />
              </div>
            )}

            {formData.type === 'percentage' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Procent</label>
                <input
                  type="number"
                  value={formData.percentage}
                  onChange={e => setFormData({ ...formData, percentage: e.target.value })}
                  placeholder="10"
                  min="1"
                  max="100"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px', fontSize: '12px' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Opis (opcjonalnie)</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Np. spłata z wynagrodzenia"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 14px', fontSize: '12px', fontWeight: '700',
                  background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 14px', fontSize: '12px', fontWeight: '700',
                  background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Utwórz
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
