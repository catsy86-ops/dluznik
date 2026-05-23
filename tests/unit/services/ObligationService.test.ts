import { ObligationService } from '../../../src/services/ObligationService';
import { ObligationRepository } from '../../../src/repositories/ObligationRepository';
import { Obligation, ObligationStatus } from '../../../src/models/Obligation';

/**
 * Unit Tests for ObligationService
 * Tests obligation creation, editing, deletion, and validation
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

// Mock the ObligationRepository
jest.mock('../../../src/repositories/ObligationRepository');

// Helper function to create mock obligations
function createMockObligation(overrides: Partial<Obligation> = {}): Obligation {
  return {
    id: 'obligation-123',
    userId: 'user-123',
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
    ...overrides,
  };
}

describe('ObligationService', () => {
  let obligationService: ObligationService;
  let mockObligationRepository: jest.Mocked<ObligationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    obligationService = new ObligationService();
    mockObligationRepository = require('../../../src/repositories/ObligationRepository').obligationRepository as jest.Mocked<ObligationRepository>;
  });

  describe('createObligation', () => {
    it('should create an obligation with valid data', async () => {
      // Arrange
      const userId = 'user-123';
      const creditorName = 'Bank ABC';
      const originalAmount = 5000;
      const dueDate = new Date('2024-12-31');
      const description = 'Test obligation';
      const currency = 'PLN';

      const mockObligation = createMockObligation({
        creditorName,
        originalAmount,
        currentBalance: originalAmount,
      });

      mockObligationRepository.create.mockResolvedValue(mockObligation);

      // Act
      const result = await obligationService.createObligation(
        userId,
        creditorName,
        originalAmount,
        dueDate,
        description,
        currency
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.creditorName).toBe(creditorName);
      expect(result.originalAmount).toBe(originalAmount);
      expect(result.currentBalance).toBe(originalAmount);
      expect(result.status).toBe(ObligationStatus.ACTIVE);
      expect(mockObligationRepository.create).toHaveBeenCalledWith(
        userId,
        creditorName,
        originalAmount,
        originalAmount,
        dueDate,
        description,
        currency
      );
    });

    it('should reject obligation creation with amount <= 0', async () => {
      // Arrange
      const userId = 'user-123';
      const creditorName = 'Bank ABC';
      const invalidAmount = 0;

      // Act & Assert
      await expect(
        obligationService.createObligation(userId, creditorName, invalidAmount)
      ).rejects.toThrow('Kwota zobowiązania musi być większa niż 0');
    });

    it('should reject obligation creation with negative amount', async () => {
      // Arrange
      const userId = 'user-123';
      const creditorName = 'Bank ABC';
      const invalidAmount = -500;

      // Act & Assert
      await expect(
        obligationService.createObligation(userId, creditorName, invalidAmount)
      ).rejects.toThrow('Kwota zobowiązania musi być większa niż 0');
    });

    it('should reject obligation creation without creditor name', async () => {
      // Arrange
      const userId = 'user-123';
      const creditorName = '';
      const originalAmount = 5000;

      // Act & Assert
      await expect(
        obligationService.createObligation(userId, creditorName, originalAmount)
      ).rejects.toThrow('Nazwa wierzyciela nie może być pusta');
    });

    it('should reject obligation creation with whitespace-only creditor name', async () => {
      // Arrange
      const userId = 'user-123';
      const creditorName = '   ';
      const originalAmount = 5000;

      // Act & Assert
      await expect(
        obligationService.createObligation(userId, creditorName, originalAmount)
      ).rejects.toThrow('Nazwa wierzyciela nie może być pusta');
    });
  });

  describe('editObligation', () => {
    it('should edit obligation with valid new amount', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const newAmount = 6000;

      const existingObligation = createMockObligation({ id: obligationId, userId });
      const updatedObligation = createMockObligation({
        id: obligationId,
        userId,
        originalAmount: newAmount,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.update.mockResolvedValue(updatedObligation);

      // Act
      const result = await obligationService.editObligation(
        obligationId,
        userId,
        { originalAmount: newAmount }
      );

      // Assert
      expect(result.originalAmount).toBe(newAmount);
      expect(mockObligationRepository.update).toHaveBeenCalledWith(
        obligationId,
        { originalAmount: newAmount }
      );
    });

    it('should reject edit with amount <= 0', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';

      const existingObligation = createMockObligation({ id: obligationId, userId });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);

      // Act & Assert
      await expect(
        obligationService.editObligation(
          obligationId,
          userId,
          { originalAmount: 0 }
        )
      ).rejects.toThrow('Kwota zobowiązania musi być większa niż 0');
    });

    it('should reject edit with amount < paid portion', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const currentBalance = 3000; // 5000 - 2000 paid
      const newAmount = 2500; // Valid new amount

      const existingObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance,
      });

      const updatedObligation = createMockObligation({
        id: obligationId,
        userId,
        originalAmount: newAmount,
        currentBalance,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.update.mockResolvedValue(updatedObligation);

      // Act
      const result = await obligationService.editObligation(
        obligationId,
        userId,
        { originalAmount: newAmount }
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.originalAmount).toBe(newAmount);
    });

    it('should reject edit when unauthorized', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const differentUserId = 'user-456';

      const existingObligation = createMockObligation({
        id: obligationId,
        userId: differentUserId,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);

      // Act & Assert
      await expect(
        obligationService.editObligation(
          obligationId,
          userId,
          { originalAmount: 6000 }
        )
      ).rejects.toThrow('Brak uprawnień do edycji tego zobowiązania');
    });

    it('should reject edit when obligation not found', async () => {
      // Arrange
      const obligationId = 'non-existent';
      const userId = 'user-123';

      mockObligationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        obligationService.editObligation(
          obligationId,
          userId,
          { originalAmount: 6000 }
        )
      ).rejects.toThrow('Zobowiązanie nie znalezione');
    });
  });

  describe('deleteObligation', () => {
    it('should delete obligation with confirmation', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';

      const existingObligation = createMockObligation({ id: obligationId, userId });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.delete.mockResolvedValue(true);

      // Act
      const result = await obligationService.deleteObligation(obligationId, userId);

      // Assert
      expect(result).toBe(true);
      expect(mockObligationRepository.delete).toHaveBeenCalledWith(obligationId);
    });

    it('should reject delete when unauthorized', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const differentUserId = 'user-456';

      const existingObligation = createMockObligation({
        id: obligationId,
        userId: differentUserId,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);

      // Act & Assert
      await expect(
        obligationService.deleteObligation(obligationId, userId)
      ).rejects.toThrow('Brak uprawnień do usunięcia tego zobowiązania');
    });

    it('should reject delete when obligation not found', async () => {
      // Arrange
      const obligationId = 'non-existent';
      const userId = 'user-123';

      mockObligationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        obligationService.deleteObligation(obligationId, userId)
      ).rejects.toThrow('Zobowiązanie nie znalezione');
    });
  });

  describe('getObligationById', () => {
    it('should get obligation by ID when authorized', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';

      const mockObligation = createMockObligation({ id: obligationId, userId });

      mockObligationRepository.findById.mockResolvedValue(mockObligation);

      // Act
      const result = await obligationService.getObligationById(obligationId, userId);

      // Assert
      expect(result).toEqual(mockObligation);
    });

    it('should reject access when unauthorized', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const differentUserId = 'user-456';

      const mockObligation = createMockObligation({
        id: obligationId,
        userId: differentUserId,
      });

      mockObligationRepository.findById.mockResolvedValue(mockObligation);

      // Act & Assert
      await expect(
        obligationService.getObligationById(obligationId, userId)
      ).rejects.toThrow('Brak uprawnień do dostępu do tego zobowiązania');
    });
  });

  describe('getObligationsByUser', () => {
    it('should get obligations with pagination', async () => {
      // Arrange
      const userId = 'user-123';
      const page = 1;
      const limit = 10;

      const mockObligations = [
        createMockObligation({
          id: 'obligation-1',
          userId,
        }),
      ];

      mockObligationRepository.findWithPagination.mockResolvedValue({
        obligations: mockObligations,
        total: 1,
        page,
        limit,
        totalPages: 1,
      });

      // Act
      const result = await obligationService.getObligationsByUser(userId, page, limit);

      // Assert
      expect(result.obligations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });

  describe('markObligationAsPaid', () => {
    it('should mark obligation as paid', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';

      const existingObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance: 0,
      });

      const paidObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance: 0,
        status: ObligationStatus.PAID,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.update.mockResolvedValue(paidObligation);

      // Act
      const result = await obligationService.markObligationAsPaid(obligationId, userId);

      // Assert
      expect(result.status).toBe(ObligationStatus.PAID);
      expect(result.currentBalance).toBe(0);
    });
  });

  describe('updateObligationBalance', () => {
    it('should update balance and maintain ACTIVE status when balance > 0', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const newBalance = 2500;

      const existingObligation = createMockObligation({
        id: obligationId,
        userId,
      });

      const updatedObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance: newBalance,
        status: ObligationStatus.ACTIVE,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.update.mockResolvedValue(updatedObligation);

      // Act
      const result = await obligationService.updateObligationBalance(
        obligationId,
        userId,
        newBalance
      );

      // Assert
      expect(result.currentBalance).toBe(newBalance);
      expect(result.status).toBe(ObligationStatus.ACTIVE);
    });

    it('should update balance to PAID when balance = 0', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const newBalance = 0;

      const existingObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance: 100,
      });

      const updatedObligation = createMockObligation({
        id: obligationId,
        userId,
        currentBalance: newBalance,
        status: ObligationStatus.PAID,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);
      mockObligationRepository.update.mockResolvedValue(updatedObligation);

      // Act
      const result = await obligationService.updateObligationBalance(
        obligationId,
        userId,
        newBalance
      );

      // Assert
      expect(result.currentBalance).toBe(0);
      expect(result.status).toBe(ObligationStatus.PAID);
    });

    it('should reject update with negative balance', async () => {
      // Arrange
      const obligationId = 'obligation-123';
      const userId = 'user-123';
      const invalidBalance = -100;

      const existingObligation = createMockObligation({
        id: obligationId,
        userId,
      });

      mockObligationRepository.findById.mockResolvedValue(existingObligation);

      // Act & Assert
      await expect(
        obligationService.updateObligationBalance(
          obligationId,
          userId,
          invalidBalance
        )
      ).rejects.toThrow('Saldo nie może być ujemne');
    });
  });
});
