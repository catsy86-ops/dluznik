import { loanRepository } from '../repositories/LoanRepository';
import { Loan, LoanStatus } from '../models/Loan';

/**
 * Loan Service
 * Handles business logic for loan operations
 * 
 * Requirements: 3.2
 */
export class LoanService {
  // Expose repository for advanced queries
  loanRepository = loanRepository;
  /**
   * Create a new loan
   * @param userId - User ID who owns the loan
   * @param borrowerName - Name of the borrower
   * @param originalAmount - Original loan amount
   * @param dueDate - Optional due date
   * @param description - Optional description
   * @param currency - Currency code (defaults to PLN)
   * @returns Created loan
   * @throws Error if validation fails
   */
  async createLoan(
    userId: string,
    borrowerName: string,
    originalAmount: number,
    dueDate?: Date,
    description?: string,
    currency: string = 'PLN'
  ): Promise<Loan> {
    // Validate amount
    if (originalAmount <= 0) {
      throw new Error('Kwota pożyczki musi być większa niż 0');
    }

    // Validate borrower name
    if (!borrowerName || borrowerName.trim().length === 0) {
      throw new Error('Nazwa pożyczkobiorcy nie może być pusta');
    }

    // Create loan with status set to "active"
    const loan = await loanRepository.create(
      userId,
      borrowerName,
      originalAmount,
      originalAmount, // currentBalance = originalAmount initially
      dueDate,
      description,
      currency
    );

    return loan;
  }

  /**
   * Edit an existing loan
   * @param loanId - Loan ID to edit
   * @param userId - User ID (for authorization check)
   * @param updates - Partial loan data to update
   * @returns Updated loan
   * @throws Error if loan not found, unauthorized, or validation fails
   */
  async editLoan(
    loanId: string,
    userId: string,
    updates: Partial<Loan>
  ): Promise<Loan> {
    // Get loan
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Check authorization
    if (loan.userId !== userId) {
      throw new Error('Brak uprawnień do edycji tej pożyczki');
    }

    // Validate amount if being updated
    if (updates.originalAmount !== undefined && updates.originalAmount <= 0) {
      throw new Error('Kwota pożyczki musi być większa niż 0');
    }

    if (updates.currentBalance !== undefined && updates.currentBalance < 0) {
      throw new Error('Bieżące saldo nie może być ujemne');
    }

    // Validate borrower name if being updated
    if (updates.borrowerName !== undefined) {
      if (!updates.borrowerName || updates.borrowerName.trim().length === 0) {
        throw new Error('Nazwa pożyczkobiorcy nie może być pusta');
      }
    }

    // Update loan
    return loanRepository.update(loanId, updates);
  }

  /**
   * Delete a loan
   * @param loanId - Loan ID to delete
   * @param userId - User ID (for authorization check)
   * @returns true if deleted, false if not found
   * @throws Error if unauthorized
   */
  async deleteLoan(loanId: string, userId: string): Promise<boolean> {
    // Get loan
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Check authorization
    if (loan.userId !== userId) {
      throw new Error('Brak uprawnień do usunięcia tej pożyczki');
    }

    // Delete loan
    return loanRepository.delete(loanId);
  }

  /**
   * Get loan by ID
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @returns Loan if found and authorized
   * @throws Error if loan not found or unauthorized
   */
  async getLoanById(loanId: string, userId: string): Promise<Loan> {
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Check authorization
    if (loan.userId !== userId) {
      throw new Error('Brak uprawnień do dostępu do tej pożyczki');
    }

    return loan;
  }

  /**
   * Get all loans for a user
   * @param userId - User ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with loans and pagination info
   */
  async getLoansByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    loans: Loan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return loanRepository.findWithPagination(userId, page, limit);
  }

  /**
   * Get loan statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getLoanStatistics(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalAmount: number;
    totalBalance: number;
  }> {
    return loanRepository.getStatistics(userId);
  }

  /**
   * Mark loan as paid
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @returns Updated loan
   * @throws Error if loan not found or unauthorized
   */
  async markLoanAsPaid(loanId: string, userId: string): Promise<Loan> {
    await this.getLoanById(loanId, userId);
    return loanRepository.update(loanId, {
      status: LoanStatus.PAID,
      currentBalance: 0,
    });
  }

  /**
   * Mark loan as overdue
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @returns Updated loan
   * @throws Error if loan not found or unauthorized
   */
  async markLoanAsOverdue(loanId: string, userId: string): Promise<Loan> {
    await this.getLoanById(loanId, userId);
    return loanRepository.update(loanId, {
      status: LoanStatus.OVERDUE,
    });
  }

  /**
   * Update loan balance
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @param newBalance - New balance amount
   * @returns Updated loan
   * @throws Error if loan not found, unauthorized, or validation fails
   */
  async updateLoanBalance(loanId: string, userId: string, newBalance: number): Promise<Loan> {
    if (newBalance < 0) {
      throw new Error('Saldo nie może być ujemne');
    }

    const loan = await this.getLoanById(loanId, userId);
    
    // Update status based on balance
    let status = loan.status;
    if (newBalance === 0 && loan.status === LoanStatus.ACTIVE) {
      status = LoanStatus.PAID;
    }

    return loanRepository.update(loanId, {
      currentBalance: newBalance,
      status,
    });
  }

  /**
   * Add a note to a loan
   */
  async addNote(loanId: string, userId: string, text: string) {
    await this.getLoanById(loanId, userId);
    const noteService = (await import('./NoteService')).NoteService;
    return new noteService().addLoanNote(loanId, userId, text);
  }

  /**
   * Get notes for a loan
   */
  async getNotes(loanId: string) {
    const noteService = (await import('./NoteService')).NoteService;
    return new noteService().getLoanNotes(loanId);
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string) {
    const noteService = (await import('./NoteService')).NoteService;
    return new noteService().deleteLoanNote(noteId);
  }

  /**
   * Get audit log for a loan
   */
  async getAuditLog(loanId: string) {
    const auditService = (await import('./AuditService')).auditService;
    return auditService.getLogsForEntity('loan', loanId);
  }

  /**
   * Add category to loan
   */
  async addCategory(loanId: string, userId: string, name: string, color?: string) {
    const categoryService = (await import('./CategoryService')).categoryService;
    return categoryService.addLoanCategory(loanId, userId, name, color);
  }

  /**
   * Get categories for loan
   */
  async getCategories(loanId: string) {
    const categoryService = (await import('./CategoryService')).categoryService;
    return categoryService.getLoanCategories(loanId);
  }

  /**
   * Delete category from loan
   */
  async deleteCategory(categoryId: string) {
    const categoryService = (await import('./CategoryService')).categoryService;
    return categoryService.removeLoanCategory(categoryId);
  }

  /**
   * Create recurring payment for loan
   */
  async createRecurring(loanId: string, amount: number, frequency: string, startDate: string, endDate?: string, description?: string) {
    const recurringService = (await import('./RecurringPaymentService')).recurringPaymentService;
    return recurringService.createRecurringPayment(
      loanId,
      true,
      amount,
      frequency as any,
      new Date(startDate),
      endDate ? new Date(endDate) : undefined,
      description
    );
  }

  /**
   * Get recurring payments for loan
   */
  async getRecurring(loanId: string) {
    const recurringService = (await import('./RecurringPaymentService')).recurringPaymentService;
    return recurringService.getRecurringPayments(loanId, true);
  }
}

// Export singleton instance
export const loanService = new LoanService();
