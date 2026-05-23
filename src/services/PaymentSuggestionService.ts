import { loanRepository } from '../repositories/LoanRepository';

/**
 * Payment Suggestion Service (TIER 1)
 * Provides intelligent payment suggestions for loans
 * 
 * Algorithm: 
 * 1. Minimum payment = to prevent default
 * 2. Recommended payment = 10% of remaining balance or monthly fair amount
 * 3. Full payment option
 * 4. Interest savings calculation
 */
export class PaymentSuggestionService {
  /**
   * Suggest optimal payment for a loan
   * @param loanId - Loan ID
   * @returns PaymentSuggestion with minimum, recommended, and full payment options
   */
  async suggestPayment(loanId: string): Promise<PaymentSuggestion> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Calculate days until due date
    const daysToOverdue = this.getDaysToOverdue(loan.dueDate);
    
    // Calculate interest metrics
    const monthlyInterestRate = (loan.interestRate || 0) / 12 / 100;
    const monthlyInterest = loan.currentBalance * monthlyInterestRate;
    
    // Minimum payment: enough to avoid default + accrued interest
    // If no due date, assume 30-day payment cycle
    const minimumPayment = Math.max(
      monthlyInterest, // At least the interest
      loan.currentBalance * 0.02 // Or 2% of balance
    );

    // Recommended payment: 10% of remaining balance (better than minimum)
    const recommendedPayment = loan.currentBalance * 0.1;

    // Full payment option
    const fullPayment = loan.currentBalance + monthlyInterest;

    // Interest savings if paid today
    const interestSavingsIfPaidNow = this.calculateInterestSavings(
      loan.currentBalance,
      loan.interestRate || 0,
      daysToOverdue
    );

    // Days to pay off at recommended rate
    const daysToPayOffAtRecommended =
      recommendedPayment > 0
        ? Math.ceil((loan.currentBalance / recommendedPayment) * 30)
        : Infinity;

    return {
      minimumPayment: Math.round(minimumPayment * 100) / 100,
      recommendedPayment: Math.round(recommendedPayment * 100) / 100,
      fullPayment: Math.round(fullPayment * 100) / 100,
      interestSavingsIfPaidNow: Math.round(interestSavingsIfPaidNow * 100) / 100,
      daysToOverdue: Math.max(0, daysToOverdue),
      daysToPayOffAtRecommended,
      currentBalance: loan.currentBalance,
      monthlyInterest: Math.round(monthlyInterest * 100) / 100,
      isOverdue: daysToOverdue < 0,
      recommendationReason:
        daysToOverdue < 0
          ? 'Pożyczka jest przeterminowana - podejmij natychmiastową akcję!'
          : daysToOverdue < 7
          ? 'Pożyczka będzie przeterminowana wkrótce - zalecamy płatność'
          : 'Regularna płatność zalecana do utrzymania zdrowotności pożyczki',
    };
  }

  /**
   * Calculate interest savings if paid today
   */
  private calculateInterestSavings(
    balance: number,
    annualRate: number,
    daysToOverdue: number
  ): number {
    const dailyRate = annualRate / 365 / 100;
    const daysOfInterest = Math.max(0, daysToOverdue);
    
    // Interest that would accrue if not paid
    const futureInterest = balance * dailyRate * daysOfInterest;
    
    return futureInterest;
  }

  /**
   * Get days until due date (negative if overdue)
   */
  private getDaysToOverdue(dueDate: Date | null | undefined): number {
    if (!dueDate) return 30; // Assume 30-day default if no due date
    
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }
}

export interface PaymentSuggestion {
  minimumPayment: number;
  recommendedPayment: number;
  fullPayment: number;
  interestSavingsIfPaidNow: number;
  daysToOverdue: number;
  daysToPayOffAtRecommended: number;
  currentBalance: number;
  monthlyInterest: number;
  isOverdue: boolean;
  recommendationReason: string;
}

export const paymentSuggestionService = new PaymentSuggestionService();
