import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api';

const COOLDOWN_SECONDS = 60;

/**
 * VerificationPrompt
 * Shown to authenticated but unverified users on protected routes.
 * Provides a resend button with 60-second cooldown and rate limit handling.
 *
 * Requirements: 2.2, 2.6
 */
export default function VerificationPrompt() {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitEnd, setRateLimitEnd] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          // If rate limit ended, clear it
          if (rateLimitEnd && new Date() >= rateLimitEnd) {
            setRateLimited(false);
            setRateLimitEnd(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cooldown, rateLimitEnd]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || rateLimited || resending) return;

    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await authApi.resendVerification();
      setResendSuccess(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      const message = err?.message || '';

      // Check if it's a rate limit error (429)
      if (message.includes('429') || message.toLowerCase().includes('rate') || message.toLowerCase().includes('limit')) {
        setRateLimited(true);
        // Try to parse retryAfter from error message or default to 60s
        const retryMatch = message.match(/(\d+)/);
        const retryAfterSeconds = retryMatch ? parseInt(retryMatch[1], 10) : COOLDOWN_SECONDS;
        const endTime = new Date(Date.now() + retryAfterSeconds * 1000);
        setRateLimitEnd(endTime);
        setCooldown(retryAfterSeconds);
        setResendError('Osiągnięto limit wysyłek. Spróbuj ponownie później.');
      } else {
        setResendError(message || 'Nie udało się wysłać emaila weryfikacyjnego');
        setCooldown(COOLDOWN_SECONDS);
      }
    } finally {
      setResending(false);
    }
  }, [cooldown, rateLimited, resending]);

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const isButtonDisabled = resending || cooldown > 0 || rateLimited;

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
          {/* Email icon */}
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>

          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Zweryfikuj swój email
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            Wysłaliśmy link weryfikacyjny na Twój adres email. Sprawdź skrzynkę odbiorczą (i folder spam) aby aktywować konto.
          </p>

          {/* Success message */}
          {resendSuccess && (
            <div style={{
              background: 'var(--success-bg, rgba(34,197,94,0.1))',
              color: 'var(--success, #22c55e)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              ✓ Nowy email weryfikacyjny został wysłany
            </div>
          )}

          {/* Error message */}
          {resendError && (
            <div style={{
              background: 'var(--danger-bg, rgba(239,68,68,0.1))',
              color: 'var(--danger, #ef4444)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              ⚠️ {resendError}
            </div>
          )}

          {/* Rate limit info */}
          {rateLimited && rateLimitEnd && cooldown > 0 && (
            <div style={{
              background: 'var(--warning-bg, rgba(245,158,11,0.1))',
              color: 'var(--warning, #f59e0b)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              Następna próba możliwa za: {formatCountdown(cooldown)}
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={isButtonDisabled}
            className="btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              opacity: isButtonDisabled ? 0.6 : 1,
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            aria-label={isButtonDisabled && cooldown > 0
              ? `Wyślij ponownie (dostępne za ${formatCountdown(cooldown)})`
              : 'Wyślij ponownie email weryfikacyjny'
            }
          >
            {resending ? (
              <span className="spinner" />
            ) : cooldown > 0 ? (
              `Wyślij ponownie (${formatCountdown(cooldown)})`
            ) : (
              'Wyślij ponownie'
            )}
          </button>

          {/* Cooldown hint (non-rate-limited) */}
          {cooldown > 0 && !rateLimited && (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px' }}>
              Możesz wysłać ponownie za {formatCountdown(cooldown)}
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          Dłużnik App v2.0 · Twoje finanse pod kontrolą
        </p>
      </div>
    </div>
  );
}
