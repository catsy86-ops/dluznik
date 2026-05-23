import { useState } from 'react';
import type { FormEvent } from 'react';
import { authApi, summaryApi } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    setSavingNotif(true);
    try {
      await authApi.updateProfile({ notificationsEnabled: val });
      toast(val ? 'Powiadomienia włączone' : 'Powiadomienia wyłączone', 'success');
    } catch (e: any) {
      setNotifications(!val);
      toast(e.message, 'error');
    } finally { setSavingNotif(false); }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError('Hasła nie są identyczne'); return; }
    if (newPwd.length < 8) { setPwdError('Hasło musi mieć co najmniej 8 znaków'); return; }
    setPwdLoading(true);
    try {
      await authApi.updateProfile({ currentPassword: currentPwd, newPassword: newPwd });
      toast('Hasło zmienione pomyślnie ✓', 'success');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) { setPwdError(e.message); }
    finally { setPwdLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profil</h1>
      </div>

      {/* User info card */}
      <div className="card-gradient" style={{ marginBottom: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '900', color: '#fff', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '17px' }}>{user?.email}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Konto od {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
        <div className="divider" />
        <button
          onClick={() => { logout(); }}
          className="btn-danger"
          style={{ width: '100%', padding: '11px', marginTop: '12px', fontWeight: '700' }}
        >
          🚪 Wyloguj się
        </button>
      </div>

      {/* Notifications toggle */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔔 Powiadomienia
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Powiadomienia o terminach</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Alerty o zbliżających się i przeterminowanych płatnościach
            </div>
          </div>
          <Toggle value={notifications} onChange={toggleNotifications} disabled={savingNotif} />
        </div>
      </div>

      {/* Change password */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔒 Zmień hasło
        </h2>
        {pwdError && <div className="error-msg" style={{ marginBottom: '14px' }}>⚠️ {pwdError}</div>}
        <form onSubmit={changePassword}>
          <div className="form-group">
            <label>Aktualne hasło</label>
            <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label>Nowe hasło (min. 8 znaków)</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" required minLength={8} />
          </div>
          <div className="form-group">
            <label>Potwierdź nowe hasło</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" disabled={pwdLoading} style={{ width: '100%', padding: '12px' }}>
            {pwdLoading ? <span className="spinner" /> : '🔐 Zmień hasło'}
          </button>
        </form>
      </div>

      {/* Export */}
      <div className="card">
        <h2 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📥 Eksport danych
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Pobierz wszystkie pożyczki, zobowiązania i transakcje jako plik CSV (kompatybilny z Excel).
        </p>
        <button
          className="btn-ghost"
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}
          onClick={() => { summaryApi.exportCsv(); toast('Pobieranie pliku CSV...', 'info'); }}
        >
          📊 Pobierz CSV
        </button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      aria-label={value ? 'Wyłącz' : 'Włącz'}
      style={{
        width: 50, height: 28, borderRadius: 14, padding: 3,
        background: value ? 'linear-gradient(135deg, var(--primary), #7c3aed)' : 'var(--bg4)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s',
        position: 'relative', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        boxShadow: value ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 25 : 3,
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}
