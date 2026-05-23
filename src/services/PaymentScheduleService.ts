import { loanRepository } from '../repositories/LoanRepository';

/**
 * Payment Schedule Service (TIER 1)
 * Generates payment schedules for loans
 * 
 * Algorithm: Divides currentBalance by number of months, applies interest if present
 * Returns: Array of PaymentScheduleItem with suggested payments and milestones
 */
export class PaymentScheduleService {
  /**
   * Generate payment schedule for a loan
   * @param loanId - Loan ID
   * @param months - Number of months to generate schedule for (default 12)
   * @returns Payment schedule array
   */
  async generatePaymentSchedule(
    loanId: string,
    months: number = 12
  ): Promise<PaymentScheduleItem[]> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    const schedule: PaymentScheduleItem[] = [];
    let remainingBalance = loan.currentBalance;
    const monthlyPayment = remainingBalance / months;
    const monthlyInterestRate = (loan.interestRate || 0) / 12 / 100; // Convert annual to monthly

    for (let month = 1; month <= months; month++) {
      // Calculate accrued interest for this month
      const interestAccrued = remainingBalance * monthlyInterestRate;
      
      // Principal payment
      const principalPayment = monthlyPayment;
      
      // Total payment (principal + interest)
      const totalPayment = principalPayment + interestAccrued;
      
      // Update remaining balance
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      // Payment date (assuming monthly from now)
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + month);

      // Calculate percentage milestone
      const percentagePaid = ((loan.currentBalance - remainingBalance) / loan.currentBalance) * 100;

      schedule.push({
        month,
        date: paymentDate.toISOString().split('T')[0],
        suggestedPayment: Math.round(totalPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestAccrued * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
        percentageMilestone: Math.round(percentagePaid),
      });

      if (remainingBalance === 0) break;
    }

    return schedule;
  }
}

export interface PaymentScheduleItem {
  month: number;
  date: string;
  suggestedPayment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  percentageMilestone: number;
}

export const paymentScheduleService = new PaymentScheduleService();
