# Requirements Document

## Introduction

Zestaw 5 usprawnień UX dla aplikacji do zarządzania długami "Dłużnik". Usprawnienia obejmują: empty state na dashboardzie z CTA, weryfikację adresu email przy rejestracji, automatyczne odświeżanie powiadomień, sekcję "Ostatnio oglądane" oraz obsługę wielu walut w statystykach dashboardu.

## Glossary

- **Dashboard**: Główna strona aplikacji wyświetlająca podsumowanie finansowe użytkownika (wykresy, statystyki, ostatnie pożyczki)
- **Empty_State**: Widok wyświetlany gdy brak danych do prezentacji, zawierający komunikat i zachętę do działania
- **CTA**: Call-to-Action — przycisk lub link zachęcający użytkownika do wykonania akcji
- **Notification_Service**: Komponent w Layout odpowiedzialny za pobieranie i wyświetlanie alertów o terminach płatności
- **Polling_Interval**: Okres czasu między automatycznymi zapytaniami do serwera o nowe powiadomienia
- **Recently_Viewed_Service**: Mechanizm śledzący ostatnio odwiedzane przez użytkownika pożyczki i zobowiązania
- **Email_Verification_Service**: Usługa backendowa odpowiedzialna za wysyłanie i walidację tokenów weryfikacyjnych email
- **Currency_Aggregator**: Logika grupująca i prezentująca salda w podziale na waluty (PLN, EUR, USD)
- **Verification_Token**: Jednorazowy token wysyłany na adres email użytkownika w celu potwierdzenia własności konta

## Requirements

### Requirement 1: Dashboard Empty State z CTA

**User Story:** Jako nowy użytkownik, chcę widzieć zachętę do dodania pierwszej pożyczki gdy dashboard jest pusty, abym wiedział jak zacząć korzystać z aplikacji.

#### Acceptance Criteria

1. IF the user has zero loans and zero obligations after data loading completes, THEN THE Dashboard SHALL display an Empty_State view instead of charts, statistics, and loan/obligation lists
2. THE Empty_State SHALL contain a CTA button labeled with text indicating loan creation that navigates to the loan creation page (/loans)
3. THE Empty_State SHALL contain a CTA button labeled with text indicating obligation creation that navigates to the obligation creation page (/obligations)
4. THE Empty_State SHALL display a message of no more than 200 characters that describes what the user can track in the application (loans and obligations) and encourages adding the first entry
5. WHEN the actual data state contains at least one loan or obligation, THE Dashboard SHALL display the standard statistics and charts view instead of the Empty_State
6. THE Empty_State SHALL include at least one SVG illustration or icon with a minimum rendered size of 48x48 pixels
7. WHILE the Dashboard is fetching loan and obligation data, THE Dashboard SHALL display a loading skeleton placeholder instead of the Empty_State or the standard view
8. IF the data fetch for loans or obligations fails, THEN THE Dashboard SHALL display an error message indicating the failure and a retry button, rather than showing the Empty_State

### Requirement 2: Email Verification at Registration

**User Story:** Jako administrator systemu, chcę aby użytkownicy weryfikowali swój adres email przy rejestracji, aby zapobiec rejestracji na fałszywe adresy i spamowi.

#### Acceptance Criteria

1. WHEN a user submits the registration form, THE Email_Verification_Service SHALL send a Verification_Token to the provided email address within 60 seconds of form submission
2. WHILE the user email is not verified, THE Application SHALL restrict access to authenticated routes and display a verification prompt informing the user to check their email
3. WHEN the user clicks the verification link containing a valid Verification_Token that has not been previously used, THE Email_Verification_Service SHALL mark the email as verified, invalidate the token, and grant full access
4. IF the Verification_Token has expired, THEN THE Email_Verification_Service SHALL display a message indicating the token is no longer valid and allow the user to request a new Verification_Token
5. THE Verification_Token SHALL expire after 24 hours from generation and SHALL be invalidated after a single successful use
6. WHEN the user is on the verification prompt screen, THE Application SHALL provide a "Wyślij ponownie" (resend) button to request a new Verification_Token, limited to a maximum of 5 requests per hour, with a minimum interval of 60 seconds between requests; WHEN the resend limit is reached, THE button SHALL remain visible but be disabled
7. IF the user attempts to register with an email that is already registered, THEN THE Application SHALL display a generic message indicating that a verification email has been sent, without revealing whether the account already exists
8. IF the user clicks a verification link containing a malformed or unrecognized Verification_Token, THEN THE Email_Verification_Service SHALL reject the request and display a message indicating the link is invalid
9. WHEN a new Verification_Token is generated via the resend mechanism, THE Email_Verification_Service SHALL invalidate all previously issued Verification_Tokens for that email address

### Requirement 3: Auto-Refreshing Notifications

**User Story:** Jako zalogowany użytkownik, chcę aby powiadomienia o terminach płatności odświeżały się automatycznie podczas mojej sesji, abym nie przegapił alertu o zbliżającym się lub przekroczonym terminie.

#### Acceptance Criteria

1. WHILE the user is on any authenticated page, THE Notification_Service SHALL poll the server for new notifications at a Polling_Interval of 60 seconds
2. WHEN new notifications are received during polling, THE Notification_Service SHALL update the bell icon badge count to reflect the actual current notification count without requiring a page navigation
3. WHEN the browser tab loses visibility, THE Notification_Service SHALL pause polling until the tab regains visibility
4. WHEN the browser tab becomes visible again, THE Notification_Service SHALL perform a poll within 1 second and resume the regular Polling_Interval of 60 seconds
5. IF the polling request fails due to a network error, THEN THE Notification_Service SHALL retry after doubling the Polling_Interval, applying the 5-minute maximum limit during the doubling calculation, up to a maximum of 5 consecutive retry attempts
6. WHEN polling resumes successfully after a failure, THE Notification_Service SHALL reset the Polling_Interval to 60 seconds and reset the retry attempt counter to zero
7. IF the polling request returns an authentication error, THEN THE Notification_Service SHALL stop polling and redirect the user to the login page

### Requirement 4: Recently Viewed Section

**User Story:** Jako powracający użytkownik, chcę widzieć listę ostatnio przeglądanych pożyczek i zobowiązań na dashboardzie, abym mógł szybko wrócić do elementów nad którymi pracowałem.

#### Acceptance Criteria

1. WHEN the user navigates to a loan or obligation detail page, THE Recently_Viewed_Service SHALL record that item as recently viewed by storing its id, type (loan or obligation), item name (borrowerName for loans, creditorName for obligations), current balance, and currency, along with a timestamp of the view event
2. IF the user views an item that is already in the recently viewed list, THEN THE Recently_Viewed_Service SHALL move that item to the top of the list without creating a duplicate entry
3. THE Dashboard SHALL display a "Ostatnio oglądane" section showing up to 5 most recently viewed items ordered from newest to oldest by view timestamp
4. THE Recently_Viewed_Service SHALL persist recently viewed items in local storage scoped to the current user's id, retaining a maximum of 20 items total, so they survive page refreshes and browser restarts
5. WHEN the user clicks an item in the "Ostatnio oglądane" section, THE Application SHALL navigate to that item's detail page (loans/{id} for loans, obligations/{id} for obligations)
6. WHEN a loan or obligation is deleted, THE Recently_Viewed_Service SHALL remove that item from the recently viewed list
7. THE "Ostatnio oglądane" section SHALL display for each entry: the item name (borrowerName for loans, creditorName for obligations), a label indicating the type ("Pożyczka" or "Zobowiązanie"), the current balance, and the currency
8. IF the user has not viewed any items in the current session, THEN THE Dashboard SHALL hide the "Ostatnio oglądane" section entirely, regardless of items stored in local storage from previous sessions

### Requirement 5: Multi-Currency Support on Dashboard

**User Story:** Jako użytkownik z pożyczkami w różnych walutach, chcę aby dashboard poprawnie prezentował salda w podziale na waluty, abym miał rzetelny obraz mojej sytuacji finansowej.

#### Acceptance Criteria

1. THE Currency_Aggregator SHALL group all loan and obligation balances by their ISO 4217 currency code (PLN, EUR, USD)
2. WHEN the user has items in multiple currencies, THE Dashboard SHALL display a separate balance summary for each currency, where each summary includes: net balance (loans minus obligations), total loan balance, and total obligation balance for that currency
3. THE Dashboard SHALL display the net balance per currency instead of a single hardcoded PLN value
4. WHEN the user has items in only one currency, THE Dashboard SHALL display net balance, total loan balance, and total obligation balance in that single currency without currency grouping headers
5. WHEN the user has items in multiple currencies, THE DonutChart component SHALL display a per-currency breakdown showing the loan-to-obligation proportion within each currency separately
6. WHEN formatting monetary values, THE Dashboard SHALL use the correct locale formatting for each currency (PLN uses pl-PL, EUR uses de-DE, USD uses en-US)
7. WHEN the user has items in multiple currencies, THE Dashboard SHALL order currency sections alphabetically by currency code
