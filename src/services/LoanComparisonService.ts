import { loanRepository } from '../repositories/LoanRepository';

/**
 * Loan Comparison Service (TIER 1)
 * Compares multiple loans side-by-side
 * 
 * Returns: Interest rate, remaining, % paid, days to due, interest accrued
 */
export class LoanComparisonService {
  /**
   * Compare multiple loans
   * @param loanIds - Array of loan IDs to compare
   * @param userId - User ID (for authorization)
   * @returns Comparison data for all loans
   */
  async compareLoan(loanIds: string[], userId: string): Promise<LoanComparisonResult> {
    if (loanIds.length === 0) {
      throw new Error('Należy podać co najmniej jeden loan ID do porównania');
    }

    const loans = await Promise.all(
      loanIds.map(async (loanId) => {
        const loan = await loanRepository.findById(loanId);
        if (!loan) {
          throw new Error(`Pożyczka ${loanId} nie znaleziona`);
        }
        
        // Verify ownership
        if (loan.userId !== userId) {
          throw new Error(`Brak uprawnień do dostępu do pożyczki ${loanId}`);
        }

        return loan;
      })
    );

    // Calculate comparison metrics
    const comparisons: LoanComparisonItem[] = loans.map((loan) => ({
      id: loan.id,
      borrowerName: loan.borrowerName,
      originalAmount: loan.originalAmount,
      currentBalance: loan.currentBalance,
      interestRate: loan.interestRate || 0,
      interestType: loan.interestType || 'simple',
      status: loan.status,
      currency: loan.currency,
      dueDate: loan.dueDate || undefined,
      
      // Calculated metrics
      percentagePaid: this.calculatePercentagePaid(loan.originalAmount, loan.currentBalance),
      percentageRemaining: (loan.currentBalance / loan.originalAmount) * 100,
      daysToOverdue: this.getDaysToOverdue(loan.dueDate),
      monthlyInterest: this.calculateMonthlyInterest(loan.currentBalance, loan.interestRate),
      totalInterestAccrued: this.calculateTotalInterest(
        loan.currentBalance,
        loan.interestRate
      ),
      estimatedPayoffDays: this.estimatePayoffDays(loan.currentBalance),
    }) as LoanComparisonItem);

    // Summary comparison
    const summary = {
      totalLoans: loans.length,
      totalOriginalAmount: loans.reduce((sum, l) => sum + l.originalAmount, 0),
      totalCurrentBalance: loans.reduce((sum, l) => sum + l.currentBalance, 0),
      averageInterestRate:
        loans.length > 0
          ? loans.reduce((sum, l) => sum + (l.interestRate || 0), 0) / loans.length
          : 0,
      highestInterestRate: Math.max(...loans.map((l) => l.interestRate || 0)),
      lowestInterestRate: Math.min(...loans.map((l) => l.interestRate || 0)),
      mostUrgent: this.findMostUrgent(comparisons),
      closestToDueDate: this.findClosestToDueDate(comparisons),
    };

    return {
      loans: comparisons,
      summary,
      comparisonDate: new Date().toISOString(),
    };
  }

  /**
   * Calculate percentage paid
   */
  private calculatePercentagePaid(originalAmount: number, currentBalance: number): number {
    if (originalAmount === 0) return 0;
    return ((originalAmount - currentBalance) / originalAmount) * 100;
  }

  /**
   * Get days to overdue
   */
  private getDaysToOverdue(dueDate: Date | null | undefined): number {
    if (!dueDate) return Infinity;
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate monthly interest
   */
  private calculateMonthlyInterest(balance: number, annualRate: number | null | undefined): number {
    const rate = annualRate || 0;
    return (balance * rate / 12 / 100);
  }

  /**
   * Calculate total interest accrued
   */
  private calculateTotalInterest(
    currentBalance: number,
    annualRate: number | null | undefined
  ): number {
    // Simple estimate: interest accrued based on current balance and annual rate
    const rate = annualRate || 0;
    const monthlyRate = rate / 12 / 100;
    
    // Estimate: assume 1 month has passed on average
    return currentBalance * monthlyRate;
  }

  /**
   * Estimate days to pay off at current rate
   */
  private estimatePayoffDays(balance: number): number {
    if (balance === 0) return 0;
    
    // Assume average monthly payment of 10% of balance
    const monthlyPayment = balance * 0.1;
    if (monthlyPayment === 0) return Infinity;
    
    const monthsToPayoff = balance / monthlyPayment;
    return Math.ceil(monthsToPayoff * 30); // Convert to days
  }

  /**
   * Find most urgent loan (closest to default)
   */
  private findMostUrgent(comparisons: LoanComparisonItem[]): string | null {
    const overdue = comparisons.filter((c) => c.daysToOverdue < 0);
    if (overdue.length > 0) {
      return overdue.reduce((prev, curr) =>
        curr.daysToOverdue < prev.daysToOverdue ? curr : prev
      ).id;
    }

    const withDueDate = comparisons.filter((c) => c.daysToOverdue !== Infinity);
    if (withDueDate.length > 0) {
      return withDueDate.reduce((prev, curr) =>
        curr.daysToOverdue < prev.daysToOverdue ? curr : prev
      ).id;
    }

    return null;
  }

  /**
   * Find closest to due date
   */
  private findClosestToDueDate(comparisons: LoanComparisonItem[]): string | null {
    const withDueDate = comparisons.filter((c) => c.daysToOverdue !== Infinity);
    if (withDueDate.length === 0) return null;
    
    return withDueDate.reduce((prev, curr) =>
      Math.abs(curr.daysToOverdue) < Math.abs(prev.daysToOverdue) ? curr : prev
    ).id;
  }
}

export interface LoanComparisonResult {
  loans: LoanComparisonItem[];
  summary: ComparisonSummary;
  comparisonDate: string;
}

export interface LoanComparisonItem {
  id: string;
  borrowerName: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  interestType: string;
  status: string;
  currency: string;
  dueDate?: Date;
  percentagePaid: number;
  percentageRemaining: number;
  daysToOverdue: number;
  monthlyInterest: number;
  totalInterestAccrued: number;
  estimatedPayoffDays: number;
}

export interface ComparisonSummary {
  totalLoans: number;
  totalOriginalAmount: number;
  totalCurrentBalance: number;
  averageInterestRate: number;
  highestInterestRate: number;
  lowestInterestRate: number;
  mostUrgent: string | null;
  closestToDueDate: string | null;
}

export const loanComparisonService = new LoanComparisonService();
