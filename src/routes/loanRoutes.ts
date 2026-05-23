import { Router } from 'express';
import { loanController } from '../controllers/LoanController';
import { paymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Loan Routes
 * Handles loan-related endpoints
 */
const loanRoutes = Router();

// All loan routes require authentication
loanRoutes.use(authenticate);

/**
 * POST /api/loans
 * Create a new loan
 * Body: { borrowerName: string, originalAmount: number, dueDate?: string, description?: string, currency?: string }
 * Response: { loan: Loan }
 */
loanRoutes.post('/', loanController.createLoan);

/**
 * GET /api/loans
 * Get all loans for current user with pagination
 * Query: { page?: number, limit?: number }
 * Response: { loans: Loan[], total: number, page: number, limit: number, totalPages: number }
 */
loanRoutes.get('/', loanController.getUserLoans);

/**
 * GET /api/loans/statistics
 * Get loan statistics for current user
 * Response: { totalLoans: number, activeLoans: number, totalAmount: number, totalBalance: number }
 */
loanRoutes.get('/statistics', loanController.getStatistics);

/**
 * GET /api/loans/:id
 * Get loan by ID
 * Response: { loan: Loan }
 */
loanRoutes.get('/:id', loanController.getLoan);

/**
 * PUT /api/loans/:id
 * Update loan
 * Body: { borrowerName?: string, originalAmount?: number, currentBalance?: number, dueDate?: string, description?: string, status?: string }
 * Response: { loan: Loan }
 */
loanRoutes.put('/:id', loanController.updateLoan);

/**
 * DELETE /api/loans/:id
 * Delete loan
 * Response: { message: string }
 */
loanRoutes.delete('/:id', loanController.deleteLoan);

/**
 * PUT /api/loans/:id/mark-paid
 * Mark loan as paid
 * Response: { loan: Loan }
 */
loanRoutes.put('/:id/mark-paid', loanController.markLoanAsPaid);

/**
 * PUT /api/loans/:id/update-balance
 * Update loan balance
 * Body: { newBalance: number }
 * Response: { loan: Loan }
 */
loanRoutes.put('/:id/update-balance', loanController.updateBalance);

/**
 * POST /api/loans/:id/payments
 * Register a payment for a loan
 * Body: { amount: number, note?: string }
 * Response: { transaction: Transaction }
 */
loanRoutes.post('/:id/payments', paymentController.registerLoanPayment);

/**
 * GET /api/loans/:id/payments
 * Get payment history for a loan
 * Response: { transactions: Transaction[], total: number }
 */
loanRoutes.get('/:id/payments', paymentController.getLoanPayments);

/**
 * POST /api/loans/:id/notes
 * Add a note to a loan
 * Body: { text: string }
 * Response: { note: LoanNote }
 */
loanRoutes.post('/:id/notes', loanController.addNote);

/**
 * GET /api/loans/:id/notes
 * Get all notes for a loan
 * Response: { notes: LoanNote[] }
 */
loanRoutes.get('/:id/notes', loanController.getNotes);

/**
 * DELETE /api/loans/:noteId/notes
 * Delete a note from a loan
 * Response: { message: string }
 */
loanRoutes.delete('/:loanId/notes/:noteId', loanController.deleteNote);

/**
 * GET /api/loans/:id/audit
 * Get audit history for a loan
 * Response: { logs: AuditLog[] }
 */
loanRoutes.get('/:id/audit', loanController.getAuditLog);

/**
 * POST /api/loans/:id/categories
 * Add a category to a loan
 * Body: { name: string, color?: string }
 * Response: { category: LoanCategory }
 */
loanRoutes.post('/:id/categories', loanController.addCategory);

/**
 * GET /api/loans/:id/categories
 * Get all categories for a loan
 * Response: { categories: LoanCategory[] }
 */
loanRoutes.get('/:id/categories', loanController.getCategories);

/**
 * DELETE /api/loans/:loanId/categories/:categoryId
 * Remove a category from a loan
 * Response: { message: string }
 */
loanRoutes.delete('/:loanId/categories/:categoryId', loanController.deleteCategory);

/**
 * POST /api/loans/:id/recurring
 * Create a recurring payment
 * Body: { amount: number, frequency: string, startDate: string, endDate?: string }
 * Response: { recurring: RecurringPayment }
 */
loanRoutes.post('/:id/recurring', loanController.createRecurring);

/**
 * GET /api/loans/:id/recurring
 * Get recurring payments for a loan
 * Response: { recurring: RecurringPayment[] }
 */
loanRoutes.get('/:id/recurring', loanController.getRecurring);

// ===== TIER 1 FEATURE ROUTES =====

/**
 * GET /api/loans/:id/payment-schedule
 * Get payment schedule breakdown
 * Query: months (default 12)
 * Response: { schedule with monthly breakdown }
 */
loanRoutes.get('/:id/payment-schedule', loanController.getPaymentSchedule);

/**
 * GET /api/loans/search
 * Advanced search and filtering
 * Query: status, minAmount, maxAmount, dateFrom, dateTo, category, searchTerm, page, limit
 * Response: { loans, total, page, limit, totalPages }
 */
loanRoutes.get('/search/advanced', loanController.advancedSearch);

/**
 * POST /api/loans/:id/suggest-payment
 * Get payment suggestion for a loan
 * Response: { minimum, recommended, fullPayment, interestSavings, urgency }
 */
loanRoutes.post('/:id/suggest-payment', loanController.suggestPayment);

/**
 * GET /api/loans/compare
 * Compare multiple loans
 * Query: ids=id1,id2,id3
 * Response: { loans comparison array, summary }
 */
loanRoutes.get('/compare/multiple', loanController.compareLoansList);

// ===== TIER 2 FEATURE ROUTES =====

/**
 * GET /api/loans/:id/interest-breakdown
 * Get interest breakdown for a loan
 * Response: { principal, interest, paid, remaining }
 */
loanRoutes.get('/:id/interest-breakdown', loanController.getInterestBreakdown);

/**
 * GET /api/loans/:id/interest-accrual
 * Get real-time accrued interest
 * Response: { currentAccruedInterest, accruedSinceLastPayment, dailyAccrualRate }
 */
loanRoutes.get('/:id/interest-accrual', loanController.getRealTimeAccrual);

/**
 * GET /api/loans/:id/health-score
 * Get loan health score (0-100)
 * Response: { score, category, breakdown, risks, recommendations }
 */
loanRoutes.get('/:id/health-score', loanController.getHealthScore);

// ===== TIER 3 FEATURE ROUTES =====

/**
 * GET /api/loans/:id/forecast
 * Forecast payment completion
 * Response: { estimatedDate, confidence, riskOfOverdue, scenarios }
 */
loanRoutes.get('/:id/forecast', loanController.getForecast);

/**
 * POST /api/loans/:id/rules
 * Create a payment rule
 * Body: { type, trigger, action, amount?, percentage?, description? }
 * Response: { rule: PaymentRule }
 */
loanRoutes.post('/:id/rules', loanController.createPaymentRule);

/**
 * GET /api/loans/:id/rules
 * Get all payment rules for a loan
 * Response: { rules: PaymentRule[] }
 */
loanRoutes.get('/:id/rules', loanController.getPaymentRules);

/**
 * GET /api/loans/:id/rules/active
 * Get active payment rules for a loan
 * Response: { rules: PaymentRule[] }
 */
loanRoutes.get('/:id/rules/active', loanController.getActiveRules);

/**
 * GET /api/loans/:id/rules/suggested
 * Get suggested payment rules
 * Response: { suggestions: Rule[] }
 */
loanRoutes.get('/:id/rules/suggested', loanController.getSuggestedRules);

/**
 * PUT /api/loans/rules/:ruleId
 * Update a payment rule
 * Body: { partial PaymentRule updates }
 * Response: { rule: PaymentRule }
 */
loanRoutes.put('/rules/:ruleId', loanController.updatePaymentRule);

/**
 * DELETE /api/loans/rules/:ruleId
 * Delete a payment rule
 * Response: { message: string }
 */
loanRoutes.delete('/rules/:ruleId', loanController.deletePaymentRule);


export default loanRoutes;
