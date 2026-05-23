import { paymentRuleRepository } from '../repositories/PaymentRuleRepository';
import { loanRepository } from '../repositories/LoanRepository';
import { PaymentRuleType } from '../models/PaymentRule';

/**
 * Payment Rule Service (TIER 3)
 * Manages automated payment rules
 * 
 * Rules can be:
 * - Fixed amount: "Pay 100 PLN every month"
 * - Percentage: "Pay 10% of balance when salary arrives"
 * - Smart triggers: Based on conditions
 */
export class PaymentRuleService {
  /**
   * Create a payment rule
   */
  async createPaymentRule(
    loanId: string,
    ruleData: CreatePaymentRuleInput
  ): Promise<any> {
    // Verify loan exists
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Validate rule data
    this.validateRuleData(ruleData);

    // Create rule
    const rule = await paymentRuleRepository.create(loanId, {
      loanId,
      type: ruleData.type,
      trigger: ruleData.trigger,
      action: ruleData.action,
      amount: ruleData.amount || null,
      percentage: ruleData.percentage || null,
      startDate: ruleData.startDate || new Date(),
      endDate: ruleData.endDate || null,
      isActive: true,
      description: ruleData.description || null,
    });

    return rule;
  }

  /**
   * Get all payment rules for a loan
   */
  async getPaymentRules(loanId: string): Promise<any[]> {
    return paymentRuleRepository.findByLoanId(loanId);
  }

  /**
   * Get active payment rules
   */
  async getActivePaymentRules(loanId: string): Promise<any[]> {
    const rules = await paymentRuleRepository.findByLoanId(loanId);
    return rules.filter((r) => r.isActive && this.isRuleActive(r));
  }

  /**
   * Get suggested payment rules
   */
  async getSuggestedRules(loanId: string): Promise<SuggestedRule[]> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    const suggestions: SuggestedRule[] = [];

    // Suggestion 1: Fixed monthly payment
    const monthlyPayment = Math.ceil(loan.currentBalance / 12); // 12-month payoff
    suggestions.push({
      id: 'monthly-fixed',
      name: 'Regularnie co miesiąc',
      description: `Płacaj ${monthlyPayment} zł każdego miesiąca`,
      type: PaymentRuleType.FIXED_AMOUNT,
      trigger: 'monthly',
      action: 'pay_amount',
      amount: monthlyPayment,
      rationale: `Spłaci pożyczkę w ciągu 12 miesięcy przy ${monthlyPayment}/miesiąc`,
      priority: 'high',
    });

    // Suggestion 2: Percentage payment
    suggestions.push({
      id: 'percentage-balance',
      name: 'Procent balansu',
      description: 'Płacaj 10% pozostałego balansu co miesiąc',
      type: PaymentRuleType.PERCENTAGE,
      trigger: 'monthly',
      action: 'pay_percentage',
      percentage: 10,
      rationale: 'Szybciej spłaci początkowe okresy, spowalnia na koniec',
      priority: 'medium',
    });

    // Suggestion 3: Salary day payment
    if (loan.interestRate && loan.interestRate > 5) {
      suggestions.push({
        id: 'salary-day',
        name: 'Płatność na dzień wypłaty',
        description: 'Płacaj 15% balansu na dzień wypłaty (ustalony w systemie)',
        type: PaymentRuleType.PERCENTAGE,
        trigger: 'on_event',
        action: 'pay_percentage',
        percentage: 15,
        rationale: 'Dzień po wypłacie to idealny czas - skraca oprocentowanie',
        priority: 'high',
      });
    }

    // Suggestion 4: Aggressive payment (if balance is small)
    if (loan.currentBalance < 5000) {
      suggestions.push({
        id: 'aggressive-payoff',
        name: 'Agresywna spłata',
        description: `Płacaj 25% balansu (${Math.ceil((loan.currentBalance * 0.25) * 100) / 100} zł) co miesiąc`,
        type: PaymentRuleType.PERCENTAGE,
        trigger: 'monthly',
        action: 'pay_percentage',
        percentage: 25,
        rationale: 'Szybka spłata w ciągu 4 miesięcy - najmniej odsetek',
        priority: 'high',
      });
    }

    return suggestions;
  }

  /**
   * Update payment rule
   */
  async updatePaymentRule(
    ruleId: string,
    updates: Partial<CreatePaymentRuleInput>
  ): Promise<any> {
    const rule = await paymentRuleRepository.findById(ruleId);
    if (!rule) {
      throw new Error('Reguła nie znaleziona');
    }

    // Validate updates if type/trigger/action are being changed
    if (updates.type || updates.trigger || updates.action) {
      this.validateRuleData(updates as any);
    }

    // Update rule
    return paymentRuleRepository.update(ruleId, {
      type: updates.type !== undefined ? updates.type : undefined,
      trigger: updates.trigger !== undefined ? updates.trigger : undefined,
      action: updates.action !== undefined ? updates.action : undefined,
      amount: updates.amount !== undefined ? updates.amount : undefined,
      percentage: updates.percentage !== undefined ? updates.percentage : undefined,
      description: updates.description !== undefined ? updates.description : undefined,
    });
  }

  /**
   * Delete payment rule
   */
  async deletePaymentRule(ruleId: string): Promise<boolean> {
    const rule = await paymentRuleRepository.findById(ruleId);
    if (!rule) {
      throw new Error('Reguła nie znaleziona');
    }

    return paymentRuleRepository.delete(ruleId);
  }

  /**
   * Validate rule data
   */
  private validateRuleData(data: any): void {
    if (!data.type || !data.trigger || !data.action) {
      throw new Error('Typ, wyzwalacz i akcja są wymagane');
    }

    // Validate type
    const validTypes = Object.values(PaymentRuleType);
    if (!validTypes.includes(data.type)) {
      throw new Error('Nieprawidłowy typ reguły');
    }

    // Validate amount/percentage
    if (data.type === PaymentRuleType.FIXED_AMOUNT && (!data.amount || data.amount <= 0)) {
      throw new Error('Kwota jest wymagana dla reguł stałych i musi być większa niż 0');
    }

    if (data.type === PaymentRuleType.PERCENTAGE && (!data.percentage || data.percentage <= 0 || data.percentage > 100)) {
      throw new Error('Procent musi być między 1 a 100');
    }
  }

  /**
   * Check if rule is currently active
   */
  private isRuleActive(rule: any): boolean {
    const now = new Date();

    // Check start date
    if (rule.startDate && rule.startDate > now) {
      return false;
    }

    // Check end date
    if (rule.endDate && rule.endDate < now) {
      return false;
    }

    return true;
  }

  /**
   * Execute payment rule (called by scheduler)
   */
  async executePaymentRule(ruleId: string): Promise<void> {
    const rule = await paymentRuleRepository.findById(ruleId);
    if (!rule || !rule.isActive) {
      return;
    }

    // Check if rule should execute today
    if (!this.shouldExecuteToday(rule)) {
      return;
    }

    // Get loan
    const loan = await loanRepository.findById(rule.loanId);
    if (!loan) return;

    // Calculate payment amount
    let paymentAmount = 0;

    if (rule.type === PaymentRuleType.FIXED_AMOUNT && rule.amount !== null) {
      paymentAmount = rule.amount;
    } else if (rule.type === PaymentRuleType.PERCENTAGE && rule.percentage !== null) {
      paymentAmount = (loan.currentBalance * rule.percentage) / 100;
    }

    // Don't exceed remaining balance
    paymentAmount = Math.min(paymentAmount, loan.currentBalance);

    // For now, just log that rule would execute
    // In a real implementation, this would integrate with payment processor
    console.log(`Payment rule ${ruleId} would execute payment of ${paymentAmount} PLN`);
  }

  /**
   * Determine if rule should execute today
   */
  private shouldExecuteToday(rule: any): boolean {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const dayOfWeek = today.getDay();

    switch (rule.trigger) {
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === 1; // Monday
      case 'monthly':
        return dayOfMonth === 1; // 1st of month
      case 'on_date':
        // Parse custom date (would be stored differently in real impl)
        return false;
      case 'on_event':
        return false;
      default:
        return false;
    }
  }
}

export interface CreatePaymentRuleInput {
  type: PaymentRuleType;
  trigger: string;
  action: string;
  amount?: number;
  percentage?: number;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface SuggestedRule {
  id: string;
  name: string;
  description: string;
  type: PaymentRuleType;
  trigger: string;
  action: string;
  amount?: number;
  percentage?: number;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
}

export const paymentRuleService = new PaymentRuleService();
