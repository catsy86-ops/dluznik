import { AppDataSource } from '../config/database-init';
import { Obligation, ObligationStatus } from '../models/Obligation';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obligation Repository
 * Handles all database operations for Obligation entity
 * 
 * Requirements: 4.1
 */
export class ObligationRepository {
  private repository = AppDataSource.getRepository(Obligation);

  /**
   * Create a new obligation
   * @param userId - User ID who owns the obligation
   * @param creditorName - Name of the creditor
   * @param originalAmount - Original obligation amount
   * @param currentBalance - Current balance (defaults to originalAmount)
   * @param dueDate - Optional due date
   * @param description - Optional description
   * @param currency - Currency code (defaults to PLN)
   * @returns Created obligation
   * @throws Error if validation fails
   */
  async create(
    userId: string,
    creditorName: string,
    originalAmount: number,
    currentBalance?: number,
    dueDate?: Date,
    description?: string,
    currency: string = 'PLN'
  ): Promise<Obligation> {
    // Validate creditor name
    if (!creditorName || creditorName.trim().length === 0) {
      throw new Error('Nazwa wierzyciela nie może być pusta');
    }

    // Validate amount
    if (originalAmount <= 0) {
      throw new Error('Kwota zobowiązania musi być większa niż 0');
    }

    // Create new obligation
    const obligation = new Obligation();
    obligation.id = uuidv4();
    obligation.userId = userId;
    obligation.creditorName = creditorName.trim();
    obligation.originalAmount = originalAmount;
    obligation.currentBalance = currentBalance || originalAmount;
    obligation.status = ObligationStatus.ACTIVE;
    obligation.dueDate = dueDate || null;
    obligation.description = description || null;
    obligation.currency = currency;

    return this.repository.save(obligation);
  }

  /**
   * Find obligation by ID
   * @param id - Obligation ID
   * @returns Obligation if found, null otherwise
   */
  async findById(id: string): Promise<Obligation | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Find all obligations for a user
   * @param userId - User ID
   * @returns Array of obligations
   */
  async findByUserId(userId: string): Promise<Obligation[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find obligations with pagination
   * @param userId - User ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with obligations and pagination info
   */
  async findWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    obligations: Obligation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    const [obligations, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: validLimit,
    });

    return {
      obligations,
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit),
    };
  }

  /**
   * Update obligation
   * @param id - Obligation ID
   * @param updates - Partial obligation data to update
   * @returns Updated obligation
   * @throws Error if obligation not found or validation fails
   */
  async update(id: string, updates: Partial<Obligation>): Promise<Obligation> {
    const obligation = await this.findById(id);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Validate creditor name if being updated
    if (updates.creditorName !== undefined) {
      if (!updates.creditorName || updates.creditorName.trim().length === 0) {
        throw new Error('Nazwa wierzyciela nie może być pusta');
      }
      updates.creditorName = updates.creditorName.trim();
    }

    // Validate amount if being updated
    if (updates.originalAmount !== undefined && updates.originalAmount <= 0) {
      throw new Error('Kwota zobowiązania musi być większa niż 0');
    }

    if (updates.currentBalance !== undefined && updates.currentBalance < 0) {
      throw new Error('Bieżące saldo nie może być ujemne');
    }

    // Update obligation fields
    Object.assign(obligation, updates);
    return this.repository.save(obligation);
  }

  /**
   * Delete obligation
   * @param id - Obligation ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Find obligations by status
   * @param userId - User ID
   * @param status - Obligation status
   * @returns Array of obligations with specified status
   */
  async findByStatus(userId: string, status: ObligationStatus): Promise<Obligation[]> {
    return this.repository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get obligation statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getStatistics(userId: string): Promise<{
    totalObligations: number;
    activeObligations: number;
    totalAmount: number;
    totalBalance: number;
  }> {
    const obligations = await this.findByUserId(userId);

    const totalObligations = obligations.length;
    const activeObligations = obligations.filter(o => o.status === ObligationStatus.ACTIVE).length;
    const totalAmount = obligations.reduce((sum, o) => sum + Number(o.originalAmount), 0);
    const totalBalance = obligations.reduce((sum, o) => sum + Number(o.currentBalance), 0);

    return {
      totalObligations,
      activeObligations,
      totalAmount,
      totalBalance,
    };
  }
}

// Export singleton instance
export const obligationRepository = new ObligationRepository();
