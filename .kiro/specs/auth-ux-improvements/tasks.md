# Implementation Plan: Authentication UX Improvements

## Overview

This implementation plan breaks down the 10 authentication UX improvements into discrete coding tasks. The implementation follows a progressive approach: starting with foundational components and hooks, then building feature-specific implementations, and finally integrating everything together. Each task builds incrementally on previous work to ensure continuous validation.

## Tasks

- [x] 1. Set up project structure and shared utilities
  - Create directory structure for auth components and hooks
  - Set up TypeScript interfaces for auth-related types
  - Create shared validation utilities and error formatters
  - Configure testing framework for auth components
  - _Requirements: All requirements (foundation)_

- [x] 2. Implement password input component with show/hide toggle
  - [x] 2.1 Create PasswordInput component with visibility toggle
    - Implement password field with type switching (password/text)
    - Add eye/eye-slash icon button positioned within input field
    - Implement keyboard navigation (Tab, Enter, Space)
    - Add ARIA labels for accessibility
    - Style with focus indicators (3:1 contrast ratio)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  
  - [ ]* 2.2 Write unit tests for PasswordInput component
    - Test visibility toggle functionality
    - Test keyboard navigation
    - Test ARIA attributes
    - Test default masked state
    - _Requirements: 1.1-1.9_

- [x] 3. Implement real-time password validation
  - [x] 3.1 Create usePasswordValidation hook
    - Implement password strength calculation logic
    - Calculate strength score based on 5 requirements (length, uppercase, lowercase, number, special)
    - Return validation state with requirements checklist
    - Implement debouncing (300ms delay)
    - Enforce 128 character maximum
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.10, 2.11_
  
  - [ ]* 3.2 Write unit tests for usePasswordValidation hook
    - Test weak password detection (< 3 requirements)
    - Test medium password detection (3-4 requirements)
    - Test strong password detection (all 5 requirements)
    - Test 128 character maximum enforcement
    - _Requirements: 2.1-2.11_
  
  - [x] 3.3 Create PasswordStrengthIndicator component
    - Display strength label (Słabe/Średnie/Silne) with color coding
    - Render requirements checklist with checkmark/circle icons
    - Display visual progress bar (0-100%)
    - Integrate with usePasswordValidation hook
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 2.9_
  
  - [x] 3.4 Integrate password validation into Registration form
    - Add PasswordStrengthIndicator to registration form
    - Disable submit button when password strength is "Słabe"
    - _Requirements: 2.7_

- [x] 4. Implement email validation with typo detection
  - [x] 4.1 Create useEmailValidation hook
    - Implement RFC 5322 email format validation
    - Implement typo detection using Levenshtein distance algorithm
    - Support popular domains (gmail.com, yahoo.com, outlook.com, etc.)
    - Implement debouncing (500ms on input, 200ms on blur)
    - Return validation state with error and suggestion
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.11_
  
  - [ ]* 4.2 Write unit tests for useEmailValidation hook
    - Test RFC 5322 compliant email validation
    - Test typo detection for popular domains
    - Test valid non-popular domains acceptance
    - Test invalid email format rejection
    - _Requirements: 6.1-6.12_
  
  - [x] 4.3 Create EmailInput component
    - Implement email field with real-time validation
    - Display error messages below field (red, 4.5:1 contrast)
    - Display typo suggestions with clickable link
    - Display green checkmark icon for valid emails
    - Handle suggestion acceptance
    - Clear suggestions on user input
    - _Requirements: 6.3, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.12_

- [x] 5. Implement Remember Me functionality
  - [x] 5.1 Add Remember Me checkbox to Login form
    - Create checkbox component with label "Zapamiętaj mnie"
    - Implement keyboard accessibility (Space key toggle)
    - Persist checkbox state across page refreshes
    - Set default state to unchecked
    - Retain state on login failure
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8_
  
  - [ ] 5.2 Update TokenService to support extended sessions
    - Modify JWT generation to accept rememberMe parameter
    - Issue 30-day tokens when rememberMe is true
    - Issue 24-hour tokens when rememberMe is false
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 5.3 Write unit tests for TokenService
    - Test 24-hour token generation (rememberMe false)
    - Test 30-day token generation (rememberMe true)
    - _Requirements: 3.2, 3.3_
  
  - [ ] 5.4 Implement session expiration handling
    - Redirect to login page on token expiration
    - Display session expired message
    - Clear token on explicit logout
    - _Requirements: 3.5, 3.9_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement forgot password flow
  - [ ] 7.1 Create password reset request page
    - Create form with email input field
    - Add "Zapomniałeś hasła?" link to Login form
    - Display success message after submission
    - Handle invalid email format errors
    - _Requirements: 4.1, 4.10_
  
  - [ ] 7.2 Implement PasswordResetService backend
    - Create password_reset_tokens database table
    - Implement cryptographically secure token generation
    - Set 1-hour expiration for reset tokens
    - Invalidate previous tokens when generating new one
    - Send reset email regardless of email existence (prevent enumeration)
    - _Requirements: 4.2, 4.3, 4.4, 4.9_
  
  - [ ]* 7.3 Write unit tests for PasswordResetService
    - Test cryptographically secure token generation
    - Test 1-hour expiration time
    - Test invalidation of previous tokens
    - _Requirements: 4.4, 4.9_
  
  - [ ] 7.4 Implement rate limiting for password reset
    - Create rate_limits database table
    - Implement rate limiting (3 requests per hour per email)
    - Display rate limit error with remaining time
    - _Requirements: 4.8, 4.11_
  
  - [ ]* 7.5 Write unit tests for RateLimitService
    - Test 3 requests per hour limit
    - Test limit reset after 1 hour window
    - _Requirements: 4.8, 4.11_
  
  - [ ] 7.6 Create password reset confirmation page
    - Verify reset token validity on page load
    - Display password change form with validation
    - Implement password strength validation (reuse from Requirement 2)
    - Handle token expiration and invalid token errors
    - Redirect to login with success message after password update
    - _Requirements: 4.5, 4.6, 4.7, 4.12_
  
  - [ ] 7.7 Integrate EmailService for sending reset emails
    - Configure Nodemailer with SMTP settings
    - Create email template for password reset
    - Send reset email within 60 seconds of request
    - _Requirements: 4.2_

- [x] 8. Implement autocomplete and autofocus improvements
  - [x] 8.1 Update Login form with autocomplete attributes
    - Set email field: type="email", autocomplete="email"
    - Set password field: type="password", autocomplete="current-password"
    - Wrap form in form element with autocomplete="on"
    - Add autofocus to email field (100ms timeout)
    - Add Enter key submit handler
    - _Requirements: 5.1, 5.2, 5.6, 5.8, 5.9, 5.10_
  
  - [x] 8.2 Update Registration form with autocomplete attributes
    - Set email field: type="email", autocomplete="email"
    - Set password field: type="password", autocomplete="new-password"
    - Set confirm password field: type="password", autocomplete="new-password"
    - Wrap form in form element with autocomplete="on"
    - Add autofocus to email field (100ms timeout)
    - Add Enter key submit handler
    - Handle autofocus failure gracefully
    - _Requirements: 5.3, 5.4, 5.5, 5.7, 5.8, 5.9, 5.10_

- [ ] 9. Implement OAuth social login
  - [ ] 9.1 Set up OAuth backend infrastructure
    - Install and configure Passport.js
    - Create OAuth routes for Google, Facebook, Apple
    - Implement OAuth callback handlers
    - Store OAuth provider identifier and user ID in database
    - Extend users table with oauth_provider, oauth_provider_id, profile_picture_url columns
    - _Requirements: 7.2, 7.6_
  
  - [ ] 9.2 Implement OAuthService backend logic
    - Exchange authorization code for user profile
    - Handle existing user login (match by email)
    - Handle new user registration (set emailVerified to true)
    - Request minimum required scopes (email, basic profile)
    - Handle missing email error
    - Handle invalid/expired authorization code
    - Handle account creation failures
    - Handle provider timeout (30 seconds)
    - _Requirements: 7.3, 7.4, 7.5, 7.8, 7.9, 7.10, 7.11, 7.12_
  
  - [ ] 9.3 Create OAuthButtons component
    - Render three provider buttons (Google, Facebook, Apple)
    - Implement redirect to OAuth provider authorization page
    - Handle OAuth success callback (issue Session_Token)
    - Handle OAuth failure/cancellation
    - Display loading states during authentication
    - _Requirements: 7.1, 7.2, 7.7_
  
  - [ ] 9.4 Integrate OAuthButtons into Login form
    - Add OAuth buttons below standard login form
    - _Requirements: 7.1_
  
  - [ ]* 9.5 Write integration tests for OAuth flow
    - Test successful OAuth authentication
    - Test new user registration via OAuth
    - Test OAuth cancellation handling
    - Test missing email error handling
    - _Requirements: 7.1-7.12_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement error message formatting
  - [x] 11.1 Create ErrorMessageFormatter utility
    - Map error codes to user-friendly Polish messages
    - Implement error priority ordering (network > server > rate limiting > validation)
    - Format rate limit errors with remaining time
    - _Requirements: 8.1-8.12_
  
  - [ ]* 11.2 Write unit tests for ErrorMessageFormatter
    - Test rate limit error formatting with remaining time
    - Test error priority ordering
    - _Requirements: 8.11_
  
  - [x] 11.3 Integrate error messages into Login form
    - Display incorrect credentials error
    - Display network error
    - Display server error
    - Display rate limit error
    - Display empty fields error
    - Clear errors on field modification
    - Style with warning icon and 3:1 contrast background
    - Use red text with 4.5:1 contrast
    - _Requirements: 8.1, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.12_
  
  - [x] 11.4 Integrate error messages into Registration form
    - Display email already exists error
    - Display weak password error
    - Display passwords mismatch error
    - Display network error
    - Display server error
    - Display empty fields error
    - Clear errors on field modification
    - Style with warning icon and 3:1 contrast background
    - Use red text with 4.5:1 contrast
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.9, 8.10, 8.12_

- [ ] 12. Implement registration progress bar
  - [ ] 12.1 Create ProgressBar component
    - Display 3 steps: "Dane konta", "Weryfikacja email", "Gotowe"
    - Highlight active step with 3:1 contrast and bold text (font-weight 600+)
    - Display completed steps with checkmark icons
    - Display future steps with 50% opacity
    - Implement responsive layout (horizontal ≥768px, vertical <768px)
    - Prevent navigation to incomplete steps
    - Allow navigation back to completed steps
    - _Requirements: 9.1, 9.2, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_
  
  - [ ] 12.2 Integrate ProgressBar into Registration flow
    - Display progress bar on registration form (step 1)
    - Advance to step 2 after successful form submission
    - Display email verification prompt on step 2
    - Advance to step 3 after email verification
    - Display success message and dashboard button on step 3
    - Handle verification failure (remain on step 2)
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 12.3 Write unit tests for ProgressBar component
    - Test step highlighting
    - Test completed step checkmarks
    - Test future step opacity
    - Test navigation prevention
    - _Requirements: 9.1-9.11_

- [ ] 13. Implement biometric authentication
  - [ ] 13.1 Set up WebAuthn backend infrastructure
    - Install @simplewebauthn/server package
    - Create biometric_credentials database table
    - Create biometric routes for registration and authentication
    - _Requirements: 10.3_
  
  - [ ] 13.2 Implement BiometricService backend
    - Generate registration options (PublicKeyCredentialCreationOptions)
    - Verify registration credential and store in database
    - Generate authentication options (PublicKeyCredentialRequestOptions)
    - Verify authentication credential signature
    - Issue Session_Token on successful authentication
    - Support platform authenticators with user verification required
    - Enforce maximum 5 credentials per user
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.7, 10.12_
  
  - [ ] 13.3 Create useBiometric hook
    - Check WebAuthn API support and OS-level biometric enrollment
    - Implement biometric registration flow
    - Implement biometric authentication flow
    - Handle authentication success (return token and user)
    - Handle authentication failure/cancellation
    - Handle network errors during verification
    - Handle server verification failures
    - _Requirements: 10.2, 10.4, 10.6, 10.10, 10.11_
  
  - [ ] 13.4 Create BiometricButton component
    - Conditionally render based on WebAuthn support and device capabilities
    - Display "Zaloguj biometrycznie" button
    - Trigger native biometric prompt on click
    - Display loading state during authentication
    - Handle success and error callbacks
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ] 13.5 Integrate BiometricButton into Login form
    - Add biometric button to login form
    - Hide button when WebAuthn not supported or no biometric authenticators
    - _Requirements: 10.1, 10.9_
  
  - [ ] 13.6 Implement biometric credential management
    - Create profile settings page section for biometric credentials
    - Display list of registered credentials with names and last used dates
    - Implement credential removal functionality
    - _Requirements: 10.8_
  
  - [ ]* 13.7 Write integration tests for biometric authentication
    - Test registration flow with mocked WebAuthn API
    - Test authentication flow with mocked WebAuthn API
    - Test credential verification
    - Test maximum credentials enforcement
    - _Requirements: 10.1-10.12_

- [ ] 14. Final integration and testing
  - [ ] 14.1 Wire all components together
    - Integrate all components into Login page
    - Integrate all components into Registration page
    - Ensure all features work together cohesively
    - Test complete user flows end-to-end
    - _Requirements: All requirements_
  
  - [ ]* 14.2 Write E2E tests for complete authentication flows
    - Test complete registration flow with all features
    - Test complete login flow with all features
    - Test password reset flow end-to-end
    - Test OAuth login flow end-to-end
    - Test biometric authentication flow end-to-end
    - _Requirements: All requirements_
  
  - [ ] 14.3 Perform accessibility audit
    - Verify WCAG 2.1 AA compliance
    - Test keyboard navigation across all forms
    - Test screen reader compatibility
    - Verify contrast ratios (3:1 for UI components, 4.5:1 for text)
    - _Requirements: 1.6, 1.7, 1.8, 3.6, 8.8, 8.12, 9.7_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Unit tests validate specific logic and edge cases
- Integration tests validate API endpoints with real database
- E2E tests validate complete user flows
- The implementation uses TypeScript for both frontend (React) and backend (Node.js with Express)
- All components follow accessibility best practices (WCAG 2.1 AA)
- OAuth integration requires provider-specific API credentials (Google, Facebook, Apple)
- Biometric authentication requires HTTPS in production
- Email service requires SMTP configuration

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3", "4.2", "4.3", "5.1"] },
    { "id": 3, "tasks": ["3.4", "5.2", "5.3", "7.1", "7.2"] },
    { "id": 4, "tasks": ["5.4", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 5, "tasks": ["7.7", "8.1", "8.2", "9.1"] },
    { "id": 6, "tasks": ["9.2", "11.1"] },
    { "id": 7, "tasks": ["9.3", "11.2", "11.3", "12.1"] },
    { "id": 8, "tasks": ["9.4", "9.5", "11.4", "12.2", "13.1"] },
    { "id": 9, "tasks": ["12.3", "13.2", "13.3"] },
    { "id": 10, "tasks": ["13.4", "13.5"] },
    { "id": 11, "tasks": ["13.6", "13.7", "14.1"] },
    { "id": 12, "tasks": ["14.2", "14.3"] }
  ]
}
```
