# Implementation Plan: Dashboard UX Improvements

## Overview

This plan implements 5 UX improvements for the Dłużnik application: Dashboard Empty State with CTA, Email Verification at Registration, Auto-Refreshing Notifications, Recently Viewed Section, and Multi-Currency Support on Dashboard. Tasks are ordered to build foundational pieces first (models, services, utilities) then wire them into the UI.

## Tasks

- [x] 1. Set up project structure and shared interfaces
  - [x] 1.1 Create shared TypeScript interfaces and types for the feature
    - Create `client/src/types/dashboard-ux.ts` with interfaces: `RecentlyViewedItem`, `CurrencyGroup`, `NotificationPollingOptions`, `NotificationPollingResult`, `NotificationResponse`
    - Create `src/models/EmailVerificationToken.ts` TypeORM entity with columns: id, userId, token, expiresAt, usedAt, createdAt
    - Create `src/models/ResendRateLimit.ts` TypeORM entity with columns: id, userId, requestedAt
    - Add `emailVerified: boolean` and `emailVerifiedAt: Date | null` fields to existing `src/models/User.ts`
    - _Requirements: 2.1, 2.5, 3.1, 4.1, 5.1_

  - [x] 1.2 Create database migration for email verification tables and user extension
    - Add migration that creates `email_verification_token` table and `resend_rate_limit` table
    - Add migration that adds `emailVerified` (default false) and `emailVerifiedAt` columns to `user` table
    - _Requirements: 2.1, 2.5, 2.6_

- [x] 2. Implement Email Verification backend
  - [x] 2.1 Implement EmailVerificationService
    - Create `src/services/EmailVerificationService.ts` with methods: `sendVerificationEmail`, `verifyToken`, `resendVerification`, `invalidatePreviousTokens`, `checkRateLimit`
    - Token generation using `crypto.randomBytes(32).toString('hex')`
    - Token expiry set to 24 hours from creation
    - Invalidate previous tokens on resend
    - Rate limiting: max 5 per hour, min 60s between requests
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9_

  - [ ]* 2.2 Write property tests for token validity rules
    - **Property 2: Token validity rules**
    - **Validates: Requirements 2.5, 2.9**

  - [ ]* 2.3 Write property tests for resend rate limiting
    - **Property 3: Resend rate limiting**
    - **Validates: Requirements 2.6**

  - [ ]* 2.4 Write property tests for malformed token rejection
    - **Property 4: Malformed token rejection**
    - **Validates: Requirements 2.8**

  - [x] 2.5 Implement email verification API routes
    - Create `POST /api/auth/verify-email` endpoint that validates token and marks user verified
    - Create `POST /api/auth/resend-verification` endpoint with rate limiting
    - Modify registration route to trigger verification email on signup
    - Return generic message for already-registered emails (no enumeration)
    - _Requirements: 2.1, 2.3, 2.4, 2.7, 2.8_

  - [x] 2.6 Implement email verification middleware
    - Create middleware that checks `emailVerified` on authenticated routes
    - Return 403 with `EMAIL_NOT_VERIFIED` error for unverified users
    - Exclude verification-related routes from the check
    - _Requirements: 2.2_

  - [ ]* 2.7 Write unit tests for EmailVerificationService
    - Test happy path: valid token → email marked verified
    - Test expired token handling
    - Test already-used token rejection
    - Test rate limit enforcement
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Checkpoint - Email verification backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Currency Aggregator utility
  - [x] 4.1 Create currencyAggregator utility
    - Create `client/src/utils/currencyAggregator.ts` with functions: `aggregateByCurrency`, `formatCurrency`, `getCurrencyLocale`
    - Group loans and obligations by ISO 4217 currency code
    - Calculate netBalance, totalLoanBalance, totalObligationBalance per group
    - Format using correct locale: PLN→pl-PL, EUR→de-DE, USD→en-US
    - Sort groups alphabetically by currency code
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_

  - [ ]* 4.2 Write property tests for currency aggregation correctness
    - **Property 12: Currency aggregation correctness**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 4.3 Write property tests for currency locale formatting
    - **Property 14: Currency locale formatting**
    - **Validates: Requirements 5.6**

  - [ ]* 4.4 Write property tests for currency section ordering
    - **Property 15: Currency section ordering**
    - **Validates: Requirements 5.7**

- [x] 5. Implement RecentlyViewedService
  - [x] 5.1 Create RecentlyViewedService
    - Create `client/src/services/RecentlyViewedService.ts` implementing the interface from design
    - Storage key pattern: `dluznik_recently_viewed_{userId}`
    - Max 20 items persisted, deduplication by id, move-to-top on re-view
    - Session tracking via in-memory Set of item IDs viewed this session
    - Graceful degradation when localStorage unavailable
    - Clear corrupted data on parse failure
    - _Requirements: 4.1, 4.2, 4.4, 4.6_

  - [ ]* 5.2 Write property tests for recently viewed list invariants
    - **Property 8: Recently viewed list invariants**
    - **Validates: Requirements 4.2, 4.4**

  - [ ]* 5.3 Write property tests for recently viewed recording completeness
    - **Property 7: Recently viewed recording completeness**
    - **Validates: Requirements 4.1**

  - [ ]* 5.4 Write property tests for recently viewed display ordering
    - **Property 9: Recently viewed display ordering**
    - **Validates: Requirements 4.3**

  - [ ]* 5.5 Write property tests for recently viewed URL generation
    - **Property 10: Recently viewed URL generation**
    - **Validates: Requirements 4.5**

  - [ ]* 5.6 Write property tests for recently viewed deletion cleanup
    - **Property 11: Recently viewed deletion cleanup**
    - **Validates: Requirements 4.6**

- [x] 6. Checkpoint - Services and utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement useNotificationPolling hook
  - [x] 7.1 Create useNotificationPolling hook
    - Create `client/src/hooks/useNotificationPolling.ts`
    - Implement interval-based polling at 60s base interval
    - Integrate Page Visibility API: pause on hidden, immediate poll + resume on visible
    - Exponential backoff on failure: `min(baseInterval * 2^retryCount, maxInterval)`
    - Stop polling after 5 consecutive failures
    - Reset interval and retry counter on success
    - Stop polling and trigger auth error callback on 401
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 7.2 Create notification polling API endpoint
    - Create `GET /api/notifications` lightweight endpoint
    - Return `{ count, notifications }` without heavy summary aggregation
    - _Requirements: 3.1, 3.2_

  - [ ]* 7.3 Write property tests for notification badge accuracy
    - **Property 5: Notification badge accuracy**
    - **Validates: Requirements 3.2**

  - [ ]* 7.4 Write property tests for exponential backoff with cap
    - **Property 6: Exponential backoff with cap**
    - **Validates: Requirements 3.5**

- [x] 8. Implement Dashboard Empty State component
  - [x] 8.1 Create DashboardEmptyState component
    - Create `client/src/components/DashboardEmptyState.tsx`
    - Include SVG illustration (≥48×48px)
    - Display descriptive message (≤200 chars) about tracking loans and obligations
    - Two CTA buttons: one navigating to /loans, one navigating to /obligations
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [ ]* 8.2 Write unit tests for DashboardEmptyState component
    - Test rendering with correct CTA buttons and navigation
    - Test SVG illustration presence and minimum size
    - Test message length constraint
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

- [x] 9. Implement Email Verification frontend
  - [x] 9.1 Create EmailVerificationPage component
    - Create `client/src/pages/EmailVerificationPage.tsx`
    - Handle token from URL query parameter
    - Show success state on valid verification
    - Show expiry message + resend button for expired tokens
    - Show "invalid link" message for malformed tokens
    - _Requirements: 2.3, 2.4, 2.8_

  - [x] 9.2 Create verification prompt component and integrate with AuthContext
    - Create component shown to unverified users on authenticated routes
    - Include "Wyślij ponownie" resend button with rate limit handling
    - Disable button when rate limit reached, show next-allowed time
    - Integrate `emailVerified` state into AuthContext
    - _Requirements: 2.2, 2.6_

- [x] 10. Wire features into Dashboard and Layout
  - [x] 10.1 Integrate Empty State into DashboardPageNew
    - Add conditional rendering: show empty state when loans.length === 0 && obligations.length === 0
    - Show loading skeleton during data fetch
    - Show error message with retry button on fetch failure
    - Ensure standard view shows when data exists
    - _Requirements: 1.1, 1.5, 1.7, 1.8_

  - [x] 10.2 Integrate Multi-Currency display into DashboardPageNew
    - Replace hardcoded PLN display with currency-grouped summaries
    - Show separate balance summary per currency when multiple currencies exist
    - Show single currency view without grouping headers when only one currency
    - Update DonutChart to show per-currency breakdown
    - Order currency sections alphabetically
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 10.3 Write property tests for per-currency chart data
    - **Property 13: Per-currency chart data**
    - **Validates: Requirements 5.5**

  - [x] 10.4 Integrate Recently Viewed section into DashboardPageNew
    - Add "Ostatnio oglądane" section showing up to 5 items, newest first
    - Display item name, type label ("Pożyczka"/"Zobowiązanie"), balance, and currency
    - Navigate to detail page on click
    - Hide section if no items viewed in current session
    - _Requirements: 4.3, 4.5, 4.7, 4.8_

  - [x] 10.5 Integrate notification polling into Layout
    - Wire `useNotificationPolling` hook into Layout component
    - Update bell icon badge count from polling result
    - Display "9+" when count exceeds 9
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 10.6 Record recently viewed items on detail page navigation
    - Modify LoanDetailPage and ObligationsPage (or equivalent detail pages) to call `RecentlyViewedService.recordView` on mount
    - Remove deleted items from recently viewed list when deletion occurs
    - _Requirements: 4.1, 4.2, 4.6_

- [x] 11. Integrate Email Verification routes and navigation
  - [x] 11.1 Add email verification routes to React Router
    - Add `/verify-email` route pointing to EmailVerificationPage
    - Add route guard for unverified users showing verification prompt
    - _Requirements: 2.2, 2.3_

- [x] 12. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout (React + Vite frontend, Node.js + Express backend)
- fast-check is used for property-based testing
- localStorage is used for recently viewed persistence (no backend needed)
- Notification polling uses REST (no WebSocket infrastructure changes required)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "4.1", "5.1", "7.2", "8.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "4.2", "4.3", "4.4", "5.2", "5.3", "5.4", "5.5", "5.6", "7.1", "8.2"] },
    { "id": 4, "tasks": ["2.6", "2.7", "7.3", "7.4", "9.1"] },
    { "id": 5, "tasks": ["9.2", "10.1", "10.2", "10.4", "10.5"] },
    { "id": 6, "tasks": ["10.3", "10.6", "11.1"] }
  ]
}
```
