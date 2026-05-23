/**
 * GuestBanner Component
 * 
 * Shows a banner at the top when user is in guest/read-only mode.
 * Prompts user to register or login for full access.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function GuestBanner() {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();

  if (!isGuest) return null;

  const handleLogin = () => {
    logout(); // clear guest mode
    navigate('/login');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '10px',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>👁️</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-light)' }}>
            Tryb Gościa — tylko odczyt
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Przeglądasz dane demonstracyjne. Zaloguj się aby zarządzać własnymi pożyczkami.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleLogin}
          className="btn-primary"
          style={{ padding: '7px 16px', fontSize: '13px' }}
        >
          🔑 Zaloguj się
        </button>
        <button
          onClick={handleLogin}
          className="btn-ghost"
          style={{ padding: '7px 16px', fontSize: '13px' }}
        >
          ✨ Zarejestruj
        </button>
      </div>
    </div>
  );
}
