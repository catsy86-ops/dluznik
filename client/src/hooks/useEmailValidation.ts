import { useState, useEffect, useCallback } from 'react';

// Popular email domains for typo detection
const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'wp.pl',
  'onet.pl',
  'interia.pl',
  'o2.pl',
];

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// RFC 5322 compliant email validation (simplified)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Detect typos in email domain
function detectTypo(email: string): string | null {
  if (!email.includes('@')) return null;

  const [, domain] = email.split('@');
  if (!domain) return null;

  for (const popularDomain of POPULAR_DOMAINS) {
    const distance = levenshteinDistance(domain.toLowerCase(), popularDomain);
    if (distance > 0 && distance <= 2) {
      return popularDomain;
    }
  }

  return null;
}

interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
  suggestion: string | null;
  suggestedEmail: string | null;
}

export function useEmailValidation(
  email: string,
  onBlur: boolean = false
): EmailValidationResult {
  const [result, setResult] = useState<EmailValidationResult>({
    isValid: false,
    error: null,
    suggestion: null,
    suggestedEmail: null,
  });

  const validate = useCallback(() => {
    // Empty email - no validation
    if (!email.trim()) {
      setResult({
        isValid: false,
        error: null,
        suggestion: null,
        suggestedEmail: null,
      });
      return;
    }

    // Check format validity
    const valid = isValidEmail(email);

    if (!valid) {
      setResult({
        isValid: false,
        error: 'Nieprawidłowy format email',
        suggestion: null,
        suggestedEmail: null,
      });
      return;
    }

    // Check for typos
    const suggestedDomain = detectTypo(email);
    if (suggestedDomain) {
      const [localPart] = email.split('@');
      const suggestedEmail = `${localPart}@${suggestedDomain}`;
      setResult({
        isValid: true,
        error: null,
        suggestion: `Czy chodziło Ci o ${suggestedDomain}?`,
        suggestedEmail,
      });
      return;
    }

    // Valid email, no typos
    setResult({
      isValid: true,
      error: null,
      suggestion: null,
      suggestedEmail: null,
    });
  }, [email]);

  useEffect(() => {
    if (!email.trim()) {
      setResult({
        isValid: false,
        error: null,
        suggestion: null,
        suggestedEmail: null,
      });
      return;
    }

    // Debounce validation
    const delay = onBlur ? 200 : 500;
    const timer = setTimeout(validate, delay);

    return () => clearTimeout(timer);
  }, [email, onBlur, validate]);

  return result;
}
