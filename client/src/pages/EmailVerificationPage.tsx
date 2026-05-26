import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

type VerificationState = 'loading' | 'success' | 'expired' | 'invalid';

/**
 * EmailVerificationPage
 * Handles email verification via token from URL query parameter.
 * 
 * States:
 * - loading: verifying token with backend
 * - success: email verified successfully
 * - expired: token has expired, show resend button
 * - invalid: malformed or unrecognized token
 * 
 * Requirements: 2.3, 2.4, 2.8
 */
export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('loading');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const verifyToken = useCallback(async (tokenValue: string) => {
    // Validate token format: must be a 64-character hex string
    const hexRegex = /^[a-f0-9]{64}$/i;
    if (!hexRegex.test(tokenValue)) {
      setState('invalid');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setState('success');
      } else {
        const errorCode = data.error?.code;
        if (errorCode === 'TOKEN_EXPIRED') {
          setState('expired');
        } else {
          setState('invalid');
        }
      }
    } catch {
      // Network error — treat as invalid since we can't verify
      setState('invalid');
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }
    verifyToken(token);
  }, [token, verifyToken]);

  const handleResend = async () => {
    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendSuccess(true);
      } else {
        setResendError(data.message || 'Nie udało się wysłać emaila');
      }
    } catch {
      setResendError('Brak połączenia z serwerem');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)', top: '-100px', left: '-50px', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(168,85,247,0.06)', bottom: '-80px', right: '-40px', filter: 'blur(60px)' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div className="card-gradient" style={{ padding: '40px 32px', textAlign: 'center' }}>
          {state === 'loading' && <LoadingState />}
          {state === 'success' && <SuccessState onGoToLogin={() => navigate('/login')} />}
          {state === 'expired' && (
            <ExpiredState
              onResend={handleResend}
              resending={resending}
              resendSuccess={resendSuccess}
              resendError={resendError}
            />
          )}
          {state === 'invalid' && <InvalidState onGoToLogin={() => navigate('/login')} />}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          Dłużnik App v2.0 · Twoje finanse pod kontrolą
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <span className="spinner spinner-dark" style={{ width: '32px', height: '32px' }} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
        Weryfikacja...
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        Sprawdzamy Twój link weryfikacyjny
      </p>
    </>
  );
}

function SuccessState({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
        Email zweryfikowany!
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Twój adres email został pomyślnie potwierdzony. Możesz teraz korzystać z pełnej funkcjonalności aplikacji.
      </p>
      <button
        onClick={onGoToLogin}
        className="btn-primary"
        style={{ padding: '12px 32px', fontSize: '15px' }}
      >
        Przejdź do logowania →
      </button>
    </>
  );
}

function ExpiredState({
  onResend,
  resending,
  resendSuccess,
  resendError,
}: {
  onResend: () => void;
  resending: boolean;
  resendSuccess: boolean;
  resendError: string;
}) {
  return (
    <>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
        Link wygasł
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Twój link weryfikacyjny stracił ważność. Wyślij nowy email weryfikacyjny, aby potwierdzić swój adres.
      </p>

      {resendSuccess && (
        <div className="success-msg" style={{ marginBottom: '16px' }}>
          ✓ Nowy email weryfikacyjny został wysłany
        </div>
      )}
      {resendError && (
        <div className="error-msg" style={{ marginBottom: '16px' }}>
          ⚠️ {resendError}
        </div>
      )}

      <button
        onClick={onResend}
        className="btn-primary"
        style={{ padding: '12px 32px', fontSize: '15px' }}
        disabled={resending || resendSuccess}
      >
        {resending ? <span className="spinner" /> : 'Wyślij ponownie'}
      </button>
    </>
  );
}

function InvalidState({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
        Nieprawidłowy link
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Link weryfikacyjny jest nieprawidłowy lub został już wykorzystany. Sprawdź czy skopiowałeś cały adres z emaila.
      </p>
      <button
        onClick={onGoToLogin}
        className="btn-primary"
        style={{ padding: '12px 32px', fontSize: '15px' }}
      >
        Wróć do logowania →
      </button>
    </>
  );
}
