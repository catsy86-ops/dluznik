import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loansApi, obligationsApi, summaryApi } from '../api';
import type { Loan, Obligation, Summary } from '../api';
import { useAuth } from '../AuthContext';

function fmt(n: number, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function DonutChart({ loans, obligations }: { loans: number; obligations: number }) {
  const total = loans + obligations;
  const r = 54, cx = 68, cy = 68, stroke = 12;
  const circ = 2 * Math.PI * r;
  const loanPct = total > 0 ? loans / total : 0.5;
  const obPct = total > 0 ? obligations / total : 0.5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <svg width="136" height="136" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="loanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="obGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--warning)" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={stroke} />
        {total > 0 && (
          <>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#loanGrad)" strokeWidth={stroke}
              strokeDasharray={`${loanPct * circ} ${circ}`}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#obGrad)" strokeWidth={stroke}
              strokeDasharray={`${obPct * circ} ${circ}`}
              strokeDashoffset={circ * 0.25 - loanPct * circ}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </>
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">Bilans</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="10">netto</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <LegendItem color="var(--primary)" label="Należności" value={fmt(loans)} />
        <LegendItem color="var(--warning)" label="Zobowiązania" value={fmt(obligations)} />
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ width: 10, height: 10, borderRadius: '4px', background: color, flexShrink: 0, boxShadow: `0 2px 8px ${color}40` }} />
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: '800', color }}>{value}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, ((max - value) / max) * 100) : 0;
  return (
    <div className="progress-bar" style={{ marginTop: '8px' }}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ height: 10, width: '50%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 26, width: '70%' }} />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      loansApi.list({ limit: '100' }),
      obligationsApi.list({ limit: '100' }),
      summaryApi.get(),
    ]).then(([l, o, s]) => {
      setLoans((l as any).loans ?? []);
      setObligations((o as any).obligations ?? []);
      setSummary(s);
    }).catch(() => {}).finally(() => {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const activeLoans = loans.filter(l => l.status === 'active');
  const paidLoans = loans.filter(l => l.status === 'paid');
  const activeObs = obligations.filter(o => o.status === 'active');
  const totalLoanBalance = loans.reduce((s, l) => s + Number(l.currentBalance), 0);
  const totalObligationBalance = obligations.reduce((s, o) => s + Number(o.currentBalance), 0);
  const netBalance = totalLoanBalance - totalObligationBalance;

  const animatedNet = useCountUp(Math.round(Math.abs(netBalance)));
  const animatedLoans = useCountUp(Math.round(totalLoanBalance));
  const animatedObs = useCountUp(Math.round(totalObligationBalance));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return 'Dobrej nocy';
    if (h < 12) return 'Dzień dobry';
    if (h < 18) return 'Cześć';
    return 'Dobry wieczór';
  };

  const stats = [
    { label: 'Saldo netto', value: (netBalance >= 0 ? '+' : '-') + fmt(animatedNet), color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)', icon: '⚖️', sub: netBalance >= 0 ? 'Na plusie' : 'Na minusie' },
    { label: 'Należności', value: fmt(animatedLoans), color: 'var(--primary)', icon: '💸', sub: `${activeLoans.length} aktywnych` },
    { label: 'Zobowiązania', value: fmt(animatedObs), color: 'var(--warning)', icon: '📋', sub: `${activeObs.length} aktywnych` },
    { label: 'Spłacone', value: String(paidLoans.length), color: 'var(--success)', icon: '✅', sub: `z ${loans.length} pożyczek` },
  ];

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.8px' }}>
          {greeting()}, <span className="text-gradient">{user?.email?.split('@')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : stats.map((s, i) => (
          <div
            key={s.label}
            className="stat-card slide-up"
            style={{ '--accent-color': s.color, animationDelay: `${i * 80}ms` } as any}
          >
            <div className="orb" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              <span style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Donut chart */}
      {!loading && (loans.length > 0 || obligations.length > 0) && (
        <div className="card-gradient fade-in" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '18px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Podział finansowy</h2>
          <DonutChart loans={totalLoanBalance} obligations={totalObligationBalance} />
        </div>
      )}

      {/* Monthly summary */}
      {!loading && summary && (
        <div className="card fade-in" style={{ marginBottom: '24px', padding: '20px', borderColor: 'rgba(16,185,129,0.2)' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📅 {summary.monthName}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spłacono w tym miesiącu</div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--success)', marginTop: '4px', letterSpacing: '-0.5px' }}>
                {fmt(summary.monthlyPaid)}
              </div>
            </div>
            <div style={{ fontSize: '40px', opacity: 0.8 }}>📈</div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <Link to="/loans" className="card-interactive" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '24px' }}>➕</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>Nowa pożyczka</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dodaj szybko</div>
            </div>
          </Link>
          <Link to="/obligations" className="card-interactive" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>Nowe zobowiązanie</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dodaj szybko</div>
            </div>
          </Link>
        </div>
      )}

      {/* Recent loans */}
      <Section title="Ostatnie pożyczki" link="/loans" linkLabel="Wszystkie">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg3)', marginBottom: '8px' }}>
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 10, width: '30%' }} />
            </div>
          ))
        ) : loans.length === 0 ? (
          <EmptyMini icon="💸" text="Brak pożyczek" link="/loans" linkText="Dodaj pierwszą" />
        ) : loans.slice(0, 4).map((loan, i) => (
          <LoanCard key={loan.id} loan={loan} delay={i * 60} />
        ))}
      </Section>

      {/* Recent obligations */}
      <Section title="Ostatnie zobowiązania" link="/obligations" linkLabel="Wszystkie">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg3)', marginBottom: '8px' }}>
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 10, width: '30%' }} />
            </div>
          ))
        ) : obligations.length === 0 ? (
          <EmptyMini icon="📋" text="Brak zobowiązań" link="/obligations" linkText="Dodaj pierwsze" />
        ) : obligations.slice(0, 4).map((ob, i) => (
          <ObligationCard key={ob.id} obligation={ob} delay={i * 60} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.3px' }}>{title}</h2>
        <Link to={link} style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {linkLabel} <span style={{ fontSize: '16px' }}>→</span>
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyMini({ icon, text, link, linkText }: { icon: string; text: string; link: string; linkText: string }) {
  return (
    <div style={{ padding: '28px', textAlign: 'center', background: 'var(--bg3)', borderRadius: '12px', border: '1.5px dashed var(--border2)' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.7 }}>{icon}</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>{text}</p>
      <Link to={link} style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{linkText} →</Link>
    </div>
  );
}

function LoanCard({ loan, delay }: { loan: Loan; delay: number }) {
  const pct = loan.originalAmount > 0 ? ((Number(loan.originalAmount) - Number(loan.currentBalance)) / Number(loan.originalAmount)) * 100 : 0;
  const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date();
  return (
    <Link to={`/loans/${loan.id}`} className="animate-in" style={{
      display: 'block', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg2)',
      border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.3)' : 'var(--border)'}`,
      marginBottom: '8px', textDecoration: 'none', transition: 'all 0.2s',
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px' }}>{loan.borrowerName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {isOverdue ? <span style={{ color: 'var(--danger)' }}>⚠️ Przeterminowane</span> : new Date(loan.createdAt).toLocaleDateString('pl-PL')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '15px', color: loan.status === 'paid' ? 'var(--success)' : 'var(--primary)' }}>
            {fmt(Number(loan.currentBalance), loan.currency)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</div>
        </div>
      </div>
      <ProgressBar value={Number(loan.currentBalance)} max={Number(loan.originalAmount)} color={loan.status === 'paid' ? 'var(--success)' : 'var(--primary)'} />
    </Link>
  );
}

function ObligationCard({ obligation, delay }: { obligation: Obligation; delay: number }) {
  const pct = obligation.originalAmount > 0 ? ((Number(obligation.originalAmount) - Number(obligation.currentBalance)) / Number(obligation.originalAmount)) * 100 : 0;
  const isOverdue = obligation.status === 'active' && obligation.dueDate && new Date(obligation.dueDate) < new Date();
  return (
    <div className="animate-in" style={{
      padding: '14px 16px', borderRadius: '12px', background: 'var(--bg2)',
      border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.3)' : 'var(--border)'}`,
      marginBottom: '8px', animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px' }}>{obligation.creditorName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {isOverdue ? <span style={{ color: 'var(--danger)' }}>⚠️ Przeterminowane</span> : new Date(obligation.createdAt).toLocaleDateString('pl-PL')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '15px', color: obligation.status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
            {fmt(Number(obligation.currentBalance), obligation.currency)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</div>
        </div>
      </div>
      <ProgressBar value={Number(obligation.currentBalance)} max={Number(obligation.originalAmount)} color={obligation.status === 'paid' ? 'var(--success)' : 'var(--warning)'} />
    </div>
  );
}
