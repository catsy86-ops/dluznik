import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { loansApi } from '../api';
import type { Loan, Transaction } from '../api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Confetti from '../components/Confetti';
import { AnimatedNumber, AnimatedStatus, VoiceButton } from '../components';
import FilterPanel, { type LoanFilters, DEFAULT_FILTERS } from '../components/FilterPanel';
import GuestBanner from '../components/GuestBanner';
import { useAuth } from '../AuthContext';
import { useGuestGuard } from '../hooks/useGuestGuard';
import { GUEST_LOANS, GUEST_TRANSACTIONS } from '../guestData';
import { useSwipeDelete } from '../hooks/useSwipeDelete';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useDebounce } from '../hooks/useDebounce';
import { RecentlyViewedService } from '../services/RecentlyViewedService';

function fmt(n: number, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(n);
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, ((Number(max) - Number(value)) / Number(max)) * 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary)' }} />
    </div>
  );
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Loan | null>(null);
  const [showPayments, setShowPayments] = useState<Loan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [filters, setFilters] = useState<LoanFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const { isGuest, user } = useAuth();
  const { checkGuest } = useGuestGuard();
  const debouncedSearch = useDebounce(filters.search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // Use demo data for guest mode
        await new Promise(r => setTimeout(r, 400)); // simulate loading
        setLoans(GUEST_LOANS);
      } else {
        const r = await loansApi.list({ limit: '100' });
        setLoans((r as any).loans ?? []);
      }
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [isGuest]);

  useEffect(() => { load(); }, [load]);

  const { containerRef, pullY, refreshing } = usePullToRefresh(load);

  const handleDelete = async (loan: Loan) => {
    if (checkGuest('Nie możesz usuwać pożyczek w trybie gościa')) return;
    setDeleteTarget(null);
    setRemovingId(loan.id);
    await new Promise(r => setTimeout(r, 350));
    try {
      await loansApi.delete(loan.id);
      toast('Pożyczka usunięta', 'success');
      setLoans(prev => prev.filter(l => l.id !== loan.id));
      // Remove from recently viewed list
      if (user?.id) {
        RecentlyViewedService.removeItem(user.id, loan.id);
      }
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setRemovingId(null); }
  };

  // Apply all filters client-side
  const filtered = loans
    .filter(l => {
      // Status filter (overdue is special case)
      if (filters.status === 'overdue') {
        return l.status === 'active' && l.dueDate && new Date(l.dueDate) < new Date();
      }
      return filters.status === 'all' ? true : l.status === filters.status;
    })
    .filter(l => !debouncedSearch || l.borrowerName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(l => !filters.currency || filters.currency === 'all' || l.currency === filters.currency)
    .filter(l => !filters.amountMin || Number(l.currentBalance) >= Number(filters.amountMin))
    .filter(l => !filters.amountMax || Number(l.currentBalance) <= Number(filters.amountMax))
    .filter(l => !filters.dateFrom || new Date(l.createdAt) >= new Date(filters.dateFrom))
    .filter(l => !filters.dateTo || new Date(l.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    .sort((a, b) => {
      switch (filters.sort) {
        case 'amount_desc': return Number(b.currentBalance) - Number(a.currentBalance);
        case 'amount_asc': return Number(a.currentBalance) - Number(b.currentBalance);
        case 'name_asc': return a.borrowerName.localeCompare(b.borrowerName);
        case 'name_desc': return b.borrowerName.localeCompare(a.borrowerName);
        case 'date_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalBalance = loans.reduce((s, l) => s + Number(l.currentBalance), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;
  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Guest mode banner */}
      <GuestBanner />

      {/* Pull to refresh indicator */}
      {(pullY > 0 || refreshing) && (
        <div className="pull-indicator" style={{ height: pullY, marginBottom: pullY > 0 ? '8px' : 0 }}>
          {refreshing
            ? <><span className="spinner spinner-dark" style={{ width: 16, height: 16 }} /> Odświeżanie...</>
            : pullY > 60
              ? '↑ Puść aby odświeżyć'
              : '↓ Pociągnij aby odświeżyć'
          }
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '900',
            letterSpacing: '-1px',
            marginBottom: '6px'
          }}>
            📋 Moje Pożyczki
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-muted)',
            marginBottom: '0'
          }}>
            {activeCount} aktywnych · <AnimatedNumber 
              value={totalBalance} 
              format="currency" 
              currency="PLN"
            /> łącznie
          </p>
        </div>
        <button className="btn-primary bounce-cta" onClick={() => {
          if (!checkGuest('Nie możesz dodawać pożyczek w trybie gościa')) setShowCreate(true);
        }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> {isGuest ? '🔒 Nowa' : 'Nowa'}
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <FilterPanel
        filters={filters}
        onChange={f => { setFilters(f); setPage(1); }}
        onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
        totalCount={loans.length}
        filteredCount={filtered.length}
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 6, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💸"
          title={filters.status === 'all' && !filters.search ? 'Brak pożyczek' : 'Brak wyników'}
          desc={filters.status === 'all' && !filters.search ? 'Dodaj pierwszą pożyczkę klikając przycisk poniżej' : 'Spróbuj zmienić filtry lub wyszukiwanie'}
          action={filters.status === 'all' && !filters.search ? { label: '+ Dodaj pożyczkę', onClick: () => setShowCreate(true) } : { label: 'Wyczyść filtry', onClick: () => setFilters(DEFAULT_FILTERS) }}
        />
      ) : (
        <div>
          {paginated.map((loan, i) => (
            <SwipableLoanCard
              key={loan.id}
              loan={loan}
              delay={i * 40}
              removing={removingId === loan.id}
              onEdit={() => setSelected(loan)}
              onPayments={() => setShowPayments(loan)}
              onDelete={() => setDeleteTarget(loan)}
            />
          ))}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px' }}>←</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
              <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px' }}>→</button>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <LoanModal onClose={(saved) => {
          setShowCreate(false);
          if (saved) { toast('Pożyczka dodana ✓', 'success'); load(); }
        }} />
      )}
      {selected && (
        <LoanModal loan={selected} onClose={(saved) => {
          setSelected(null);
          if (saved) { toast('Pożyczka zaktualizowana ✓', 'success'); load(); }
        }} />
      )}
      {showPayments && (
        <PaymentsModal
          loan={showPayments}
          onClose={() => { setShowPayments(null); load(); }}
          onFullyPaid={() => setShowConfetti(true)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Usuń pożyczkę"
          message={`Czy na pewno chcesz usunąć pożyczkę dla "${deleteTarget.borrowerName}"? Ta operacja jest nieodwracalna.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 20px',
      background: 'var(--bg2)', border: '2px dashed var(--border2)',
      borderRadius: '16px',
    }}>
      <div style={{ fontSize: '52px', marginBottom: '12px', opacity: 0.7 }}>{icon}</div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: action ? '20px' : 0 }}>{desc}</p>
      {action && (
        <button className="btn-primary" onClick={action.onClick} style={{ padding: '10px 24px' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function SwipableLoanCard({ loan, delay, removing, onEdit, onPayments, onDelete }: {
  loan: Loan; delay: number; removing: boolean;
  onEdit: () => void; onPayments: () => void; onDelete: () => void;
}) {
  const { isGuest } = useAuth();
  const { checkGuest } = useGuestGuard();
  const { onTouchStart, onTouchMove, onTouchEnd, style: swipeStyle, offset } = useSwipeDelete(
    () => checkGuest('Nie możesz usuwać pożyczek w trybie gościa') ? undefined : onDelete()
  );
  const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date();
  const pct = loan.originalAmount > 0 ? ((Number(loan.originalAmount) - Number(loan.currentBalance)) / Number(loan.originalAmount)) * 100 : 0;
  void pct; // used in ProgressBar below

  const statusMap: Record<string, [string, string]> = {
    active: ['var(--primary)', 'Aktywna'],
    paid: ['var(--success)', 'Spłacona'],
    overdue: ['var(--danger)', 'Przeterminowana'],
  };
  const [_statusColor, _statusLabel] = statusMap[loan.status] ?? ['var(--text-muted)', loan.status];

  return (
    <div className={removing ? 'card-removing' : ''} style={{ marginBottom: '10px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
        {/* Swipe delete background */}
        <div className="swipe-delete-bg" style={{ opacity: Math.min(1, Math.abs(offset) / 80) }}>
          🗑️ Usuń
        </div>
        {/* Card */}
        <div
          className={`loan-card animate-in status-${loan.status === 'active' && isOverdue ? 'overdue' : loan.status}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            padding: '16px', marginBottom: 0,
            animationDelay: `${delay}ms`,
            borderColor: isOverdue ? 'rgba(239,68,68,0.4)' : undefined,
            background: isOverdue ? 'rgba(239,68,68,0.04)' : undefined,
            ...swipeStyle,
          }}
        >
          {isOverdue && (
            <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚠️ Termin minął {new Date(loan.dueDate!).toLocaleDateString('pl-PL')}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loan.borrowerName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {loan.dueDate && !isOverdue ? `Termin: ${new Date(loan.dueDate).toLocaleDateString('pl-PL')}` : `Dodano: ${new Date(loan.createdAt).toLocaleDateString('pl-PL')}`}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
              <div style={{ fontWeight: '800', fontSize: '17px', color: loan.status === 'paid' ? 'var(--success)' : 'var(--primary)' }}>
                {fmt(Number(loan.currentBalance), loan.currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>z {fmt(Number(loan.originalAmount), loan.currency)}</div>
            </div>
          </div>

          <ProgressBar value={Number(loan.currentBalance)} max={Number(loan.originalAmount)} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <AnimatedStatus 
              status={isOverdue ? 'overdue' : (loan.status as 'active' | 'paid')} 
              size="sm" 
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link to={`/loans/${loan.id}`} style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s', }}>
                Szczegóły
              </Link>
              <button onClick={() => {
                if (!checkGuest('Nie możesz rejestrować spłat w trybie gościa')) onPayments();
              }} style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {isGuest ? '🔒' : ''} Spłata
              </button>
              <button onClick={() => {
                if (!checkGuest('Nie możesz edytować pożyczek w trybie gościa')) onEdit();
              }} style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {isGuest ? '🔒' : ''} Edytuj
              </button>
              {!isGuest && (
                <button onClick={onDelete} style={{ padding: '5px 10px', fontSize: '12px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Usuń
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoanModal({ loan, onClose }: { loan?: Loan; onClose: (saved: boolean) => void }) {
  const [borrowerName, setBorrowerName] = useState(loan?.borrowerName ?? '');
  const [originalAmount, setOriginalAmount] = useState(String(loan?.originalAmount ?? ''));
  const [dueDate, setDueDate] = useState(loan?.dueDate ? String(loan.dueDate).slice(0, 10) : '');
  const [description, setDescription] = useState(loan?.description ?? '');
  const [currency, setCurrency] = useState(loan?.currency ?? 'PLN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVoiceInput = (text: string) => {
    // Parse voice input for borrower name
    const cleanText = text.trim();
    if (cleanText.length > 2) {
      // Capitalize first letter of each word
      const formatted = cleanText
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setBorrowerName(formatted);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = { borrowerName, originalAmount: Number(originalAmount), dueDate: dueDate || undefined, description: description || undefined, currency };
      if (loan) await loansApi.update(loan.id, data);
      else await loansApi.create(data);
      onClose(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div className="modal">
        <h3>{loan ? '✏️ Edytuj pożyczkę' : '💸 Nowa pożyczka'}</h3>
        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Imię dłużnika *</span>
              <VoiceButton 
                onTranscript={handleVoiceInput}
                label="🎤"
                language="pl-PL"
              />
            </label>
            <input value={borrowerName} onChange={e => setBorrowerName(e.target.value)} placeholder="Jan Kowalski" required autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Kwota *</label>
              <input type="number" value={originalAmount} onChange={e => setOriginalAmount(e.target.value)} placeholder="1000" min="0.01" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Waluta</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>PLN</option><option>EUR</option><option>USD</option><option>GBP</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Termin spłaty</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Opis (opcjonalnie)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Np. pożyczka na samochód..." />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn-ghost" onClick={() => onClose(false)}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '90px' }}>
              {loading ? <span className="spinner" /> : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentsModal({ loan, onClose, onFullyPaid }: { loan: Loan; onClose: () => void; onFullyPaid: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(true);
  const [currentLoan, setCurrentLoan] = useState(loan);
  const { toast } = useToast();
  const { isGuest } = useAuth();

  const loadTx = async () => {
    setTxLoading(true);
    try {
      if (isGuest) {
        await new Promise(r => setTimeout(r, 300));
        setTransactions(GUEST_TRANSACTIONS[loan.id] ?? []);
      } else {
        const r = await loansApi.payments(loan.id);
        setTransactions((r as any).transactions ?? []);
        const updated = await loansApi.get(loan.id);
        setCurrentLoan(updated);
      }
    } finally { setTxLoading(false); }
  };
  useEffect(() => { loadTx(); }, []);

  const addPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast('🔒 Tryb gościa: Nie możesz rejestrować spłat', 'info');
      return;
    }
    setError(''); setLoading(true);
    try {
      await loansApi.addPayment(loan.id, Number(amount), note || undefined);
      const wasFullyPaid = Number(currentLoan.currentBalance) - Number(amount) <= 0;
      setAmount(''); setNote('');
      await loadTx();
      if (wasFullyPaid) {
        toast('🎉 Pożyczka w pełni spłacona!', 'success');
        onFullyPaid();
      } else {
        toast('Spłata zarejestrowana ✓', 'success');
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const pct = currentLoan.originalAmount > 0
    ? ((Number(currentLoan.originalAmount) - Number(currentLoan.currentBalance)) / Number(currentLoan.originalAmount)) * 100
    : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <h3>💳 Historia spłat</h3>
        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{currentLoan.borrowerName}</div>

        <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pozostało</span>
            <span style={{ fontWeight: '700', color: currentLoan.status === 'paid' ? 'var(--success)' : 'var(--primary)' }}>
              {fmt(Number(currentLoan.currentBalance), currentLoan.currency)}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
            {pct.toFixed(1)}% z {fmt(Number(currentLoan.originalAmount), currentLoan.currency)}
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '12px' }}>⚠️ {error}</div>}

        {currentLoan.status !== 'paid' && (
          <form onSubmit={addPayment} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zarejestruj spłatę</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Kwota" min="0.01" step="0.01" required style={{ flex: '0 0 110px' }} />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notatka..." style={{ flex: 1 }} />
              <button type="submit" className="btn-success" disabled={loading} style={{ flexShrink: 0, padding: '10px 14px' }}>
                {loading ? <span className="spinner" /> : '+ Dodaj'}
              </button>
            </div>
          </form>
        )}

        <div className="divider" />
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Historia ({transactions.length})
        </div>

        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {txLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><span className="spinner spinner-dark" /></div>
          ) : transactions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak transakcji</p>
          ) : transactions.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success)' }}>-{fmt(Number(tx.amount), currentLoan.currency)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px' }}>→ {fmt(Number(tx.balanceAfter), currentLoan.currency)}</div>
                {tx.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.note}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button className="btn-ghost" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}
