import { Router, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppDataSource } from '../config/database-init';
import { Loan } from '../models/Loan';
import { Obligation } from '../models/Obligation';
import { Transaction } from '../models/Transaction';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

const summaryRoutes = Router();
summaryRoutes.use(authenticate);

/**
 * GET /api/summary
 * Financial summary + monthly stats + upcoming due dates
 */
summaryRoutes.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  const userId = req.user.id;

  const loanRepo = AppDataSource.getRepository(Loan);
  const obRepo = AppDataSource.getRepository(Obligation);
  const txRepo = AppDataSource.getRepository(Transaction);

  const [loans, obligations] = await Promise.all([
    loanRepo.find({ where: { userId } }),
    obRepo.find({ where: { userId } }),
  ]);

  const totalLoanBalance = loans.reduce((s, l) => s + Number(l.currentBalance), 0);
  const totalObligationBalance = obligations.reduce((s, o) => s + Number(o.currentBalance), 0);

  // Monthly summary — current month payments
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const loanIds = loans.map(l => l.id);
  const obIds = obligations.map(o => o.id);

  let monthlyPaid = 0;
  if (loanIds.length > 0 || obIds.length > 0) {
    const txs = await txRepo
      .createQueryBuilder('tx')
      .where('tx.createdAt >= :start AND tx.createdAt <= :end', { start: monthStart, end: monthEnd })
      .andWhere('(tx.loanId IN (:...loanIds) OR tx.obligationId IN (:...obIds))', {
        loanIds: loanIds.length > 0 ? loanIds : ['none'],
        obIds: obIds.length > 0 ? obIds : ['none'],
      })
      .getMany();
    monthlyPaid = txs.reduce((s, t) => s + Number(t.amount), 0);
  }

  // Upcoming due dates (next 30 days)
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingLoans = loans.filter(l =>
    l.status === 'active' && l.dueDate && new Date(l.dueDate) >= now && new Date(l.dueDate) <= in30
  );
  const upcomingObs = obligations.filter(o =>
    o.status === 'active' && o.dueDate && new Date(o.dueDate) >= now && new Date(o.dueDate) <= in30
  );
  const overdueLoans = loans.filter(l => l.status === 'active' && l.dueDate && new Date(l.dueDate) < now);
  const overdueObs = obligations.filter(o => o.status === 'active' && o.dueDate && new Date(o.dueDate) < now);

  res.json(ApiResponse.success(200, 'Podsumowanie pobrane', {
    netBalance: totalLoanBalance - totalObligationBalance,
    totalLoanBalance,
    totalObligationBalance,
    activeLoans: loans.filter(l => l.status === 'active').length,
    paidLoans: loans.filter(l => l.status === 'paid').length,
    activeObligations: obligations.filter(o => o.status === 'active').length,
    paidObligations: obligations.filter(o => o.status === 'paid').length,
    monthlyPaid,
    monthName: now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }),
    notifications: [
      ...overdueLoans.map(l => ({ type: 'overdue_loan', id: l.id, name: l.borrowerName, dueDate: l.dueDate, amount: l.currentBalance, currency: l.currency })),
      ...overdueObs.map(o => ({ type: 'overdue_obligation', id: o.id, name: o.creditorName, dueDate: o.dueDate, amount: o.currentBalance, currency: o.currency })),
      ...upcomingLoans.map(l => ({ type: 'upcoming_loan', id: l.id, name: l.borrowerName, dueDate: l.dueDate, amount: l.currentBalance, currency: l.currency })),
      ...upcomingObs.map(o => ({ type: 'upcoming_obligation', id: o.id, name: o.creditorName, dueDate: o.dueDate, amount: o.currentBalance, currency: o.currency })),
    ],
  }));
}));

/**
 * GET /api/summary/export/csv
 * Export all loans + obligations + transactions as CSV
 */
summaryRoutes.get('/export/csv', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  const userId = req.user.id;

  const loanRepo = AppDataSource.getRepository(Loan);
  const obRepo = AppDataSource.getRepository(Obligation);
  const txRepo = AppDataSource.getRepository(Transaction);

  const [loans, obligations] = await Promise.all([
    loanRepo.find({ where: { userId } }),
    obRepo.find({ where: { userId } }),
  ]);

  const loanIds = loans.map(l => l.id);
  const obIds = obligations.map(o => o.id);

  let transactions: Transaction[] = [];
  if (loanIds.length > 0 || obIds.length > 0) {
    transactions = await txRepo
      .createQueryBuilder('tx')
      .where('(tx.loanId IN (:...loanIds) OR tx.obligationId IN (:...obIds))', {
        loanIds: loanIds.length > 0 ? loanIds : ['none'],
        obIds: obIds.length > 0 ? obIds : ['none'],
      })
      .orderBy('tx.createdAt', 'DESC')
      .getMany();
  }

  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows: string[] = [];

  rows.push('=== POŻYCZKI ===');
  rows.push(['ID', 'Dłużnik', 'Kwota oryginalna', 'Saldo', 'Status', 'Waluta', 'Termin', 'Opis', 'Data dodania'].map(esc).join(','));
  loans.forEach(l => rows.push([l.id, l.borrowerName, l.originalAmount, l.currentBalance, l.status, l.currency, l.dueDate ?? '', l.description ?? '', l.createdAt].map(esc).join(',')));

  rows.push('');
  rows.push('=== ZOBOWIĄZANIA ===');
  rows.push(['ID', 'Wierzyciel', 'Kwota oryginalna', 'Saldo', 'Status', 'Waluta', 'Termin', 'Opis', 'Data dodania'].map(esc).join(','));
  obligations.forEach(o => rows.push([o.id, o.creditorName, o.originalAmount, o.currentBalance, o.status, o.currency, o.dueDate ?? '', o.description ?? '', o.createdAt].map(esc).join(',')));

  rows.push('');
  rows.push('=== TRANSAKCJE ===');
  rows.push(['ID', 'Typ', 'Kwota', 'Saldo przed', 'Saldo po', 'Notatka', 'Data'].map(esc).join(','));
  transactions.forEach(t => rows.push([t.id, t.loanId ? 'pożyczka' : 'zobowiązanie', t.amount, t.balanceBefore, t.balanceAfter, t.note ?? '', t.createdAt].map(esc).join(',')));

  const csv = '\uFEFF' + rows.join('\n'); // BOM for Excel UTF-8
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="dluznik-export-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
}));

export default summaryRoutes;
