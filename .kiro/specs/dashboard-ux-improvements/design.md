# Design Document: Dashboard UX Improvements

## Overview

This design covers 5 UX improvements for the "Dłużnik" debt management application:

1. **Dashboard Empty State with CTA** — A welcoming empty state when users have no data, guiding them to create their first loan or obligation.
2. **Email Verification at Registration** — Backend token-based email verification flow to prevent fake registrations.
3. **Auto-Refreshing Notifications** — Polling-based notification system that keeps the bell badge up-to-date without page reloads.
4. **Recently Viewed Section** — A dashboard section showing the last 5 items the user interacted with, persisted in localStorage.
5. **Multi-Currency Support on Dashboard** — Proper grouping and display of balances by currency instead of hardcoded PLN.

The implementation spans both the React/TypeScript frontend (Vite + React Router) and the Node.js/Express/TypeORM backend.

## Architecture

```mermaid
graph TD
    subgraph Frontend [React Client]
        Dashboard[DashboardPageNew]
        Layout[Layout - Notifications]
        AuthCtx[AuthContext]
        RVService[RecentlyViewedService]
        NotifHook[useNotificationPolling]
        CurrencyAgg[CurrencyAggregator]
        EmptyState[DashboardEmptyState]
        VerifyPage[EmailVerificationPage]
    end

    subgraph Backend [Express API]
        AuthSvc[AuthService + EmailVerification]
        SummaryRoute[/api/summary - notifications]
        NotifRoute[/api/notifications]
        AuthRoute[/api/auth/verify-email]
    end

    subgraph Storage
        LocalStorage[Browser localStorage]
        DB[(PostgreSQL)]
        EmailSvc[Email Provider - SMTP]
    end

    Dashboard --> EmptyState
    Dashboard --> CurrencyAgg
    Dashboard --> RVService
    Layout --> NotifHook
    NotifHook --> NotifRoute
    AuthCtx --> VerifyPage
    VerifyPage --> AuthRoute
    AuthRoute --> AuthSvc
    AuthSvc --> DB
    AuthSvc --> EmailSvc
    RVService --> LocalStorage
    CurrencyAgg --> SummaryRoute
    SummaryRoute --> DB
```

### Key Architectural Decisions

1. **Notification polling via custom hook** — Rather than WebSockets (which would require infrastructure changes), we use a polling hook with exponential backoff. This fits the existing REST architecture and the 60-second interval is acceptable for payment deadline alerts.

2. **Recently Viewed in localStorage** — No backend storage needed. The data is ephemeral, user-scoped, and small. localStorage provides persistence across refreshes without API overhead.

3. **Currency aggregation on the frontend** — The backend already returns per-item currency data. Aggregation logic lives in a pure utility function on the client, making it easily testable without API calls.

4. **Email verification as middleware guard** — A new `emailVerified` field on the User model, checked by a middleware that intercepts authenticated routes for unverified users.

## Components and Interfaces

### 1. DashboardEmptyState Component

```typescript
// client/src/components/DashboardEmptyState.tsx
interface DashboardEmptyStateProps {
  onNavigateLoans: () => void;
  onNavigateObligations: () => void;
}
```

A presentational component rendered when `loans.length === 0 && obligations.length === 0`. Contains:
- SVG illustration (≥48×48px)
- Descriptive message (≤200 chars)
- Two CTA buttons linking to /loans and /obligations

### 2. useNotificationPolling Hook

```typescript
// client/src/hooks/useNotificationPolling.ts
interface NotificationPollingOptions {
  baseInterval: number;       // 60000ms
  maxInterval: number;        // 300000ms (5 min)
  maxRetries: number;         // 5
  onAuthError: () => void;    // redirect to login
}

interface NotificationPollingResult {
  notifications: Notification[];
  count: number;
  isPolling: boolean;
  error: string | null;
}

function useNotificationPolling(options: NotificationPollingOptions): NotificationPollingResult;
```

Manages:
- Interval-based polling with `setInterval`
- Page Visibility API integration (`document.visibilitychange`)
- Exponential backoff on failure: `min(baseInterval * 2^retryCount, maxInterval)`
- Reset on success
- Stop on 401

### 3. RecentlyViewedService

```typescript
// client/src/services/RecentlyViewedService.ts
interface RecentlyViewedItem {
  id: string;
  type: 'loan' | 'obligation';
  name: string;              // borrowerName or creditorName
  balance: number;
  currency: string;
  viewedAt: string;          // ISO timestamp
}

interface RecentlyViewedService {
  recordView(item: RecentlyViewedItem): void;
  getRecentItems(userId: string, limit?: number): RecentlyViewedItem[];
  getSessionItems(): RecentlyViewedItem[];
  removeItem(id: string): void;
  clear(userId: string): void;
}
```

Storage key pattern: `dluznik_recently_viewed_{userId}`
Session tracking: in-memory Set of item IDs viewed this session.

### 4. CurrencyAggregator Utility

```typescript
// client/src/utils/currencyAggregator.ts
interface CurrencyGroup {
  currency: string;
  netBalance: number;
  totalLoanBalance: number;
  totalObligationBalance: number;
  loans: Loan[];
  obligations: Obligation[];
}

function aggregateByCurrency(loans: Loan[], obligations: Obligation[]): CurrencyGroup[];
function formatCurrency(amount: number, currency: string): string;
function getCurrencyLocale(currency: string): string;
```

### 5. Email Verification Backend

```typescript
// src/models/EmailVerificationToken.ts
interface EmailVerificationToken {
  id: string;
  userId: string;
  token: string;           // crypto.randomBytes(32).toString('hex')
  expiresAt: Date;         // createdAt + 24h
  usedAt: Date | null;
  createdAt: Date;
}

// src/services/EmailVerificationService.ts
interface EmailVerificationService {
  sendVerificationEmail(userId: string, email: string): Promise<void>;
  verifyToken(token: string): Promise<{ success: boolean; userId: string }>;
  resendVerification(userId: string): Promise<void>;
  invalidatePreviousTokens(userId: string): Promise<void>;
  checkRateLimit(userId: string): Promise<{ allowed: boolean; nextAllowedAt: Date | null }>;
}
```

### 6. User Model Extension

```typescript
// Addition to src/models/User.ts
@Column({ type: 'boolean', default: false })
emailVerified!: boolean;

@Column({ type: 'timestamp', nullable: true })
emailVerifiedAt!: Date | null;
```

### 7. Notification Polling Endpoint

```typescript
// GET /api/notifications
// Lightweight endpoint returning only notification count and items
// Separate from /api/summary to avoid heavy aggregation on every poll
interface NotificationResponse {
  count: number;
  notifications: Notification[];
}
```

## Data Models

### EmailVerificationToken (New Table)

| Column     | Type        | Constraints                    |
|-----------|-------------|-------------------------------|
| id        | UUID        | PK                            |
| userId    | UUID        | FK → user.id, NOT NULL        |
| token     | VARCHAR(64) | UNIQUE, NOT NULL              |
| expiresAt | TIMESTAMP   | NOT NULL                      |
| usedAt    | TIMESTAMP   | NULLABLE                      |
| createdAt | TIMESTAMP   | DEFAULT NOW()                 |

### User Table Extension

| Column          | Type      | Default |
|----------------|-----------|---------|
| emailVerified  | BOOLEAN   | false   |
| emailVerifiedAt| TIMESTAMP | NULL    |

### ResendRateLimit (New Table)

| Column     | Type      | Constraints             |
|-----------|-----------|------------------------|
| id        | UUID      | PK                     |
| userId    | UUID      | FK → user.id, NOT NULL |
| requestedAt| TIMESTAMP | NOT NULL              |

### RecentlyViewedItem (localStorage schema)

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "loan | obligation",
      "name": "string",
      "balance": 1000.00,
      "currency": "PLN",
      "viewedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### CurrencyGroup (runtime model)

```typescript
{
  currency: "PLN",
  netBalance: 5000,        // totalLoanBalance - totalObligationBalance
  totalLoanBalance: 8000,
  totalObligationBalance: 3000,
  loans: [...],
  obligations: [...]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Unverified user access restriction

*For any* user whose `emailVerified` field is `false`, and *for any* authenticated route in the application, the system should restrict access and return a verification prompt rather than the requested resource.

**Validates: Requirements 2.2**

### Property 2: Token validity rules

*For any* verification token, the token should be considered valid only if: (a) it is the most recently generated token for that email address, (b) it has not been previously used (`usedAt` is null), and (c) the current time is within 24 hours of its `createdAt` timestamp. If any condition fails, verification should be rejected.

**Validates: Requirements 2.5, 2.9**

### Property 3: Resend rate limiting

*For any* sequence of resend requests from a single user, the system should allow at most 5 requests per rolling hour window, with a minimum interval of 60 seconds between consecutive requests. Any request violating either constraint should be rejected.

**Validates: Requirements 2.6**

### Property 4: Malformed token rejection

*For any* string that does not match the format of a valid verification token (64-character hex string), the verification endpoint should reject the request and return an invalid token error.

**Validates: Requirements 2.8**

### Property 5: Notification badge accuracy

*For any* notification count N returned by the polling endpoint, the bell icon badge should display exactly N (or "9+" when N > 9).

**Validates: Requirements 3.2**

### Property 6: Exponential backoff with cap

*For any* number of consecutive polling failures `n` (where 1 ≤ n ≤ 5), the next retry interval should equal `min(60 * 2^n, 300)` seconds. After 5 consecutive failures, polling should stop entirely.

**Validates: Requirements 3.5**

### Property 7: Recently viewed recording completeness

*For any* loan or obligation item that is viewed, the recorded entry in the recently viewed list should contain: the item's id, type ("loan" or "obligation"), name (borrowerName for loans, creditorName for obligations), current balance, currency, and a valid ISO timestamp.

**Validates: Requirements 4.1**

### Property 8: Recently viewed list invariants

*For any* sequence of view operations on the recently viewed list: (a) the list should never contain duplicate entries (by id), (b) the list should never exceed 20 items, and (c) re-viewing an existing item should move it to index 0 without changing the list length.

**Validates: Requirements 4.2, 4.4**

### Property 9: Recently viewed display ordering

*For any* recently viewed list of N items (where N ≥ 1), the dashboard section should display exactly `min(N, 5)` items ordered by `viewedAt` timestamp descending (newest first).

**Validates: Requirements 4.3**

### Property 10: Recently viewed URL generation

*For any* recently viewed item with type `t` and id `i`, the navigation URL should be `/loans/{i}` when `t === 'loan'` and `/obligations/{i}` when `t === 'obligation'`.

**Validates: Requirements 4.5**

### Property 11: Recently viewed deletion cleanup

*For any* recently viewed list containing item with id `x`, after that item is deleted from the system, the recently viewed list should no longer contain any entry with id `x`.

**Validates: Requirements 4.6**

### Property 12: Currency aggregation correctness

*For any* set of loans and obligations with mixed currencies, the `aggregateByCurrency` function should produce groups where: (a) each group contains only items matching its currency code, (b) `totalLoanBalance` equals the sum of all loan `currentBalance` values in that group, (c) `totalObligationBalance` equals the sum of all obligation `currentBalance` values in that group, and (d) `netBalance` equals `totalLoanBalance - totalObligationBalance`.

**Validates: Requirements 5.1, 5.2**

### Property 13: Per-currency chart data

*For any* set of loans and obligations in multiple currencies, the DonutChart data should contain a separate entry per currency, where each entry's loan and obligation proportions sum to the total for that currency.

**Validates: Requirements 5.5**

### Property 14: Currency locale formatting

*For any* numeric amount and supported currency code, the `formatCurrency` function should use locale `pl-PL` for PLN, `de-DE` for EUR, and `en-US` for USD.

**Validates: Requirements 5.6**

### Property 15: Currency section ordering

*For any* set of currency groups with 2 or more currencies, the displayed sections should be ordered alphabetically by currency code (e.g., EUR before PLN before USD).

**Validates: Requirements 5.7**

## Error Handling

### Frontend Error Handling

| Scenario | Behavior |
|----------|----------|
| Dashboard data fetch fails | Show error message with retry button (not empty state) |
| Notification poll network error | Exponential backoff, max 5 retries |
| Notification poll 401 | Stop polling, redirect to /login |
| localStorage full/unavailable | Gracefully degrade — recently viewed section hidden |
| Invalid recently viewed data in localStorage | Clear corrupted data, start fresh |
| Email verification link expired | Show expiry message + resend button |
| Email verification link malformed | Show "invalid link" message |
| Resend rate limit exceeded | Disable button, show next-allowed time |

### Backend Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Registration with existing email | 200 | Generic "verification sent" (no enumeration) |
| Invalid verification token | 400 | `{ error: "INVALID_TOKEN", message: "Link jest nieprawidłowy" }` |
| Expired verification token | 400 | `{ error: "TOKEN_EXPIRED", message: "Link wygasł" }` |
| Resend rate limited | 429 | `{ error: "RATE_LIMITED", retryAfter: seconds }` |
| Email service failure | 500 | Log error, return generic failure to user |
| Unverified user accessing protected route | 403 | `{ error: "EMAIL_NOT_VERIFIED", message: "Zweryfikuj email" }` |

## Testing Strategy

### Unit Tests (Example-Based)

- **Dashboard Empty State**: Render with zero data → verify empty state shows; render with data → verify standard view shows
- **Loading skeleton**: Verify skeleton renders during loading state
- **Error state**: Mock failed fetch → verify error message and retry button
- **Email verification happy path**: Valid token → email marked verified
- **Expired token handling**: Expired token → appropriate error message
- **Tab visibility**: Simulate visibility change → verify polling pause/resume
- **Single currency mode**: Items in one currency → no grouping headers
- **Session-scoped recently viewed**: New session with localStorage data → section hidden

### Property-Based Tests

Property-based testing is appropriate for this feature because several components involve pure logic with universal properties across varied inputs (currency aggregation, recently viewed list management, rate limiting, token validation, backoff calculation).

**Library**: `fast-check` (already in devDependencies)

**Configuration**: Minimum 100 iterations per property test.

**Tag format**: `Feature: dashboard-ux-improvements, Property {N}: {description}`

Properties to implement:
1. Token validity rules (Property 2)
2. Resend rate limiting (Property 3)
3. Malformed token rejection (Property 4)
4. Notification badge accuracy (Property 5)
5. Exponential backoff (Property 6)
6. Recently viewed recording completeness (Property 7)
7. Recently viewed list invariants (Property 8)
8. Recently viewed display ordering (Property 9)
9. Recently viewed URL generation (Property 10)
10. Recently viewed deletion cleanup (Property 11)
11. Currency aggregation correctness (Property 12)
12. Per-currency chart data (Property 13)
13. Currency locale formatting (Property 14)
14. Currency section ordering (Property 15)

### Integration Tests

- Email sending triggered on registration (mock SMTP)
- Notification polling endpoint returns correct data from DB
- Verification endpoint marks user as verified in DB
- Summary endpoint returns per-currency data correctly

### Test File Structure

```
src/__tests__/
  services/
    EmailVerificationService.test.ts
    EmailVerificationService.property.test.ts
  utils/
    rateLimiter.test.ts
    rateLimiter.property.test.ts

client/src/__tests__/
  utils/
    currencyAggregator.test.ts
    currencyAggregator.property.test.ts
  services/
    recentlyViewedService.test.ts
    recentlyViewedService.property.test.ts
  hooks/
    useNotificationPolling.test.ts
    useNotificationPolling.property.test.ts
  components/
    DashboardEmptyState.test.tsx
```
