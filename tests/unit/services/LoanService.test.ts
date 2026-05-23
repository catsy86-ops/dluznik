import { LoanService } from '../../../src/services/LoanService';
import { LoanRepository } from '../../../src/repositories/LoanRepository';
import { Loan, LoanStatus } from '../../../src/models/Loan';

/**
 * Unit Tests for LoanService
 * Tests loan creation, editing, deletion, and validation
 * 
 * Requirements: 3.5
 */

// Mock the LoanRepository
jest.mock('../../../src/repositories/LoanRepository');

/**
 * Helper function to create a mock Loan object with optional overrides
 */
function createMockLoan(overrides?: Partial<Loan>): Loan {
  return {
    id: 'loan-123',
    userId: 'user-123',
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
    ...overrides,
  };
}

describe('LoanService', () => {
  let loanService: LoanService;
  let mockLoanRepository: jest.Mocked<LoanRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    loanService = new LoanService();
    mockLoanRepository = require('../../../src/repositories/LoanRepository').loanRepository as jest.Mocked<LoanRepository>;
  });

  describe('createLoan', () => {
    it('should create a loan with valid data', async () => {
      // Arrange
      const userId = 'user-123';
      const borrowerName = 'John Doe';
      const originalAmount = 1000;
      const dueDate = new Date('2024-12-31');
      const description = 'Test loan';
      const currency = 'PLN';

      const mockLoan = createMockLoan({
        borrowerName,
        originalAmount,
        currentBalance: originalAmount,
        dueDate,
        description,
        currency,
      });

      mockLoanRepository.create.mockResolvedValue(mockLoan);

      // Act
      const result = await loanService.createLoan(
        userId,
        borrowerName,
        originalAmount,
        dueDate,
        description,
        currency
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.borrowerName).toBe(borrowerName);
      expect(result.originalAmount).toBe(originalAmount);
      expect(result.currentBalance).toBe(originalAmount);
      expect(result.status).toBe(LoanStatus.ACTIVE);
      expect(mockLoanRepository.create).toHaveBeenCalledWith(
        userId,
        borrowerName,
        originalAmount,
        originalAmount,
        dueDate,
        description,
        currency
      );
    });

    it('should reject loan creation with amount <= 0', async () => {
      // Arrange
      const userId = 'user-123';
      const borrowerName = 'John Doe';
      const invalidAmount = 0;

      // Act & Assert
      await expect(
        loanService.createLoan(userId, borrowerName, invalidAmount)
      ).rejects.toThrow('Kwota pożyczki musi być większa niż 0');
    });

    it('should reject loan creation with negative amount', async () => {
      // Arrange
      const userId = 'user-123';
      const borrowerName = 'John Doe';
      const invalidAmount = -100;

      // Act & Assert
      await expect(
        loanService.createLoan(userId, borrowerName, invalidAmount)
      ).rejects.toThrow('Kwota pożyczki musi być większa niż 0');
    });

    it('should reject loan creation without borrower name', async () => {
      // Arrange
      const userId = 'user-123';
      const borrowerName = '';
      const originalAmount = 1000;

      // Act & Assert
      await expect(
        loanService.createLoan(userId, borrowerName, originalAmount)
      ).rejects.toThrow('Nazwa pożyczkobiorcy nie może być pusta');
    });

    it('should reject loan creation with whitespace-only borrower name', async () => {
      // Arrange
      const userId = 'user-123';
      const borrowerName = '   ';
      const originalAmount = 1000;

      // Act & Assert
      await expect(
        loanService.createLoan(userId, borrowerName, originalAmount)
      ).rejects.toThrow('Nazwa pożyczkobiorcy nie może być pusta');
    });
  });

  describe('editLoan', () => {
    it('should edit loan with valid new amount', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const newAmount = 1500;

      const existingLoan = createMockLoan({
        id: loanId,
        userId,
        originalAmount: 1000,
        currentBalance: 500,
      });

      const updatedLoan = createMockLoan({
        id: loanId,
        userId,
        originalAmount: newAmount,
        currentBalance: 500,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await loanService.editLoan(loanId, userId, {
        originalAmount: newAmount,
      });

      // Assert
      expect(result.originalAmount).toBe(newAmount);
      expect(mockLoanRepository.update).toHaveBeenCalledWith(
        loanId,
        expect.objectContaining({ originalAmount: newAmount })
      );
    });

    it('should reject edit with amount <= 0', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';

      const existingLoan = createMockLoan({
        id: loanId,
        userId,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);

      // Act & Assert
      await expect(
        loanService.editLoan(loanId, userId, { originalAmount: 0 })
      ).rejects.toThrow('Kwota pożyczki musi być większa niż 0');
    });

    it('should reject edit if loan not found', async () => {
      // Arrange
      const loanId = 'nonexistent-loan';
      const userId = 'user-123';

      mockLoanRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        loanService.editLoan(loanId, userId, { borrowerName: 'New Name' })
      ).rejects.toThrow('Pożyczka nie znaleziona');
    });

    it('should reject edit if user is not authorized', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const otherUserId = 'user-456';

      const existingLoan = createMockLoan({
        id: loanId,
        userId: otherUserId,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);

      // Act & Assert
      await expect(
        loanService.editLoan(loanId, userId, { borrowerName: 'New Name' })
      ).rejects.toThrow('Brak uprawnień do edycji tej pożyczki');
    });
  });

  describe('deleteLoan', () => {
    it('should delete loan with confirmation', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';

      const existingLoan = createMockLoan({
        id: loanId,
        userId,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);
      mockLoanRepository.delete.mockResolvedValue(true);

      // Act
      const result = await loanService.deleteLoan(loanId, userId);

      // Assert
      expect(result).toBe(true);
      expect(mockLoanRepository.delete).toHaveBeenCalledWith(loanId);
    });

    it('should reject delete if loan not found', async () => {
      // Arrange
      const loanId = 'nonexistent-loan';
      const userId = 'user-123';

      mockLoanRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        loanService.deleteLoan(loanId, userId)
      ).rejects.toThrow('Pożyczka nie znaleziona');
    });

    it('should reject delete if user is not authorized', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const otherUserId = 'user-456';

      const existingLoan = createMockLoan({
        id: loanId,
        userId: otherUserId,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);

      // Act & Assert
      await expect(
        loanService.deleteLoan(loanId, userId)
      ).rejects.toThrow('Brak uprawnień do usunięcia tej pożyczki');
    });
  });

  describe('getLoanById', () => {
    it('should get loan by ID', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';

      const mockLoan = createMockLoan({
        id: loanId,
        userId,
      });

      mockLoanRepository.findById.mockResolvedValue(mockLoan);

      // Act
      const result = await loanService.getLoanById(loanId, userId);

      // Assert
      expect(result).toEqual(mockLoan);
    });

    it('should reject if loan not found', async () => {
      // Arrange
      const loanId = 'nonexistent-loan';
      const userId = 'user-123';

      mockLoanRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        loanService.getLoanById(loanId, userId)
      ).rejects.toThrow('Pożyczka nie znaleziona');
    });

    it('should reject if user is not authorized', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const otherUserId = 'user-456';

      const mockLoan = createMockLoan({
        id: loanId,
        userId: otherUserId,
      });

      mockLoanRepository.findById.mockResolvedValue(mockLoan);

      // Act & Assert
      await expect(
        loanService.getLoanById(loanId, userId)
      ).rejects.toThrow('Brak uprawnień do dostępu do tej pożyczki');
    });
  });

  describe('getLoansByUser', () => {
    it('should get loans with pagination', async () => {
      // Arrange
      const userId = 'user-123';
      const page = 1;
      const limit = 10;

      const mockLoans: Loan[] = [
        createMockLoan({
          id: 'loan-1',
          userId,
        }),
      ];

      mockLoanRepository.findWithPagination.mockResolvedValue({
        loans: mockLoans,
        total: 1,
        page,
        limit,
        totalPages: 1,
      });

      // Act
      const result = await loanService.getLoansByUser(userId, page, limit);

      // Assert
      expect(result.loans).toEqual(mockLoans);
      expect(result.total).toBe(1);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });

  describe('updateLoanBalance', () => {
    it('should update loan balance', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const newBalance = 300;

      const existingLoan = createMockLoan({
        id: loanId,
        userId,
        currentBalance: 500,
      });

      const updatedLoan = createMockLoan({
        id: loanId,
        userId,
        currentBalance: newBalance,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await loanService.updateLoanBalance(loanId, userId, newBalance);

      // Assert
      expect(result.currentBalance).toBe(newBalance);
    });

    it('should mark loan as paid when balance reaches 0', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const newBalance = 0;

      const existingLoan = createMockLoan({
        id: loanId,
        userId,
        currentBalance: 500,
        status: LoanStatus.ACTIVE,
      });

      const updatedLoan = createMockLoan({
        id: loanId,
        userId,
        currentBalance: newBalance,
        status: LoanStatus.PAID,
      });

      mockLoanRepository.findById.mockResolvedValue(existingLoan);
      mockLoanRepository.update.mockResolvedValue(updatedLoan);

      // Act
      const result = await loanService.updateLoanBalance(loanId, userId, newBalance);

      // Assert
      expect(result.currentBalance).toBe(0);
      expect(result.status).toBe(LoanStatus.PAID);
      expect(mockLoanRepository.update).toHaveBeenCalledWith(
        loanId,
        expect.objectContaining({
          currentBalance: 0,
          status: LoanStatus.PAID,
        })
      );
    });

    it('should reject update with negative balance', async () => {
      // Arrange
      const loanId = 'loan-123';
      const userId = 'user-123';
      const newBalance = -100;

      // Act & Assert
      await expect(
        loanService.updateLoanBalance(loanId, userId, newBalance)
      ).rejects.toThrow('Saldo nie może być ujemne');
    });
  });
});
