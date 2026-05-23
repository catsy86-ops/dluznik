import { obligationRepository } from '../repositories/ObligationRepository';
import { Obligation, ObligationStatus } from '../models/Obligation';

/**
 * Obligation Service
 * Handles business logic for obligation operations
 * 
 * Requirements: 4.2
 */
export class ObligationService {
  /**
   * Create a new obligation
   * @param userId - User ID who owns the obligation
   * @param creditorName - Name of the creditor
   * @param originalAmount - Original obligation amount
   * @param dueDate - Optional due date
   * @param description - Optional description
   * @param currency - Currency code (defaults to PLN)
   * @returns Created obligation
   * @throws Error if validation fails
   */
  async createObligation(
    userId: string,
    creditorName: string,
    originalAmount: number,
    dueDate?: Date,
    description?: string,
    currency: string = 'PLN'
  ): Promise<Obligation> {
    // Validate amount
    if (originalAmount <= 0) {
      throw new Error('Kwota zobowiązania musi być większa niż 0');
    }

    // Validate creditor name
    if (!creditorName || creditorName.trim().length === 0) {
      throw new Error('Nazwa wierzyciela nie może być pusta');
    }

    // Create obligation with status set to "active"
    const obligation = await obligationRepository.create(
      userId,
      creditorName,
      originalAmount,
      originalAmount, // currentBalance = originalAmount initially
      dueDate,
      description,
      currency
    );

    return obligation;
  }

  /**
   * Edit an existing obligation
   * @param obligationId - Obligation ID to edit
   * @param userId - User ID (for authorization check)
   * @param updates - Partial obligation data to update
   * @returns Updated obligation
   * @throws Error if obligation not found, unauthorized, or validation fails
   */
  async editObligation(
    obligationId: string,
    userId: string,
    updates: Partial<Obligation>
  ): Promise<Obligation> {
    // Get obligation
    const obligation = await obligationRepository.findById(obligationId);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Check authorization
    if (obligation.userId !== userId) {
      throw new Error('Brak uprawnień do edycji tego zobowiązania');
    }

    // Validate amount if being updated
    if (updates.originalAmount !== undefined && updates.originalAmount <= 0) {
      throw new Error('Kwota zobowiązania musi być większa niż 0');
    }

    if (updates.currentBalance !== undefined && updates.currentBalance < 0) {
      throw new Error('Bieżące saldo nie może być ujemne');
    }

    // Validate creditor name if being updated
    if (updates.creditorName !== undefined) {
      if (!updates.creditorName || updates.creditorName.trim().length === 0) {
        throw new Error('Nazwa wierzyciela nie może być pusta');
      }
    }

    // Update obligation
    return obligationRepository.update(obligationId, updates);
  }

  /**
   * Delete an obligation
   * @param obligationId - Obligation ID to delete
   * @param userId - User ID (for authorization check)
   * @returns true if deleted, false if not found
   * @throws Error if unauthorized
   */
  async deleteObligation(obligationId: string, userId: string): Promise<boolean> {
    // Get obligation
    const obligation = await obligationRepository.findById(obligationId);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Check authorization
    if (obligation.userId !== userId) {
      throw new Error('Brak uprawnień do usunięcia tego zobowiązania');
    }

    // Delete obligation
    return obligationRepository.delete(obligationId);
  }

  /**
   * Get obligation by ID
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @returns Obligation if found and authorized
   * @throws Error if obligation not found or unauthorized
   */
  async getObligationById(obligationId: string, userId: string): Promise<Obligation> {
    const obligation = await obligationRepository.findById(obligationId);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Check authorization
    if (obligation.userId !== userId) {
      throw new Error('Brak uprawnień do dostępu do tego zobowiązania');
    }

    return obligation;
  }

  /**
   * Get all obligations for a user
   * @param userId - User ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with obligations and pagination info
   */
  async getObligationsByUser(
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
    return obligationRepository.findWithPagination(userId, page, limit);
  }

  /**
   * Get obligation statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getObligationStatistics(userId: string): Promise<{
    totalObligations: number;
    activeObligations: number;
    totalAmount: number;
    totalBalance: number;
  }> {
    return obligationRepository.getStatistics(userId);
  }

  /**
   * Mark obligation as paid
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @returns Updated obligation
   * @throws Error if obligation not found or unauthorized
   */
  async markObligationAsPaid(obligationId: string, userId: string): Promise<Obligation> {
    await this.getObligationById(obligationId, userId);
    return obligationRepository.update(obligationId, {
      status: ObligationStatus.PAID,
      currentBalance: 0,
    });
  }

  /**
   * Mark obligation as overdue
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @returns Updated obligation
   * @throws Error if obligation not found or unauthorized
   */
  async markObligationAsOverdue(obligationId: string, userId: string): Promise<Obligation> {
    await this.getObligationById(obligationId, userId);
    return obligationRepository.update(obligationId, {
      status: ObligationStatus.OVERDUE,
    });
  }

  /**
   * Update obligation balance
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @param newBalance - New balance amount
   * @returns Updated obligation
   * @throws Error if obligation not found, unauthorized, or validation fails
   */
  async updateObligationBalance(obligationId: string, userId: string, newBalance: number): Promise<Obligation> {
    if (newBalance < 0) {
      throw new Error('Saldo nie może być ujemne');
    }

    const obligation = await this.getObligationById(obligationId, userId);
    
    // Update status based on balance
    let status = obligation.status;
    if (newBalance === 0 && obligation.status === ObligationStatus.ACTIVE) {
      status = ObligationStatus.PAID;
    }

    return obligationRepository.update(obligationId, {
      currentBalance: newBalance,
      status,
    });
  }
}

// Export singleton instance
export const obligationService = new ObligationService();
