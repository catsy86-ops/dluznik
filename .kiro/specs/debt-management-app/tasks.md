# Implementation Plan: Aplikacja Dłużnik

## Overview

Implementacja aplikacji Dłużnik będzie przebiegać w 8 głównych fazach odpowiadających modułom systemu. Każda faza obejmuje implementację funkcjonalności biznesowej oraz testy jednostkowe i property-based tests dla weryfikacji 20 właściwości poprawności. Architektura będzie oparta na TypeScript z warstwą REST API, logiką biznesową i warstwą dostępu do danych.

## Tasks

- [x] 1. Konfiguracja projektu i infrastruktura
  - [x] 1.1 Inicjalizacja projektu TypeScript z Express.js
    - Skonfiguruj package.json z wymaganymi zależnościami (Express, TypeORM, bcrypt, jsonwebtoken, uuid)
    - Skonfiguruj tsconfig.json dla TypeScript
    - Skonfiguruj strukturę katalogów (src/controllers, src/services, src/repositories, src/models, src/middleware, src/utils)
    - _Wymagania: 1.1, 14.1_

  - [x] 1.2 Konfiguracja bazy danych i migracji
    - Skonfiguruj TypeORM z PostgreSQL
    - Utwórz plik konfiguracyjny dla połączenia z bazą danych
    - Skonfiguruj system migracji bazy danych
    - _Wymagania: 1.1, 14.1_

  - [x] 1.3 Ustawienie testów i frameworku testowego
    - Zainstaluj i skonfiguruj Jest dla testów jednostkowych
    - Zainstaluj fast-check dla property-based tests
    - Utwórz strukturę katalogów dla testów (tests/unit, tests/properties)
    - Skonfiguruj coverage reporting
    - _Wymagania: 1.1_

  - [x] 1.4 Konfiguracja middleware i obsługi błędów
    - Utwórz middleware do obsługi błędów globalnie
    - Skonfiguruj middleware CORS
    - Skonfiguruj middleware do logowania żądań
    - Utwórz standardowe formaty odpowiedzi API
    - _Wymagania: 1.1, 14.1_

- [ ] 2. Moduł Autentykacji
  - [-] 2.1 Implementacja modelu User i repozytorium
    - Utwórz encję User z polami: id, email, passwordHash, createdAt, updatedAt, lastLoginAt, notificationsEnabled
    - Utwórz repozytorium User z metodami: create, findByEmail, findById, update
    - Dodaj walidację email (format, unikalność)
    - _Wymagania: 1.1, 1.2, 1.3_

  - [-] 2.2 Implementacja serwisu autentykacji
    - Utwórz serwis AuthService z metodami: register, login, logout, validateToken
    - Implementuj hashing haseł za pomocą bcrypt
    - Implementuj generowanie JWT tokenów
    - Implementuj walidację hasła (minimum 8 znaków)
    - _Wymagania: 1.1, 1.2, 1.3, 14.2_

  - [~] 2.3 Testy jednostkowe dla rejestracji i logowania
    - Test rejestracji z prawidłowymi danymi
    - Test rejestracji z duplikatem email
    - Test logowania z prawidłowymi danymi
    - Test logowania z nieprawidłowym hasłem
    - Test hashing haseł za pomocą bcrypt
    - _Wymagania: 1.1, 1.2, 1.3_

  - [-] 2.4 Implementacja kontrolerów autentykacji
    - Utwórz endpoint POST /api/auth/register
    - Utwórz endpoint POST /api/auth/login
    - Utwórz endpoint POST /api/auth/logout
    - Utwórz endpoint GET /api/auth/me
    - Dodaj obsługę błędów walidacji
    - _Wymagania: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [-] 2.5 Implementacja middleware autentykacji
    - Utwórz middleware do weryfikacji JWT
    - Utwórz middleware do sprawdzenia timeout sesji (30 minut)
    - Utwórz middleware do automatycznego wylogowania
    - _Wymagania: 1.4, 1.5, 14.3, 14.4_

  - [~] 2.6 Testy property-based dla autentykacji
    - **Property 6: Unique Identifier Assignment** - Weryfikuj, że każdy nowy użytkownik otrzymuje unikalny ID
    - **Validates: Requirements 1.1, 1.2**
    - _Wymagania: 1.1, 1.2_

- [ ] 3. Moduł Zarządzania Pożyczkami
  - [~] 3.1 Implementacja modelu Loan i repozytorium
    - Utwórz encję Loan z polami: id, userId, borrowerName, originalAmount, currentBalance, status, createdAt, updatedAt, dueDate, description, currency
    - Utwórz repozytorium Loan z metodami: create, findById, findByUserId, update, delete, findWithPagination
    - Dodaj walidację kwoty (> 0)
    - Dodaj walidację imienia dłużnika (nie puste)
    - _Wymagania: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.2 Implementacja serwisu zarządzania pożyczkami
    - Utwórz serwis LoanService z metodami: createLoan, editLoan, deleteLoan, getLoanById, getLoansByUser
    - Implementuj logikę walidacji kwoty
    - Implementuj logikę przypisywania unikalnego ID
    - Implementuj logikę ustawiania statusu na "aktywna"
    - _Wymagania: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.3 Testy property-based dla pożyczek
    - **Property 4: Loan Amount Invariant** - Weryfikuj, że currentBalance ≤ originalAmount
    - **Property 6: Unique Identifier Assignment** - Weryfikuj unikalność ID pożyczek
    - **Property 7: Status Consistency** - Weryfikuj poprawność statusu na podstawie salda
    - **Validates: Requirements 2.1, 2.4, 2.5_

  - [~] 3.4 Implementacja kontrolerów pożyczek
    - Utwórz endpoint POST /api/loans
    - Utwórz endpoint GET /api/loans (z paginacją)
    - Utwórz endpoint GET /api/loans/:id
    - Utwórz endpoint PUT /api/loans/:id
    - Utwórz endpoint DELETE /api/loans/:id
    - Dodaj obsługę błędów walidacji
    - _Wymagania: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.5 Testy jednostkowe dla pożyczek
    - Test tworzenia pożyczki z prawidłowymi danymi
    - Test tworzenia pożyczki z kwotą ≤ 0
    - Test tworzenia pożyczki bez imienia dłużnika
    - Test edycji pożyczki z prawidłową nową kwotą
    - Test edycji pożyczki z kwotą < spłacona część
    - Test usuwania pożyczki z potwierdzeniem
    - _Wymagania: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Moduł Zarządzania Zobowiązaniami
  - [~] 4.1 Implementacja modelu Obligation i repozytorium
    - Utwórz encję Obligation z polami: id, userId, creditorName, originalAmount, currentBalance, status, createdAt, updatedAt, dueDate, description, currency
    - Utwórz repozytorium Obligation z metodami: create, findById, findByUserId, update, delete, findWithPagination
    - Dodaj walidację kwoty (> 0)
    - Dodaj walidację imienia wierzyciela (nie puste)
    - _Wymagania: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 4.2 Implementacja serwisu zarządzania zobowiązaniami
    - Utwórz serwis ObligationService z metodami: createObligation, editObligation, deleteObligation, getObligationById, getObligationsByUser
    - Implementuj logikę walidacji kwoty
    - Implementuj logikę przypisywania unikalnego ID
    - Implementuj logikę ustawiania statusu na "aktywne"
    - _Wymagania: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 4.3 Testy property-based dla zobowiązań
    - **Property 4: Loan Amount Invariant** - Weryfikuj, że currentBalance ≤ originalAmount
    - **Property 6: Unique Identifier Assignment** - Weryfikuj unikalność ID zobowiązań
    - **Property 7: Status Consistency** - Weryfikuj poprawność statusu na podstawie salda
    - **Validates: Requirements 3.1, 3.4, 3.5_

  - [~] 4.4 Implementacja kontrolerów zobowiązań
    - Utwórz endpoint POST /api/obligations
    - Utwórz endpoint GET /api/obligations (z paginacją)
    - Utwórz endpoint GET /api/obligations/:id
    - Utwórz endpoint PUT /api/obligations/:id
    - Utwórz endpoint DELETE /api/obligations/:id
    - Dodaj obsługę błędów walidacji
    - _Wymagania: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 4.5 Testy jednostkowe dla zobowiązań
    - Test tworzenia zobowiązania z prawidłowymi danymi
    - Test tworzenia zobowiązania z kwotą ≤ 0
    - Test tworzenia zobowiązania bez imienia wierzyciela
    - Test edycji zobowiązania z prawidłową nową kwotą
    - Test edycji zobowiązania z kwotą < spłacona część
    - Test usuwania zobowiązania z potwierdzeniem
    - _Wymagania: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Moduł Rejestrowania Spłat
  - [~] 5.1 Implementacja modelu Transaction i repozytorium
    - Utwórz encję Transaction z polami: id, loanId, obligationId, type, amount, balanceBefore, balanceAfter, createdAt, note
    - Utwórz repozytorium Transaction z metodami: create, findByLoanId, findByObligationId, findAll, delete
    - _Wymagania: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4_

  - [~] 5.2 Implementacja serwisu rejestrowania spłat
    - Utwórz serwis PaymentService z metodami: registerPayment, getTransactionHistory
    - Implementuj walidację kwoty spłaty (> 0 i ≤ saldo)
    - Implementuj logikę aktualizacji salda (newBalance = oldBalance - payment)
    - Implementuj logikę zmiany statusu na "spłacona" gdy saldo = 0
    - Implementuj tworzenie rekordu transakcji
    - _Wymagania: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 5.3 Testy property-based dla spłat
    - **Property 1: Payment Amount Validation** - Weryfikuj, że payment > 0 AND payment ≤ balance
    - **Property 2: Balance Update Correctness** - Weryfikuj, że newBalance = oldBalance - payment
    - **Property 3: Status Transition on Completion** - Weryfikuj zmianę statusu na "completed" gdy balance = 0
    - **Property 5: Transaction History Completeness** - Weryfikuj, że sum(payments) = originalAmount - currentBalance
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4_

  - [~] 5.4 Implementacja kontrolerów spłat
    - Utwórz endpoint POST /api/loans/:id/payments
    - Utwórz endpoint GET /api/loans/:id/payments
    - Utwórz endpoint POST /api/obligations/:id/payments
    - Utwórz endpoint GET /api/obligations/:id/payments
    - Dodaj obsługę błędów walidacji
    - _Wymagania: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 5.5 Testy jednostkowe dla spłat
    - Test rejestrowania spłaty z prawidłową kwotą
    - Test rejestrowania spłaty przekraczającej saldo
    - Test rejestrowania spłaty z kwotą ≤ 0
    - Test aktualizacji salda po spłacie
    - Test zmiany statusu na "spłacona" gdy saldo = 0
    - Test tworzenia rekordu transakcji
    - _Wymagania: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [~] 6. Checkpoint - Weryfikacja modułów podstawowych
  - Upewnij się, że wszystkie testy przechodzą, zapytaj użytkownika o ewentualne pytania.


- [ ] 7. Moduł Wyświetlania Listy Pożyczek
  - [~] 7.1 Implementacja logiki sortowania pożyczek
    - Utwórz metodę sortowania pożyczek po dacie, kwocie i imieniu
    - Implementuj sortowanie rosnące i malejące
    - _Wymagania: 4.4_

  - [~] 7.2 Implementacja logiki filtrowania pożyczek
    - Utwórz metodę filtrowania pożyczek po statusie
    - Utwórz metodę filtrowania pożyczek po imieniu dłużnika
    - Implementuj kombinowanie wielu filtrów
    - _Wymagania: 4.5_

  - [~] 7.3 Implementacja paginacji pożyczek
    - Utwórz metodę paginacji z limit i offset
    - Zwróć całkowitą liczbę pożyczek
    - _Wymagania: 4.2_

  - [~] 7.4 Testy property-based dla wyświetlania pożyczek
    - **Property 11: Loan List Display Completeness** - Weryfikuj, że wszystkie wymagane pola są wyświetlane
    - **Property 13: Loan List Sorting Correctness** - Weryfikuj poprawność sortowania
    - **Property 15: Loan List Filtering Correctness** - Weryfikuj poprawność filtrowania
    - **Validates: Requirements 4.2, 4.4, 4.5_

  - [~] 7.5 Implementacja kontrolera listy pożyczek
    - Utwórz endpoint GET /api/loans z obsługą sort, filter, page, limit
    - Zwróć listę pożyczek z wymaganymi polami
    - Obsłuż przypadek braku pożyczek
    - _Wymagania: 4.2, 4.4, 4.5_

  - [~] 7.6 Testy jednostkowe dla listy pożyczek
    - Test wyświetlania listy pożyczek
    - Test sortowania pożyczek po dacie
    - Test sortowania pożyczek po kwocie
    - Test sortowania pożyczek po imieniu
    - Test filtrowania pożyczek po statusie
    - Test filtrowania pożyczek po imieniu dłużnika
    - Test paginacji pożyczek
    - Test komunikatu "Brak pożyczek udzielonych"
    - _Wymagania: 4.2, 4.4, 4.5_

- [ ] 8. Moduł Wyświetlania Listy Zobowiązań
  - [~] 8.1 Implementacja logiki sortowania zobowiązań
    - Utwórz metodę sortowania zobowiązań po dacie, kwocie i imieniu
    - Implementuj sortowanie rosnące i malejące
    - _Wymagania: 5.4_

  - [~] 8.2 Implementacja logiki filtrowania zobowiązań
    - Utwórz metodę filtrowania zobowiązań po statusie
    - Utwórz metodę filtrowania zobowiązań po imieniu wierzyciela
    - Implementuj kombinowanie wielu filtrów
    - _Wymagania: 5.5_

  - [~] 8.3 Implementacja paginacji zobowiązań
    - Utwórz metodę paginacji z limit i offset
    - Zwróć całkowitą liczbę zobowiązań
    - _Wymagania: 5.2_

  - [~] 8.4 Testy property-based dla wyświetlania zobowiązań
    - **Property 12: Obligation List Display Completeness** - Weryfikuj, że wszystkie wymagane pola są wyświetlane
    - **Property 14: Obligation List Sorting Correctness** - Weryfikuj poprawność sortowania
    - **Property 16: Obligation List Filtering Correctness** - Weryfikuj poprawność filtrowania
    - **Validates: Requirements 5.2, 5.4, 5.5_

  - [~] 8.5 Implementacja kontrolera listy zobowiązań
    - Utwórz endpoint GET /api/obligations z obsługą sort, filter, page, limit
    - Zwróć listę zobowiązań z wymaganymi polami
    - Obsłuż przypadek braku zobowiązań
    - _Wymagania: 5.2, 5.4, 5.5_

  - [~] 8.6 Testy jednostkowe dla listy zobowiązań
    - Test wyświetlania listy zobowiązań
    - Test sortowania zobowiązań po dacie
    - Test sortowania zobowiązań po kwocie
    - Test sortowania zobowiązań po imieniu
    - Test filtrowania zobowiązań po statusie
    - Test filtrowania zobowiązań po imieniu wierzyciela
    - Test paginacji zobowiązań
    - Test komunikatu "Brak zobowiązań"
    - _Wymagania: 5.2, 5.4, 5.5_

- [ ] 9. Moduł Historii Transakcji
  - [~] 9.1 Implementacja logiki wyświetlania historii transakcji
    - Utwórz metodę pobierania historii transakcji dla pożyczki
    - Utwórz metodę pobierania historii transakcji dla zobowiązania
    - Implementuj sortowanie chronologiczne (najnowsze najpierw)
    - _Wymagania: 8.2, 8.4_

  - [~] 9.2 Testy property-based dla historii transakcji
    - **Property 17: Transaction History Completeness** - Weryfikuj, że wszystkie wymagane pola są wyświetlane
    - **Property 18: Transaction History Sorting Correctness** - Weryfikuj sortowanie chronologiczne
    - **Validates: Requirements 8.2, 8.4_

  - [~] 9.3 Implementacja kontrolera historii transakcji
    - Utwórz endpoint GET /api/loans/:id/payments
    - Utwórz endpoint GET /api/obligations/:id/payments
    - Zwróć historię transakcji z wymaganymi polami
    - Obsłuż przypadek braku transakcji
    - _Wymagania: 8.2, 8.4_

  - [~] 9.4 Testy jednostkowe dla historii transakcji
    - Test wyświetlania historii transakcji
    - Test sortowania transakcji chronologicznie
    - Test wyświetlania wszystkich wymaganych pól transakcji
    - Test komunikatu "Brak transakcji"
    - _Wymagania: 8.2, 8.4_

- [ ] 10. Moduł Edycji Pożyczek i Zobowiązań
  - [~] 10.1 Implementacja logiki edycji pożyczek
    - Utwórz metodę edycji danych pożyczki
    - Implementuj walidację nowej kwoty (≥ spłacona część)
    - Implementuj aktualizację salda na podstawie nowej kwoty
    - Implementuj potwierdzenie przed zmianą pożyczki o statusie "spłacona"
    - _Wymagania: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 10.2 Implementacja logiki edycji zobowiązań
    - Utwórz metodę edycji danych zobowiązania
    - Implementuj walidację nowej kwoty (≥ spłacona część)
    - Implementuj aktualizację salda na podstawie nowej kwoty
    - Implementuj potwierdzenie przed zmianą zobowiązania o statusie "spłacone"
    - _Wymagania: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 10.3 Testy property-based dla edycji
    - **Property 9: Edit Amount Validation** - Weryfikuj, że newAmount ≥ paidAmount
    - **Validates: Requirements 9.2, 9.4_

  - [~] 10.4 Implementacja kontrolerów edycji
    - Utwórz endpoint PUT /api/loans/:id
    - Utwórz endpoint PUT /api/obligations/:id
    - Dodaj obsługę błędów walidacji
    - _Wymagania: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 10.5 Testy jednostkowe dla edycji
    - Test edycji pożyczki z prawidłowymi danymi
    - Test edycji pożyczki z kwotą < spłacona część
    - Test edycji zobowiązania z prawidłowymi danymi
    - Test edycji zobowiązania z kwotą < spłacona część
    - Test potwierdzenia przed zmianą pożyczki "spłaconej"
    - _Wymagania: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Moduł Usuwania Pożyczek i Zobowiązań
  - [~] 11.1 Implementacja logiki usuwania pożyczek
    - Utwórz metodę usuwania pożyczki
    - Implementuj usuwanie powiązanych transakcji (cascading delete)
    - Implementuj potwierdzenie przed usunięciem
    - Implementuj dodatkowe potwierdzenie dla pożyczek "spłaconych"
    - _Wymagania: 10.1, 10.2, 10.3, 10.4_

  - [~] 11.2 Implementacja logiki usuwania zobowiązań
    - Utwórz metodę usuwania zobowiązania
    - Implementuj usuwanie powiązanych transakcji (cascading delete)
    - Implementuj potwierdzenie przed usunięciem
    - Implementuj dodatkowe potwierdzenie dla zobowiązań "spłaconych"
    - _Wymagania: 10.1, 10.2, 10.3, 10.4_

  - [~] 11.3 Testy property-based dla usuwania
    - **Property 10: Data Integrity on Deletion** - Weryfikuj, że wszystkie powiązane transakcje są usunięte i podsumowanie jest przeliczane
    - **Validates: Requirement 10.3_

  - [~] 11.4 Implementacja kontrolerów usuwania
    - Utwórz endpoint DELETE /api/loans/:id
    - Utwórz endpoint DELETE /api/obligations/:id
    - Dodaj obsługę błędów
    - _Wymagania: 10.1, 10.2, 10.3, 10.4_

  - [~] 11.5 Testy jednostkowe dla usuwania
    - Test usuwania pożyczki z potwierdzeniem
    - Test usuwania pożyczki z cascading delete transakcji
    - Test usuwania zobowiązania z potwierdzeniem
    - Test usuwania zobowiązania z cascading delete transakcji
    - Test dodatkowego potwierdzenia dla pożyczek "spłaconych"
    - _Wymagania: 10.1, 10.2, 10.3, 10.4_

- [x] **11. TIER 1-3 FEATURES: 10 Zaawansowanych Funkcjonalności (NOWE!)**

### TIER 1 - Krytyczne (1-2 dni)
- [x] 1️⃣ Smart Payment Scheduler
  - [x] Endpoint: GET /api/loans/:id/payment-schedule
  - [x] Service: PaymentScheduleService
  - [x] Generuje harmonogram spłat na 12 miesięcy
  - [x] Algorytm: Dzieli currentBalance przez liczbę miesięcy
  - [x] Wyświetla sugerowane spłaty z markami procentowymi
  
- [x] 2️⃣ Smart Search & Advanced Filters
  - [x] Endpoint: GET /api/loans/search/advanced
  - [x] Service: LoanRepository.findWithAdvancedFilters
  - [x] Filtry: status, zakres kwoty, zakres dat, waluta, kategoria
  - [x] Pełnotekstowe wyszukiwanie po notkach i opisach
  
- [x] 3️⃣ Payment Intelligence - "Optimal Payment Suggestion"
  - [x] Endpoint: POST /api/loans/:id/suggest-payment
  - [x] Service: PaymentSuggestionService
  - [x] Zwraca: minimalna, rekomendowana, pełna spłata
  - [x] Oblicza oszczędności odsetek jeśli zapłacimy dziś
  
- [x] 4️⃣ Loan Comparison Tool
  - [x] Endpoint: GET /api/loans/compare/multiple?ids=id1,id2,id3
  - [x] Service: LoanComparisonService
  - [x] Porównanie: oprocentowanie, pozostała kwota, % spłaty, dni do terminu
  - [x] Side-by-side porównanie w UI

### TIER 2 - Złote (2-3 dni)
- [x] 5️⃣ Interest Accrual Visualization
  - [x] Endpoint: GET /api/loans/:id/interest-breakdown
  - [x] Service: InterestBreakdownService
  - [x] Zwraca: principale, odsetki, spłacone, pozostałe
  - [x] Pie chart z rozkładem
  - [x] Live calculator: "Jeśli nie spłacisz do [DATE], odsetki będą: XXX zł"
  - [x] Endpoint: GET /api/loans/:id/interest-accrual
  - [x] Real-time naliczanie odsetek

- [x] 6️⃣ Loan Health Score
  - [x] Endpoint: GET /api/loans/:id/health-score
  - [x] Service: LoanHealthScoreService
  - [x] Algorytm: score = (daysToOverdue/30)*40 + (remainingBalance/originalAmount)*40 + (paymentVelocity)*20
  - [x] Score 0-100: Red (overdue), Orange (30+ dni), Yellow (15-30), Green (paid on time)
  - [x] Progress ring z sugestiami

### TIER 3 - Premium (3-4 dni)
- [x] 9️⃣ Predictive Analytics - Payment Forecasting
  - [x] Endpoint: GET /api/loans/:id/forecast
  - [x] Service: PaymentForecastService
  - [x] ML model: Analiza ostatnich 10 płatności (velocity)
  - [x] Prognoza kiedy będzie spłacone (z confidence interval)
  - [x] Alert jeśli będzie przeterminowane w ciągu 30 dni

- [x] 🔟 Automated Payment Rules Engine
  - [x] Endpoint: POST /api/loans/:id/rules (create)
  - [x] Endpoint: GET /api/loans/:id/rules (list)
  - [x] Endpoint: GET /api/loans/:id/rules/active (active only)
  - [x] Endpoint: GET /api/loans/:id/rules/suggested (suggestions)
  - [x] Endpoint: PUT /api/loans/rules/:ruleId (update)
  - [x] Endpoint: DELETE /api/loans/rules/:ruleId (delete)
  - [x] Service: PaymentRuleService
  - [x] Reguły: "Spłacaj 100 zł co miesiąc", "Spłacaj 10% balansu gdy dostanę wynagrodzenie"
  - [x] Integracja z RecurringPaymentService
  - [x] Schedule engine: cron-like execution

**Status: ✅ WSZYSTKIE 10 FUNKCJI ZAIMPLEMENTOWANE!**

**Frontend UI Components: ✅ WSZYSTKIE STWORZONE!**

- [x] **11.1 React Component: PaymentScheduleComponent**
  - [x] 12-month payment schedule with timeline visualization
  - [x] Table view with month, suggested payment, principal, remaining balance
  - [x] Loading states and error handling
  - [x] Responsive design (mobile/tablet/desktop)
  - [x] Dark mode support
  - [x] TypeScript type-safe

- [x] **11.2 React Component: PaymentSuggestionComponent**
  - [x] 3-option payment suggestions (minimum, recommended, full)
  - [x] Savings calculation display
  - [x] Urgency indicator (critical/high/normal)
  - [x] Quick action buttons
  - [x] Interest savings highlight

- [x] **11.3 React Component: LoanHealthScoreComponent**
  - [x] SVG progress ring (0-100 score)
  - [x] Component breakdown (timeliness, balance, velocity)
  - [x] Color-coded status (Red/Orange/Yellow/Green)
  - [x] Recommendations display
  - [x] Responsive layout

- [x] **11.4 React Component: InterestBreakdownComponent**
  - [x] 2 modes: breakdown view + real-time accrual
  - [x] Pie chart visualization with percentages
  - [x] Principal vs Interest comparison
  - [x] Paid/Remaining stats
  - [x] Live interest accrual calculator

- [x] **11.5 React Component: PaymentForecastComponent**
  - [x] Completion date forecast with confidence intervals
  - [x] 3 scenario options (conservative/moderate/aggressive)
  - [x] Monthly payment recommendation
  - [x] Overdue risk alert
  - [x] Timeline visualization

- [x] **11.6 React Component: LoanComparisonComponent**
  - [x] Side-by-side loan comparison table
  - [x] Key metrics: APR, balance, completion %, days to due
  - [x] Summary statistics at top
  - [x] Responsive grid layout

- [x] **11.7 React Component: PaymentRulesComponent**
  - [x] Payment rules management UI
  - [x] Create/Update/Delete rules
  - [x] Active rules display
  - [x] Suggested rules recommendations
  - [x] Rule types (fixed amount, percentage, conditional)

- [x] **11.8 Enhanced LoanDetailPageEnhanced.tsx**
  - [x] 5-tab interface: Overview, Schedule, Breakdown, Forecast, Notes
  - [x] Integrated all 7 feature components
  - [x] Payment form with validation
  - [x] Transaction history display
  - [x] Confetti celebration on full payment
  - [x] Loading states and error handling
  - [x] Dark mode support
  - [x] Fully responsive design

- [x] **11.9 API Integration (client/src/api.ts)**
  - [x] 13 new API methods added:
    - getPaymentSchedule(), getPaymentSuggestion(), compareLoanS()
    - getInterestBreakdown(), getRealTimeAccrual(), getHealthScore()
    - getPaymentForecast(), getPaymentRules(), getActivePaymentRules()
    - getSuggestedRules(), createPaymentRule(), updatePaymentRule()
    - deletePaymentRule()
  - [x] 8+ new TypeScript types defined:
    - PaymentScheduleItem, PaymentSuggestion, LoanComparisonResult
    - InterestBreakdownResponse, RealTimeAccrualResponse
    - LoanHealthScoreResponse, PaymentForecastResponse
    - CreatePaymentRuleInput, SuggestedRule

- [x] **11.10 App.tsx Updated**
  - [x] Route updated to use LoanDetailPageEnhanced
  - [x] All feature components available from loan detail page
  - [x] Seamless navigation and integration

- [ ] 12. Moduł Podsumowania Finansowego
  - [~] 12.1 Implementacja logiki obliczania podsumowania
    - Utwórz metodę obliczania całkowitej kwoty pożyczek udzielonych
    - Utwórz metodę obliczania całkowitej kwoty zobowiązań
    - Utwórz metodę obliczania salda netto (pożyczki - zobowiązania)
    - Utwórz metodę liczenia aktywnych pożyczek
    - Utwórz metodę liczenia spłaconych pożyczek
    - Utwórz metodę liczenia aktywnych zobowiązań
    - Utwórz metodę liczenia spłaconych zobowiązań
    - _Wymagania: 11.1, 11.2, 11.3, 11.4_

  - [~] 12.2 Testy property-based dla podsumowania
    - **Property 8: Financial Summary Accuracy** - Weryfikuj, że netBalance = sum(loanBalances) - sum(obligationBalances)
    - **Property 20: Active and Completed Counts Accuracy** - Weryfikuj poprawność liczników
    - **Validates: Requirements 11.2, 11.3, 11.4_

  - [~] 12.3 Implementacja kontrolera podsumowania
    - Utwórz endpoint GET /api/summary
    - Zwróć podsumowanie finansowe z wszystkimi wymaganymi polami
    - _Wymagania: 11.1, 11.2, 11.3, 11.4_

  - [~] 12.4 Testy jednostkowe dla podsumowania
    - Test obliczania całkowitej kwoty pożyczek
    - Test obliczania całkowitej kwoty zobowiązań
    - Test obliczania salda netto
    - Test liczenia aktywnych pożyczek
    - Test liczenia spłaconych pożyczek
    - Test liczenia aktywnych zobowiązań
    - Test liczenia spłaconych zobowiązań
    - _Wymagania: 11.1, 11.2, 11.3, 11.4_

- [~] 13. Checkpoint - Weryfikacja modułów biznesowych
  - Upewnij się, że wszystkie testy przechodzą, zapytaj użytkownika o ewentualne pytania.


- [ ] 14. Moduł Powiadomień
  - [~] 14.1 Implementacja modelu Notification i repozytorium
    - Utwórz encję Notification z polami: id, userId, loanId, obligationId, type, message, isRead, createdAt
    - Utwórz repozytorium Notification z metodami: create, findByUserId, markAsRead, delete
    - _Wymagania: 12.1, 12.2, 12.3, 12.4_

  - [~] 14.2 Implementacja serwisu powiadomień
    - Utwórz serwis NotificationService z metodami: sendNotification, getNotifications, markAsRead
    - Implementuj scheduler do sprawdzania pożyczek co 24 godziny
    - Implementuj logikę wysyłania powiadomienia dla pożyczek aktywnych > 30 dni
    - Implementuj obsługę preferencji powiadomień użytkownika
    - _Wymagania: 12.1, 12.2, 12.3, 12.4_

  - [~] 14.3 Implementacja kontrolera powiadomień
    - Utwórz endpoint GET /api/notifications
    - Utwórz endpoint PUT /api/notifications/:id/read
    - Utwórz endpoint DELETE /api/notifications/:id
    - _Wymagania: 12.1, 12.2, 12.3, 12.4_

  - [~] 14.4 Testy jednostkowe dla powiadomień
    - Test wysyłania powiadomienia dla pożyczki > 30 dni
    - Test braku wysyłania powiadomienia gdy wyłączone
    - Test oznaczania powiadomienia jako przeczytane
    - Test usuwania powiadomienia
    - _Wymagania: 12.1, 12.2, 12.3, 12.4_

- [ ] 15. Moduł Eksportu Danych
  - [~] 15.1 Implementacja logiki eksportu do CSV
    - Utwórz metodę eksportu pożyczek do CSV
    - Utwórz metodę eksportu zobowiązań do CSV
    - Utwórz metodę eksportu historii transakcji do CSV
    - Implementuj formatowanie danych do CSV
    - _Wymagania: 13.1, 13.2, 13.3, 13.4_

  - [~] 15.2 Testy property-based dla eksportu
    - **Property 19: Export Data Completeness** - Weryfikuj, że wszystkie wymagane pola są w eksporcie
    - **Validates: Requirement 13.2_

  - [~] 15.3 Implementacja kontrolera eksportu
    - Utwórz endpoint GET /api/export/csv
    - Zwróć plik CSV z wszystkimi danymi
    - Obsłuż błędy eksportu
    - _Wymagania: 13.1, 13.2, 13.3, 13.4_

  - [~] 15.4 Testy jednostkowe dla eksportu
    - Test eksportu pożyczek do CSV
    - Test eksportu zobowiązań do CSV
    - Test eksportu historii transakcji do CSV
    - Test formatu CSV
    - Test zawartości eksportu
    - Test pobierania pliku
    - _Wymagania: 13.1, 13.2, 13.3, 13.4_

- [ ] 16. Moduł Bezpieczeństwa
  - [~] 16.1 Implementacja szyfrowania transmisji
    - Skonfiguruj HTTPS/TLS dla wszystkich endpointów
    - Skonfiguruj certyfikaty SSL
    - Implementuj redirect HTTP → HTTPS
    - _Wymagania: 14.1_

  - [~] 16.2 Implementacja szyfrowania haseł
    - Weryfikuj, że hasła są hashowane za pomocą bcrypt
    - Weryfikuj, że salt jest generowany losowo
    - _Wymagania: 14.2_

  - [~] 16.3 Implementacja zarządzania sesją
    - Implementuj zniszczenie sesji przy wylogowaniu
    - Implementuj automatyczne wylogowanie po 30 minutach nieaktywności
    - Implementuj CSRF protection
    - _Wymagania: 14.3, 14.4_

  - [~] 16.4 Implementacja walidacji danych
    - Implementuj ochronę przed SQL injection
    - Implementuj ochronę przed XSS
    - Implementuj walidację wszystkich danych wejściowych
    - _Wymagania: 14.1, 14.2, 14.3, 14.4_

  - [~] 16.5 Testy bezpieczeństwa
    - Test SQL injection prevention
    - Test XSS prevention
    - Test CSRF protection
    - Test walidacji hasła
    - Test zapobiegania przejęciu sesji
    - Test zapobiegania nieautoryzowanemu dostępowi
    - Test weryfikacji szyfrowania danych
    - Test wymuszania HTTPS
    - _Wymagania: 14.1, 14.2, 14.3, 14.4_

- [~] 17. Checkpoint - Weryfikacja modułów zaawansowanych
  - Upewnij się, że wszystkie testy przechodzą, zapytaj użytkownika o ewentualne pytania.

- [ ] 18. Integracja i Połączenie Komponentów
  - [~] 18.1 Integracja wszystkich modułów
    - Połącz wszystkie kontrolery z routerem Express
    - Skonfiguruj middleware dla wszystkich tras
    - Weryfikuj przepływ danych między modułami
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

  - [~] 18.2 Testowanie end-to-end
    - Test pełnego przepływu rejestracji i logowania
    - Test pełnego przepływu tworzenia pożyczki i rejestrowania spłaty
    - Test pełnego przepływu tworzenia zobowiązania i rejestrowania spłaty
    - Test pełnego przepływu eksportu danych
    - Test pełnego przepływu powiadomień
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

  - [~] 18.3 Testowanie wydajności
    - Test obciążenia: 1000 równoczesnych użytkowników
    - Test czasu odpowiedzi: < 200ms dla operacji listowania
    - Test czasu odpowiedzi: < 100ms dla operacji na pojedynczym elemencie
    - Test optymalizacji zapytań do bazy danych
    - Test wydajności eksportu CSV z 10,000+ rekordami
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

  - [~] 18.4 Testy integracyjne
    - Test przepływu rejestracji → logowania → tworzenia pożyczki
    - Test przepływu tworzenia pożyczki → rejestrowania spłaty → aktualizacji salda
    - Test przepływu tworzenia zobowiązania → rejestrowania spłaty → aktualizacji salda
    - Test przepływu eksportu danych i weryfikacji zawartości
    - Test przepływu powiadomień po 30 dniach
    - Test przepływu timeout sesji po 30 minutach
    - Test weryfikacji szyfrowania HTTPS/TLS
    - Test weryfikacji hashowania haseł za pomocą bcrypt
    - Test zniszczenia sesji przy wylogowaniu
    - Test cascading delete transakcji z pożyczką/zobowiązaniem
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

- [~] 19. Checkpoint - Weryfikacja integracji
  - Upewnij się, że wszystkie testy przechodzą, zapytaj użytkownika o ewentualne pytania.

- [ ] 20. Dokumentacja i Finalizacja
  - [~] 20.1 Dokumentacja API
    - Utwórz dokumentację OpenAPI/Swagger dla wszystkich endpointów
    - Dokumentuj parametry, odpowiedzi i kody błędów
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

  - [~] 20.2 Dokumentacja kodu
    - Dodaj komentarze do wszystkich funkcji i klas
    - Dokumentuj złożone logiki biznesowe
    - Utwórz README z instrukcjami instalacji i uruchomienia
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

  - [~] 20.3 Przygotowanie do produkcji
    - Skonfiguruj zmienne środowiskowe
    - Skonfiguruj logging i monitoring
    - Skonfiguruj backup bazy danych
    - Skonfiguruj CI/CD pipeline
    - _Wymagania: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

- [~] 21. Final Checkpoint - Weryfikacja gotowości do produkcji
  - Upewnij się, że wszystkie testy przechodzą, zapytaj użytkownika o ewentualne pytania.

## Notes

- Zadania oznaczone `*` są opcjonalne i mogą być pominięte dla szybszego MVP
- Każde zadanie zawiera odniesienia do konkretnych wymagań dla możliwości śledzenia
- Checkpointy zapewniają inkrementalne walidacje
- Property-based tests weryfikują uniwersalne właściwości poprawności
- Testy jednostkowe weryfikują konkretne przykłady i przypadki brzegowe
- Wszystkie 20 właściwości poprawności są pokryte przez zadania testowe
- Architektura warstwowa zapewnia separację odpowiedzialności
- TypeScript zapewnia type-safety dla całej aplikacji

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.4", "2.5"] },
    { "id": 2, "tasks": ["2.3", "2.6", "3.1", "3.2", "4.1", "4.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "4.3", "4.4", "5.1", "5.2"] },
    { "id": 4, "tasks": ["3.5", "4.5", "5.3", "5.4", "5.5"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "8.1", "8.2", "8.3"] },
    { "id": 6, "tasks": ["7.4", "7.5", "8.4", "8.5"] },
    { "id": 7, "tasks": ["7.6", "8.6", "9.1", "9.3"] },
    { "id": 8, "tasks": ["9.2", "9.4", "10.1", "10.2", "10.4"] },
    { "id": 9, "tasks": ["10.3", "10.5", "11.1", "11.2", "11.4"] },
    { "id": 10, "tasks": ["11.3", "11.5", "12.1", "12.3"] },
    { "id": 11, "tasks": ["12.2", "12.4", "14.1", "14.2", "14.3"] },
    { "id": 12, "tasks": ["14.4", "15.1", "15.3"] },
    { "id": 13, "tasks": ["15.2", "15.4", "16.1", "16.2", "16.3", "16.4"] },
    { "id": 14, "tasks": ["16.5", "18.1", "18.2"] },
    { "id": 15, "tasks": ["18.3", "18.4", "20.1", "20.2", "20.3"] }
  ]
}
```
