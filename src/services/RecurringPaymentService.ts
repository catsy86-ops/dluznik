import { AppDataSource } from '../config/database-init';
import { RecurringPayment, RecurrenceFrequency } from '../models/RecurringPayment';
import { InterestService } from './InterestService';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuid } from 'uuid';

export class RecurringPaymentService {
  private recurringRepo = AppDataSource.getRepository(RecurringPayment);

  async createRecurringPayment(
    loanOrObligationId: string,
    isLoan: boolean,
    amount: number,
    frequency: RecurrenceFrequency,
    startDate: Date,
    endDate?: Date,
    description?: string
  ): Promise<RecurringPayment> {
    if (amount <= 0) {
      throw new ApiError(400, 'INVALID_AMOUNT', 'Kwota musi być większa niż 0');
    }

    const nextPaymentDate = InterestService.getNextPaymentDate(startDate, frequency);

    const recurring = this.recurringRepo.create({
      id: uuid(),
      ...(isLoan ? { loanId: loanOrObligationId } : { obligationId: loanOrObligationId }),
      amount,
      frequency,
      startDate,
      endDate,
      description,
      isActive: true,
      nextPaymentDate,
    });

    return await this.recurringRepo.save(recurring);
  }

  async getRecurringPayments(loanOrObligationId: string, isLoan: boolean): Promise<RecurringPayment[]> {
    const whereClause = isLoan ? { loanId: loanOrObligationId } : { obligationId: loanOrObligationId };
    return await this.recurringRepo.find({
      where: whereClause,
      order: { startDate: 'ASC' },
    });
  }

  async getActiveRecurringPayments(loanOrObligationId: string, isLoan: boolean): Promise<RecurringPayment[]> {
    const whereClause = isLoan
      ? { loanId: loanOrObligationId, isActive: true }
      : { obligationId: loanOrObligationId, isActive: true };
    return await this.recurringRepo.find({
      where: whereClause,
      order: { nextPaymentDate: 'ASC' },
    });
  }

  async updateRecurringPayment(
    id: string,
    updates: Partial<RecurringPayment>
  ): Promise<RecurringPayment> {
    const recurring = await this.recurringRepo.findOne({ where: { id } });
    if (!recurring) {
      throw new ApiError(404, 'NOT_FOUND', 'Płatność cykliczna nie znaleziona');
    }

    Object.assign(recurring, updates);
    return await this.recurringRepo.save(recurring);
  }

  async deleteRecurringPayment(id: string): Promise<void> {
    const result = await this.recurringRepo.delete(id);
    if (result.affected === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Płatność cykliczna nie znaleziona');
    }
  }

  async pauseRecurringPayment(id: string): Promise<RecurringPayment> {
    return this.updateRecurringPayment(id, { isActive: false });
  }

  async resumeRecurringPayment(id: string): Promise<RecurringPayment> {
    return this.updateRecurringPayment(id, { isActive: true });
  }

  /**
   * Get upcoming payments due in the next N days
   */
  async getUpcomingPayments(daysAhead: number = 7): Promise<RecurringPayment[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const upcoming = await this.recurringRepo
      .createQueryBuilder('rp')
      .where('rp.isActive = :isActive', { isActive: true })
      .andWhere('rp.nextPaymentDate >= :now', { now })
      .andWhere('rp.nextPaymentDate <= :futureDate', { futureDate })
      .orderBy('rp.nextPaymentDate', 'ASC')
      .getMany();

    return upcoming;
  }
}

export const recurringPaymentService = new RecurringPaymentService();
