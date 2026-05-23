import { Response } from 'express';
import { paymentService } from '../services/PaymentService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Payment Controller
 * Handles payment-related HTTP requests
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export class PaymentController {
  /**
   * POST /api/loans/:id/payments
   * Register a payment for a loan
   * 
   * @param req - Authenticated request with loan ID in params and payment data in body
   * @param res - Express response
   */
  registerLoanPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;
    const { amount, note } = req.body;

    // Validate required fields
    if (amount === undefined) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Kwota spłaty jest wymagana'
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new ApiError(
        400,
        'INVALID_AMOUNT',
        'Kwota spłaty musi być liczbą większą niż 0'
      );
    }

    // Register payment
    const transaction = await paymentService.registerLoanPayment(
      id,
      req.user.id,
      amount,
      note
    );

    res.status(201).json(
      ApiResponse.success(
        201,
        'Spłata zarejestrowana pomyślnie',
        transaction
      )
    );
  });

  /**
   * GET /api/loans/:id/payments
   * Get payment history for a loan
   * 
   * @param req - Authenticated request with loan ID in params
   * @param res - Express response
   */
  getLoanPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Get transaction history
    const transactions = await paymentService.getLoanTransactionHistory(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Historia spłat pobrana pomyślnie',
        {
          transactions,
          total: transactions.length,
        }
      )
    );
  });

  /**
   * POST /api/obligations/:id/payments
   * Register a payment for an obligation
   * 
   * @param req - Authenticated request with obligation ID in params and payment data in body
   * @param res - Express response
   */
  registerObligationPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;
    const { amount, note } = req.body;

    // Validate required fields
    if (amount === undefined) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Kwota spłaty jest wymagana'
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new ApiError(
        400,
        'INVALID_AMOUNT',
        'Kwota spłaty musi być liczbą większą niż 0'
      );
    }

    // Register payment
    const transaction = await paymentService.registerObligationPayment(
      id,
      req.user.id,
      amount,
      note
    );

    res.status(201).json(
      ApiResponse.success(
        201,
        'Spłata zarejestrowana pomyślnie',
        transaction
      )
    );
  });

  /**
   * GET /api/obligations/:id/payments
   * Get payment history for an obligation
   * 
   * @param req - Authenticated request with obligation ID in params
   * @param res - Express response
   */
  getObligationPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Get transaction history
    const transactions = await paymentService.getObligationTransactionHistory(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Historia spłat pobrana pomyślnie',
        {
          transactions,
          total: transactions.length,
        }
      )
    );
  });
}

// Export singleton instance
export const paymentController = new PaymentController();
