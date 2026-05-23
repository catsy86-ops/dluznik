const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkError) {
    throw new Error('Brak połączenia z serwerem. Sprawdź czy backend działa.');
  }

  // Handle empty responses (204 No Content, etc.)
  const contentType = res.headers.get('content-type');
  const hasJson = contentType && contentType.includes('application/json');
  const text = await res.text();

  let data: any = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      return text as unknown as T;
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status} ${res.statusText}`);
  }

  return data?.data ?? data;
}

// Auth
export const authApi = {
  register: (email: string, password: string, confirmPassword: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, confirmPassword }) }),
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<User>('/auth/me'),
  updateProfile: (data: { notificationsEnabled?: boolean; currentPassword?: string; newPassword?: string }) =>
    request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Loans
export const loansApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ loans: Loan[]; total: number; totalPages: number }>(`/loans${q}`);
  },
  get: (id: string) => request<Loan>(`/loans/${id}`),
  create: (data: Partial<Loan>) => request<Loan>('/loans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Loan>) => request<Loan>(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/loans/${id}`, { method: 'DELETE' }),
  payments: (id: string) => request<{ transactions: Transaction[] }>(`/loans/${id}/payments`),
  addPayment: (id: string, amount: number, note?: string) =>
    request(`/loans/${id}/payments`, { method: 'POST', body: JSON.stringify({ amount, note }) }),
  
  // TIER 1 - Payment Scheduler
  getPaymentSchedule: (id: string, months?: number) =>
    request<PaymentScheduleItem[]>(`/loans/${id}/payment-schedule${months ? `?months=${months}` : ''}`),
  
  // TIER 1 - Payment Suggestions
  getPaymentSuggestion: (id: string) =>
    request<PaymentSuggestion>(`/loans/${id}/suggest-payment`),
  
  // TIER 1 - Loan Comparison
  compareLoanS: (ids: string[]) =>
    request<LoanComparisonResult>(`/loans/compare/multiple?ids=${ids.join(',')}`),
  
  // TIER 2 - Interest Breakdown
  getInterestBreakdown: (id: string) =>
    request<InterestBreakdownResponse>(`/loans/${id}/interest-breakdown`),
  getRealTimeAccrual: (id: string) =>
    request<RealTimeAccrualResponse>(`/loans/${id}/interest-accrual`),
  
  // TIER 2 - Health Score
  getHealthScore: (id: string) =>
    request<LoanHealthScoreResponse>(`/loans/${id}/health-score`),
  
  // TIER 3 - Payment Forecasting
  getPaymentForecast: (id: string) =>
    request<PaymentForecastResponse>(`/loans/${id}/forecast`),
  
  // TIER 3 - Payment Rules
  getPaymentRules: (id: string) =>
    request<PaymentRule[]>(`/loans/${id}/rules`),
  getActivePaymentRules: (id: string) =>
    request<PaymentRule[]>(`/loans/${id}/rules/active`),
  getSuggestedRules: (id: string) =>
    request<SuggestedRule[]>(`/loans/${id}/rules/suggested`),
  createPaymentRule: (id: string, rule: CreatePaymentRuleInput) =>
    request<PaymentRule>(`/loans/${id}/rules`, { method: 'POST', body: JSON.stringify(rule) }),
  updatePaymentRule: (ruleId: string, updates: Partial<CreatePaymentRuleInput>) =>
    request<PaymentRule>(`/loans/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deletePaymentRule: (ruleId: string) =>
    request(`/loans/rules/${ruleId}`, { method: 'DELETE' }),
};

// Obligations
export const obligationsApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ obligations: Obligation[]; total: number; totalPages: number }>(`/obligations${q}`);
  },
  get: (id: string) => request<Obligation>(`/obligations/${id}`),
  create: (data: Partial<Obligation>) => request<Obligation>('/obligations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Obligation>) => request<Obligation>(`/obligations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/obligations/${id}`, { method: 'DELETE' }),
  payments: (id: string) => request<{ transactions: Transaction[] }>(`/obligations/${id}/payments`),
  addPayment: (id: string, amount: number, note?: string) =>
    request(`/obligations/${id}/payments`, { method: 'POST', body: JSON.stringify({ amount, note }) }),
};

// Loan Notes
export const loanNotesApi = {
  add: (loanId: string, text: string) =>
    request<LoanNote>(`/loans/${loanId}/notes`, { method: 'POST', body: JSON.stringify({ text }) }),
  list: (loanId: string) =>
    request<{ notes: LoanNote[] }>(`/loans/${loanId}/notes`),
  delete: (loanId: string, noteId: string) =>
    request(`/loans/${loanId}/notes/${noteId}`, { method: 'DELETE' }),
};

// Loan Audit
export const loanAuditApi = {
  list: (loanId: string) =>
    request<{ logs: AuditLog[] }>(`/loans/${loanId}/audit`),
};

// Loan Categories
export const loanCategoryApi = {
  add: (loanId: string, name: string, color?: string) =>
    request<LoanCategory>(`/loans/${loanId}/categories`, { method: 'POST', body: JSON.stringify({ name, color }) }),
  list: (loanId: string) =>
    request<{ categories: LoanCategory[] }>(`/loans/${loanId}/categories`),
  delete: (loanId: string, categoryId: string) =>
    request(`/loans/${loanId}/categories/${categoryId}`, { method: 'DELETE' }),
};

// Loan Recurring
export const loanRecurringApi = {
  create: (loanId: string, amount: number, frequency: string, startDate: string, endDate?: string, description?: string) =>
    request<RecurringPayment>(`/loans/${loanId}/recurring`, { method: 'POST', body: JSON.stringify({ amount, frequency, startDate, endDate, description }) }),
  list: (loanId: string) =>
    request<{ recurring: RecurringPayment[] }>(`/loans/${loanId}/recurring`),
};

// Obligation Notes
export const obligationNotesApi = {
  add: (obligationId: string, text: string) =>
    request<ObligationNote>(`/obligations/${obligationId}/notes`, { method: 'POST', body: JSON.stringify({ text }) }),
  list: (obligationId: string) =>
    request<{ notes: ObligationNote[] }>(`/obligations/${obligationId}/notes`),
  delete: (obligationId: string, noteId: string) =>
    request(`/obligations/${obligationId}/notes/${noteId}`, { method: 'DELETE' }),
};

// Summary
export const summaryApi = {
  get: () => request<Summary>('/summary'),
  exportCsv: () => {
    const token = getToken();
    const a = document.createElement('a');
    a.href = `/api/summary/export/csv`;
    // Use fetch to include auth header
    fetch('/api/summary/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `dluznik-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};

// Tier 1 - Payment Schedule
export const paymentScheduleApi = {
  generate: (loanId: string, months: number = 12) =>
    request<{ schedule: PaymentScheduleItem[] }>(`/loans/${loanId}/payment-schedule?months=${months}`),
};

// Tier 1 - Advanced Search
export interface LoanSearchFilters {
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  searchTerm?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const searchApi = {
  advanced: (filters: LoanSearchFilters) => {
    const q = new URLSearchParams(Object.entries(filters).filter(([,v]) => v !== undefined).map(([k,v]) => [k, String(v)])).toString();
    return request<{ loans: Loan[]; total: number; totalPages: number }>(`/loans/search/advanced?${q}`);
  },
};

// Tier 1 - Payment Suggestion
export const paymentSuggestionApi = {
  get: (loanId: string) =>
    request<PaymentSuggestion>(`/loans/${loanId}/suggest-payment`),
};

// Tier 1 - Loan Comparison
export const loanComparisonApi = {
  compare: (loanIds: string[]) =>
    request<{ loans: LoanComparison[] }>(`/loans/compare/multiple?ids=${loanIds.join(',')}`),
};

// Tier 2 - Interest Breakdown
export const interestBreakdownApi = {
  get: (loanId: string) =>
    request<InterestBreakdown>(`/loans/${loanId}/interest-breakdown`),
  getAccrual: (loanId: string) =>
    request<{ accrued: number; projected: number }>(`/loans/${loanId}/interest-accrual`),
};

// Tier 2 - Health Score
export const healthScoreApi = {
  get: (loanId: string) =>
    request<LoanHealthScore>(`/loans/${loanId}/health-score`),
};

// Tier 3 - Forecasting
export const forecastApi = {
  get: (loanId: string) =>
    request<PaymentForecast>(`/loans/${loanId}/forecast`),
};

// Tier 3 - Payment Rules
export const paymentRulesApi = {
  create: (loanId: string, rule: PaymentRuleInput) =>
    request<PaymentRule>(`/loans/${loanId}/rules`, { method: 'POST', body: JSON.stringify(rule) }),
  list: (loanId: string) =>
    request<{ rules: PaymentRule[] }>(`/loans/${loanId}/rules`),
  listActive: (loanId: string) =>
    request<{ rules: PaymentRule[] }>(`/loans/${loanId}/rules/active`),
  suggested: (loanId: string) =>
    request<{ suggestions: PaymentRuleSuggestion[] }>(`/loans/${loanId}/rules/suggested`),
  update: (ruleId: string, updates: Partial<PaymentRuleInput>) =>
    request<PaymentRule>(`/loans/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (ruleId: string) =>
    request(`/loans/rules/${ruleId}`, { method: 'DELETE' }),
};

// Types
export interface User {
  id: string;
  email: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  borrowerName: string;
  originalAmount: number;
  currentBalance: number;
  status: 'active' | 'paid' | 'overdue';
  dueDate?: string;
  description?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Obligation {
  id: string;
  userId: string;
  creditorName: string;
  originalAmount: number;
  currentBalance: number;
  status: 'active' | 'paid' | 'overdue';
  dueDate?: string;
  description?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

export interface Notification {
  type: 'overdue_loan' | 'overdue_obligation' | 'upcoming_loan' | 'upcoming_obligation';
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  currency: string;
}

export interface Summary {
  netBalance: number;
  totalLoanBalance: number;
  totalObligationBalance: number;
  activeLoans: number;
  paidLoans: number;
  activeObligations: number;
  paidObligations: number;
  monthlyPaid: number;
  monthName: string;
  notifications: Notification[];
}

export interface LoanNote {
  id: string;
  loanId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface ObligationNote {
  id: string;
  obligationId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'loan' | 'obligation' | 'transaction';
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  field: string | null;
  reason: string | null;
  createdAt: string;
}

export interface LoanCategory {
  id: string;
  loanId: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface ObligationCategory {
  id: string;
  obligationId: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface RecurringPayment {
  id: string;
  loanId?: string;
  obligationId?: string;
  amount: number;
  frequency: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  isActive: boolean;
  nextPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tier 1-3 New Types
export interface PaymentScheduleItem {
  month: number;
  date: string;
  suggestedPayment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  percentageMilestone: number;
}

export interface PaymentSuggestion {
  loanId: string;
  minimumPayment: number;
  minimumPaymentMessage: string;
  recommendedPayment: number;
  recommendedMessage: string;
  fullPaymentOption: number;
  interestSavings: number;
  interestSavingsMessage: string;
}

export interface LoanComparisonItem {
  id: string;
  borrowerName: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  interestType: string;
  status: string;
  currency: string;
  dueDate?: Date;
  percentagePaid: number;
  percentageRemaining: number;
  daysToOverdue: number;
  monthlyInterest: number;
  totalInterestAccrued: number;
  estimatedPayoffDays: number;
}

export interface LoanComparisonResult {
  loans: LoanComparisonItem[];
  summary: {
    totalLoans: number;
    totalOriginalAmount: number;
    totalCurrentBalance: number;
    averageInterestRate: number;
    highestInterestRate: number;
    lowestInterestRate: number;
    mostUrgent: string | null;
    closestToDueDate: string | null;
  };
  comparisonDate: string;
}

export interface InterestProjection {
  months: number;
  projectedInterest: number;
  projectedBalance: number;
}

export interface InterestBreakdownResponse {
  loanId: string;
  originalBalance: number;
  paymentsMade: number;
  currentBalance: number;
  interestAccrued: number;
  interestRate: number;
  interestType: string;
  monthlyInterest: number;
  principalPercentage: number;
  interestPercentage: number;
  pieChart: {
    principal: { label: string; value: number; percentage: number; color: string };
    interest: { label: string; value: number; percentage: number; color: string };
  };
  projections: InterestProjection[];
  timelineMessage: string;
}

export interface RealTimeAccrualResponse {
  loanId: string;
  currentBalance: number;
  interestRate: number;
  dailyInterest: number;
  weeklyInterest: number;
  monthlyInterest: number;
  yearlyInterest: number;
  daysSinceLastPayment: number;
  accruedSinceLastPayment: number;
  breakEvenPayment: number;
  accrualMessage: string;
  lastUpdated: string;
}

export interface LoanHealthScoreResponse {
  loanId: string;
  score: number;
  status: 'healthy' | 'fair' | 'atrisk' | 'critical';
  color: string;
  components: {
    overdue: { score: number; weight: number; label: string; daysToOverdue: number; message: string };
    balance: { score: number; weight: number; label: string; percentageRemaining: number; message: string };
    velocity: { score: number; weight: number; label: string; paymentVelocity: number; message: string };
  };
  progressRing: { score: number; maxScore: number; circumference: number; offset: number };
  recommendations: string[];
  summary: string;
}

export interface PaymentForecastResponse {
  loanId: string;
  currentBalance: number;
  completionDate: string | null;
  daysToPayoff: number;
  confidence: 'low' | 'medium' | 'high';
  optimisticDate: string | null;
  pesimisticDate: string | null;
  optimisticDays: number;
  pesimisticDays: number;
  paymentHistory: {
    totalPayments: number;
    averagePayment: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
    standardDeviation: number;
    lastPaymentAmount: number | null;
    lastPaymentDate: string | null;
  };
  overdueAlert: string | null;
  recommendations: string[];
}

export interface CreatePaymentRuleInput {
  type: string;
  trigger: string;
  action: string;
  amount?: number;
  percentage?: number;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface SuggestedRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  action: string;
  amount?: number;
  percentage?: number;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
}
