import { loanRepository } from '../repositories/LoanRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { TransactionType } from '../models/Transaction';

/**
 * Loan Health Score Service (TIER 2)
 * Calculates loan health score (0-100)
 * 
 * Algorithm:
 * score = (daysToOverdue/30) * 40 + (remainingBalance/originalAmount) * 40 + (paymentVelocity) * 20
 * 
 * Color coding:
 * - Red (0-30): Overdue/Critical
 * - Orange (31-60): At risk
 * - Yellow (61-80): Fair
 * - Green (81-100): Healthy
 */
export class LoanHealthScoreService {
  /**
   * Calculate health score for a loan
   */
  async calculateHealthScore(loanId: string): Promise<LoanHealthScoreResponse> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Component 1: Days to overdue (40%)
    const daysToOverdue = this.getDaysToOverdue(loan.dueDate);
    const overdueScore = this.calculateOverdueScore(daysToOverdue);

    // Component 2: Remaining balance vs original (40%)
    const balanceScore = this.calculateBalanceScore(loan.currentBalance, loan.originalAmount);

    // Component 3: Payment velocity (20%)
    const paymentVelocity = await this.calculatePaymentVelocity(loanId);
    const velocityScore = this.calculateVelocityScore(paymentVelocity);

    // Overall score (weighted average)
    const score = overdueScore * 0.4 + balanceScore * 0.4 + velocityScore * 0.2;
    const roundedScore = Math.min(100, Math.max(0, Math.round(score)));

    // Determine health status
    const status = this.getHealthStatus(roundedScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(daysToOverdue, paymentVelocity, loan);

    return {
      loanId,
      score: roundedScore,
      status,
      color: this.getStatusColor(status),
      
      // Component breakdown
      components: {
        overdue: {
          score: Math.round(overdueScore),
          weight: 40,
          label: 'Termin spłaty',
          daysToOverdue,
          message: this.getOverdueMessage(daysToOverdue),
        },
        balance: {
          score: Math.round(balanceScore),
          weight: 40,
          label: 'Saldo',
          percentageRemaining: (loan.currentBalance / loan.originalAmount) * 100,
          message: `${((loan.currentBalance / loan.originalAmount) * 100).toFixed(1)}% pozostało do spłaty`,
        },
        velocity: {
          score: Math.round(velocityScore),
          weight: 20,
          label: 'Tempo spłaty',
          paymentVelocity,
          message: this.getVelocityMessage(paymentVelocity),
        },
      },
      
      // Progress ring data
      progressRing: {
        score: roundedScore,
        maxScore: 100,
        circumference: 2 * Math.PI * 45, // For SVG circle with r=45
        offset: (100 - roundedScore) * (2 * Math.PI * 45) / 100,
      },
      
      // Recommendations
      recommendations,
      
      // Summary
      summary:
        status === 'healthy'
          ? 'Doskonale! Twoja pożyczka jest w doskonałym stanie.'
          : status === 'fair'
          ? 'Twoja pożyczka wymaga uwagi, aby pozostała zdrowotna.'
          : status === 'atrisk'
          ? 'Twoja pożyczka jest zagrożona. Podejmij działania naprawcze.'
          : 'Twoja pożyczka jest KRYTYCZNA. Natychmiast podejmij działania.',
    };
  }

  /**
   * Calculate overdue score (40% weight)
   */
  private calculateOverdueScore(daysToOverdue: number): number {
    if (daysToOverdue >= 30) return 100; // More than 30 days = perfect
    if (daysToOverdue < 0) return 0; // Overdue = worst
    
    // 0-30 days: linear scale
    return (daysToOverdue / 30) * 100;
  }

  /**
   * Calculate balance score (40% weight)
   */
  private calculateBalanceScore(currentBalance: number, originalAmount: number): number {
    if (originalAmount === 0) return 100;
    
    const percentageRemaining = (currentBalance / originalAmount) * 100;
    
    // The more paid off, the better
    // 0% remaining (fully paid) = 100
    // 100% remaining (no payment) = 0
    return 100 - percentageRemaining;
  }

  /**
   * Calculate payment velocity score (20% weight)
   */
  private calculateVelocityScore(velocity: number): number {
    // Velocity measured in percentage paid per month
    // 0-5% per month = 0
    // 5-10% per month = 50
    // 10%+ per month = 100
    
    if (velocity >= 10) return 100;
    if (velocity <= 0) return 0;
    
    return (velocity / 10) * 100;
  }

  /**
   * Calculate payment velocity (% of original amount paid per month)
   */
  private async calculatePaymentVelocity(loanId: string): Promise<number> {
    // Get transactions for this loan
    const transactions = await transactionRepository.findByLoanId(loanId);

    if (transactions.length === 0) return 0;

    // Get loan data
    const loan = await loanRepository.findById(loanId);
    if (!loan) return 0;

    // Calculate months since creation
    const createdDate = loan.createdAt;
    const now = new Date();
    const monthsElapsed = Math.max(
      1,
      (now.getFullYear() - createdDate.getFullYear()) * 12 +
        (now.getMonth() - createdDate.getMonth())
    );

    // Calculate total paid
    const totalPaid = transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate velocity
    const velocity = (totalPaid / loan.originalAmount / monthsElapsed) * 100;

    return Math.min(100, velocity); // Cap at 100%
  }

  /**
   * Get health status from score
   */
  private getHealthStatus(score: number): 'healthy' | 'fair' | 'atrisk' | 'critical' {
    if (score >= 81) return 'healthy';
    if (score >= 61) return 'fair';
    if (score >= 31) return 'atrisk';
    return 'critical';
  }

  /**
   * Get status color
   */
  private getStatusColor(status: 'healthy' | 'fair' | 'atrisk' | 'critical'): string {
    switch (status) {
      case 'healthy':
        return '#10b981'; // green
      case 'fair':
        return '#f59e0b'; // yellow
      case 'atrisk':
        return '#f97316'; // orange
      case 'critical':
        return '#ef4444'; // red
    }
  }

  /**
   * Get overdue message
   */
  private getOverdueMessage(daysToOverdue: number): string {
    if (daysToOverdue < 0) {
      return `PRZETERMINOWANA o ${Math.abs(daysToOverdue)} dni`;
    }
    if (daysToOverdue < 7) {
      return `Termin za ${daysToOverdue} dni - PILNE!`;
    }
    if (daysToOverdue < 30) {
      return `Termin za ${daysToOverdue} dni`;
    }
    return `Dobrze - termin za więcej niż miesiąc`;
  }

  /**
   * Get velocity message
   */
  private getVelocityMessage(velocity: number): string {
    if (velocity === 0) return 'Brak płatności';
    if (velocity < 5) return 'Wolne tempo spłaty';
    if (velocity < 10) return 'Średnie tempo spłaty';
    return 'Szybkie tempo spłaty';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    daysToOverdue: number,
    paymentVelocity: number,
    loan: any
  ): string[] {
    const recommendations: string[] = [];

    // Overdue recommendations
    if (daysToOverdue < 0) {
      recommendations.push('PILNE: Pożyczka jest przeterminowana - zapłać natychmiast!');
    } else if (daysToOverdue < 7) {
      recommendations.push('Dokonaj płatności w ciągu 7 dni, aby uniknąć odsetek za opóźnienie');
    }

    // Payment velocity recommendations
    if (paymentVelocity < 5) {
      recommendations.push('Zwiększ kwotę swoich miesięcznych płatności, aby przyspieszyć spłatę');
    }

    // Balance recommendations
    const percentageRemaining = (loan.currentBalance / loan.originalAmount) * 100;
    if (percentageRemaining > 80) {
      recommendations.push('Jesteś zaledwie na początku spłaty - utrzymaj regularne płatności');
    } else if (percentageRemaining > 50) {
      recommendations.push('Jesteś na połowie drogi - kontynuuj obecny tempo spłaty');
    } else if (percentageRemaining > 20) {
      recommendations.push('Świetny postęp! Patrz na światło na końcu tunelu');
    } else if (percentageRemaining > 0) {
      recommendations.push('Ostatnie etapy! Ostateczny wysiłek dla całkowitej spłaty');
    }

    // Interest recommendations
    if (loan.interestRate > 10) {
      recommendations.push('Wysokie oprocentowanie - rozważ możliwość refinansowania');
    }

    if (recommendations.length === 0) {
      recommendations.push('Utrzymuj obecne tempo - wszystko idzie dobrze!');
    }

    return recommendations;
  }

  /**
   * Get days to overdue
   */
  private getDaysToOverdue(dueDate: Date | null | undefined): number {
    if (!dueDate) return 30; // Assume 30-day default if no due date
    
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }
}

export interface LoanHealthScoreResponse {
  loanId: string;
  score: number;
  status: 'healthy' | 'fair' | 'atrisk' | 'critical';
  color: string;
  components: {
    overdue: {
      score: number;
      weight: number;
      label: string;
      daysToOverdue: number;
      message: string;
    };
    balance: {
      score: number;
      weight: number;
      label: string;
      percentageRemaining: number;
      message: string;
    };
    velocity: {
      score: number;
      weight: number;
      label: string;
      paymentVelocity: number;
      message: string;
    };
  };
  progressRing: {
    score: number;
    maxScore: number;
    circumference: number;
    offset: number;
  };
  recommendations: string[];
  summary: string;
}

export const loanHealthScoreService = new LoanHealthScoreService();
