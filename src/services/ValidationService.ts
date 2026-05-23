import { ApiError } from '../middleware/errorHandler';

export interface ValidationRules {
  minAmount?: number;
  maxAmount?: number;
  nameMinLength?: number;
  nameMaxLength?: number;
  dueDateAfter?: Date;
}

const DEFAULT_RULES: ValidationRules = {
  minAmount: 0.01,
  maxAmount: 999999999.99,
  nameMinLength: 2,
  nameMaxLength: 255,
};

export class ValidationService {
  static validateLoanCreation(data: any, rules: ValidationRules = DEFAULT_RULES) {
    const r = { ...DEFAULT_RULES, ...rules };

    if (!data.borrowerName?.trim()) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Imię dłużnika jest wymagane');
    }

    if (data.borrowerName.length < r.nameMinLength!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Imię musi mieć co najmniej ${r.nameMinLength} znaki`);
    }

    if (data.borrowerName.length > r.nameMaxLength!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Imię może mieć max. ${r.nameMaxLength} znaków`);
    }

    if (!data.originalAmount || Number(data.originalAmount) < r.minAmount!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Kwota musi być co najmniej ${r.minAmount}`);
    }

    if (Number(data.originalAmount) > r.maxAmount!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Kwota nie może przekraczać ${r.maxAmount}`);
    }

    if (data.dueDate && !this.isValidDate(data.dueDate)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Format daty jest niepoprawny');
    }

    if (data.dueDate && data.createdAt) {
      const dueDate = new Date(data.dueDate);
      const createdDate = new Date(data.createdAt);
      if (dueDate < createdDate) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Termin spłaty musi być po dacie utworzenia');
      }
    }

    if (data.interestRate !== undefined && data.interestRate !== null) {
      if (Number(data.interestRate) < 0 || Number(data.interestRate) > 100) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Oprocentowanie musi być między 0 a 100%');
      }
    }

    return true;
  }

  static validateObligationCreation(data: any, rules: ValidationRules = DEFAULT_RULES) {
    const r = { ...DEFAULT_RULES, ...rules };

    if (!data.creditorName?.trim()) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Nazwa wierzyciela jest wymagana');
    }

    if (data.creditorName.length < r.nameMinLength!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Nazwa musi mieć co najmniej ${r.nameMinLength} znaki`);
    }

    if (data.creditorName.length > r.nameMaxLength!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Nazwa może mieć max. ${r.nameMaxLength} znaków`);
    }

    if (!data.originalAmount || Number(data.originalAmount) < r.minAmount!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Kwota musi być co najmniej ${r.minAmount}`);
    }

    if (Number(data.originalAmount) > r.maxAmount!) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Kwota nie może przekraczać ${r.maxAmount}`);
    }

    if (data.dueDate && !this.isValidDate(data.dueDate)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Format daty jest niepoprawny');
    }

    return true;
  }

  static validatePayment(amount: any, maxAmount: number) {
    const val = Number(amount);

    if (isNaN(val)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Kwota spłaty musi być liczbą');
    }

    if (val <= 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Kwota spłaty musi być większa niż 0');
    }

    if (val > maxAmount) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Kwota nie może być większa niż pozostały do spłaty: ${maxAmount}`);
    }

    return true;
  }

  static isValidDate(date: any): boolean {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  static validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      active: ['paid', 'overdue', 'paused', 'disputed', 'cancelled'],
      paid: [],
      overdue: ['paused', 'disputed', 'cancelled'],
      paused: ['active', 'cancelled'],
      disputed: ['active', 'cancelled'],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ApiError(400, 'INVALID_STATUS_TRANSITION', `Nie można zmienić status z ${currentStatus} na ${newStatus}`);
    }

    return true;
  }
}
