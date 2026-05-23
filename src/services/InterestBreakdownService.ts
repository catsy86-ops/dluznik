import { loanRepository } from '../repositories/LoanRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { TransactionType } from '../models/Transaction';

/**
 * Interest Breakdown Service (TIER 2)
 * Visualizes and calculates interest accrual
 * 
 * Returns: Principal, Interest accrued, Projected interest if no payment, pie chart data
 */
export class InterestBreakdownService {
  /**
   * Get interest breakdown for a loan
   * Shows original balance, payments made, interest accrued
   */
  async getInterestBreakdown(loanId: string): Promise<InterestBreakdownResponse> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Get all transactions for this loan
    const transactions = await transactionRepository.findByLoanId(loanId);

    // Calculate totals
    const totalPaymentsMade = transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .reduce((sum, t) => sum + t.amount, 0);

    const interestAccrued = loan.originalAmount - loan.currentBalance - totalPaymentsMade;

    // Calculate monthly interest accrual
    const monthlyInterestRate = (loan.interestRate || 0) / 12 / 100;
    const monthlyInterest = loan.currentBalance * monthlyInterestRate;

    // Project interest if no payment for 6, 12, 24 months
    const projections = this.projectInterestAccrual(
      loan.currentBalance,
      loan.interestRate || 0,
      [6, 12, 24]
    );

    // Calculate percentage split (principal vs interest)
    const principalPercentage =
      loan.originalAmount > 0
        ? ((loan.originalAmount - interestAccrued) / loan.originalAmount) * 100
        : 0;
    const interestPercentage = 100 - principalPercentage;

    return {
      loanId,
      originalBalance: loan.originalAmount,
      paymentsMade: totalPaymentsMade,
      currentBalance: loan.currentBalance,
      interestAccrued: Math.round(interestAccrued * 100) / 100,
      interestRate: loan.interestRate || 0,
      interestType: loan.interestType || 'simple',
      monthlyInterest: Math.round(monthlyInterest * 100) / 100,
      
      // Breakdown percentages
      principalPercentage: Math.round(principalPercentage * 100) / 100,
      interestPercentage: Math.round(interestPercentage * 100) / 100,
      
      // Pie chart data
      pieChart: {
        principal: {
          label: 'Główna pożyczka',
          value: loan.originalAmount - interestAccrued,
          percentage: principalPercentage,
          color: '#3b82f6', // blue
        },
        interest: {
          label: 'Odsetki',
          value: Math.round(interestAccrued * 100) / 100,
          percentage: interestPercentage,
          color: '#ef4444', // red
        },
      },
      
      // Interest projections
      projections,
      
      // Timeline message
      timelineMessage: this.generateTimelineMessage(
        monthlyInterest,
        loan.dueDate
      ),
    };
  }

  /**
   * Get real-time accrued interest
   * Shows live calculation of accrued interest
   */
  async getRealTimeAccrual(loanId: string): Promise<RealTimeAccrualResponse> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    const monthlyInterestRate = (loan.interestRate || 0) / 12 / 100;
    const dailyInterestRate = (loan.interestRate || 0) / 365 / 100;

    // Calculate interest accrued since last update (assume 1 day)
    const dailyInterest = loan.currentBalance * dailyInterestRate;
    const monthlyInterest = loan.currentBalance * monthlyInterestRate;
    const yearlyInterest = loan.currentBalance * ((loan.interestRate || 0) / 100);

    // Calculate exact time-based interest
    const transactions = await transactionRepository.findByLoanId(loanId);
    const lastPaymentDate = this.getLastPaymentDate(transactions);
    const daysSinceLastPayment = this.getDaysSince(lastPaymentDate);

    const accruedSinceLastPayment = loan.currentBalance * dailyInterestRate * daysSinceLastPayment;

    // Calculate break-even payment (enough to cover all accrued interest)
    const breakEvenPayment = monthlyInterest;

    return {
      loanId,
      currentBalance: loan.currentBalance,
      interestRate: loan.interestRate || 0,
      
      // Real-time accrual rates
      dailyInterest: Math.round(dailyInterest * 100) / 100,
      weeklyInterest: Math.round(dailyInterest * 7 * 100) / 100,
      monthlyInterest: Math.round(monthlyInterest * 100) / 100,
      yearlyInterest: Math.round(yearlyInterest * 100) / 100,
      
      // Since last payment
      daysSinceLastPayment,
      accruedSinceLastPayment: Math.round(accruedSinceLastPayment * 100) / 100,
      
      // Break-even
      breakEvenPayment: Math.round(breakEvenPayment * 100) / 100,
      
      // Message
      accrualMessage: `Każdego dnia naliczane są ${this.formatCurrency(dailyInterest)} odsetek. Bez płatności, za miesiąc będzie to ${this.formatCurrency(monthlyInterest)}.`,
      
      // Last update
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Project interest accrual over multiple months
   */
  private projectInterestAccrual(
    balance: number,
    annualRate: number,
    months: number[]
  ): InterestProjection[] {
    const monthlyRate = annualRate / 12 / 100;

    return months.map((month) => {
      let projectedBalance = balance;
      let totalInterest = 0;

      for (let i = 0; i < month; i++) {
        const monthlyInterest = projectedBalance * monthlyRate;
        totalInterest += monthlyInterest;
        // With simple interest, balance stays the same
        // With compound, it would grow
        if (annualRate > 0) {
          projectedBalance = balance + totalInterest;
        }
      }

      return {
        months: month,
        projectedInterest: Math.round(totalInterest * 100) / 100,
        projectedBalance: Math.round(projectedBalance * 100) / 100,
      };
    });
  }

  /**
   * Generate timeline message
   */
  private generateTimelineMessage(monthlyInterest: number, dueDate: Date | null | undefined): string {
    if (dueDate) {
      const daysToOverdue = Math.floor(
        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysToOverdue < 0) {
        return `Pożyczka jest przeterminowana o ${Math.abs(daysToOverdue)} dni. Każdy dzień dodaje odsetki!`;
      }
      return `Termin płatności za ${daysToOverdue} dni. Jeśli nie spłacisz do [DATE], odsetki będą: ${this.formatCurrency(monthlyInterest * Math.ceil(daysToOverdue / 30))}`;
    }
    return `Miesięczne odsetki: ${this.formatCurrency(monthlyInterest)}`;
  }

  /**
   * Get last payment date from transactions
   */
  private getLastPaymentDate(transactions: any[]): Date {
    const payments = transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return payments.length > 0 ? payments[0].createdAt : new Date();
  }

  /**
   * Get days since date
   */
  private getDaysSince(date: Date): number {
    const timeDiff = new Date().getTime() - date.getTime();
    return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  }
}

export interface InterestBreakdownResponse {
  loanId: string;
  originalBalance: number;
  paymentsMade: number;
  currentBalance: number;
  interestAccrued: number;
  interestRate: number;
  interestType: string;
  monthlyInterest: number;
  principalPercentage: number;
  interestPercentage: number;
  pieChart: {
    principal: {
      label: string;
      value: number;
      percentage: number;
      color: string;
    };
    interest: {
      label: string;
      value: number;
      percentage: number;
      color: string;
    };
  };
  projections: InterestProjection[];
  timelineMessage: string;
}

export interface InterestProjection {
  months: number;
  projectedInterest: number;
  projectedBalance: number;
}

export interface RealTimeAccrualResponse {
  loanId: string;
  currentBalance: number;
  interestRate: number;
  dailyInterest: number;
  weeklyInterest: number;
  monthlyInterest: number;
  yearlyInterest: number;
  daysSinceLastPayment: number;
  accruedSinceLastPayment: number;
  breakEvenPayment: number;
  accrualMessage: string;
  lastUpdated: string;
}

export const interestBreakdownService = new InterestBreakdownService();
