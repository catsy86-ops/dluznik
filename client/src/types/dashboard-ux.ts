/**
 * Shared TypeScript interfaces for Dashboard UX Improvements
 */

/**
 * Represents an item in the "Recently Viewed" section.
 * Stored in localStorage scoped to the user.
 */
export interface RecentlyViewedItem {
  id: string;
  type: 'loan' | 'obligation';
  name: string; // borrowerName for loans, creditorName for obligations
  balance: number;
  currency: string;
  viewedAt: string; // ISO 8601 timestamp
}

/**
 * Represents a group of loans and obligations aggregated by currency.
 */
export interface CurrencyGroup {
  currency: string;
  netBalance: number; // totalLoanBalance - totalObligationBalance
  totalLoanBalance: number;
  totalObligationBalance: number;
  loans: Array<{ id: string; borrowerName: string; currentBalance: number; currency: string }>;
  obligations: Array<{ id: string; creditorName: string; currentBalance: number; currency: string }>;
}

/**
 * Configuration options for the notification polling hook.
 */
export interface NotificationPollingOptions {
  baseInterval: number; // Default: 60000ms (60s)
  maxInterval: number; // Default: 300000ms (5 min)
  maxRetries: number; // Default: 5
  onAuthError: () => void; // Callback on 401 — redirect to login
}

/**
 * Result returned by the useNotificationPolling hook.
 */
export interface NotificationPollingResult {
  notifications: NotificationItem[];
  count: number;
  isPolling: boolean;
  error: string | null;
}

/**
 * Shape of a single notification item from the API.
 */
export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

/**
 * Response shape from GET /api/notifications.
 */
export interface NotificationResponse {
  count: number;
  notifications: NotificationItem[];
}
