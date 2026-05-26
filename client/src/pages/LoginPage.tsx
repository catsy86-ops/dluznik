import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import EmailInput from '../components/EmailInput';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { formatAuthError } from '../utils/errorMessages';

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Password validation for registration
  const passwordValidation = usePasswordValidation(password);

  // Auto-focus email field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [tab]);

  // Persist remember me preference
  useEffect(() => {
    localStorage.setItem('rememberMe', rememberMe.toString());
  }, [rememberMe]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Wszystkie pola są wymagane');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Wszystkie pola są wymagane');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    
    if (!passwordValidation.isValid) {
      setError('Hasło musi spełniać wszystkie wymagania bezpieczeństwa');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.register(email, password, confirmPassword);
      setSuccess('Konto utworzone! Sprawdź swoją skrzynkę email, aby zweryfikować adres.');
      setTab('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div
              className="error-msg"
              style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.5' }}>{error}</span>
            </div>
          )}
          {success && (
            <div
              className="success-msg"
              style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span style={{ fontSize: '16px' }}>✓</span>
              <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.5' }}>{success}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} autoComplete="on">
              <EmailInput
                ref={emailInputRef}
                label="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onEmailChange={(newEmail) => setEmail(newEmail)}
                placeholder="twoj@email.com"
                required
                autoComplete="email"
              />
              <PasswordInput
                label="Hasło"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              
              {/* Remember Me Checkbox */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  marginBottom: '4px',
                }}
              >
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--primary)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      setRememberMe(!rememberMe);
                    }
                  }}
                />
                <label
                  htmlFor="rememberMe"
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Zapamiętaj mnie
                </label>
              </div>
              
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  marginTop: '8px',
                  fontSize: '15px',
                }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Zaloguj się →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} autoComplete="on">
              <EmailInput
                ref={emailInputRef}
                label="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onEmailChange={(newEmail) => setEmail(newEmail)}
                placeholder="twoj@email.com"
                required
                autoComplete="email"
              />
              <PasswordInput
                label="Hasło"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                maxLength={128}
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <PasswordStrengthIndicator
                  strength={passwordValidation.strength}
                  requirements={passwordValidation.requirements}
                  score={passwordValidation.score}
                />
              )}
              
              <PasswordInput
                label="Potwierdź hasło"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                maxLength={128}
              />
              
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  marginTop: '16px',
                  fontSize: '15px',
                }}
                disabled={loading || !passwordValidation.isValid}
              >
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
