import { loanRepository } from '../repositories/LoanRepository';
import { obligationRepository } from '../repositories/ObligationRepository';
import { transactionRepository } from '../repositories/TransactionRepository';
import { Transaction, TransactionType } from '../models/Transaction';
import { LoanStatus } from '../models/Loan';
import { ObligationStatus } from '../models/Obligation';

/**
 * Payment Service
 * Handles payment registration and transaction history
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export class PaymentService {
  /**
   * Register a payment for a loan
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @param amount - Payment amount
   * @param note - Optional note
   * @returns Created transaction
   * @throws Error if validation fails
   */
  async registerLoanPayment(
    loanId: string,
    userId: string,
    amount: number,
    note?: string
  ): Promise<Transaction> {
    // Validate payment amount
    if (amount <= 0) {
      throw new Error('Kwota spłaty musi być większa niż 0');
    }

    // Get loan
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Check authorization
    if (loan.userId !== userId) {
      throw new Error('Brak uprawnień do rejestrowania spłaty dla tej pożyczki');
    }

    // Validate payment amount doesn't exceed balance
    if (amount > loan.currentBalance) {
      throw new Error(`Kwota spłaty nie może przekraczać salda (${loan.currentBalance})`);
    }

    // Calculate new balance
    const balanceBefore = loan.currentBalance;
    const newBalance = balanceBefore - amount;

    // Create transaction
    const transaction = await transactionRepository.create(
      loanId,
      null,
      TransactionType.PAYMENT,
      amount,
      balanceBefore,
      newBalance,
      note
    );

    // Update loan balance and status
    let newStatus = loan.status;
    if (newBalance === 0 && loan.status === LoanStatus.ACTIVE) {
      newStatus = LoanStatus.PAID;
    }

    await loanRepository.update(loanId, {
      currentBalance: newBalance,
      status: newStatus,
    });

    return transaction;
  }

  /**
   * Register a payment for an obligation
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @param amount - Payment amount
   * @param note - Optional note
   * @returns Created transaction
   * @throws Error if validation fails
   */
  async registerObligationPayment(
    obligationId: string,
    userId: string,
    amount: number,
    note?: string
  ): Promise<Transaction> {
    // Validate payment amount
    if (amount <= 0) {
      throw new Error('Kwota spłaty musi być większa niż 0');
    }

    // Get obligation
    const obligation = await obligationRepository.findById(obligationId);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Check authorization
    if (obligation.userId !== userId) {
      throw new Error('Brak uprawnień do rejestrowania spłaty dla tego zobowiązania');
    }

    // Validate payment amount doesn't exceed balance
    if (amount > obligation.currentBalance) {
      throw new Error(`Kwota spłaty nie może przekraczać salda (${obligation.currentBalance})`);
    }

    // Calculate new balance
    const balanceBefore = obligation.currentBalance;
    const newBalance = balanceBefore - amount;

    // Create transaction
    const transaction = await transactionRepository.create(
      null,
      obligationId,
      TransactionType.PAYMENT,
      amount,
      balanceBefore,
      newBalance,
      note
    );

    // Update obligation balance and status
    let newStatus = obligation.status;
    if (newBalance === 0 && obligation.status === ObligationStatus.ACTIVE) {
      newStatus = ObligationStatus.PAID;
    }

    await obligationRepository.update(obligationId, {
      currentBalance: newBalance,
      status: newStatus,
    });

    return transaction;
  }

  /**
   * Get transaction history for a loan
   * @param loanId - Loan ID
   * @param userId - User ID (for authorization check)
   * @returns Array of transactions
   * @throws Error if loan not found or unauthorized
   */
  async getLoanTransactionHistory(loanId: string, userId: string): Promise<Transaction[]> {
    // Get loan
    const loan = await loanRepository.findById(loanId);
    if (!loan) {
      throw new Error('Pożyczka nie znaleziona');
    }

    // Check authorization
    if (loan.userId !== userId) {
      throw new Error('Brak uprawnień do dostępu do historii transakcji dla tej pożyczki');
    }

    return transactionRepository.findByLoanId(loanId);
  }

  /**
   * Get transaction history for an obligation
   * @param obligationId - Obligation ID
   * @param userId - User ID (for authorization check)
   * @returns Array of transactions
   * @throws Error if obligation not found or unauthorized
   */
  async getObligationTransactionHistory(
    obligationId: string,
    userId: string
  ): Promise<Transaction[]> {
    // Get obligation
    const obligation = await obligationRepository.findById(obligationId);
    if (!obligation) {
      throw new Error('Zobowiązanie nie znalezione');
    }

    // Check authorization
    if (obligation.userId !== userId) {
      throw new Error('Brak uprawnień do dostępu do historii transakcji dla tego zobowiązania');
    }

    return transactionRepository.findByObligationId(obligationId);
  }

  /**
   * Get all transactions with pagination
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Object with transactions and pagination info
   */
  async getAllTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return transactionRepository.findAll(page, limit);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
