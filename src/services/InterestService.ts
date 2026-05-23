export class InterestService {
  /**
   * Calculate simple interest: A = P(1 + rt)
   * A = final amount, P = principal, r = rate (annual), t = time (years)
   */
  static calculateSimpleInterest(
    principal: number,
    annualRate: number,
    daysElapsed: number
  ): number {
    const yearsElapsed = daysElapsed / 365.25;
    const rate = annualRate / 100;
    const accruedInterest = principal * rate * yearsElapsed;
    return Math.round(accruedInterest * 100) / 100;
  }

  /**
   * Calculate compound interest: A = P(1 + r/n)^(nt)
   * A = final amount, P = principal, r = rate (annual), n = compounds per year, t = time (years)
   */
  static calculateCompoundInterest(
    principal: number,
    annualRate: number,
    daysElapsed: number,
    compoundFrequency: 'daily' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): number {
    const yearsElapsed = daysElapsed / 365.25;
    const rate = annualRate / 100;

    const n =
      compoundFrequency === 'daily'
        ? 365.25
        : compoundFrequency === 'monthly'
          ? 12
          : compoundFrequency === 'quarterly'
            ? 4
            : 1;

    const amount = principal * Math.pow(1 + rate / n, n * yearsElapsed);
    const accruedInterest = amount - principal;
    return Math.round(accruedInterest * 100) / 100;
  }

  /**
   * Calculate accrued interest from creation date to now
   */
  static getAccruedInterest(
    principal: number,
    annualRate: number,
    createdDate: Date,
    interestType: 'simple' | 'compound' = 'simple',
    compoundFrequency: 'daily' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): number {
    if (!annualRate || annualRate <= 0) return 0;

    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < 0) return 0;

    return interestType === 'simple'
      ? this.calculateSimpleInterest(principal, annualRate, daysElapsed)
      : this.calculateCompoundInterest(principal, annualRate, daysElapsed, compoundFrequency);
  }

  /**
   * Calculate total balance including accrued interest
   */
  static getTotalWithInterest(
    principal: number,
    currentBalance: number,
    annualRate: number,
    createdDate: Date,
    interestType: 'simple' | 'compound' = 'simple'
  ): number {
    const accruedInterest = this.getAccruedInterest(principal, annualRate, createdDate, interestType);
    return Math.round((currentBalance + accruedInterest) * 100) / 100;
  }

  /**
   * Calculate next payment date based on frequency
   */
  static getNextPaymentDate(lastPaymentDate: Date, frequency: string): Date {
    const date = new Date(lastPaymentDate);

    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return date;
  }
}
