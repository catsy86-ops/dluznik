import { Response } from 'express';
import { loanService } from '../services/LoanService';
import { paymentScheduleService } from '../services/PaymentScheduleService';
import { paymentSuggestionService } from '../services/PaymentSuggestionService';
import { loanComparisonService } from '../services/LoanComparisonService';
import { interestBreakdownService } from '../services/InterestBreakdownService';
import { loanHealthScoreService } from '../services/LoanHealthScoreService';
import { paymentForecastService } from '../services/PaymentForecastService';
import { paymentRuleService } from '../services/PaymentRuleService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Loan Controller
 * Handles loan-related HTTP requests
 */
export class LoanController {
  /**
   * POST /api/loans
   * Create a new loan
   * 
   * @param req - Authenticated request with loan data in body
   * @param res - Express response
   */
  createLoan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { borrowerName, originalAmount, dueDate, description, currency } = req.body;

    // Validate required fields
    if (!borrowerName || originalAmount === undefined) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Nazwa pożyczkobiorcy i kwota są wymagane'
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

    // Create loan
    const loan = await loanService.createLoan(
      req.user.id,
      borrowerName,
      originalAmount,
      dueDate ? new Date(dueDate) : undefined,
      description,
      currency
    );

    res.status(201).json(
      ApiResponse.success(
        201,
        'Pożyczka utworzona pomyślnie',
        loan
      )
    );
  });

  /**
   * GET /api/loans/:id
   * Get loan by ID
   * 
   * @param req - Authenticated request with loan ID in params
   * @param res - Express response
   */
  getLoan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Get loan
    const loan = await loanService.getLoanById(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Pożyczka pobrana pomyślnie',
        loan
      )
    );
  });

  /**
   * GET /api/loans
   * Get all loans for current user with pagination
   * 
   * @param req - Authenticated request with optional page and limit query params
   * @param res - Express response
   */
  getUserLoans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

    // Get loans
    const result = await loanService.getLoansByUser(req.user.id, page, limit);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Pożyczki pobrane pomyślnie',
        result
      )
    );
  });

  /**
   * PUT /api/loans/:id
   * Update loan
   * 
   * @param req - Authenticated request with loan ID in params and updates in body
   * @param res - Express response
   */
  updateLoan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

    // Update loan
    const loan = await loanService.editLoan(id, req.user.id, updates);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Pożyczka zaktualizowana pomyślnie',
        loan
      )
    );
  });

  /**
   * DELETE /api/loans/:id
   * Delete loan
   * 
   * @param req - Authenticated request with loan ID in params
   * @param res - Express response
   */
  deleteLoan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    const { id } = req.params;

    // Delete loan
    const deleted = await loanService.deleteLoan(id, req.user.id);

    if (!deleted) {
      throw new ApiError(
        404,
        'LOAN_NOT_FOUND',
        'Pożyczka nie znaleziona'
      );
    }

    res.status(200).json(
      ApiResponse.success(
        200,
        'Pożyczka usunięta pomyślnie',
        null
      )
    );
  });

  /**
   * GET /api/loans/statistics
   * Get loan statistics for current user
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
    const stats = await loanService.getLoanStatistics(req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Statystyki pobrane pomyślnie',
        stats
      )
    );
  });

  /**
   * PUT /api/loans/:id/mark-paid
   * Mark loan as paid
   * 
   * @param req - Authenticated request with loan ID in params
   * @param res - Express response
   */
  markLoanAsPaid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
    const loan = await loanService.markLoanAsPaid(id, req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Pożyczka oznaczona jako spłacona',
        loan
      )
    );
  });

  /**
   * PUT /api/loans/:id/update-balance
   * Update loan balance
   * 
   * @param req - Authenticated request with loan ID in params and newBalance in body
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
    const loan = await loanService.updateLoanBalance(id, req.user.id, newBalance);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Saldo pożyczki zaktualizowane pomyślnie',
        loan
      )
    );
  });

  /**
   * POST /api/loans/:id/notes
   * Add a note to a loan
   */
  addNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const { text } = req.body;
    const note = await loanService.addNote(id, req.user.id, text);
    res.status(201).json(ApiResponse.success(201, 'Notatka dodana', note));
  });

  /**
   * GET /api/loans/:id/notes
   * Get all notes for a loan
   */
  getNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const notes = await loanService.getNotes(id);
    res.status(200).json(ApiResponse.success(200, 'Notatki pobrane', notes));
  });

  /**
   * DELETE /api/loans/:loanId/notes/:noteId
   * Delete a note from a loan
   */
  deleteNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { noteId } = req.params;
    await loanService.deleteNote(noteId);
    res.status(200).json(ApiResponse.success(200, 'Notatka usunięta', null));
  });

  /**
   * GET /api/loans/:id/audit
   * Get audit history for a loan
   */
  getAuditLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const logs = await loanService.getAuditLog(id);
    res.status(200).json(ApiResponse.success(200, 'Historia zmian pobrana', logs));
  });

  /**
   * POST /api/loans/:id/categories
   * Add a category to a loan
   */
  addCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const { name, color } = req.body;
    const category = await loanService.addCategory(id, req.user.id, name, color);
    res.status(201).json(ApiResponse.success(201, 'Kategoria dodana', category));
  });

  /**
   * GET /api/loans/:id/categories
   * Get all categories for a loan
   */
  getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const categories = await loanService.getCategories(id);
    res.status(200).json(ApiResponse.success(200, 'Kategorie pobrane', categories));
  });

  /**
   * DELETE /api/loans/:loanId/categories/:categoryId
   * Remove a category from a loan
   */
  deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { categoryId } = req.params;
    await loanService.deleteCategory(categoryId);
    res.status(200).json(ApiResponse.success(200, 'Kategoria usunięta', null));
  });

  /**
   * POST /api/loans/:id/recurring
   * Create a recurring payment
   */
  createRecurring = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const { amount, frequency, startDate, endDate, description } = req.body;
    const recurring = await loanService.createRecurring(id, amount, frequency, startDate, endDate, description);
    res.status(201).json(ApiResponse.success(201, 'Płatność cykliczna utworzona', recurring));
  });

  /**
   * GET /api/loans/:id/recurring
   * Get recurring payments for a loan
   */
  getRecurring = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const recurring = await loanService.getRecurring(id);
    res.status(200).json(ApiResponse.success(200, 'Płatności cykliczne pobrane', recurring));
  });

  // ===== TIER 1 FEATURES =====

  /**
   * GET /api/loans/:id/payment-schedule
   * Get payment schedule for a loan
   * Query: months (default 12)
   */
  getPaymentSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const months = parseInt(req.query.months as string) || 12;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const schedule = await paymentScheduleService.generatePaymentSchedule(id, months);
    res.status(200).json(ApiResponse.success(200, 'Harmonogram spłat wygenerowany', schedule));
  });

  /**
   * GET /api/loans/search
   * Advanced search and filtering
   * Query: status, minAmount, maxAmount, dateFrom, dateTo, category, searchTerm, page, limit
   */
  advancedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    
    const { status, minAmount, maxAmount, dateFrom, dateTo, category, searchTerm, page, limit } = req.query;
    
    // If search term provided, use full text search
    if (searchTerm) {
      const result = await loanService.loanRepository.findByFullText(
        req.user.id,
        searchTerm as string,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10
      );
      return res.status(200).json(ApiResponse.success(200, 'Wyniki wyszukiwania', result));
    }

    // Otherwise use advanced filters
    const filters: any = {};
    if (status) filters.status = status;
    if (minAmount) filters.minAmount = Number(minAmount);
    if (maxAmount) filters.maxAmount = Number(maxAmount);
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (category) filters.category = category;
    filters.page = parseInt(page as string) || 1;
    filters.limit = parseInt(limit as string) || 10;

    const result = await loanService.loanRepository.findWithAdvancedFilters(req.user.id, filters);
    return res.status(200).json(ApiResponse.success(200, 'Pożyczki przefiltrowane', result));
  });

  /**
   * POST /api/loans/:id/suggest-payment
   * Get payment suggestion for a loan
   */
  suggestPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const suggestion = await paymentSuggestionService.suggestPayment(id);
    res.status(200).json(ApiResponse.success(200, 'Sugestia płatności', suggestion));
  });

  /**
   * GET /api/loans/compare
   * Compare multiple loans
   * Query: ids (comma-separated loan IDs)
   */
  compareLoansList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    
    const { ids } = req.query;
    if (!ids || typeof ids !== 'string') {
      throw new ApiError(400, 'INVALID_INPUT', 'Należy podać IDs pożyczek do porównania (ids=id1,id2,id3)');
    }

    const loanIds = ids.split(',').map(id => id.trim());
    const comparison = await loanComparisonService.compareLoan(loanIds, req.user.id);
    res.status(200).json(ApiResponse.success(200, 'Porównanie pożyczek', comparison));
  });

  // ===== TIER 2 FEATURES =====

  /**
   * GET /api/loans/:id/interest-breakdown
   * Get interest breakdown for a loan
   */
  getInterestBreakdown = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const breakdown = await interestBreakdownService.getInterestBreakdown(id);
    res.status(200).json(ApiResponse.success(200, 'Rozkład odsetek', breakdown));
  });

  /**
   * GET /api/loans/:id/interest-accrual
   * Get real-time accrued interest
   */
  getRealTimeAccrual = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const accrual = await interestBreakdownService.getRealTimeAccrual(id);
    res.status(200).json(ApiResponse.success(200, 'Bieżące naliczanie odsetek', accrual));
  });

  /**
   * GET /api/loans/:id/health-score
   * Get loan health score
   */
  getHealthScore = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const healthScore = await loanHealthScoreService.calculateHealthScore(id);
    res.status(200).json(ApiResponse.success(200, 'Wskaźnik zdrowotności pożyczki', healthScore));
  });

  // ===== TIER 3 FEATURES =====

  /**
   * GET /api/loans/:id/forecast
   * Forecast payment completion
   */
  getForecast = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const forecast = await paymentForecastService.forecastPaymentCompletion(id);
    res.status(200).json(ApiResponse.success(200, 'Prognoza spłaty', forecast));
  });

  /**
   * POST /api/loans/:id/rules
   * Create a payment rule
   * Body: { type, trigger, action, amount?, percentage?, description? }
   */
  createPaymentRule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    const { type, trigger, action, amount, percentage, startDate, endDate, description } = req.body;

    if (!type || !trigger || !action) {
      throw new ApiError(400, 'MISSING_FIELDS', 'Typ, wyzwalacz i akcja są wymagane');
    }

    const rule = await paymentRuleService.createPaymentRule(id, {
      type,
      trigger,
      action,
      amount,
      percentage,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      description,
    });

    res.status(201).json(ApiResponse.success(201, 'Reguła płatności utworzona', rule));
  });

  /**
   * GET /api/loans/:id/rules
   * Get payment rules for a loan
   */
  getPaymentRules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const rules = await paymentRuleService.getPaymentRules(id);
    res.status(200).json(ApiResponse.success(200, 'Reguły płatności', rules));
  });

  /**
   * GET /api/loans/:id/rules/active
   * Get active payment rules
   */
  getActiveRules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const rules = await paymentRuleService.getActivePaymentRules(id);
    res.status(200).json(ApiResponse.success(200, 'Aktywne reguły płatności', rules));
  });

  /**
   * GET /api/loans/:id/rules/suggested
   * Get suggested payment rules
   */
  getSuggestedRules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { id } = req.params;
    
    // Verify ownership
    await loanService.getLoanById(id, req.user.id);
    
    const suggestions = await paymentRuleService.getSuggestedRules(id);
    res.status(200).json(ApiResponse.success(200, 'Sugerowane reguły płatności', suggestions));
  });

  /**
   * PUT /api/loans/rules/:ruleId
   * Update a payment rule
   */
  updatePaymentRule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { ruleId } = req.params;
    
    const rule = await paymentRuleService.updatePaymentRule(ruleId, req.body);
    res.status(200).json(ApiResponse.success(200, 'Reguła płatności zaktualizowana', rule));
  });

  /**
   * DELETE /api/loans/rules/:ruleId
   * Delete a payment rule
   */
  deletePaymentRule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { ruleId } = req.params;
    
    const deleted = await paymentRuleService.deletePaymentRule(ruleId);
    if (!deleted) {
      throw new ApiError(404, 'RULE_NOT_FOUND', 'Reguła nie znaleziona');
    }

    res.status(200).json(ApiResponse.success(200, 'Reguła usunięta', null));
  });
}

// Export singleton instance
export const loanController = new LoanController();
