import { Response } from 'express';
import { obligationService } from '../services/ObligationService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Obligation Controller
 * Handles obligation-related HTTP requests
 * 
 * Requirements: 4.4
 */
export class ObligationController {
  /**
   * POST /api/obligations
   * Create a new obligation
   * 
   * @param req - Authenticated request with obligation data in body
   * @param res - Express response
   */
  createObligation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { creditorName, originalAmount, dueDate, description, currency } = req.body;

    // Validate required fields
    if (!creditorName || originalAmount === undefined) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Nazwa wierzyciela i kwota są wymagane'
      );
    }

    // Validate amount
    if (typeof originalAmount !== 'number' || originalAmount <= 0) {
      throw new ApiError(
        400,
        'INVALID_AMOUNT',
        'Kwota musi być liczbą większą niż 0'
      );
    }

    // Create obligation
    const obligation = await obligationService.createObligation(
      req.user.id,
      creditorName,
      originalAmount,
      dueDate ? new Date(dueDate) : undefined,
      description,
      currency
    );

    res.status(201).json(
      ApiResponse.success(
        201,
        'Zobowiązanie utworzone pomyślnie',
        obligation
      )
    );
  });

  /**
   * GET /api/obligations/:id
   * Get obligation by ID
   * 
   * @param req - Authenticated request with obligation ID in params
   * @param res - Express response
   */
  getObligation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Get obligation
    const obligation = await obligationService.getObligationById(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zobowiązanie pobrane pomyślnie',
        obligation
      )
    );
  });

  /**
   * GET /api/obligations
   * Get all obligations for current user with pagination
   * 
   * @param req - Authenticated request with optional page and limit query params
   * @param res - Express response
   */
  getUserObligations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get obligations
    const result = await obligationService.getObligationsByUser(req.user.id, page, limit);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zobowiązania pobrane pomyślnie',
        result
      )
    );
  });

  /**
   * PUT /api/obligations/:id
   * Update obligation
   * 
   * @param req - Authenticated request with obligation ID in params and updates in body
   * @param res - Express response
   */
  updateObligation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;
    const updates = req.body;

    // Update obligation
    const obligation = await obligationService.editObligation(id, req.user.id, updates);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zobowiązanie zaktualizowane pomyślnie',
        obligation
      )
    );
  });

  /**
   * DELETE /api/obligations/:id
   * Delete obligation
   * 
   * @param req - Authenticated request with obligation ID in params
   * @param res - Express response
   */
  deleteObligation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Delete obligation
    const deleted = await obligationService.deleteObligation(id, req.user.id);

    if (!deleted) {
      throw new ApiError(
        404,
        'OBLIGATION_NOT_FOUND',
        'Zobowiązanie nie znalezione'
      );
    }

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zobowiązanie usunięte pomyślnie',
        null
      )
    );
  });

  /**
   * GET /api/obligations/statistics
   * Get obligation statistics for current user
   * 
   * @param req - Authenticated request
   * @param res - Express response
   */
  getStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    // Get statistics
    const stats = await obligationService.getObligationStatistics(req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Statystyki pobrane pomyślnie',
        stats
      )
    );
  });

  /**
   * PUT /api/obligations/:id/mark-paid
   * Mark obligation as paid
   * 
   * @param req - Authenticated request with obligation ID in params
   * @param res - Express response
   */
  markObligationAsPaid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Mark as paid
    const obligation = await obligationService.markObligationAsPaid(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zobowiązanie oznaczone jako spłacone',
        obligation
      )
    );
  });

  /**
   * PUT /api/obligations/:id/update-balance
   * Update obligation balance
   * 
   * @param req - Authenticated request with obligation ID in params and newBalance in body
   * @param res - Express response
   */
  updateBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;
    const { newBalance } = req.body;

    // Validate balance
    if (newBalance === undefined || typeof newBalance !== 'number') {
      throw new ApiError(
        400,
        'INVALID_BALANCE',
        'Nowe saldo musi być liczbą'
      );
    }

    // Update balance
    const obligation = await obligationService.updateObligationBalance(id, req.user.id, newBalance);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Saldo zobowiązania zaktualizowane pomyślnie',
        obligation
      )
    );
  });
}

// Export singleton instance
export const obligationController = new ObligationController();
