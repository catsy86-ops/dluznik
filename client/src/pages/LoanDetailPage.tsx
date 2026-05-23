import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loansApi, loanNotesApi, healthScoreApi, interestBreakdownApi, forecastApi, paymentSuggestionApi, paymentScheduleApi } from '../api';
import type { Loan, Transaction, LoanNote, LoanHealthScore, InterestBreakdown, PaymentForecast, PaymentSuggestion, PaymentScheduleItem } from '../api';
import { useToast } from '../components/Toast';
import Confetti from '../components/Confetti';

// Helper: Format number as currency
function fmt(n: number, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(n);
}

// Helper: Status badge
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    active: ['var(--primary)', 'rgba(99,102,241,0.15)', 'Aktywna'],
    paid: ['var(--success)', 'rgba(34,197,94,0.15)', 'Spłacona'],
    overdue: ['var(--danger)', 'rgba(239,68,68,0.15)', 'Przeterminowana'],
  };
  const [color, bg, label] = map[status] ?? ['var(--text-muted)', 'var(--bg3)', status];
  return (
    <span style={{ background: bg, color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
      {label}
    </span>
  );
}

// Helper: Stat box
function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '700', color }}>{value}</div>
    </div>
  );
}

// Widget: Health Score
function HealthScoreWidget({ score }: { score: LoanHealthScore }) {
  const getHealthColor = (s: number) => s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--danger)';
  const getHealthLabel = (s: string) => s === 'excellent' ? '✨ Doskonała' : s === 'good' ? '✅ Dobra' : s === 'caution' ? '⚠️ Ostrożnie' : s === 'warning' ? '🔴 Ostrzeżenie' : '🆘 Krytyczne';

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>📊 Kondycja pożyczki</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px' }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `conic-gradient(${getHealthColor(score.score)} ${score.score}%, var(--bg3) ${score.score}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          boxShadow: `0 0 20px ${getHealthColor(score.score)}40`,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '32px', fontWeight: '900' }}>{score.score}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: getHealthColor(score.score) }}>
            {getHealthLabel(score.status)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>• Terminowość: <strong>{score.components.timeliness}/40</strong></div>
            <div>• Balans: <strong>{score.components.balance}/40</strong></div>
            <div>• Szybkość spłaty: <strong>{score.components.velocity}/20</strong></div>
          </div>
        </div>
      </div>
      {score.recommendations.length > 0 && (
        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {score.recommendations.map((r, i) => <div key={i}>💡 {r}</div>)}
        </div>
      )}
    </div>
  );
}

// Widget: Payment Suggestion
function PaymentSuggestionWidget({ suggestion, loan, onApply }: { suggestion: PaymentSuggestion; loan: Loan; onApply: (amount: number) => void }) {
  const urgencyColor = suggestion.urgency === 'critical' ? 'var(--danger)' : suggestion.urgency === 'high' ? 'var(--warning)' : 'var(--primary)';

  return (
    <div className="card" style={{ marginBottom: '16px', borderColor: urgencyColor + '40' }}>
      <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>💡 Sugerowana spłata</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>MINIMUM</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--danger)', marginBottom: '2px' }}>
            {fmt(suggestion.minimum, loan.currency)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>aby nie przeterminować</div>
        </div>
        <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '12px', border: '2px solid var(--primary)' }}>
          <div style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>REKOMENDOWANA</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginBottom: '2px' }}>
            {fmt(suggestion.recommended, loan.currency)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>idealna teraz</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: suggestion.interestSavings > 0 ? '12px' : 0 }}>
        <button onClick={() => onApply(suggestion.minimum)} className="btn-ghost" style={{ flex: 1, padding: '10px' }}>
          Spłacić minimum
        </button>
        <button onClick={() => onApply(suggestion.recommended)} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
          Spłacić rekomendowaną
        </button>
        <button onClick={() => onApply(suggestion.fullPayment)} className="btn-success" style={{ flex: 1, padding: '10px' }}>
          Spłacić całość
        </button>
      </div>
      {suggestion.interestSavings > 0 && (
        <div style={{ padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
          💰 Zaoszczędzisz {fmt(suggestion.interestSavings, loan.currency)} odsetek!
        </div>
      )}
    </div>
  );
}

// Widget: Payment Schedule
function PaymentScheduleWidget({ schedule, currency }: { schedule: PaymentScheduleItem[]; currency: string }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700' }}>📅 Harmonogram spłat (12 miesięcy)</h2>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {schedule.map((item, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '10px',
            fontSize: '12px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>Miesiąc {item.month}</div>
              <div style={{ fontWeight: '700' }}>{new Date(item.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>Do spłaty</div>
              <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{fmt(item.suggestedPayment, currency)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>Principal</div>
              <div style={{ fontWeight: '600' }}>{fmt(item.principal, currency)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>Saldo po</div>
              <div style={{ fontWeight: '700', color: item.remainingBalance <= 0 ? 'var(--success)' : 'var(--text)' }}>
                {fmt(item.remainingBalance, currency)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Widget: Interest Breakdown
function InterestBreakdownWidget({ breakdown, currency }: { breakdown: InterestBreakdown; currency: string }) {
  const total = breakdown.principal + breakdown.interestAccrued;
  const principalPct = total > 0 ? (breakdown.principal / total) * 100 : 50;

  return (
    <div className="card">
      <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>💹 Rozkład odsetek</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>PRINCIPAL</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
            {fmt(breakdown.principal, currency)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{principalPct.toFixed(1)}% kwoty</div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ODSETKI NALICZONE</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--warning)', marginBottom: '4px' }}>
            {fmt(breakdown.interestAccrued, currency)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(100 - principalPct).toFixed(1)}% kwoty</div>
        </div>
      </div>
      <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ width: `${principalPct}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <StatBox label="Już spłacono" value={fmt(breakdown.totalPaid, currency)} color="var(--success)" />
        <StatBox label="Pozostało" value={fmt(breakdown.remainingBalance, currency)} color="var(--primary)" />
      </div>
    </div>
  );
}

// Widget: Payment Forecast
function PaymentForecastWidget({ forecast, currency }: { forecast: PaymentForecast; currency: string }) {
  return (
    <div className="card">
      <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>🔮 Prognoza spłaty</h2>
      <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>PRZEWIDYWANA DATA SPŁATY</div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '6px' }}>
          {new Date(forecast.estimatedCompletionDate).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Pewność prognozy</div>
            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{forecast.confidence}%</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Rekomendowana spłata/miesiąc</div>
            <div style={{ fontWeight: '700', color: 'var(--success)' }}>{fmt(forecast.recommendedMonthlyPayment, currency)}</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Scenariusze</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: forecast.riskOfOverdue ? '12px' : 0 }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>🐢 Konserwatywnie</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--danger)', marginBottom: '4px' }}>
            {forecast.scenarios.conservative.monthsToCompletion}m
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {new Date(forecast.scenarios.conservative.completionDate).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center', border: '2px solid var(--warning)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>⚡ Standardowo</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--warning)', marginBottom: '4px' }}>
            {forecast.scenarios.moderate.monthsToCompletion}m
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {new Date(forecast.scenarios.moderate.completionDate).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>🚀 Agresywnie</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
            {forecast.scenarios.aggressive.monthsToCompletion}m
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {new Date(forecast.scenarios.aggressive.completionDate).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
      {forecast.riskOfOverdue && (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>
          ⚠️ Ryzyko przeterminowania! Zwiększ spłaty lub ustaw przypomnienie.
        </div>
      )}
    </div>
  );
}

// Main Component
export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<LoanNote[]>([]);
  const [healthScore, setHealthScore] = useState<LoanHealthScore | null>(null);
  const [interestBreakdown, setInterestBreakdown] = useState<InterestBreakdown | null>(null);
  const [forecast, setForecast] = useState<PaymentForecast | null>(null);
  const [paymentSuggestion, setPaymentSuggestion] = useState<PaymentSuggestion | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'breakdown' | 'forecast' | 'notes'>('overview');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [l, p, n] = await Promise.all([loansApi.get(id), loansApi.payments(id), loanNotesApi.list(id)]);
      setLoan(l);
      setTransactions((p as any).transactions ?? []);
      setNotes((n as any).notes ?? []);

      // Load enhanced data (optional, won't block if they fail)
      try {
        const [hs, ib, f, ps, psch] = await Promise.all([
          healthScoreApi.get(id),
          interestBreakdownApi.get(id),
          forecastApi.get(id),
          paymentSuggestionApi.get(id),
          paymentScheduleApi.generate(id, 12),
        ]);
        setHealthScore(hs);
        setInterestBreakdown(ib);
        setForecast(f);
        setPaymentSuggestion(ps);
        setPaymentSchedule((psch as any).schedule ?? []);
      } catch (e) {
        // Enhanced data is optional
      }
    } catch (e: any) {
      toast(e.message, 'error');
      navigate('/loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!loan) return;
    setPaying(true);
    try {
      await loansApi.addPayment(loan.id, Number(amount), note || undefined);
      const wasFullyPaid = Number(loan.currentBalance) - Number(amount) <= 0;
      setAmount('');
      setNote('');
      await load();
      if (wasFullyPaid) {
        toast('🎉 Pożyczka w pełni spłacona!', 'success');
        setShowConfetti(true);
      } else {
        toast('Spłata zarejestrowana ✓', 'success');
      }
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
        <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!loan) return null;

  const pct = loan.originalAmount > 0 ? ((Number(loan.originalAmount) - Number(loan.currentBalance)) / Number(loan.originalAmount)) * 100 : 0;
  const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date();

  return (
    <div className="fade-in">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: '16px', borderColor: isOverdue ? 'rgba(239,68,68,0.4)' : undefined }}>
        {isOverdue && (
          <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚠️ Termin minął {new Date(loan.dueDate!).toLocaleDateString('pl-PL')}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{loan.borrowerName}</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Dodano {new Date(loan.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <StatBox label="Kwota oryginalna" value={fmt(Number(loan.originalAmount), loan.currency)} color="var(--text)" />
          <StatBox label="Pozostało" value={fmt(Number(loan.currentBalance), loan.currency)} color={loan.status === 'paid' ? 'var(--success)' : 'var(--primary)'} />
          {loan.dueDate && <StatBox label="Termin spłaty" value={new Date(loan.dueDate).toLocaleDateString('pl-PL')} color={isOverdue ? 'var(--danger)' : 'var(--text)'} />}
          <StatBox label="Spłacono" value={`${pct.toFixed(1)}%`} color="var(--success)" />
        </div>

        <div className="progress-bar" style={{ height: '8px', marginBottom: '12px' }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary)' }} />
        </div>

        {loan.description && (
          <div style={{ padding: '10px', background: 'var(--bg3)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            📝 {loan.description}
          </div>
        )}
      </div>

      {/* Payment Form (if not fully paid) */}
      {loan.status !== 'paid' && (
        <form onSubmit={addPayment} className="card" style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Kwota spłaty"
            step="0.01"
            min="0"
            style={{ flex: 1 }}
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notatka (opcjonalnie)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={paying || !amount} style={{ flexShrink: 0 }}>
            {paying ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '💳 Spłacić'}
          </button>
        </form>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {(['overview', 'schedule', 'breakdown', 'forecast', 'notes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === tab ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'var(--bg2)',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'overview' && '📊 Przegląd'}
            {tab === 'schedule' && '📅 Harmonogram'}
            {tab === 'breakdown' && '💹 Rozkład odsetek'}
            {tab === 'forecast' && '🔮 Prognoza'}
            {tab === 'notes' && '💬 Notatki'}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {healthScore && <HealthScoreWidget score={healthScore} />}

          {paymentSuggestion && (
            <PaymentSuggestionWidget
              suggestion={paymentSuggestion}
              loan={loan}
              onApply={(amt) => {
                setAmount(String(amt));
                setActiveTab('overview');
              }}
            />
          )}

          {interestBreakdown && (
            <div className="card" style={{ padding: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-muted)' }}>💹 Rozkład finansów</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <StatBox label="Principal" value={fmt(interestBreakdown.principal, loan.currency)} color="var(--primary)" />
                <StatBox label="Odsetki" value={fmt(interestBreakdown.interestAccrued, loan.currency)} color="var(--warning)" />
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Historia spłat</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{transactions.length} transakcji</span>
            </div>
            {transactions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Brak transakcji
              </div>
            ) : (
              <div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="animate-in" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                    animationDelay: `${i * 30}ms`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        💰
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--success)' }}>
                          -{fmt(Number(tx.amount), loan.currency)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(tx.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {tx.note && ` · ${tx.note}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Saldo po</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{fmt(Number(tx.balanceAfter), loan.currency)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/loans" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            ← Powrót do pożyczek
          </Link>
        </div>
      )}

      {/* TAB: Schedule */}
      {activeTab === 'schedule' && paymentSchedule.length > 0 && (
        <PaymentScheduleWidget schedule={paymentSchedule} currency={loan.currency || 'PLN'} />
      )}

      {/* TAB: Breakdown */}
      {activeTab === 'breakdown' && interestBreakdown && (
        <InterestBreakdownWidget breakdown={interestBreakdown} currency={loan.currency || 'PLN'} />
      )}

      {/* TAB: Forecast */}
      {activeTab === 'forecast' && forecast && (
        <PaymentForecastWidget forecast={forecast} currency={loan.currency || 'PLN'} />
      )}

      {/* TAB: Notes */}
      {activeTab === 'notes' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>💬 Notatki</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!note.trim()) return;
                setAddingNote(true);
                try {
                  await loanNotesApi.add(loan.id, note);
                  setNote('');
                  await load();
                  toast('Notatka dodana', 'success');
                } catch (err: any) {
                  toast(err.message, 'error');
                } finally {
                  setAddingNote(false);
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dodaj notatkę..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={addingNote || !note.trim()} style={{ flexShrink: 0, padding: '10px 16px' }}>
                {addingNote ? <span className="spinner" /> : '➕'}
              </button>
            </form>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notes.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Brak notatek
              </div>
            ) : (
              notes.map((n) => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await loanNotesApi.delete(loan.id, n.id);
                        await load();
                        toast('Notatka usunięta', 'success');
                      } catch (err: any) {
                        toast(err.message, 'error');
                      }
                    }}
                    className="btn-icon"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  );
}
