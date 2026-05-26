import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { obligationsApi } from '../api';
import type { Obligation, Transaction } from '../api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Confetti from '../components/Confetti';
import { AnimatedNumber, AnimatedStatus } from '../components';
import FilterPanel, { type LoanFilters, DEFAULT_FILTERS } from '../components/FilterPanel';
import GuestBanner from '../components/GuestBanner';
import { useAuth } from '../AuthContext';
import { useGuestGuard } from '../hooks/useGuestGuard';
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
      <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--warning)' }} />
    </div>
  );
}

export default function ObligationsPage() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Obligation | null>(null);
  const [showPayments, setShowPayments] = useState<Obligation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Obligation | null>(null);
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
        await new Promise(r => setTimeout(r, 300));
        setObligations([]);
      } else {
        const r = await obligationsApi.list({ limit: '100' });
        setObligations((r as any).obligations ?? []);
      }
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [isGuest]);

  useEffect(() => { load(); }, [load]);

  const { containerRef, pullY, refreshing } = usePullToRefresh(load);

  const handleDelete = async (ob: Obligation) => {
    if (checkGuest('Nie możesz usuwać zobowiązań w trybie gościa')) return;
    setDeleteTarget(null);
    setRemovingId(ob.id);
    await new Promise(r => setTimeout(r, 350));
    try {
      await obligationsApi.delete(ob.id);
      toast('Zobowiązanie usunięte', 'success');
      setObligations(prev => prev.filter(o => o.id !== ob.id));
      // Remove from recently viewed list
      if (user?.id) {
        RecentlyViewedService.removeItem(user.id, ob.id);
      }
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setRemovingId(null); }
  };

  const filtered = obligations
    .filter(o => {
      if (filters.status === 'overdue') return o.status === 'active' && o.dueDate && new Date(o.dueDate) < new Date();
      return filters.status === 'all' ? true : o.status === filters.status;
    })
    .filter(o => !debouncedSearch || o.creditorName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(o => !filters.currency || filters.currency === 'all' || o.currency === filters.currency)
    .filter(o => !filters.amountMin || Number(o.currentBalance) >= Number(filters.amountMin))
    .filter(o => !filters.amountMax || Number(o.currentBalance) <= Number(filters.amountMax))
    .filter(o => !filters.dateFrom || new Date(o.createdAt) >= new Date(filters.dateFrom))
    .filter(o => !filters.dateTo || new Date(o.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    .sort((a, b) => {
      switch (filters.sort) {
        case 'amount_desc': return Number(b.currentBalance) - Number(a.currentBalance);
        case 'amount_asc': return Number(a.currentBalance) - Number(b.currentBalance);
        case 'name_asc': return a.creditorName.localeCompare(b.creditorName);
        case 'name_desc': return b.creditorName.localeCompare(a.creditorName);
        case 'date_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalBalance = obligations.reduce((s, o) => s + Number(o.currentBalance), 0);
  const activeCount = obligations.filter(o => o.status === 'active').length;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <GuestBanner />

      {(pullY > 0 || refreshing) && (
        <div className="pull-indicator" style={{ height: pullY, marginBottom: pullY > 0 ? '8px' : 0 }}>
          {refreshing
            ? <><span className="spinner spinner-dark" style={{ width: 16, height: 16 }} /> Odświeżanie...</>
            : pullY > 60 ? '↑ Puść aby odświeżyć' : '↓ Pociągnij aby odświeżyć'
          }
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '6px' }}>
            📋 Moje Zobowiązania
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '0' }}>
            {activeCount} aktywnych · <AnimatedNumber value={totalBalance} format="currency" currency="PLN" /> łącznie
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { if (!checkGuest('Nie możesz dodawać zobowiązań w trybie gościa')) setShowCreate(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> {isGuest ? '🔒 Nowe' : 'Nowe'}
        </button>
      </div>

      <FilterPanel
        filters={filters}
        onChange={f => { setFilters(f); setPage(1); }}
        onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
        totalCount={obligations.length}
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
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg2)', border: '2px dashed var(--border2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px', opacity: 0.7 }}>📋</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            {filters.status === 'all' && !filters.search ? 'Brak zobowiązań' : 'Brak wyników'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: filters.status === 'all' && !filters.search ? '20px' : 0 }}>
            {filters.status === 'all' && !filters.search
              ? 'Dodaj pierwsze zobowiązanie klikając przycisk poniżej'
              : 'Spróbuj zmienić filtry lub wyszukiwanie'}
          </p>
          {filters.status === 'all' && !filters.search && (
            <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '10px 24px' }}>
              + Dodaj zobowiązanie
            </button>
          )}
        </div>
      ) : (
        <div>
          {paginated.map((ob, i) => (
            <SwipableObligationCard
              key={ob.id}
              obligation={ob}
              delay={i * 40}
              removing={removingId === ob.id}
              onEdit={() => { if (!checkGuest('Nie możesz edytować zobowiązań w trybie gościa')) setSelected(ob); }}
              onPayments={() => setShowPayments(ob)}
              onDelete={() => setDeleteTarget(ob)}
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

      {showCreate && <ObligationModal onClose={(saved) => { setShowCreate(false); if (saved) { toast('Zobowiązanie dodane ✓', 'success'); load(); } }} />}
      {selected && <ObligationModal obligation={selected} onClose={(saved) => { setSelected(null); if (saved) { toast('Zaktualizowano ✓', 'success'); load(); } }} />}
      {showPayments && <PaymentsModal obligation={showPayments} onClose={() => { setShowPayments(null); load(); }} onFullyPaid={() => setShowConfetti(true)} />}
      {deleteTarget && (
        <ConfirmModal
          title="Usuń zobowiązanie"
          message={`Czy na pewno chcesz usunąć zobowiązanie "${deleteTarget.creditorName}"? Ta operacja jest nieodwracalna.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  );
}

function SwipableObligationCard({ obligation, delay, removing, onEdit, onPayments, onDelete }: {
  obligation: Obligation; delay: number; removing: boolean;
  onEdit: () => void; onPayments: () => void; onDelete: () => void;
}) {
  const { isGuest } = useAuth();
  const { checkGuest } = useGuestGuard();
  const { onTouchStart, onTouchMove, onTouchEnd, style: swipeStyle, offset } = useSwipeDelete(
    () => { if (!checkGuest('Nie możesz usuwać zobowiązań w trybie gościa')) onDelete(); }
  );
  const isOverdue = obligation.status === 'active' && obligation.dueDate && new Date(obligation.dueDate) < new Date();
  const pct = obligation.originalAmount > 0
    ? ((Number(obligation.originalAmount) - Number(obligation.currentBalance)) / Number(obligation.originalAmount)) * 100
    : 0;

  return (
    <div className={removing ? 'card-removing' : ''} style={{ marginBottom: '10px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
        <div className="swipe-delete-bg" style={{ opacity: Math.min(1, Math.abs(offset) / 80) }}>🗑️ Usuń</div>
        <div
          className="card animate-in"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{
            padding: '16px', marginBottom: 0, animationDelay: `${delay}ms`,
            borderColor: isOverdue ? 'rgba(239,68,68,0.4)' : undefined,
            background: isOverdue ? 'rgba(239,68,68,0.04)' : undefined,
            ...swipeStyle,
          }}
        >
          {isOverdue && (
            <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '700', marginBottom: '8px' }}>
              ⚠️ Termin minął {new Date(obligation.dueDate!).toLocaleDateString('pl-PL')}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {obligation.creditorName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {obligation.dueDate && !isOverdue
                  ? `Termin: ${new Date(obligation.dueDate).toLocaleDateString('pl-PL')}`
                  : `Dodano: ${new Date(obligation.createdAt).toLocaleDateString('pl-PL')}`}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
              <div style={{ fontWeight: '800', fontSize: '17px', color: obligation.status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                {fmt(Number(obligation.currentBalance), obligation.currency)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>z {fmt(Number(obligation.originalAmount), obligation.currency)}</div>
            </div>
          </div>
          <ProgressBar value={Number(obligation.currentBalance)} max={Number(obligation.originalAmount)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AnimatedStatus status={isOverdue ? 'overdue' : (obligation.status as 'active' | 'paid')} size="sm" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {pct.toFixed(0)}% spłacone</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={onPayments} style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                Historia
              </button>
              <button onClick={onEdit} style={{ padding: '5px 10px', fontSize: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
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

function ObligationModal({ obligation, onClose }: { obligation?: Obligation; onClose: (saved: boolean) => void }) {
  const [creditorName, setCreditorName] = useState(obligation?.creditorName ?? '');
  const [originalAmount, setOriginalAmount] = useState(String(obligation?.originalAmount ?? ''));
  const [dueDate, setDueDate] = useState(obligation?.dueDate ? String(obligation.dueDate).slice(0, 10) : '');
  const [description, setDescription] = useState(obligation?.description ?? '');
  const [currency, setCurrency] = useState(obligation?.currency ?? 'PLN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = { creditorName, originalAmount: Number(originalAmount), dueDate: dueDate || undefined, description: description || undefined, currency };
      if (obligation) await obligationsApi.update(obligation.id, data);
      else await obligationsApi.create(data);
      onClose(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div className="modal">
        <h3>{obligation ? '✏️ Edytuj zobowiązanie' : '📋 Nowe zobowiązanie'}</h3>
        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nazwa wierzyciela *</label>
            <input value={creditorName} onChange={e => setCreditorName(e.target.value)} placeholder="Bank / Firma / Osoba" required autoFocus />
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
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Np. kredyt hipoteczny..." />
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

function PaymentsModal({ obligation, onClose, onFullyPaid }: { obligation: Obligation; onClose: () => void; onFullyPaid: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(true);
  const [current, setCurrent] = useState(obligation);
  const { toast } = useToast();
  const { isGuest } = useAuth();

  const loadTx = async () => {
    setTxLoading(true);
    try {
      const r = await obligationsApi.payments(obligation.id);
      setTransactions((r as any).transactions ?? []);
      const updated = await obligationsApi.get(obligation.id);
      setCurrent(updated);
    } finally { setTxLoading(false); }
  };
  useEffect(() => { loadTx(); }, []);

  const addPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (isGuest) { toast('🔒 Tryb gościa: Nie możesz rejestrować spłat', 'info'); return; }
    setError(''); setLoading(true);
    try {
      await obligationsApi.addPayment(obligation.id, Number(amount), note || undefined);
      const wasFullyPaid = Number(current.currentBalance) - Number(amount) <= 0;
      setAmount(''); setNote('');
      await loadTx();
      if (wasFullyPaid) { toast('🎉 Zobowiązanie w pełni spłacone!', 'success'); onFullyPaid(); }
      else toast('Spłata zarejestrowana ✓', 'success');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const pct = current.originalAmount > 0
    ? ((Number(current.originalAmount) - Number(current.currentBalance)) / Number(current.originalAmount)) * 100
    : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <h3>💳 Historia spłat</h3>
        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{current.creditorName}</div>
        <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pozostało</span>
            <span style={{ fontWeight: '700', color: current.status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>{fmt(Number(current.currentBalance), current.currency)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--warning)' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>{pct.toFixed(1)}% z {fmt(Number(current.originalAmount), current.currency)}</div>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: '12px' }}>⚠️ {error}</div>}
        {current.status !== 'paid' && (
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
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Historia ({transactions.length})</div>
        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {txLoading ? <div style={{ textAlign: 'center', padding: '20px' }}><span className="spinner spinner-dark" /></div>
            : transactions.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak transakcji</p>
            : transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success)' }}>-{fmt(Number(tx.amount), current.currency)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px' }}>→ {fmt(Number(tx.balanceAfter), current.currency)}</div>
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
