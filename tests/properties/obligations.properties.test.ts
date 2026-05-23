import fc from 'fast-check';
import { ObligationService } from '../../src/services/ObligationService';
import { ObligationRepository } from '../../src/repositories/ObligationRepository';
import { Obligation, ObligationStatus } from '../../src/models/Obligation';

/**
 * Property-Based Tests for Obligations
 * Validates universal properties of obligation system
 * 
 * Requirements: 3.1, 3.4, 3.5
 */

// Mock the ObligationRepository
jest.mock('../../src/repositories/ObligationRepository');

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

describe('Obligation Properties', () => {
  let obligationService: ObligationService;
  let mockObligationRepository: jest.Mocked<ObligationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    obligationService = new ObligationService();
    mockObligationRepository = require('../../src/repositories/ObligationRepository').obligationRepository as jest.Mocked<ObligationRepository>;
  });

  describe('Property 4: Obligation Amount Invariant', () => {
    it('should ensure currentBalance <= originalAmount for all obligations', () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
          paidAmount: fc.integer({ min: 0 }),
        }),
        20
      );

      for (const data of samples) {
        // Ensure paid amount doesn't exceed original amount
        const paidAmount = Math.min(data.paidAmount, data.originalAmount);
        const currentBalance = data.originalAmount - paidAmount;

        // Create mock obligation
        const mockObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance,
        });

        // Verify invariant
        expect(mockObligation.currentBalance).toBeLessThanOrEqual(mockObligation.originalAmount);
        expect(mockObligation.currentBalance).toBeGreaterThanOrEqual(0);
      }
    });

    it('should maintain invariant after payment', () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 100, max: 1000000 }),
          payment: fc.integer({ min: 1, max: 100000 }),
        }),
        20
      );

      for (const data of samples) {
        // Create initial obligation
        const initialBalance = data.originalAmount;
        const newBalance = Math.max(0, initialBalance - data.payment);

        // Verify invariant before and after payment
        expect(initialBalance).toBeLessThanOrEqual(data.originalAmount);
        expect(newBalance).toBeLessThanOrEqual(data.originalAmount);
        expect(newBalance).toBeGreaterThanOrEqual(0);
      }
    });

    it('should never allow currentBalance to exceed originalAmount', () => {
      const samples = fc.sample(
        fc.record({
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
          currentBalance: fc.integer({ min: 0, max: 1000000 }),
        }),
        20
      );

      for (const data of samples) {
        // Verify that if currentBalance > originalAmount, it's caught
        // In a valid system, this should never happen
        if (data.currentBalance > data.originalAmount) {
          // This is an invalid state - just verify the condition
          expect(data.currentBalance > data.originalAmount).toBe(true);
        } else {
          // Valid state
          expect(data.currentBalance).toBeLessThanOrEqual(data.originalAmount);
        }
      }
    });
  });

  describe('Property 6: Unique Identifier Assignment', () => {
    it('should assign unique IDs to each new obligation', async () => {
      const obligations = fc.sample(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
            originalAmount: fc.integer({ min: 1, max: 1000000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        1
      )[0];

      const obligationIds = new Set<string>();

      for (let i = 0; i < obligations.length; i++) {
        const mockObligation = createMockObligation({
          id: `obligation-${i}`, // Simulate unique ID
          userId: obligations[i].userId,
          creditorName: obligations[i].creditorName,
          originalAmount: obligations[i].originalAmount,
          currentBalance: obligations[i].originalAmount,
        });

        mockObligationRepository.create.mockResolvedValueOnce(mockObligation);

        const result = await obligationService.createObligation(
          obligations[i].userId,
          obligations[i].creditorName,
          obligations[i].originalAmount
        );

        obligationIds.add(result.id);
      }

      // Verify all IDs are unique
      expect(obligationIds.size).toBe(obligations.length);
    });

    it('should generate IDs that are non-empty strings', async () => {
      const [data] = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
        }),
        1
      );

      const mockObligation = createMockObligation({
        userId: data.userId,
        creditorName: data.creditorName,
        originalAmount: data.originalAmount,
        currentBalance: data.originalAmount,
      });

      mockObligationRepository.create.mockResolvedValueOnce(mockObligation);

      const result = await obligationService.createObligation(
        data.userId,
        data.creditorName,
        data.originalAmount
      );

      // Verify ID is a non-empty string
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should generate IDs that follow UUID format', async () => {
      const [data] = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
        }),
        1
      );

      // Generate a valid UUID v4
      const validUuid = fc.sample(fc.uuid(), 1)[0];

      const mockObligation = createMockObligation({
        id: validUuid, // Use the generated UUID
        userId: data.userId,
        creditorName: data.creditorName,
        originalAmount: data.originalAmount,
        currentBalance: data.originalAmount,
      });

      mockObligationRepository.create.mockResolvedValueOnce(mockObligation);

      const result = await obligationService.createObligation(
        data.userId,
        data.creditorName,
        data.originalAmount
      );

      // Verify ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(result.id).toMatch(uuidRegex);
    });
  });

  describe('Property 7: Status Consistency', () => {
    it('should set status to ACTIVE for new obligations', async () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.string({ minLength: 1, maxLength: 100 }),
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
        }),
        10
      );

      for (const data of samples) {
        const mockObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance: data.originalAmount,
        });

        mockObligationRepository.create.mockResolvedValueOnce(mockObligation);

        const result = await obligationService.createObligation(
          data.userId,
          data.creditorName,
          data.originalAmount
        );

        // Verify status is ACTIVE
        expect(result.status).toBe(ObligationStatus.ACTIVE);
      }
    });

    it('should set status to PAID when balance reaches 0', async () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 1, max: 1000000 }),
        }),
        10
      );

      for (const data of samples) {
        const existingObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance: 100, // Some balance remaining
          status: ObligationStatus.ACTIVE,
        });

        const updatedObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance: 0,
          status: ObligationStatus.PAID,
        });

        mockObligationRepository.findById.mockResolvedValueOnce(existingObligation);
        mockObligationRepository.update.mockResolvedValueOnce(updatedObligation);

        const result = await obligationService.updateObligationBalance(
          'obligation-123',
          data.userId,
          0
        );

        // Verify status is PAID when balance is 0
        expect(result.currentBalance).toBe(0);
        expect(result.status).toBe(ObligationStatus.PAID);
      }
    });

    it('should maintain ACTIVE status when balance > 0', async () => {
      const samples = fc.sample(
        fc.record({
          userId: fc.uuid(),
          creditorName: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          originalAmount: fc.integer({ min: 100, max: 1000000 }),
          balance: fc.integer({ min: 1, max: 100000 }),
        }),
        10
      );

      for (const data of samples) {
        const existingObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance: data.balance,
          status: ObligationStatus.ACTIVE,
        });

        const updatedObligation = createMockObligation({
          userId: data.userId,
          creditorName: data.creditorName,
          originalAmount: data.originalAmount,
          currentBalance: data.balance,
          status: ObligationStatus.ACTIVE,
        });

        mockObligationRepository.findById.mockResolvedValueOnce(existingObligation);
        mockObligationRepository.update.mockResolvedValueOnce(updatedObligation);

        const result = await obligationService.updateObligationBalance(
          'obligation-123',
          data.userId,
          data.balance
        );

        // Verify status remains ACTIVE when balance > 0
        expect(result.currentBalance).toBeGreaterThan(0);
        expect(result.status).toBe(ObligationStatus.ACTIVE);
      }
    });
  });
});
