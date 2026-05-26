import { useState, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useEmailValidation } from '../hooks/useEmailValidation';

interface EmailInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  onEmailChange?: (email: string) => void;
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ label, value, onChange, onBlur, onEmailChange, className = '', ...props }, ref) => {
    const [email, setEmail] = useState(value?.toString() || '');
    const [hasBlurred, setHasBlurred] = useState(false);
    const validation = useEmailValidation(email, hasBlurred);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      onChange?.(e);
      onEmailChange?.(newEmail);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasBlurred(true);
      onBlur?.(e);
    };

    const applySuggestion = () => {
      if (validation.suggestedEmail) {
        setEmail(validation.suggestedEmail);
        onEmailChange?.(validation.suggestedEmail);
        // Create synthetic event for onChange
        const syntheticEvent = {
          target: { value: validation.suggestedEmail },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      }
    };

    const showCheckmark = validation.isValid && !validation.suggestion && email.trim();
    const showError = validation.error && hasBlurred;

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            {...props}
          />
          {showCheckmark && (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: '18px',
                pointerEvents: 'none',
              }}
            >
              ✓
            </div>
          )}
        </div>
        {showError && (
          <div
            style={{
              color: '#ef4444',
              fontSize: '13px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ⚠️ {validation.error}
          </div>
        )}
        {validation.suggestion && (
          <div
            style={{
              fontSize: '13px',
              marginTop: '6px',
              color: 'var(--text-muted)',
            }}
          >
            {validation.suggestion}{' '}
            <button
              type="button"
              onClick={applySuggestion}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              Zastosuj
            </button>
          </div>
        )}
      </div>
    );
  }
);

EmailInput.displayName = 'EmailInput';

export default EmailInput;
