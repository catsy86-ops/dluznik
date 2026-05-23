import { AppDataSource } from '../config/database-init';
import { Loan, LoanStatus } from '../models/Loan';
import { v4 as uuidv4 } from 'uuid';

/**
 * Loan Repository
 * Handles all database operations for Loan entity
 * 
 * Requirements: 3.1
 */
export class LoanRepository {
  private repository = AppDataSource.getRepository(Loan);

  /**
   * Create a new loan
   * @param userId - User ID who owns the loan
   * @param borrowerName - Name of the borrower
   * @param originalAmount - Original loan amount
   * @param currentBalance - Current balance (defaults to originalAmount)
   * @param dueDate - Optional due date
   * @param description - Optional description
   * @param currency - Currency code (defaults to PLN)
   * @returns Created loan
   * @throws Error if validation fails
   */
  async create(
    userId: string,
    borrowerName: string,
    originalAmount: number,
    currentBalance?: number,
    dueDate?: Date,
    description?: string,
    currency: string = 'PLN'
  ): Promise<Loan> {
    // Validate borrower name
    if (!borrowerName || borrowerName.trim().length === 0) {
      throw new Error('Nazwa pożyczkobiorcy nie może być pusta');
    }

    // Validate amount
    if (originalAmount <= 0) {
      throw new Error('Kwota pożyczki musi być większa niż 0');
    }

    // Create new loan
    const loan = new Loan();
    loan.id = uuidv4();
    loan.userId = userId;
    loan.borrowerName = borrowerName.trim();
    loan.originalAmount = originalAmount;
    loan.currentBalance = currentBalance || originalAmount;
    loan.status = LoanStatus.ACTIVE;
    loan.dueDate = dueDate || null;
    loan.description = description || null;
    loan.currency = currency;

    return this.repository.save(loan);
  }

  /**
   * Find loan by ID
   * @param id - Loan ID
   * @returns Loan if found, null otherwise
   */
  async findById(id: string): Promise<Loan | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Find all loans for a user
   * @param userId - User ID
   * @returns Array of loans
   */
  async findByUserId(userId: string): Promise<Loan[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find loans with pagination
   * @param userId - User ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with loans and pagination info
   */
  async findWithPagination(
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
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    const [loans, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: validLimit,
    });

    return {
      loans,
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit),
    };
  }

  /**
   * Update loan
   * @param id - Loan ID
   * @param updates - Partial loan data to update
   * @returns Updated loan
   * @throws Error if loan not found or validation fails
   */
  async update(id: string, updates: Partial<Loan>): Promise<Loan> {
    const loan = await this.findById(id);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Validate borrower name if being updated
    if (updates.borrowerName !== undefined) {
      if (!updates.borrowerName || updates.borrowerName.trim().length === 0) {
        throw new Error('Nazwa pożyczkobiorcy nie może być pusta');
      }
      updates.borrowerName = updates.borrowerName.trim();
    }

    // Validate amount if being updated
    if (updates.originalAmount !== undefined && updates.originalAmount <= 0) {
      throw new Error('Kwota pożyczki musi być większa niż 0');
    }

    if (updates.currentBalance !== undefined && updates.currentBalance < 0) {
      throw new Error('Bieżące saldo nie może być ujemne');
    }

    // Update loan fields
    Object.assign(loan, updates);
    return this.repository.save(loan);
  }

  /**
   * Delete loan
   * @param id - Loan ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Find loans by status
   * @param userId - User ID
   * @param status - Loan status
   * @returns Array of loans with specified status
   */
  async findByStatus(userId: string, status: LoanStatus): Promise<Loan[]> {
    return this.repository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get loan statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getStatistics(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalAmount: number;
    totalBalance: number;
  }> {
    const loans = await this.findByUserId(userId);

    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE).length;
    const totalAmount = loans.reduce((sum, l) => sum + Number(l.originalAmount), 0);
    const totalBalance = loans.reduce((sum, l) => sum + Number(l.currentBalance), 0);

    return {
      totalLoans,
      activeLoans,
      totalAmount,
      totalBalance,
    };
  }

  /**
   * Find loans with advanced filters
   * @param userId - User ID
   * @param filters - Filter options
   * @returns Array of filtered loans
   */
  async findWithAdvancedFilters(
    userId: string,
    filters: {
      status?: LoanStatus | LoanStatus[];
      minAmount?: number;
      maxAmount?: number;
      dateFrom?: Date;
      dateTo?: Date;
      category?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    loans: Loan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repository.createQueryBuilder('loan').where('loan.userId = :userId', { userId });

    // Filter by status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.andWhere('loan.status IN (:...statuses)', { statuses: filters.status });
      } else {
        query.andWhere('loan.status = :status', { status: filters.status });
      }
    }

    // Filter by amount range
    if (filters.minAmount !== undefined) {
      query.andWhere('loan.currentBalance >= :minAmount', { minAmount: filters.minAmount });
    }
    if (filters.maxAmount !== undefined) {
      query.andWhere('loan.currentBalance <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    // Filter by date range
    if (filters.dateFrom) {
      query.andWhere('loan.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      query.andWhere('loan.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Filter by category
    if (filters.category) {
      query.andWhere('loan.category = :category', { category: filters.category });
    }

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(filters.limit || 10, 100));
    const skip = (page - 1) * limit;

    query.orderBy('loan.createdAt', 'DESC').skip(skip).take(limit);

    const [loans, total] = await query.getManyAndCount();

    return {
      loans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find loans by full text search in notes and descriptions
   * @param userId - User ID
   * @param searchTerm - Search term
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Array of matching loans
   */
  async findByFullText(
    userId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    loans: Loan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100));
    const skip = (validPage - 1) * validLimit;

    const query = this.repository
      .createQueryBuilder('loan')
      .where('loan.userId = :userId', { userId })
      .andWhere(
        '(LOWER(loan.borrowerName) LIKE LOWER(:search) OR LOWER(loan.description) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      )
      .orderBy('loan.createdAt', 'DESC')
      .skip(skip)
      .take(validLimit);

    const [loans, total] = await query.getManyAndCount();

    return {
      loans,
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit),
    };
  }
}

// Export singleton instance
export const loanRepository = new LoanRepository();
