// Error message formatter for authentication
export interface FormattedError {
  message: string;
  priority: number;
}

// Error priority levels (higher = more important)
const ERROR_PRIORITIES = {
  NETWORK: 4,
  SERVER: 3,
  RATE_LIMIT: 2,
  VALIDATION: 1,
};

export function formatAuthError(error: any): string {
  // Network errors
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return 'Nie można połączyć z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie';
  }

  // Server errors (500)
  if (error.status === 500 || error.message?.includes('500')) {
    return 'Wystąpił błąd serwera. Spróbuj ponownie za chwilę';
  }

  // Rate limiting
  if (error.status === 429 || error.message?.includes('rate limit')) {
    const minutes = error.retryAfter || 5;
    return `Zbyt wiele prób. Spróbuj ponownie za ${minutes} minut`;
  }

  // Authentication errors
  if (error.status === 401 || error.message?.includes('Unauthorized')) {
    return 'Email lub hasło jest nieprawidłowe';
  }

  // Email already exists
  if (error.message?.includes('already exists') || error.message?.includes('już istnieje')) {
    return 'Ten adres email jest już zarejestrowany. Spróbuj się zalogować lub użyj opcji "Zapomniałeś hasła?"';
  }

  // Password validation errors
  if (error.message?.includes('password') && error.message?.includes('requirements')) {
    return 'Hasło musi spełniać wszystkie wymagania bezpieczeństwa';
  }

  // Password mismatch
  if (error.message?.includes('match') || error.message?.includes('nie są identyczne')) {
    return 'Hasła nie są identyczne';
  }

  // Empty fields
  if (error.message?.includes('required') || error.message?.includes('wymagane')) {
    return 'Wszystkie pola są wymagane';
  }

  // Email verification required
  if (error.message?.includes('EMAIL_NOT_VERIFIED')) {
    return 'Musisz zweryfikować swój adres email przed zalogowaniem';
  }

  // Default error message
  return error.message || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie';
}

export function getErrorPriority(error: any): number {
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return ERROR_PRIORITIES.NETWORK;
  }
  if (error.status === 500) {
    return ERROR_PRIORITIES.SERVER;
  }
  if (error.status === 429) {
    return ERROR_PRIORITIES.RATE_LIMIT;
  }
  return ERROR_PRIORITIES.VALIDATION;
}

export function formatMultipleErrors(errors: any[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return formatAuthError(errors[0]);

  // Sort by priority and return highest priority error
  const sortedErrors = errors.sort((a, b) => getErrorPriority(b) - getErrorPriority(a));
  return formatAuthError(sortedErrors[0]);
}
