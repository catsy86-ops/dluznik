import { PaymentService } from '../../../src/services/PaymentService';
import { LoanRepository } from '../../../src/repositories/LoanRepository';
import { ObligationRepository } from '../../../src/repositories/ObligationRepository';
import { TransactionRepository } from '../../../src/repositories/TransactionRepository';
import { Loan, LoanStatus } from '../../../src/models/Loan';
import { Obligation, ObligationStatus } from '../../../src/models/Obligation';
import { Transaction, TransactionType } from '../../../src/models/Transaction';

/**
 * Unit Tests for PaymentService
 * Tests payment registration, balance updates, and transaction history
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

// Mock the repositories
jest.mock('../../../src/repositories/LoanRepository');
jest.mock('../../../src/repositories/ObligationRepository');
jest.mock('../../../src/repositories/TransactionRepository');

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockLoanRepository: jest.Mocked<LoanRepository>;
  let mockObligationRepository: jest.Mocked<ObligationRepository>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
    mockLoanRepository = require('../../../src/repositories/LoanRepository').loanRepository as jest.Mocked<LoanRepository>;
    mockObligationRepository = require('../../../src/repositories/ObligationRepository').obligationRepository as jest.Mocked<ObligationRepository>;
    mockTransactionRepository = require('../../../src/repositories/TransactionRepository').transactionRepository as jest.Mocked<TransactionRepository>;
  });

  describe('registerLoanPayment', () => {
    it('should register payment with valid amount', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 250;

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
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

      const updatedLoan: Loan = {
        ...mockLoan,
        currentBalance: 750,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(payment);
      expect(result.balanceBefore).toBe(1000);
      expect(result.balanceAfter).toBe(750);
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        loanId,
        null,
        TransactionType.PAYMENT,
        payment,
        1000,
        750,
        undefined
      );
    });

    it('should reject payment with amount <= 0', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const invalidPayment = 0;

      // Act & Assert
      await expect(
        paymentService.registerLoanPayment(loanId, userId, invalidPayment)
      ).rejects.toThrow('Kwota spłaty musi być większa niż 0');
    });

    it('should reject payment exceeding balance', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 1500;

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
        user: undefined as any,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);

      // Act & Assert
      await expect(
        paymentService.registerLoanPayment(loanId, userId, payment)
      ).rejects.toThrow('Kwota spłaty nie może przekraczać salda');
    });

    it('should update balance after payment', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 250;

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
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

      const updatedLoan: Loan = {
        ...mockLoan,
        currentBalance: 750,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(mockLoanRepository.update).toHaveBeenCalledWith(loanId, {
        currentBalance: 750,
        status: LoanStatus.ACTIVE,
      });
    });

    it('should change status to PAID when balance = 0', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 1000;

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
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
      await paymentService.registerLoanPayment(loanId, userId, payment);

      // Assert
      expect(mockLoanRepository.update).toHaveBeenCalledWith(loanId, {
        currentBalance: 0,
        status: LoanStatus.PAID,
      });
    });

    it('should create transaction record', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';
      const payment = 250;
      const note = 'Test payment';

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 1000,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
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
        note,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const updatedLoan: Loan = {
        ...mockLoan,
        currentBalance: 750,
      };

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await paymentService.registerLoanPayment(loanId, userId, payment, note);

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe(TransactionType.PAYMENT);
      expect(result.note).toBe(note);
    });
  });

  describe('registerObligationPayment', () => {
    it('should register payment with valid amount', async () => {
      // Arrange
      const userId = 'user-123';
      const obligationId = 'obligation-123';
      const payment = 500;

      const mockObligation: Obligation = {
        id: obligationId,
        userId,
        creditorName: 'Bank ABC',
        originalAmount: 5000,
        currentBalance: 5000,
        status: ObligationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
        user: undefined as any,
      };

      const mockTransaction: Transaction = {
        id: 'transaction-123',
        loanId: null,
        obligationId,
        type: TransactionType.PAYMENT,
        amount: payment,
        balanceBefore: 5000,
        balanceAfter: 4500,
        createdAt: new Date(),
        note: null,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const updatedObligation: Obligation = {
        ...mockObligation,
        currentBalance: 4500,
      };

      mockObligationRepository.findById.mockResolvedValue(mockObligation);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockObligationRepository.update.mockResolvedValue(updatedObligation);

      // Act
      const result = await paymentService.registerObligationPayment(obligationId, userId, payment);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(payment);
      expect(result.balanceBefore).toBe(5000);
      expect(result.balanceAfter).toBe(4500);
    });

    it('should change status to PAID when balance = 0', async () => {
      // Arrange
      const userId = 'user-123';
      const obligationId = 'obligation-123';
      const payment = 5000;

      const mockObligation: Obligation = {
        id: obligationId,
        userId,
        creditorName: 'Bank ABC',
        originalAmount: 5000,
        currentBalance: 5000,
        status: ObligationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
        user: undefined as any,
      };

      const mockTransaction: Transaction = {
        id: 'transaction-123',
        loanId: null,
        obligationId,
        type: TransactionType.PAYMENT,
        amount: payment,
        balanceBefore: 5000,
        balanceAfter: 0,
        createdAt: new Date(),
        note: null,
        loan: undefined as any,
        obligation: undefined as any,
      };

      const paidObligation: Obligation = {
        ...mockObligation,
        currentBalance: 0,
        status: ObligationStatus.PAID,
      };

      mockObligationRepository.findById.mockResolvedValue(mockObligation);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockObligationRepository.update.mockResolvedValue(paidObligation);

      // Act
      await paymentService.registerObligationPayment(obligationId, userId, payment);

      // Assert
      expect(mockObligationRepository.update).toHaveBeenCalledWith(obligationId, {
        currentBalance: 0,
        status: ObligationStatus.PAID,
      });
    });
  });

  describe('getLoanTransactionHistory', () => {
    it('should get transaction history for loan', async () => {
      // Arrange
      const userId = 'user-123';
      const loanId = 'loan-123';

      const mockLoan: Loan = {
        id: loanId,
        userId,
        borrowerName: 'John Doe',
        originalAmount: 1000,
        currentBalance: 500,
        status: LoanStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
        user: undefined as any,
      };

      const mockTransactions: Transaction[] = [
        {
          id: 'transaction-1',
          loanId,
          obligationId: null,
          type: TransactionType.PAYMENT,
          amount: 250,
          balanceBefore: 1000,
          balanceAfter: 750,
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
          amount: 250,
          balanceBefore: 750,
          balanceAfter: 500,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        },
      ];

      mockLoanRepository.findById.mockResolvedValue(mockLoan);
      mockTransactionRepository.findByLoanId.mockResolvedValue(mockTransactions);

      // Act
      const result = await paymentService.getLoanTransactionHistory(loanId, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(250);
      expect(result[1].amount).toBe(250);
    });
  });

  describe('getObligationTransactionHistory', () => {
    it('should get transaction history for obligation', async () => {
      // Arrange
      const userId = 'user-123';
      const obligationId = 'obligation-123';

      const mockObligation: Obligation = {
        id: obligationId,
        userId,
        creditorName: 'Bank ABC',
        originalAmount: 5000,
        currentBalance: 4000,
        status: ObligationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        description: null,
        currency: 'PLN',
        statusChangedAt: null,
        statusReason: null,
        interestRate: null,
        interestType: null,
        category: null,
        user: undefined as any,
      };

      const mockTransactions: Transaction[] = [
        {
          id: 'transaction-1',
          loanId: null,
          obligationId,
          type: TransactionType.PAYMENT,
          amount: 500,
          balanceBefore: 5000,
          balanceAfter: 4500,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        },
        {
          id: 'transaction-2',
          loanId: null,
          obligationId,
          type: TransactionType.PAYMENT,
          amount: 500,
          balanceBefore: 4500,
          balanceAfter: 4000,
          createdAt: new Date(),
          note: null,
          loan: undefined as any,
          obligation: undefined as any,
        },
      ];

      mockObligationRepository.findById.mockResolvedValue(mockObligation);
      mockTransactionRepository.findByObligationId.mockResolvedValue(mockTransactions);

      // Act
      const result = await paymentService.getObligationTransactionHistory(obligationId, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(500);
      expect(result[1].amount).toBe(500);
    });
  });
});
