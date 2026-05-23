/**
 * DashboardPageNew Component
 * 
 * Complete financial overview dashboard with:
 * - Summary statistics cards
 * - Financial charts
 * - Recent payment timeline
 * - Key metrics
 */

import { useEffect, useState } from 'react';
import { loansApi } from '../api';
import type { Loan, Transaction } from '../api';
import { AnimatedNumber, StatCard, EnhancedCard } from '../components';
import { useToast } from '../components/Toast';
import { useAuth } from '../AuthContext';
import GuestBanner from '../components/GuestBanner';
import { GUEST_LOANS, GUEST_TRANSACTIONS } from '../guestData';

interface DashboardStats {
  totalDebt: number;
  totalPaid: number;
  totalInProgress: number;
  totalOverdue: number;
  activeLoans: number;
  paidLoans: number;
  overdueLoans: number;
  recentTransactions: Transaction[];
}

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isGuest } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const loans: Loan[] = isGuest
          ? GUEST_LOANS
          : ((await loansApi.list({ limit: '100' })) as any).loans ?? [];

        let totalDebt = 0;
        let totalOriginal = 0;
        let totalOverdue = 0;
        let activeCount = 0;
        let paidCount = 0;
        let overdueCount = 0;
        const allTransactions: Transaction[] = [];

        for (const loan of loans) {
          const balance = Number(loan.currentBalance);
          const original = Number(loan.originalAmount);
          totalDebt += balance;
          totalOriginal += original;
          if (loan.status === 'active') activeCount++;
          if (loan.status === 'paid') paidCount++;
          const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date();
          if (isOverdue) { overdueCount++; totalOverdue += balance; }

          if (isGuest) {
            allTransactions.push(...(GUEST_TRANSACTIONS[loan.id] ?? []));
          } else {
            try {
              const txResponse = await loansApi.payments(loan.id);
              allTransactions.push(...((txResponse as any).transactions ?? []));
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
        toast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isGuest]);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
      </div>
    );
  }

  const healthPercentage = stats.totalDebt > 0 ? Math.round(((stats.totalDebt - stats.totalOverdue) / stats.totalDebt) * 100) : 100;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Guest banner */}
      <GuestBanner />

      {/* Page Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '900',
          letterSpacing: '-1px',
          marginBottom: '8px',
          background: 'var(--gradient-text)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          📊 Przegląd Finansowy
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
        }}>
          Pełny przegląd Twojej sytuacji finansowej
        </p>
      </div>

      {/* Main Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}>
        <EnhancedCard premium>
          <StatCard
            icon="💰"
            label="Całkowite Zadłużenie"
            value={<AnimatedNumber value={stats.totalDebt} format="currency" currency="PLN" />}
            color="var(--danger)"
          />
        </EnhancedCard>

        <EnhancedCard premium>
          <StatCard
            icon="✅"
            label="Spłacone"
            value={<AnimatedNumber value={stats.totalPaid} format="currency" currency="PLN" />}
            trend={stats.totalPaid > 0 ? 5 : 0}
            color="var(--success)"
          />
        </EnhancedCard>

        <EnhancedCard premium>
          <StatCard
            icon="⏱️"
            label="W Toku"
            value={<AnimatedNumber value={stats.totalInProgress} format="currency" currency="PLN" />}
            color="var(--primary)"
          />
        </EnhancedCard>

        <EnhancedCard premium>
          <StatCard
            icon="⚠️"
            label="Przeterminowane"
            value={<AnimatedNumber value={stats.totalOverdue} format="currency" currency="PLN" />}
            color="var(--warning)"
          />
        </EnhancedCard>
      </div>

      {/* Loans Count Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}>
        <EnhancedCard premium badge={{ label: 'Active', color: 'active' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Aktywne Pożyczki
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              color: 'var(--primary)',
            }}>
              {stats.activeLoans}
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard premium badge={{ label: 'Paid', color: 'paid' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Spłacone Pożyczki
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              color: 'var(--success)',
            }}>
              {stats.paidLoans}
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard premium badge={{ label: 'Overdue', color: 'overdue' }}>
          <div style={{ padding: '12px 0' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Przeterminowane
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              color: 'var(--danger)',
            }}>
              {stats.overdueLoans}
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Health Score */}
      <EnhancedCard premium style={{ marginBottom: '30px' }}>
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '0.05em',
          }}>
            Wskaźnik Zdrowia Finansowego
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              flex: 1,
              height: '10px',
              background: 'var(--bg5)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${healthPercentage}%`,
                  background: healthPercentage > 70 ? 'var(--success)' : healthPercentage > 40 ? 'var(--warning)' : 'var(--danger)',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '900',
              color: healthPercentage > 70 ? 'var(--success)' : healthPercentage > 40 ? 'var(--warning)' : 'var(--danger)',
              minWidth: '40px',
              textAlign: 'right',
            }}>
              {healthPercentage}%
            </div>
          </div>

          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            {healthPercentage > 70 && '✅ Dobra sytuacja - większość pożyczek płaconych na czas'}
            {healthPercentage > 40 && healthPercentage <= 70 && '⚠️ Średnia - zwróć uwagę na przeterminowane'}
            {healthPercentage <= 40 && '🔴 Poważna - wiele przeterminowanych pożyczek'}
          </p>
        </div>
      </EnhancedCard>

      {/* Recent Transactions */}
      <EnhancedCard premium>
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '800',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            📝 Ostatnie Spłaty
          </h2>

          {stats.recentTransactions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              Brak ostatnich transakcji
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentTransactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--bg3)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--success)',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--text)',
                      marginBottom: '4px',
                    }}>
                      -<AnimatedNumber value={Number(tx.amount)} format="currency" currency="PLN" />
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}>
                      {new Date(tx.createdAt).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--success)',
                    fontWeight: '700',
                  }}>
                    ✅ Spłacona
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
}
