# Design Document - Aplikacja Dłużnik

## Overview

Aplikacja Dłużnik to system zarządzania pożyczkami i zobowiązaniami finansowymi, który umożliwia użytkownikom śledzenie:
- **Pożyczek udzielonych**: pieniądze, które inni są nam dłużni
- **Zobowiązań**: pieniądze, które my jesteśmy dłużni innym

Aplikacja zapewnia kompletny cykl życia pożyczki: od utworzenia, przez rejestrowanie spłat, aż do zamknięcia. Kluczowe cechy to:
- Autentykacja i zarządzanie kontami użytkowników
- Zarządzanie pożyczkami i zobowiązaniami
- Rejestrowanie i śledzenie spłat
- Historia transakcji
- Podsumowanie finansowe
- Powiadomienia o zalegających pożyczkach
- Eksport danych
- Bezpieczeństwo danych
- Responsywny interfejs

## Architecture

### Architektura warstwowa

Aplikacja będzie zbudowana na architekturze trójwarstwowej:

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │
│   - React/Vue komponenty            │
│   - Responsywny design              │
│   - Zarządzanie stanem              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic Layer              │
│   - Usługi biznesowe                │
│   - Walidacja danych                │
│   - Obliczenia finansowe            │
│   - Zarządzanie powiadomieniami      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Access Layer                 │
│   - Repozytoria                     │
│   - ORM/Query builder               │
│   - Migracje bazy danych            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database Layer                    │
│   - PostgreSQL/MySQL                │
│   - Szyfrowanie danych              │
└─────────────────────────────────────┘
```

### Przepływ danych

1. **Autentykacja**: Użytkownik loguje się → Token JWT → Sesja
2. **Zarządzanie pożyczkami**: Formularz → Walidacja → Zapis w BD → Potwierdzenie
3. **Spłaty**: Rejestracja spłaty → Aktualizacja salda → Zmiana statusu → Historia
4. **Powiadomienia**: Scheduler → Sprawdzenie warunków → Wysłanie powiadomienia
5. **Eksport**: Zbieranie danych → Formatowanie CSV → Pobieranie

## Components and Interfaces

### Komponenty systemu

#### 1. Authentication Module
- **Rejestracja użytkownika**: Walidacja email, hashing hasła (bcrypt), zapis do BD
- **Logowanie**: Weryfikacja poświadczeń, generowanie JWT, zarządzanie sesją
- **Wylogowanie**: Zniszczenie sesji, czyszczenie tokenów
- **Timeout sesji**: Automatyczne wylogowanie po 30 minutach nieaktywności

#### 2. Loan Management Module
- **Dodawanie pożyczki**: Walidacja danych, przypisanie ID, ustawienie statusu
- **Edycja pożyczki**: Walidacja nowej kwoty, aktualizacja salda
- **Usuwanie pożyczki**: Potwierdzenie, usunięcie powiązanych transakcji
- **Przeglądanie listy**: Sortowanie, filtrowanie, paginacja

#### 3. Obligation Management Module
- **Dodawanie zobowiązania**: Walidacja danych, przypisanie ID, ustawienie statusu
- **Edycja zobowiązania**: Walidacja nowej kwoty, aktualizacja salda
- **Usuwanie zobowiązania**: Potwierdzenie, usunięcie powiązanych transakcji
- **Przeglądanie listy**: Sortowanie, filtrowanie, paginacja

#### 4. Payment Registration Module
- **Rejestrowanie spłaty**: Walidacja kwoty, aktualizacja salda, zmiana statusu
- **Historia transakcji**: Przechowywanie wszystkich operacji, sortowanie chronologiczne
- **Walidacja spłaty**: Sprawdzenie, czy kwota nie przekracza salda

#### 5. Financial Summary Module
- **Obliczanie podsumowania**: Suma pożyczek, suma zobowiązań, saldo netto
- **Liczniki**: Aktywne pożyczki, spłacone pożyczki, aktywne zobowiązania, spłacone zobowiązania
- **Aktualizacja w czasie rzeczywistym**: Po każdej operacji

#### 6. Notification Module
- **Scheduler**: Sprawdzanie pożyczek co 24 godziny
- **Warunki**: Pożyczka aktywna > 30 dni
- **Wysyłanie**: Email, push notification, in-app notification
- **Preferencje**: Możliwość wyłączenia powiadomień

#### 7. Data Export Module
- **Format CSV**: Eksport pożyczek, zobowiązań, historii transakcji
- **Pobieranie**: Generowanie pliku, udostępnienie do pobrania
- **Bezpieczeństwo**: Eksport tylko dla zalogowanego użytkownika

#### 8. Security Module
- **Szyfrowanie transmisji**: HTTPS/TLS
- **Szyfrowanie haseł**: bcrypt z salt
- **Szyfrowanie danych**: Opcjonalne szyfrowanie wrażliwych danych w BD
- **Zarządzanie sesją**: JWT, timeout, CSRF protection

### Interfejsy API

#### Authentication Endpoints
```
POST /api/auth/register
  - email: string
  - password: string
  - confirmPassword: string

POST /api/auth/login
  - email: string
  - password: string

POST /api/auth/logout

GET /api/auth/me
```

#### Loan Management Endpoints
```
POST /api/loans
  - borrowerName: string
  - amount: number
  - date: date
  - description?: string

GET /api/loans
  - sort?: string (date, amount, name)
  - filter?: string (status, borrower)
  - page?: number
  - limit?: number

GET /api/loans/:id

PUT /api/loans/:id
  - borrowerName?: string
  - amount?: number
  - date?: date
  - description?: string

DELETE /api/loans/:id
```

#### Payment Endpoints
```
POST /api/loans/:id/payments
  - amount: number
  - date: date
  - note?: string

GET /api/loans/:id/payments

POST /api/obligations/:id/payments
  - amount: number
  - date: date
  - note?: string

GET /api/obligations/:id/payments
```

#### Summary Endpoint
```
GET /api/summary
  - Returns: {
      totalLoaned: number,
      totalOwed: number,
      netBalance: number,
      activeLoans: number,
      completedLoans: number,
      activeObligations: number,
      completedObligations: number
    }
```

#### Export Endpoint
```
GET /api/export/csv
  - Returns: CSV file with all loans, obligations, and transactions
```

## Data Models

### User Model
```
{
  id: UUID (primary key),
  email: string (unique),
  passwordHash: string (bcrypt),
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
  notificationsEnabled: boolean (default: true)
}
```

### Loan Model
```
{
  id: UUID (primary key),
  userId: UUID (foreign key),
  borrowerName: string,
  originalAmount: number (decimal, > 0),
  currentBalance: number (decimal, >= 0),
  status: enum (active, partially_paid, completed),
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate?: timestamp,
  description?: string,
  currency: string (default: PLN)
}
```

### Obligation Model
```
{
  id: UUID (primary key),
  userId: UUID (foreign key),
  creditorName: string,
  originalAmount: number (decimal, > 0),
  currentBalance: number (decimal, >= 0),
  status: enum (active, partially_paid, completed),
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate?: timestamp,
  description?: string,
  currency: string (default: PLN)
}
```

### Transaction Model
```
{
  id: UUID (primary key),
  loanId?: UUID (foreign key),
  obligationId?: UUID (foreign key),
  type: enum (payment, creation, edit),
  amount: number (decimal),
  balanceBefore: number (decimal),
  balanceAfter: number (decimal),
  createdAt: timestamp,
  note?: string
}
```

### Session Model
```
{
  id: UUID (primary key),
  userId: UUID (foreign key),
  token: string (JWT),
  expiresAt: timestamp,
  createdAt: timestamp,
  lastActivityAt: timestamp
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Payment Amount Validation

*For any* loan or obligation with a current balance, when a payment is registered, the payment amount must be greater than zero and not exceed the current balance.

**Validates: Requirements 6.2, 6.3, 7.2, 7.3**

### Property 2: Balance Update Correctness

*For any* loan or obligation, after registering a payment, the new balance must equal the previous balance minus the payment amount.

**Validates: Requirements 6.4, 7.4**

### Property 3: Status Transition on Completion

*For any* loan or obligation with a balance greater than zero, when a payment is registered that reduces the balance to exactly zero, the status must change to "completed".

**Validates: Requirements 6.5, 7.5**

### Property 4: Loan Amount Invariant

*For any* loan or obligation, the current balance must never exceed the original amount.

**Validates: Requirements 2.1, 3.1**

### Property 5: Transaction History Completeness

*For any* loan or obligation, the sum of all payment transactions must equal the difference between the original amount and the current balance.

**Validates: Requirements 8.2, 8.4**

### Property 6: Unique Identifier Assignment

*For any* newly created loan or obligation, a unique identifier must be assigned and must not conflict with any existing identifier.

**Validates: Requirements 2.4, 3.4**

### Property 7: Status Consistency

*For any* loan or obligation, if the current balance is zero, the status must be "completed"; if the current balance equals the original amount, the status must be "active"; otherwise, the status must be "partially_paid".

**Validates: Requirements 2.5, 3.5, 6.5, 7.5**

### Property 8: Financial Summary Accuracy

*For any* user with multiple loans and obligations, the net balance must equal the sum of all loan balances minus the sum of all obligation balances.

**Validates: Requirement 11.2**

### Property 9: Edit Amount Validation

*For any* loan or obligation being edited, the new amount must be greater than or equal to the amount already paid (original amount minus current balance).

**Validates: Requirements 9.2, 9.4**

### Property 10: Data Integrity on Deletion

*For any* loan or obligation being deleted, all associated transactions must also be deleted, and the financial summary must be recalculated correctly.

**Validates: Requirement 10.3**

### Property 11: Loan List Display Completeness

*For any* set of loans, when displayed in the list view, each loan must show all required fields: borrower name, amount, date, status, and current balance.

**Validates: Requirement 4.2**

### Property 12: Obligation List Display Completeness

*For any* set of obligations, when displayed in the list view, each obligation must show all required fields: creditor name, amount, date, status, and current balance.

**Validates: Requirement 5.2**

### Property 13: Loan List Sorting Correctness

*For any* set of loans, when sorted by a criterion (date, amount, or borrower name), the resulting list must be correctly ordered according to that criterion.

**Validates: Requirement 4.4**

### Property 14: Obligation List Sorting Correctness

*For any* set of obligations, when sorted by a criterion (date, amount, or creditor name), the resulting list must be correctly ordered according to that criterion.

**Validates: Requirement 5.4**

### Property 15: Loan List Filtering Correctness

*For any* set of loans and a filter criterion (status or borrower), the filtered list must contain only loans matching the criterion.

**Validates: Requirement 4.5**

### Property 16: Obligation List Filtering Correctness

*For any* set of obligations and a filter criterion (status or creditor), the filtered list must contain only obligations matching the criterion.

**Validates: Requirement 5.5**

### Property 17: Transaction History Completeness

*For any* loan or obligation with multiple transactions, the transaction history must display all transactions with required fields: date, amount, type, and balance after transaction.

**Validates: Requirement 8.2**

### Property 18: Transaction History Sorting Correctness

*For any* set of transactions, when sorted chronologically, the most recent transaction must appear first.

**Validates: Requirement 8.4**

### Property 19: Export Data Completeness

*For any* user with loans and obligations, the exported CSV must contain all required fields for each item: name, amount, date, status, and balance.

**Validates: Requirement 13.2**

### Property 20: Active and Completed Counts Accuracy

*For any* user with multiple loans and obligations, the count of active items must equal the number of items with status "active", and the count of completed items must equal the number of items with status "completed".

**Validates: Requirements 11.3, 11.4**

## Error Handling

### Validation Errors
- **Invalid email format**: Return 400 with message "Nieprawidłowy format adresu email"
- **Email already exists**: Return 409 with message "Email już istnieje"
- **Invalid password**: Return 400 with message "Hasło musi zawierać co najmniej 8 znaków"
- **Amount <= 0**: Return 400 with message "Kwota musi być większa od zera"
- **Missing required field**: Return 400 with message "Pole [field] jest wymagane"
- **Payment exceeds balance**: Return 400 with message "Kwota spłaty nie może być większa niż saldo"
- **New amount < paid amount**: Return 400 with message "Nowa kwota nie może być mniejsza od spłaconej części"

### Authentication Errors
- **Invalid credentials**: Return 401 with message "Nieprawidłowe dane logowania"
- **Token expired**: Return 401 with message "Sesja wygasła, zaloguj się ponownie"
- **Unauthorized access**: Return 403 with message "Brak dostępu do tego zasobu"

### Not Found Errors
- **User not found**: Return 404 with message "Użytkownik nie znaleziony"
- **Loan not found**: Return 404 with message "Pożyczka nie znaleziona"
- **Obligation not found**: Return 404 with message "Zobowiązanie nie znalezione"

### Server Errors
- **Database error**: Return 500 with message "Błąd bazy danych"
- **Export error**: Return 500 with message "Błąd podczas eksportu danych"
- **Notification error**: Return 500 with message "Błąd podczas wysyłania powiadomienia"

## Testing Strategy

### Unit Tests

#### Authentication Module
- Valid registration with correct data
- Registration with duplicate email
- Valid login with correct credentials
- Login with incorrect password
- Password hashing with bcrypt
- Session creation and validation

#### Loan Management Module
- Create loan with valid data
- Create loan with invalid amount (≤ 0)
- Create loan without borrower name
- Edit loan with valid new amount
- Edit loan with amount < paid amount
- Delete loan with confirmation
- Delete loan with cascading transaction deletion
- List loans with sorting (date, amount, name)
- List loans with filtering (status, borrower)
- Verify all required fields displayed in loan list

#### Obligation Management Module
- Create obligation with valid data
- Create obligation with invalid amount (≤ 0)
- Create obligation without creditor name
- Edit obligation with valid new amount
- Edit obligation with amount < paid amount
- Delete obligation with confirmation
- Delete obligation with cascading transaction deletion
- List obligations with sorting
- List obligations with filtering
- Verify all required fields displayed in obligation list

#### Payment Registration Module
- Register payment with valid amount
- Register payment exceeding balance
- Register payment with amount ≤ 0
- Payment updates balance correctly
- Payment changes status to "completed" when balance reaches zero
- Payment creates transaction record
- Transaction history displays all required fields
- Transaction history sorted chronologically (newest first)

#### Financial Summary Module
- Calculate total loaned amount
- Calculate total owed amount
- Calculate net balance
- Count active loans
- Count completed loans
- Count active obligations
- Count completed obligations

#### Data Export Module
- Export to CSV with all loans
- Export to CSV with all obligations
- Export to CSV with transaction history
- Verify CSV format and content
- Verify all required fields in export

### Property-Based Tests

Property-based tests will verify universal properties across randomly generated inputs:

**Feature: debt-management-app, Property 1: Payment Amount Validation**
- Generate random loans with various balances
- Generate random payment amounts
- Verify: payment > 0 AND payment ≤ balance

**Feature: debt-management-app, Property 2: Balance Update Correctness**
- Generate random loans with various balances
- Generate random valid payments
- Verify: newBalance = oldBalance - payment

**Feature: debt-management-app, Property 3: Status Transition on Completion**
- Generate random loans with various balances
- Generate payments that reduce balance to zero
- Verify: status changes to "completed"

**Feature: debt-management-app, Property 4: Loan Amount Invariant**
- Generate random loans with various balances and original amounts
- Verify: currentBalance ≤ originalAmount

**Feature: debt-management-app, Property 5: Transaction History Completeness**
- Generate random loans with multiple payments
- Verify: sum(payments) = originalAmount - currentBalance

**Feature: debt-management-app, Property 6: Unique Identifier Assignment**
- Generate multiple loans/obligations
- Verify: all IDs are unique

**Feature: debt-management-app, Property 7: Status Consistency**
- Generate random loans with various balances
- Verify: status matches balance state

**Feature: debt-management-app, Property 8: Financial Summary Accuracy**
- Generate random user with multiple loans and obligations
- Verify: netBalance = sum(loanBalances) - sum(obligationBalances)

**Feature: debt-management-app, Property 9: Edit Amount Validation**
- Generate random loans with various paid amounts
- Generate new amounts
- Verify: newAmount ≥ paidAmount

**Feature: debt-management-app, Property 10: Data Integrity on Deletion**
- Generate random loans with transactions
- Delete loan
- Verify: all transactions deleted AND summary recalculated

**Feature: debt-management-app, Property 11: Loan List Display Completeness**
- Generate random loans with various data
- Verify: all required fields present in display

**Feature: debt-management-app, Property 12: Obligation List Display Completeness**
- Generate random obligations with various data
- Verify: all required fields present in display

**Feature: debt-management-app, Property 13: Loan List Sorting Correctness**
- Generate random loans with various dates/amounts/names
- Verify: sorting by each criterion works correctly

**Feature: debt-management-app, Property 14: Obligation List Sorting Correctness**
- Generate random obligations with various dates/amounts/names
- Verify: sorting by each criterion works correctly

**Feature: debt-management-app, Property 15: Loan List Filtering Correctness**
- Generate random loans with various statuses/borrowers
- Verify: filtering returns only matching loans

**Feature: debt-management-app, Property 16: Obligation List Filtering Correctness**
- Generate random obligations with various statuses/creditors
- Verify: filtering returns only matching obligations

**Feature: debt-management-app, Property 17: Transaction History Completeness**
- Generate random loans with multiple payments
- Verify: all transaction fields present

**Feature: debt-management-app, Property 18: Transaction History Sorting Correctness**
- Generate random transactions
- Verify: transactions sorted newest first

**Feature: debt-management-app, Property 19: Export Data Completeness**
- Generate random loans and obligations
- Verify: all required fields in export

**Feature: debt-management-app, Property 20: Active and Completed Counts Accuracy**
- Generate random loans/obligations with various statuses
- Verify: counts match actual status distribution

### Integration Tests

- User registration and login flow
- Create loan → Register payment → Verify balance update
- Create obligation → Register payment → Verify balance update
- Export data and verify file content
- Notification trigger after 30 days (with mocked time)
- Session timeout after 30 minutes of inactivity (with mocked time)
- HTTPS/TLS encryption verification
- Password hashing with bcrypt verification
- Session destruction on logout
- Cascading deletion of transactions with loan/obligation

### Performance Tests

- Load test: 1000 concurrent users
- Response time: < 200ms for list operations
- Response time: < 100ms for single item operations
- Database query optimization for large datasets
- CSV export performance with 10,000+ records

### Security Tests

- SQL injection prevention
- XSS prevention
- CSRF protection
- Password strength validation
- Session hijacking prevention
- Unauthorized access prevention
- Data encryption verification
- HTTPS enforcement

### UI/Responsiveness Tests

- Mobile layout verification
- Desktop layout verification
- Tablet layout verification
- Window resize responsiveness
- Touch interaction on mobile devices
- Keyboard navigation accessibility

