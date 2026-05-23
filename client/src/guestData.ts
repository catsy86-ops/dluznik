/**
 * Demo data for guest mode (read-only)
 * Realistic sample data to showcase the app
 */

import type { Loan, Transaction } from './api';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

export const GUEST_LOANS: Loan[] = [
  {
    id: 'guest-loan-1',
    userId: 'guest',
    borrowerName: 'Jan Kowalski',
    originalAmount: 5000,
    currentBalance: 3200,
    status: 'active',
    dueDate: daysFromNow(45),
    description: 'Pożyczka na remont mieszkania',
    currency: 'PLN',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },
  {
    id: 'guest-loan-2',
    userId: 'guest',
    borrowerName: 'Maria Nowak',
    originalAmount: 2000,
    currentBalance: 2000,
    status: 'active',
    dueDate: daysFromNow(-5), // overdue
    description: 'Pożyczka na samochód',
    currency: 'PLN',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
  },
  {
    id: 'guest-loan-3',
    userId: 'guest',
    borrowerName: 'Piotr Lewandowski',
    originalAmount: 1500,
    currentBalance: 0,
    status: 'paid',
    dueDate: daysAgo(10),
    description: 'Pożyczka na wakacje',
    currency: 'PLN',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(10),
  },
  {
    id: 'guest-loan-4',
    userId: 'guest',
    borrowerName: 'Anna Wiśniewska',
    originalAmount: 8000,
    currentBalance: 5500,
    status: 'active',
    dueDate: daysFromNow(120),
    description: 'Pożyczka biznesowa',
    currency: 'PLN',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: 'guest-loan-5',
    userId: 'guest',
    borrowerName: 'Tomasz Wójcik',
    originalAmount: 3000,
    currentBalance: 1200,
    status: 'active',
    dueDate: daysFromNow(20),
    description: 'Pożyczka na sprzęt',
    currency: 'EUR',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(3),
  },
];

export const GUEST_TRANSACTIONS: Record<string, Transaction[]> = {
  'guest-loan-1': [
    { id: 'tx-1', amount: 1000, balanceBefore: 5000, balanceAfter: 4000, note: 'Pierwsza rata', createdAt: daysAgo(60) },
    { id: 'tx-2', amount: 800, balanceBefore: 4000, balanceAfter: 3200, note: 'Druga rata', createdAt: daysAgo(30) },
  ],
  'guest-loan-2': [],
  'guest-loan-3': [
    { id: 'tx-3', amount: 500, balanceBefore: 1500, balanceAfter: 1000, note: 'Rata 1', createdAt: daysAgo(90) },
    { id: 'tx-4', amount: 500, balanceBefore: 1000, balanceAfter: 500, note: 'Rata 2', createdAt: daysAgo(60) },
    { id: 'tx-5', amount: 500, balanceBefore: 500, balanceAfter: 0, note: 'Ostatnia rata', createdAt: daysAgo(10) },
  ],
  'guest-loan-4': [
    { id: 'tx-6', amount: 2500, balanceBefore: 8000, balanceAfter: 5500, note: 'Częściowa spłata', createdAt: daysAgo(5) },
  ],
  'guest-loan-5': [
    { id: 'tx-7', amount: 900, balanceBefore: 3000, balanceAfter: 2100, note: 'Rata 1', createdAt: daysAgo(30) },
    { id: 'tx-8', amount: 900, balanceBefore: 2100, balanceAfter: 1200, note: 'Rata 2', createdAt: daysAgo(3) },
  ],
};
