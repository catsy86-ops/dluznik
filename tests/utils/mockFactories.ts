import { Loan, LoanStatus } from '../../src/models/Loan';
import { Obligation, ObligationStatus } from '../../src/models/Obligation';
import { Transaction, TransactionType } from '../../src/models/Transaction';

/**
 * Mock factory for creating test objects
 */

export const createMockLoan = (overrides?: Partial<Loan>): Loan => ({
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
});

export const createMockObligation = (overrides?: Partial<Obligation>): Obligation => ({
  id: 'obligation-123',
  userId: 'user-123',
  creditorName: 'Jane Doe',
  originalAmount: 500,
  currentBalance: 250,
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
});

export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: 'transaction-123',
  loanId: null,
  obligationId: null,
  type: TransactionType.PAYMENT,
  amount: 100,
  balanceBefore: 1000,
  balanceAfter: 900,
  createdAt: new Date(),
  note: null,
  loan: undefined as any,
  obligation: undefined as any,
  ...overrides,
});
