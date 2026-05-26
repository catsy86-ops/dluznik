import { useState, useEffect } from 'react';

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export type PasswordStrength = 'Słabe' | 'Średnie' | 'Silne';

interface PasswordValidationResult {
  strength: PasswordStrength;
  requirements: PasswordRequirement[];
  score: number;
  isValid: boolean;
}

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'Minimum 8 znaków', test: (pwd: string) => pwd.length >= 8 },
  { id: 'uppercase', label: 'Jedna wielka litera', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'Jedna mała litera', test: (pwd: string) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'Jedna cyfra', test: (pwd: string) => /\d/.test(pwd) },
  {
    id: 'special',
    label: 'Jeden znak specjalny',
    test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
  },
];

export function usePasswordValidation(password: string): PasswordValidationResult {
  const [result, setResult] = useState<PasswordValidationResult>({
    strength: 'Słabe',
    requirements: PASSWORD_REQUIREMENTS.map(req => ({
      id: req.id,
      label: req.label,
      met: false,
    })),
    score: 0,
    isValid: false,
  });

  useEffect(() => {
    // Debounce validation
    const timer = setTimeout(() => {
      // Enforce 128 character maximum
      const validPassword = password.slice(0, 128);

      // Check each requirement
      const requirements = PASSWORD_REQUIREMENTS.map(req => ({
        id: req.id,
        label: req.label,
        met: req.test(validPassword),
      }));

      // Calculate score (number of requirements met)
      const score = requirements.filter(req => req.met).length;

      // Determine strength
      let strength: PasswordStrength;
      if (score < 3) {
        strength = 'Słabe';
      } else if (score < 5) {
        strength = 'Średnie';
      } else {
        strength = 'Silne';
      }

      // Password is valid if strength is not weak
      const isValid = strength !== 'Słabe';

      setResult({
        strength,
        requirements,
        score,
        isValid,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [password]);

  return result;
}
