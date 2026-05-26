import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loansApi, type Loan } from '../api';
import {
  PaymentScheduleComponent,
  PaymentSuggestionComponent,
  LoanHealthScoreComponent,
  InterestBreakdownComponent,
  PaymentForecastComponent,
  PaymentRulesComponent,
  LoanComparisonComponent,
} from '../components';
import { useToast } from '../components/Toast';
import { useAuth } from '../AuthContext';
import { GUEST_LOANS } from '../guestData';
import { RecentlyViewedService } from '../services/RecentlyViewedService';

export default function LoanDetailPageEnhanced() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'schedule' | 'insights' | 'forecast' | 'rules' | 'compare'>('overview');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { isGuest, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    if (isGuest) {
      const guestLoan = GUEST_LOANS.find(l => l.id === id);
      if (guestLoan) setLoan(guestLoan);
      else setError('Pożyczka nie znaleziona');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const data = await loansApi.get(id);
        setLoan(data);
      } catch (err: any) {
        setError(err.message);
        toast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isGuest]);

  // Record recently viewed item when loan data is loaded
  useEffect(() => {
    if (loan && user?.id) {
      RecentlyViewedService.recordView(user.id, {
        id: loan.id,
        type: 'loan',
        name: loan.borrowerName,
        balance: Number(loan.currentBalance),
        currency: loan.currency,
        viewedAt: new Date().toISOString(),
      });
    }
  }, [loan, user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Pożyczka nie znaleziona</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {error || 'Nie udało się załadować pożyczki'}
        </div>
        <Link to="/loans" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '700' }}>
          Wróć do listy
        </Link>
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: loan.currency }).format(n);

  const pct = loan.originalAmount > 0
    ? ((Number(loan.originalAmount) - Number(loan.currentBalance)) / Number(loan.originalAmount)) * 100
    : 0;

  const statusColor: Record<string, string> = {
    active: 'var(--primary)',
    paid: 'var(--success)',
    overdue: 'var(--danger)',
  };

  const allTabs = [
    { key: 'overview', label: '📋 Przegląd', icon: '📋', guestAllowed: true },
    { key: 'schedule', label: '📅 Harmonogram', icon: '📅', guestAllowed: false },
    { key: 'insights', label: '💡 Wglądy', icon: '💡', guestAllowed: false },
    { key: 'forecast', label: '🔮 Prognoza', icon: '🔮', guestAllowed: false },
    { key: 'rules', label: '⚙️ Reguły', icon: '⚙️', guestAllowed: false },
    { key: 'compare', label: '⚖️ Porównanie', icon: '⚖️', guestAllowed: false },
  ] as const;

  const tabs = isGuest ? allTabs.filter(t => t.guestAllowed) : allTabs;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/loans" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
          ← Wróć do pożyczek
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{loan.borrowerName}</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Pożyczka od {new Date(loan.createdAt).toLocaleDateString('pl-PL')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: statusColor[loan.status] }}>
              {fmt(Number(loan.currentBalance))}
            </div>
            <div style={{
              display: 'inline-block', padding: '6px 12px', borderRadius: '20px',
              background: `${statusColor[loan.status]}20`, color: statusColor[loan.status],
              fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginTop: '8px',
            }}>
              {loan.status === 'active' ? '✓ Aktywna' : loan.status === 'paid' ? '✓ Spłacona' : '⚠️ Przeterminowana'}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span>Postęp spłaty</span>
            <span style={{ fontWeight: '700' }}>{pct.toFixed(1)}%</span>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: statusColor[loan.status], transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: '8px 14px',
              background: tab === t.key ? 'var(--primary)' : 'var(--bg3)',
              color: tab === t.key ? '#fff' : 'var(--text)',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Guest note */}
      {isGuest && (
        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
          fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          🔒 Zaloguj się aby zobaczyć zaawansowane funkcje (harmonogram, wglądy, prognoza, reguły, porównanie)
        </div>
      )}

      {/* Content */}
      <div>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pierwotna kwota</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{fmt(Number(loan.originalAmount))}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pozostało</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{fmt(Number(loan.currentBalance))}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Spłacono</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)' }}>{fmt(Number(loan.originalAmount) - Number(loan.currentBalance))}</div>
              </div>
              {loan.dueDate && (
                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Termin spłaty</div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>{new Date(loan.dueDate).toLocaleDateString('pl-PL')}</div>
                </div>
              )}
            </div>

            {!isGuest && <PaymentSuggestionComponent loanId={loan.id} />}

            {loan.description && (
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>📝 Notatka</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{loan.description}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'schedule' && <PaymentScheduleComponent loanId={loan.id} borrowerName={loan.borrowerName} />}

        {tab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LoanHealthScoreComponent loanId={loan.id} />
            <InterestBreakdownComponent loanId={loan.id} />
          </div>
        )}

        {tab === 'forecast' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PaymentForecastComponent loanId={loan.id} />
          </div>
        )}

        {tab === 'rules' && <PaymentRulesComponent loanId={loan.id} />}

        {tab === 'compare' && (
          <div>
            {comparisonIds.length > 0 ? (
              <LoanComparisonComponent loanIds={comparisonIds} onClose={() => setComparisonIds([])} />
            ) : (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Porównaj z innymi pożyczkami</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Zaznacz inne pożyczki z listy aby je porównać z tą pożyczką
                </div>
                <Link to="/loans" style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--primary)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '12px' }}>
                  Przejdź do listy
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
