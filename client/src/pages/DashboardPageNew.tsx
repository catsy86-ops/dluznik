/**
 * DashboardPageNew Component
 * 
 * Complete financial overview dashboard with:
 * - Summary statistics cards
 * - Financial charts (pie + bar)
 * - Recent payment timeline with borrower names
 * - Key metrics
 * - Multi-currency support with per-currency breakdown
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loansApi, obligationsApi } from '../api';
import type { Loan, Obligation, Transaction } from '../api';
import { AnimatedNumber, StatCard, EnhancedCard } from '../components';
import { useToast } from '../components/Toast';
import { useAuth } from '../AuthContext';
import GuestBanner from '../components/GuestBanner';
import DashboardEmptyState from '../components/DashboardEmptyState';
import { GUEST_LOANS, GUEST_TRANSACTIONS } from '../guestData';
import { aggregateByCurrency, formatCurrency } from '../utils/currencyAggregator';
import { RecentlyViewedService } from '../services/RecentlyViewedService';
import type { CurrencyGroup, RecentlyViewedItem } from '../types/dashboard-ux';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';

interface TransactionWithLoan extends Transaction {
  borrowerName: string;
  loanId: string;
}

interface DashboardStats {
  totalDebt: number;
  totalPaid: number;
  totalInProgress: number;
  totalOverdue: number;
  activeLoans: number;
  paidLoans: number;
  overdueLoans: number;
  recentTransactions: TransactionWithLoan[];
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function DashboardPageNew() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDebt: 0,
    totalPaid: 0,
    totalInProgress: 0,
    totalOverdue: 0,
    activeLoans: 0,
    paidLoans: 0,
    overdueLoans: 0,
    recentTransactions: [],
  });
  const [loans, setLoans] = useState<Loan[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const { toast } = useToast();
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allLoans: Loan[] = isGuest
        ? GUEST_LOANS
        : ((await loansApi.list({ limit: '100' })) as any).loans ?? [];

      const allObligations: Obligation[] = isGuest
        ? []
        : ((await obligationsApi.list({ limit: '100' })) as any).obligations ?? [];

      setLoans(allLoans);
      setObligations(allObligations);

      let totalDebt = 0;
      let totalOriginal = 0;
      let totalOverdue = 0;
      let activeCount = 0;
      let paidCount = 0;
      let overdueCount = 0;
      const allTransactions: TransactionWithLoan[] = [];

      // Only fetch transactions for top 5 most recent loans (non-guest) to reduce N+1 calls
      const loansForTransactions = isGuest
        ? allLoans
        : allLoans
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);

      for (const loan of allLoans) {
        const balance = Number(loan.currentBalance);
        const original = Number(loan.originalAmount);
        totalDebt += balance;
        totalOriginal += original;
        if (loan.status === 'active') activeCount++;
        if (loan.status === 'paid') paidCount++;
        const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date();
        if (isOverdue) { overdueCount++; totalOverdue += balance; }
      }

      for (const loan of loansForTransactions) {
        if (isGuest) {
          const txs = (GUEST_TRANSACTIONS[loan.id] ?? []).map(tx => ({
            ...tx,
            borrowerName: loan.borrowerName,
            loanId: loan.id,
          }));
          allTransactions.push(...txs);
        } else {
          try {
            const txResponse = await loansApi.payments(loan.id);
            const txs = ((txResponse as any).transactions ?? []).map((tx: Transaction) => ({
              ...tx,
              borrowerName: loan.borrowerName,
              loanId: loan.id,
            }));
            allTransactions.push(...txs);
          } catch {}
        }
      }

      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setStats({
        totalDebt,
        totalPaid: totalOriginal - totalDebt,
        totalInProgress: totalDebt - totalOverdue,
        totalOverdue,
        activeLoans: activeCount,
        paidLoans: paidCount,
        overdueLoans: overdueCount,
        recentTransactions: allTransactions.slice(0, 5),
      });
    } catch (error: any) {
      setError(error.message || 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas \u0142adowania danych');
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load recently viewed items for the current session
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    if (!RecentlyViewedService.hasSessionItems()) {
      setRecentlyViewed([]);
      return;
    }
    const items = RecentlyViewedService.getSessionItems(userId).slice(0, 5);
    setRecentlyViewed(items);
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <GuestBanner />
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg2)', border: '2px solid var(--danger)', borderRadius: '20px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--danger)' }}>
            Błąd ładowania danych
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
            {error}
          </p>
          <button
            onClick={loadDashboard}
            style={{
              padding: '12px 24px', background: 'var(--primary)', color: '#fff',
              borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            🔄 Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no loans and no obligations
  if (loans.length === 0 && obligations.length === 0) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <GuestBanner />
        <DashboardEmptyState
          onNavigateLoans={() => navigate('/loans')}
          onNavigateObligations={() => navigate('/obligations')}
        />
      </div>
    );
  }

  // Currency aggregation
  const currencyGroups: CurrencyGroup[] = aggregateByCurrency(
    loans.map(l => ({
      id: l.id,
      borrowerName: l.borrowerName,
      currentBalance: Number(l.currentBalance),
      currency: l.currency,
    })),
    obligations.map(o => ({
      id: o.id,
      creditorName: o.creditorName,
      currentBalance: Number(o.currentBalance),
      currency: o.currency,
    }))
  );

  const isMultiCurrency = currencyGroups.length > 1;

  const healthPercentage = stats.totalDebt > 0
    ? Math.round(((stats.totalDebt - stats.totalOverdue) / stats.totalDebt) * 100)
    : 100;

  const pieData = [
    { name: 'Aktywne', value: stats.activeLoans, color: '#6366f1' },
    { name: 'Sp\u0142acone', value: stats.paidLoans, color: '#10b981' },
    { name: 'Przeterminowane', value: stats.overdueLoans, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const barData = loans
    .slice()
    .sort((a, b) => Number(b.currentBalance) - Number(a.currentBalance))
    .slice(0, 5)
    .map(loan => ({
      name: loan.borrowerName.split(' ')[0],
      balance: Number(loan.currentBalance),
      currency: loan.currency,
    }));

  // DonutChart data: per-currency breakdown when multiple currencies
  const currencyDonutData = isMultiCurrency
    ? currencyGroups.map((group, index) => ({
        name: `${group.currency} - Po\u017Cyczki`,
        value: group.totalLoanBalance,
        color: CHART_COLORS[index % CHART_COLORS.length],
        currency: group.currency,
        type: 'loans' as const,
      })).concat(
        currencyGroups.map((group, index) => ({
          name: `${group.currency} - Zobowi\u0105zania`,
          value: group.totalObligationBalance,
          color: CHART_COLORS[(index + currencyGroups.length) % CHART_COLORS.length],
          currency: group.currency,
          type: 'obligations' as const,
        }))
      ).filter(d => d.value > 0)
    : null;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <GuestBanner />

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px',
          background: 'var(--gradient-text)', backgroundClip: 'text',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          📊 Przegląd Finansowy
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Pełny przegląd Twojej sytuacji finansowej
        </p>
      </div>

      {/* Multi-Currency Balance Summaries */}
      {isMultiCurrency ? (
        <>
          {currencyGroups.map((group) => (
            <div key={group.currency} style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px',
              }}>
                💱 {group.currency}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <EnhancedCard premium>
                  <StatCard icon='💰' label="Saldo Netto"
                    value={formatCurrency(group.netBalance, group.currency)}
                    color={group.netBalance >= 0 ? 'var(--success)' : 'var(--danger)'} />
                </EnhancedCard>
                <EnhancedCard premium>
                  <StatCard icon='💸' label="Pożyczki"
                    value={formatCurrency(group.totalLoanBalance, group.currency)}
                    color="var(--primary)" />
                </EnhancedCard>
                <EnhancedCard premium>
                  <StatCard icon='📋' label="Zobowiązania"
                    value={formatCurrency(group.totalObligationBalance, group.currency)}
                    color="var(--warning)" />
                </EnhancedCard>
              </div>
            </div>
          ))}
        </>
      ) : (
        /* Single Currency - no grouping headers */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <EnhancedCard premium>
            <StatCard icon='💰' label="Saldo Netto"
              value={formatCurrency(currencyGroups[0]?.netBalance ?? 0, currencyGroups[0]?.currency ?? 'PLN')}
              color={(currencyGroups[0]?.netBalance ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)'} />
          </EnhancedCard>
          <EnhancedCard premium>
            <StatCard icon='💸' label="Pożyczki"
              value={formatCurrency(currencyGroups[0]?.totalLoanBalance ?? 0, currencyGroups[0]?.currency ?? 'PLN')}
              color="var(--primary)" />
          </EnhancedCard>
          <EnhancedCard premium>
            <StatCard icon='📋' label="Zobowiązania"
              value={formatCurrency(currencyGroups[0]?.totalObligationBalance ?? 0, currencyGroups[0]?.currency ?? 'PLN')}
              color="var(--warning)" />
          </EnhancedCard>
          <EnhancedCard premium>
            <StatCard icon='⚠️' label="Przeterminowane"
              value={formatCurrency(stats.totalOverdue, currencyGroups[0]?.currency ?? 'PLN')}
              color="var(--danger)" />
          </EnhancedCard>
        </div>
      )}

      {/* Loans Count Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <EnhancedCard premium badge={{ label: 'Active', color: 'active' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Aktywne Pożyczki</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>{stats.activeLoans}</div>
          </div>
        </EnhancedCard>
        <EnhancedCard premium badge={{ label: 'Paid', color: 'paid' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Spłacone Pożyczki</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--success)' }}>{stats.paidLoans}</div>
          </div>
        </EnhancedCard>
        <EnhancedCard premium badge={{ label: 'Overdue', color: 'overdue' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Przeterminowane</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--danger)' }}>{stats.overdueLoans}</div>
          </div>
        </EnhancedCard>
      </div>

      {/* Health Score */}
      <EnhancedCard premium style={{ marginBottom: '30px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
            Wskaźnik Zdrowia Finansowego
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, height: '10px', background: 'var(--bg5)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${healthPercentage}%`,
                background: healthPercentage > 70 ? 'var(--success)' : healthPercentage > 40 ? 'var(--warning)' : 'var(--danger)',
                transition: 'all 0.3s ease',
              }} />
            </div>
            <div style={{
              fontSize: '16px', fontWeight: '900', minWidth: '40px', textAlign: 'right',
              color: healthPercentage > 70 ? 'var(--success)' : healthPercentage > 40 ? 'var(--warning)' : 'var(--danger)',
            }}>
              {healthPercentage}%
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {healthPercentage > 70 && '✅ Dobra sytuacja — większość pożyczek płaconych na czas'}
            {healthPercentage > 40 && healthPercentage <= 70 && '⚠️ Średnia — zwróć uwagę na przeterminowane'}
            {healthPercentage <= 40 && '🔴 Poważna — wiele przeterminowanych pożyczek'}
          </p>
        </div>
      </EnhancedCard>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <EnhancedCard premium>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>
            📊 {isMultiCurrency ? 'Rozkład wg Walut' : 'Rozkład Pożyczek'}
          </h2>
          {isMultiCurrency && currencyDonutData ? (
            currencyDonutData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak danych</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={currencyDonutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {currencyDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const item = currencyDonutData.find(d => d.name === name);
                      return [item ? formatCurrency(value, item.currency) : value, name];
                    }}
                    contentStyle={{ background: '#0d1117', border: '1px solid #2a3450', borderRadius: '8px', fontSize: '12px', color: '#e2e8f5' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#6b7a99' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            pieData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak danych</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Liczba']}
                    contentStyle={{ background: '#0d1117', border: '1px solid #2a3450', borderRadius: '8px', fontSize: '12px', color: '#e2e8f5' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#6b7a99' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          )}
        </EnhancedCard>

        <EnhancedCard premium>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>🏆 Top 5 Pożyczek</h2>
          {barData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak danych</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a99' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7a99' }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, _name: string, props: any) => {
                    const currency = props?.payload?.currency ?? 'PLN';
                    return [formatCurrency(value, currency), 'Saldo'];
                  }}
                  contentStyle={{ background: '#0d1117', border: '1px solid #2a3450', borderRadius: '8px', fontSize: '12px', color: '#e2e8f5' }}
                />
                <Bar dataKey="balance" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </EnhancedCard>
      </div>

      {/* Monthly Summary */}
      {(() => {
        const now = new Date();
        const thisMonth = stats.recentTransactions.filter(tx => {
          const d = new Date(tx.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonth = stats.recentTransactions.filter(tx => {
          const d = new Date(tx.createdAt);
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        });
        const thisTotal = thisMonth.reduce((s, tx) => s + Number(tx.amount), 0);
        const lastTotal = lastMonth.reduce((s, tx) => s + Number(tx.amount), 0);
        const trend = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0;
        const primaryCurrency = currencyGroups[0]?.currency ?? 'PLN';
        return (
          <EnhancedCard premium style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>📅 Ten Miesiąc</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Spłacono w {now.toLocaleDateString('pl-PL', { month: 'long' })}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--success)' }}>
                  {formatCurrency(thisTotal, primaryCurrency)}
                </div>
                {trend !== 0 && (
                  <div style={{ fontSize: '11px', marginTop: '4px', color: trend > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs poprzedni miesiąc
                  </div>
                )}
              </div>
              <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Liczba spłat
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                  {thisMonth.length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  transakcji w tym miesiącu
                </div>
              </div>
            </div>
          </EnhancedCard>
        );
      })()}

      {/* Recent Transactions */}
      <EnhancedCard premium>
        <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📝 Ostatnie Spłaty
        </h2>
        {stats.recentTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Brak ostatnich transakcji</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentTransactions.map((tx) => {
              // Find the loan's currency for this transaction
              const txLoan = loans.find(l => l.id === tx.loanId);
              const txCurrency = txLoan?.currency ?? currencyGroups[0]?.currency ?? 'PLN';
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg3)', borderRadius: '8px', borderLeft: '3px solid var(--success)',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
                      -{formatCurrency(Number(tx.amount), txCurrency)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', textAlign: 'right' }}>
                    <div>✅ Spłacona</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tx.borrowerName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </EnhancedCard>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <EnhancedCard premium style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👁️ Ostatnio oglądane
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.type === 'loan' ? `/loans/${item.id}` : `/obligations/${item.id}`)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg3)', borderRadius: '8px',
                  borderLeft: `3px solid ${item.type === 'loan' ? 'var(--primary)' : 'var(--warning)'}`,
                  cursor: 'pointer', transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.type === 'loan' ? 'Pożyczka' : 'Zobowiązanie'}
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textAlign: 'right' }}>
                  {formatCurrency(item.balance, item.currency)}
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}
    </div>
  );
}
