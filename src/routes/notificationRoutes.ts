import { Router, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppDataSource } from '../config/database-init';
import { Loan } from '../models/Loan';
import { Obligation } from '../models/Obligation';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

const notificationRoutes = Router();
notificationRoutes.use(authenticate);

/**
 * GET /api/notifications
 * Lightweight endpoint for notification polling.
 * Returns overdue and upcoming (next 30 days) items without heavy summary aggregation.
 * 
 * Requirements: 3.1, 3.2
 */
notificationRoutes.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  const userId = req.user.id;

  const loanRepo = AppDataSource.getRepository(Loan);
  const obRepo = AppDataSource.getRepository(Obligation);

  const [loans, obligations] = await Promise.all([
    loanRepo.find({ where: { userId, status: 'active' as any } }),
    obRepo.find({ where: { userId, status: 'active' as any } }),
  ]);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const notifications = [
    ...loans
      .filter(l => l.dueDate && new Date(l.dueDate) < now)
      .map(l => ({ type: 'overdue_loan', id: l.id, name: l.borrowerName, dueDate: l.dueDate, amount: Number(l.currentBalance), currency: l.currency })),
    ...obligations
      .filter(o => o.dueDate && new Date(o.dueDate) < now)
      .map(o => ({ type: 'overdue_obligation', id: o.id, name: o.creditorName, dueDate: o.dueDate, amount: Number(o.currentBalance), currency: o.currency })),
    ...loans
      .filter(l => l.dueDate && new Date(l.dueDate) >= now && new Date(l.dueDate) <= in30)
      .map(l => ({ type: 'upcoming_loan', id: l.id, name: l.borrowerName, dueDate: l.dueDate, amount: Number(l.currentBalance), currency: l.currency })),
    ...obligations
      .filter(o => o.dueDate && new Date(o.dueDate) >= now && new Date(o.dueDate) <= in30)
      .map(o => ({ type: 'upcoming_obligation', id: o.id, name: o.creditorName, dueDate: o.dueDate, amount: Number(o.currentBalance), currency: o.currency })),
  ];

  res.json(ApiResponse.success(200, 'Powiadomienia pobrane', {
    count: notifications.length,
    notifications,
  }));
}));

export default notificationRoutes;
