import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './ThemeToggle';
import { useEffect, useState } from 'react';
import { summaryApi } from '../api';
import type { Notification } from '../api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', activeIcon: '📊' },
  { to: '/loans', label: 'Pożyczki', icon: '💸', activeIcon: '💸' },
  { to: '/obligations', label: 'Zobowiązania', icon: '📋', activeIcon: '📋' },
  { to: '/settings', label: 'Ustawienia', icon: '⚙️', activeIcon: '⚙️' },
  { to: '/profile', label: 'Profil', icon: '👤', activeIcon: '👤' },
];

export default function Layout() {
  const { user, isGuest } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    summaryApi.get().then(s => setNotifications(s.notifications)).catch(() => {});
  }, [location.pathname]);

  const pageTitle = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label ?? 'Dłużnik';

  const overdueCount = notifications.filter(n => n.type.startsWith('overdue')).length;
  const upcomingCount = notifications.filter(n => n.type.startsWith('upcoming')).length;
  const totalAlerts = overdueCount + upcomingCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="glass-effect" style={{
        padding: '0 16px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}>💰</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{pageTitle}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>Dłużnik App</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />

          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(v => !v)}
              aria-label="Powiadomienia"
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: '10px', padding: '7px 10px', fontSize: '16px',
                cursor: 'pointer', lineHeight: 1, position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              🔔
              {totalAlerts > 0 && <span className="notif-dot">{totalAlerts > 9 ? '9+' : totalAlerts}</span>}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--bg2)', border: '1px solid var(--border2)',
                borderRadius: '16px', width: '320px', boxShadow: 'var(--shadow)',
                zIndex: 100, overflow: 'hidden',
                animation: 'modalIn 0.2s ease',
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔔 Powiadomienia
                  {totalAlerts > 0 && <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{totalAlerts}</span>}
                </div>
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>✓</div>
                      Brak alertów — wszystko w porządku!
                    </div>
                  ) : notifications.map((n, i) => (
                    <NotifItem key={i} notif={n} onClose={() => setShowNotif(false)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '10px',
              background: isGuest
                ? 'linear-gradient(135deg, #6b7a99, #3d4a63)'
                : 'linear-gradient(135deg, var(--primary), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isGuest ? '16px' : '13px', fontWeight: '800', color: '#fff',
              boxShadow: isGuest
                ? '0 2px 8px rgba(107,122,153,0.3)'
                : '0 2px 8px rgba(99,102,241,0.3)',
              transition: 'transform 0.2s',
              title: isGuest ? 'Tryb gościa' : user?.email,
            }}>
              {isGuest ? '👁️' : (user?.email?.[0]?.toUpperCase() ?? 'U')}
            </div>
          </NavLink>
        </div>
      </header>

      {showNotif && <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowNotif(false)} />}

      <main style={{ flex: 1, padding: '24px 16px', paddingBottom: '100px', maxWidth: '860px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="glass-effect" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        borderTop: '1px solid var(--border)',
        display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0 14px', gap: '4px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '10px', fontWeight: isActive ? '700' : '500',
              textDecoration: 'none', transition: 'all 0.2s', position: 'relative',
              letterSpacing: '0.02em',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '32px', height: '3px',
                    background: 'linear-gradient(90deg, var(--primary), #7c3aed)',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  }} />
                )}
                <span style={{
                  fontSize: '22px', lineHeight: 1,
                  filter: isActive ? 'none' : 'grayscale(0.6) opacity(0.6)',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: isActive ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function NotifItem({ notif, onClose }: { notif: Notification; onClose: () => void }) {
  const isOverdue = notif.type.startsWith('overdue');
  const isLoan = notif.type.includes('loan');
  const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: notif.currency }).format(n);

  return (
    <NavLink
      to={isLoan ? `/loans` : `/obligations`}
      onClick={onClose}
      style={{ display: 'flex', gap: '12px', padding: '14px 18px', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
        background: isOverdue ? 'var(--danger-bg)' : 'var(--warning-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
      }}>
        {isOverdue ? '🔴' : '🟡'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: isOverdue ? 'var(--danger)' : 'var(--warning)' }}>
          {isOverdue ? 'Przeterminowane' : 'Zbliża się termin'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.name}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {fmt(notif.amount)} · {new Date(notif.dueDate).toLocaleDateString('pl-PL')}
        </div>
      </div>
    </NavLink>
  );
}
