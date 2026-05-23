import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await authApi.register(email, password, confirmPassword);
      setSuccess('Konto utworzone! Możesz się teraz zalogować.');
      setTab('login');
      setPassword(''); setConfirmPassword('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)', top: '-100px', left: '-50px', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(168,85,247,0.06)', bottom: '-80px', right: '-40px', filter: 'blur(60px)' }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '18px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>💰</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>
            <span className="text-gradient">Dłużnik</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Zarządzaj pożyczkami i zobowiązaniami
          </p>
        </div>

        <div className="card-gradient" style={{ padding: '28px' }}>
          {/* Tabs */}
          <div className="filter-tabs" style={{ marginBottom: '24px' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`filter-tab ${tab === t ? 'active' : ''}`}
              >
                {t === 'login' ? '🔑 Logowanie' : '✨ Rejestracja'}
              </button>
            ))}
          </div>

          {error && <div className="error-msg" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: '16px' }}>✓ {success}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.com" required autoFocus />
              </div>
              <div className="form-group">
                <label>Hasło</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px', marginTop: '8px', fontSize: '15px' }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Zaloguj się →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.com" required autoFocus />
              </div>
              <div className="form-group">
                <label>Hasło (min. 8 znaków)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
              </div>
              <div className="form-group">
                <label>Potwierdź hasło</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px', marginTop: '8px', fontSize: '15px' }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Utwórz konto →'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '20px 0 16px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>LUB</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} />
          </div>

          {/* Guest login button */}
          <button
            onClick={handleGuestLogin}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg3)',
              border: '1.5px dashed var(--border3)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLElement).style.color = 'var(--primary-light)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border3)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>👁️</span>
            <div style={{ textAlign: 'left' }}>
              <div>Kontynuuj jako Gość</div>
              <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: '400' }}>
                Przeglądaj demo — tylko odczyt
              </div>
            </div>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          Dłużnik App v2.0 · Twoje finanse pod kontrolą
        </p>
      </div>
    </div>
  );
}
