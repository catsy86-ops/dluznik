import { Router } from 'express';
import { obligationController } from '../controllers/ObligationController';
import { paymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Obligation Routes
 * Handles obligation-related endpoints
 */
const obligationRoutes = Router();

// All obligation routes require authentication
obligationRoutes.use(authenticate);

/**
 * POST /api/obligations
 * Create a new obligation
 * Body: { creditorName: string, originalAmount: number, dueDate?: string, description?: string, currency?: string }
 * Response: { obligation: Obligation }
 */
obligationRoutes.post('/', obligationController.createObligation);

/**
 * GET /api/obligations
 * Get all obligations for current user with pagination
 * Query: { page?: number, limit?: number }
 * Response: { obligations: Obligation[], total: number, page: number, limit: number, totalPages: number }
 */
obligationRoutes.get('/', obligationController.getUserObligations);

/**
 * GET /api/obligations/statistics
 * Get obligation statistics for current user
 * Response: { totalObligations: number, activeObligations: number, totalAmount: number, totalBalance: number }
 */
obligationRoutes.get('/statistics', obligationController.getStatistics);

/**
 * GET /api/obligations/:id
 * Get obligation by ID
 * Response: { obligation: Obligation }
 */
obligationRoutes.get('/:id', obligationController.getObligation);

/**
 * PUT /api/obligations/:id
 * Update obligation
 * Body: { creditorName?: string, originalAmount?: number, currentBalance?: number, dueDate?: string, description?: string, status?: string }
 * Response: { obligation: Obligation }
 */
obligationRoutes.put('/:id', obligationController.updateObligation);

/**
 * DELETE /api/obligations/:id
 * Delete obligation
 * Response: { message: string }
 */
obligationRoutes.delete('/:id', obligationController.deleteObligation);

/**
 * PUT /api/obligations/:id/mark-paid
 * Mark obligation as paid
 * Response: { obligation: Obligation }
 */
obligationRoutes.put('/:id/mark-paid', obligationController.markObligationAsPaid);

/**
 * PUT /api/obligations/:id/update-balance
 * Update obligation balance
 * Body: { newBalance: number }
 * Response: { obligation: Obligation }
 */
obligationRoutes.put('/:id/update-balance', obligationController.updateBalance);

/**
 * POST /api/obligations/:id/payments
 * Register a payment for an obligation
 * Body: { amount: number, note?: string }
 * Response: { transaction: Transaction }
 */
obligationRoutes.post('/:id/payments', paymentController.registerObligationPayment);

/**
 * GET /api/obligations/:id/payments
 * Get payment history for an obligation
 * Response: { transactions: Transaction[], total: number }
 */
obligationRoutes.get('/:id/payments', paymentController.getObligationPayments);

export default obligationRoutes;
