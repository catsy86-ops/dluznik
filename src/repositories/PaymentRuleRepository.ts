import { AppDataSource } from '../config/database-init';
import { PaymentRule } from '../models/PaymentRule';
import { v4 as uuidv4 } from 'uuid';

/**
 * Payment Rule Repository
 * Handles all database operations for PaymentRule entity
 */
export class PaymentRuleRepository {
  private repository = AppDataSource.getRepository(PaymentRule);

  /**
   * Create a new payment rule
   */
  async create(loanId: string, rule: Partial<PaymentRule>): Promise<PaymentRule> {
    const paymentRule = new PaymentRule();
    paymentRule.id = uuidv4();
    paymentRule.loanId = loanId;
    Object.assign(paymentRule, rule);

    return this.repository.save(paymentRule);
  }

  /**
   * Find payment rule by ID
   */
  async findById(id: string): Promise<PaymentRule | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['loan'],
    });
  }

  /**
   * Find all payment rules for a loan
   */
  async findByLoanId(loanId: string): Promise<PaymentRule[]> {
    return this.repository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find active payment rules for a loan
   */
  async findActivByLoanId(loanId: string): Promise<PaymentRule[]> {
    return this.repository.find({
      where: { loanId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update payment rule
   */
  async update(id: string, updates: Partial<PaymentRule>): Promise<PaymentRule> {
    const rule = await this.findById(id);
    if (!rule) {
      throw new Error('Reguła płatności nie znaleziona');
    }

    Object.assign(rule, updates);
    return this.repository.save(rule);
  }

  /**
   * Delete payment rule
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

// Export singleton instance
export const paymentRuleRepository = new PaymentRuleRepository();
