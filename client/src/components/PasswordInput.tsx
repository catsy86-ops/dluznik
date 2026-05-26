import { useState, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword(prev => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleVisibility();
      }
    };

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={className}
            {...props}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            onKeyDown={handleKeyDown}
            aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '18px',
              transition: 'color 0.2s',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--primary)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {error && (
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
            ⚠️ {error}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
