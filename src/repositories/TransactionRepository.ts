import { AppDataSource } from '../config/database';
import { Transaction, TransactionType } from '../models/Transaction';

/**
 * Transaction Repository
 * Handles data access for transactions
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4
 */
export class TransactionRepository {
  private repository = AppDataSource.getRepository(Transaction);

  /**
   * Create a new transaction
   * @param loanId - Optional loan ID
   * @param obligationId - Optional obligation ID
   * @param type - Transaction type
   * @param amount - Transaction amount
   * @param balanceBefore - Balance before transaction
   * @param balanceAfter - Balance after transaction
   * @param note - Optional note
   * @returns Created transaction
   */
  async create(
    loanId: string | null,
    obligationId: string | null,
    type: TransactionType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    note?: string
  ): Promise<Transaction> {
    const transaction = this.repository.create({
      loanId,
      obligationId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      note: note || null,
    });

    return this.repository.save(transaction);
  }

  /**
   * Find transaction by ID
   * @param id - Transaction ID
   * @returns Transaction if found, null otherwise
   */
  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['loan', 'obligation'],
    });
  }

  /**
   * Find all transactions for a loan
   * @param loanId - Loan ID
   * @returns Array of transactions
   */
  async findByLoanId(loanId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
      relations: ['loan'],
    });
  }

  /**
   * Find all transactions for an obligation
   * @param obligationId - Obligation ID
   * @returns Array of transactions
   */
  async findByObligationId(obligationId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: { obligationId },
      order: { createdAt: 'DESC' },
      relations: ['obligation'],
    });
  }

  /**
   * Find all transactions with pagination
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with transactions and pagination info
   */
  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['loan', 'obligation'],
    });

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete a transaction
   * @param id - Transaction ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get transaction statistics for a loan
   * @param loanId - Loan ID
   * @returns Statistics object
   */
  async getLoanStatistics(loanId: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    lastTransaction: Transaction | null;
  }> {
    const transactions = await this.repository.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalTransactions: transactions.length,
      totalAmount,
      lastTransaction: transactions[0] || null,
    };
  }

  /**
   * Get transaction statistics for an obligation
   * @param obligationId - Obligation ID
   * @returns Statistics object
   */
  async getObligationStatistics(obligationId: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    lastTransaction: Transaction | null;
  }> {
    const transactions = await this.repository.find({
      where: { obligationId },
      order: { createdAt: 'DESC' },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalTransactions: transactions.length,
      totalAmount,
      lastTransaction: transactions[0] || null,
    };
  }
}

// Export singleton instance
export const transactionRepository = new TransactionRepository();
