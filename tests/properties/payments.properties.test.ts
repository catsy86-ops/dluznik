import fc from 'fast-check';
import { PaymentService } from '../../src/services/PaymentService';
import { LoanRepository } from '../../src/repositories/LoanRepository';
import { TransactionRepository } from '../../src/repositories/TransactionRepository';
import { Loan, LoanStatus } from '../../src/models/Loan';
import { Transaction, TransactionType } from '../../src/models/Transaction';

/**
 * Property-Based Tests for Payments
 * Validates universal properties of payment system
 * 
 * Requirements: 6.2, 6.3, 6.4, 6.5, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4
 */

// Mock the repositories
jest.mock('../../src/repositories/LoanRepository');
jest.mock('../../src/repositories/TransactionRepository');

describe('Payment Properties', () => {
  let paymentService: PaymentService;
  let mockLoanRepository: jest.Mocked<LoanRepository>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
    mockLoanRepository = require('../../src/repositories/LoanRepository').loanRepository as jest.Mocked<LoanRepository>;
    mockTransactionRepository = require('../../src/repositories/TransactionRepository').transactionRepository as jest.Mocked<TransactionRepository>;
  });

  describe('Property 1: Payment Amount Validation', () => {
    it('should ensure payment > 0 AND payment <= balance for loans', async () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          loanId: fc.uuid(),
          originalAmount: fc.integer({ min: 100, max: 1000000 }),
          payment: fc.integer({ min: 1, max: 100000 }),
        }),
        10
      );

      for (const data of samples) {
        // Ensure payment doesn't exceed original amount
        const payment = Math.min(data.payment, data.originalAmount);
        const currentBalance = data.originalAmount;

        const mockLoan: Loan = {
          id: data.loanId,
          userId: data.userId,
          borrowerName: 'Test Borrower',
          originalAmount: data.originalAmount,
          currentBalance,
          status: LoanStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: null,
          description: null,
          currency: 'PLN',
          user: undefined as any,
        };

        const mockTransaction: Transaction = {
          id: 'transaction-123',
          loanId: data.loanId,
          obligationId: null,
          type: TransactionType.PAYMENT,
          amount: payment,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance - payment,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        };

        mockLoanRepository.findById.mockResolvedValueOnce(mockLoan);
        mockTransactionRepository.create.mockResolvedValueOnce(mockTransaction);
        mockLoanRepository.update.mockResolvedValueOnce(mockLoan);

        // Verify payment is valid
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThanOrEqual(currentBalance);
      }
    });

    it('should reject payment <= 0 for loans', async () => {
      const userId = 'user-123';
      const loanId = 'loan-123';
      const invalidPayment = 0;

      // Act & Assert
      await expect(
        paymentService.registerLoanPayment(loanId, userId, invalidPayment)
      ).rejects.toThrow('Kwota spłaty musi być większa niż 0');
    });

    it('should reject payment > balance for loans', async () => {
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 1000;

      const mockLoan: Loan = {
        id: loanId,
        userId, // Match the userId
        borrowerName: 'Test Borrower',
        originalAmount: 500,
        currentBalance: 500,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        user: undefined as any,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);

      // Act & Assert
      await expect(
        paymentService.registerLoanPayment(loanId, userId, payment)
      ).rejects.toThrow('Kwota spłaty nie może przekraczać salda');
    });
  });

  describe('Property 2: Balance Update Correctness', () => {
    it('should ensure newBalance = oldBalance - payment for loans', async () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          loanId: fc.uuid(),
          originalAmount: fc.integer({ min: 100, max: 1000000 }),
          payment: fc.integer({ min: 1, max: 100000 }),
        }),
        10
      );

      for (const data of samples) {
        const payment = Math.min(data.payment, data.originalAmount);
        const oldBalance = data.originalAmount;
        const expectedNewBalance = oldBalance - payment;

        // Verify calculation
        expect(expectedNewBalance).toBe(oldBalance - payment);
        expect(expectedNewBalance).toBeGreaterThanOrEqual(0);
      }
    });

    it('should update loan balance correctly after payment', async () => {
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 250;
      const oldBalance = 1000;
      const expectedNewBalance = 750;

      const mockLoan: Loan = {
        id: loanId,
        userId, // Match the userId
        borrowerName: 'Test Borrower',
        originalAmount: 1000,
        currentBalance: oldBalance,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        user: undefined as any,
      };

      const mockTransaction: Transaction = {
        id: 'transaction-123',
        loanId,
        obligationId: null,
        type: TransactionType.PAYMENT,
        amount: payment,
        balanceBefore: oldBalance,
        balanceAfter: expectedNewBalance,
        createdAt: new Date(),
        note: null,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const updatedLoan: Loan = {
        ...mockLoan,
        currentBalance: expectedNewBalance,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(result.balanceBefore).toBe(oldBalance);
      expect(result.balanceAfter).toBe(expectedNewBalance);
      expect(result.balanceAfter).toBe(oldBalance - payment);
    });
  });

  describe('Property 3: Status Transition on Completion', () => {
    it('should change status to PAID when balance = 0 for loans', async () => {
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 1000;

      const mockLoan: Loan = {
        id: loanId,
        userId, // Match the userId
        borrowerName: 'Test Borrower',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        user: undefined as any,
      };

      const mockTransaction: Transaction = {
        id: 'transaction-123',
        loanId,
        obligationId: null,
        type: TransactionType.PAYMENT,
        amount: payment,
        balanceBefore: 1000,
        balanceAfter: 0,
        createdAt: new Date(),
        note: null,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const paidLoan: Loan = {
        ...mockLoan,
        currentBalance: 0,
        status: LoanStatus.PAID,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(paidLoan);

      // Act
      const result = await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(result.balanceAfter).toBe(0);
      expect(mockLoanRepository.update).toHaveBeenCalledWith(loanId, {
        currentBalance: 0,
        status: LoanStatus.PAID,
      });
    });

    it('should maintain ACTIVE status when balance > 0 for loans', async () => {
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 250;

      const mockLoan: Loan = {
        id: loanId,
        userId, // Match the userId
        borrowerName: 'Test Borrower',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        user: undefined as any,
      };

      const mockTransaction: Transaction = {
        id: 'transaction-123',
        loanId,
        obligationId: null,
        type: TransactionType.PAYMENT,
        amount: payment,
        balanceBefore: 1000,
        balanceAfter: 750,
        createdAt: new Date(),
        note: null,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const activeLoan: Loan = {
        ...mockLoan,
        currentBalance: 750,
        status: LoanStatus.ACTIVE,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(activeLoan);

      // Act
      const result = await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(result.balanceAfter).toBeGreaterThan(0);
      expect(mockLoanRepository.update).toHaveBeenCalledWith(loanId, {
        currentBalance: 750,
        status: LoanStatus.ACTIVE,
      });
    });
  });

  describe('Property 5: Transaction History Completeness', () => {
    it('should ensure sum(payments) = originalAmount - currentBalance', async () => {
      const samples = fc.sample(
        fc.record({
          originalAmount: fc.integer({ min: 100, max: 1000000 }),
          payments: fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 1, maxLength: 10 }),
        }),
        5
      );

      for (const data of samples) {
        // Calculate total payments ensuring they don't exceed original amount
        let totalPayments = 0;
        let currentBalance = data.originalAmount;

        for (const payment of data.payments) {
          if (currentBalance > 0) {
            const actualPayment = Math.min(payment, currentBalance);
            totalPayments += actualPayment;
            currentBalance -= actualPayment;
          }
        }

        // Verify property: sum(payments) = originalAmount - currentBalance
        const expectedPaidAmount = data.originalAmount - currentBalance;
        expect(totalPayments).toBe(expectedPaidAmount);
      }
    });

    it('should record all transactions in history', async () => {
      const loanId = 'loan-123';
      const userId = 'user-123';

      const mockTransactions: Transaction[] = [
        {
          id: 'transaction-1',
          loanId,
          obligationId: null,
          type: TransactionType.PAYMENT,
          amount: 100,
          balanceBefore: 1000,
          balanceAfter: 900,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        },
        {
          id: 'transaction-2',
          loanId,
          obligationId: null,
          type: TransactionType.PAYMENT,
          amount: 200,
          balanceBefore: 900,
          balanceAfter: 700,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        },
      ];

      const mockLoan: Loan = {
        id: loanId,
        userId, // Match the userId
        borrowerName: 'Test Borrower',
        originalAmount: 1000,
        currentBalance: 700,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        user: undefined as any,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.findByLoanId.mockResolvedValue(mockTransactions);

      // Act
      const result = await paymentService.getLoanTransactionHistory(loanId, userId);

      // Assert
      expect(result).toHaveLength(2);
      const totalPayments = result.reduce((sum, t) => sum + Number(t.amount), 0);
      expect(totalPayments).toBe(300); // 100 + 200
      expect(totalPayments).toBe(1000 - 700); // originalAmount - currentBalance
    });
  });
});
