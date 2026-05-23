import { loanRepository } from '../repositories/LoanRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { TransactionType } from '../models/Transaction';

/**
 * Payment Forecast Service (TIER 3)
 * Predicts when loan will be fully paid based on payment history
 * 
 * Uses ML-inspired approach:
 * - Analyzes last 10 payments (velocity)
 * - Calculates trend
 * - Provides confidence interval
 * - Alerts if overdue in 30 days
 */
export class PaymentForecastService {
  /**
   * Forecast payment completion date
   */
  async forecastPaymentCompletion(loanId: string): Promise<PaymentForecastResponse> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Get transaction history
    const transactions = await transactionRepository.findByLoanId(loanId);
    const payments = transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // If no payments yet, estimate based on balance
    if (payments.length === 0) {
      return this.generateNoPaymentHistoryForecast(loan);
    }

    // Calculate payment velocity (last 10 payments)
    const recentPayments = payments.slice(-10);
    const { averagePayment, trend, standardDeviation } = this.analyzePaymentTrend(
      recentPayments
    );

    // Calculate days to payoff
    const daysToPayoff = this.calculateDaysToPayoff(
      loan.currentBalance,
      averagePayment,
      standardDeviation
    );

    // Project completion date
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToPayoff);

    // Calculate confidence interval (±1 std dev)
    const optimisticDays = Math.max(
      1,
      this.calculateDaysToPayoff(loan.currentBalance, averagePayment + standardDeviation, 0)
    );
    const pesimisticDays = this.calculateDaysToPayoff(
      loan.currentBalance,
      Math.max(1, averagePayment - standardDeviation),
      0
    );

    const optimisticDate = new Date();
    optimisticDate.setDate(optimisticDate.getDate() + optimisticDays);

    const pesimisticDate = new Date();
    pesimisticDate.setDate(pesimisticDate.getDate() + pesimisticDays);

    // Check if overdue in 30 days
    const daysToOverdue = this.getDaysToOverdue(loan.dueDate);
    const willBeOverdueIn30Days =
      daysToOverdue > 0 && daysToOverdue < 30 && daysToPayoff > daysToOverdue;

    return {
      loanId,
      currentBalance: loan.currentBalance,
      completionDate: completionDate.toISOString().split('T')[0],
      daysToPayoff,
      
      // Confidence interval
      confidence: this.calculateConfidence(standardDeviation, averagePayment),
      optimisticDate: optimisticDate.toISOString().split('T')[0],
      pesimisticDate: pesimisticDate.toISOString().split('T')[0],
      optimisticDays,
      pesimisticDays,
      
      // Analysis
      paymentHistory: {
        totalPayments: payments.length,
        averagePayment: Math.round(averagePayment * 100) / 100,
        trend,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        lastPaymentAmount: payments[payments.length - 1]?.amount || 0,
        lastPaymentDate: payments[payments.length - 1]?.createdAt.toISOString().split('T')[0],
      },
      
      // Alert if overdue risk
      overdueAlert: willBeOverdueIn30Days
        ? `OSTRZEŻENIE: Przy obecnym tempie spłaty, pożyczka będzie przeterminowana za ${daysToOverdue} dni`
        : null,
      
      // Recommendations
      recommendations: this.generateForecastRecommendations(
        daysToPayoff,
        averagePayment,
        loan.currentBalance,
        trend
      ),
    };
  }

  /**
   * Generate forecast when no payment history exists
   */
  private generateNoPaymentHistoryForecast(loan: any): PaymentForecastResponse {
    const estimatedMonthlyPayment = loan.currentBalance * 0.1; // Assume 10% monthly
    const daysToPayoff = Math.ceil((loan.currentBalance / estimatedMonthlyPayment) * 30);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToPayoff);

    return {
      loanId: loan.id,
      currentBalance: loan.currentBalance,
      completionDate: completionDate.toISOString().split('T')[0],
      daysToPayoff,
      confidence: 'low',
      optimisticDate: null,
      pesimisticDate: null,
      optimisticDays: Math.ceil(daysToPayoff * 0.7),
      pesimisticDays: Math.ceil(daysToPayoff * 1.3),
      paymentHistory: {
        totalPayments: 0,
        averagePayment: 0,
        trend: 'unknown',
        standardDeviation: 0,
        lastPaymentAmount: null,
        lastPaymentDate: null,
      },
      overdueAlert: null,
      recommendations: [
        'Brak historii płatności - Zacznij dokonywać regularne płatności',
        'Prognoza opiera się na szacunkach - ta dokładność wzrośnie z czasem',
      ],
    };
  }

  /**
   * Analyze payment trend from recent payments
   */
  private analyzePaymentTrend(payments: any[]): {
    averagePayment: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    standardDeviation: number;
  } {
    const amounts = payments.map((p) => p.amount);

    // Calculate average
    const averagePayment = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;

    // Calculate standard deviation
    const squaredDiffs = amounts.map((a) => Math.pow(a - averagePayment, 2));
    const standardDeviation = Math.sqrt(
      squaredDiffs.reduce((sum, sd) => sum + sd, 0) / amounts.length
    );

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (amounts.length >= 3) {
      const firstThird = amounts.slice(0, Math.floor(amounts.length / 3));
      const lastThird = amounts.slice(-Math.floor(amounts.length / 3));

      const firstAvg = firstThird.reduce((sum, a) => sum + a, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, a) => sum + a, 0) / lastThird.length;

      const changePercent = ((lastAvg - firstAvg) / firstAvg) * 100;
      if (changePercent > 10) {
        trend = 'increasing';
      } else if (changePercent < -10) {
        trend = 'decreasing';
      }
    }

    return {
      averagePayment,
      trend,
      standardDeviation,
    };
  }

  /**
   * Calculate days to payoff
   */
  private calculateDaysToPayoff(
    balance: number,
    averagePayment: number,
    adjustment: number = 0
  ): number {
    if (averagePayment === 0) return Infinity;
    
    const adjustedPayment = averagePayment + adjustment;
    if (adjustedPayment <= 0) return Infinity;

    const monthsToPayoff = balance / adjustedPayment;
    return Math.ceil(monthsToPayoff * 30); // Convert to days
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(
    standardDeviation: number,
    averagePayment: number
  ): 'low' | 'medium' | 'high' {
    const coefficientOfVariation = (standardDeviation / averagePayment) * 100;

    if (coefficientOfVariation < 10) return 'high';
    if (coefficientOfVariation < 25) return 'medium';
    return 'low';
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
   * Generate recommendations based on forecast
   */
  private generateForecastRecommendations(
    daysToPayoff: number,
    averagePayment: number,
    currentBalance: number,
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    // Time-based recommendations
    if (daysToPayoff < 90) {
      recommendations.push('Niemal tam! Utrzymuj obecne tempo spłaty');
    } else if (daysToPayoff < 180) {
      recommendations.push('Na dobrej drodze - spłata za mniej niż 6 miesięcy');
    } else if (daysToPayoff < 365) {
      recommendations.push('Spłata za rok - rozważ zwiększenie swoich płatności');
    } else if (daysToPayoff < 730) {
      recommendations.push('Spłata za 2 lata - znacznie zwiększ swoje płatności');
    } else {
      recommendations.push('Bardzo długa projekcja - natychmiast zwiększ płatności');
    }

    // Trend-based recommendations
    if (trend === 'increasing') {
      recommendations.push('Świetnie! Twoje płatności rosną - kontynuuj ten trend');
    } else if (trend === 'decreasing') {
      recommendations.push('Uwaga: Twoje płatności maleją - spróbuj je stabilizować');
    } else {
      recommendations.push('Płatności są stabilne - dobra pracy');
    }

    // Amount-based recommendations
    const suggestedIncrease = currentBalance * 0.15; // 15% of balance
    if (averagePayment < suggestedIncrease) {
      recommendations.push(
        `Możesz skrócić czas spłaty, zwiększając płatności do ${Math.round(suggestedIncrease * 100) / 100} zł`
      );
    }

    return recommendations;
  }
}

export interface PaymentForecastResponse {
  loanId: string;
  currentBalance: number;
  completionDate: string | null;
  daysToPayoff: number;
  confidence: 'low' | 'medium' | 'high';
  optimisticDate: string | null;
  pesimisticDate: string | null;
  optimisticDays: number;
  pesimisticDays: number;
  paymentHistory: {
    totalPayments: number;
    averagePayment: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
    standardDeviation: number;
    lastPaymentAmount: number | null;
    lastPaymentDate: string | null;
  };
  overdueAlert: string | null;
  recommendations: string[];
}

export const paymentForecastService = new PaymentForecastService();
