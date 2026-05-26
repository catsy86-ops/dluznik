import type { CurrencyGroup } from '../types/dashboard-ux';

/**
 * Loan shape expected by the currency aggregator.
 */
export interface Loan {
  id: string;
  borrowerName: string;
  currentBalance: number;
  currency: string;
}

/**
 * Obligation shape expected by the currency aggregator.
 */
export interface Obligation {
  id: string;
  creditorName: string;
  currentBalance: number;
  currency: string;
}

/**
 * Map of known currency codes to their display locales.
 * Falls back to 'en-US' for unknown currencies.
 */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  PLN: 'pl-PL',
  EUR: 'de-DE',
  USD: 'en-US',
};

/**
 * Returns the locale string for a given ISO 4217 currency code.
 * Falls back to 'en-US' for unknown currency codes.
 */
export function getCurrencyLocale(currency: string): string {
  return CURRENCY_LOCALE_MAP[currency] ?? 'en-US';
}

/**
 * Formats a numeric amount using the correct locale for the given currency.
 * Uses Intl.NumberFormat with 'currency' style.
 */
export function formatCurrency(amount: number, currency: string): string {
  const locale = getCurrencyLocale(currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Groups loans and obligations by their ISO 4217 currency code.
 *
 * For each currency group, calculates:
 * - totalLoanBalance: sum of all loan currentBalance values in that group
 * - totalObligationBalance: sum of all obligation currentBalance values in that group
 * - netBalance: totalLoanBalance - totalObligationBalance
 *
 * Groups are sorted alphabetically by currency code.
 */
export function aggregateByCurrency(
  loans: Loan[],
  obligations: Obligation[]
): CurrencyGroup[] {
  const groupMap = new Map<string, {
    loans: Loan[];
    obligations: Obligation[];
    totalLoanBalance: number;
    totalObligationBalance: number;
  }>();

  // Group loans by currency
  for (const loan of loans) {
    const code = loan.currency;
    if (!groupMap.has(code)) {
      groupMap.set(code, {
        loans: [],
        obligations: [],
        totalLoanBalance: 0,
        totalObligationBalance: 0,
      });
    }
    const group = groupMap.get(code)!;
    group.loans.push(loan);
    group.totalLoanBalance += loan.currentBalance;
  }

  // Group obligations by currency
  for (const obligation of obligations) {
    const code = obligation.currency;
    if (!groupMap.has(code)) {
      groupMap.set(code, {
        loans: [],
        obligations: [],
        totalLoanBalance: 0,
        totalObligationBalance: 0,
      });
    }
    const group = groupMap.get(code)!;
    group.obligations.push(obligation);
    group.totalObligationBalance += obligation.currentBalance;
  }

  // Convert map to sorted array of CurrencyGroup
  const result: CurrencyGroup[] = [];

  for (const [currency, data] of groupMap.entries()) {
    result.push({
      currency,
      netBalance: data.totalLoanBalance - data.totalObligationBalance,
      totalLoanBalance: data.totalLoanBalance,
      totalObligationBalance: data.totalObligationBalance,
      loans: data.loans.map((l) => ({
        id: l.id,
        borrowerName: l.borrowerName,
        currentBalance: l.currentBalance,
        currency: l.currency,
      })),
      obligations: data.obligations.map((o) => ({
        id: o.id,
        creditorName: o.creditorName,
        currentBalance: o.currentBalance,
        currency: o.currency,
      })),
    });
  }

  // Sort alphabetically by currency code
  result.sort((a, b) => a.currency.localeCompare(b.currency));

  return result;
}
