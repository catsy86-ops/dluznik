# Aplikacja Dłużnik - Debt Management Application

Aplikacja do zarządzania pożyczkami i zobowiązaniami finansowymi. Umożliwia użytkownikom monitorowanie, kto jest im dłużny pieniądze (pożyczki udzielone) oraz jakie są ich własne długi (pożyczki otrzymane).

## Wymagania

- Node.js >= 16.0.0
- npm >= 8.0.0 lub yarn >= 1.22.0
- PostgreSQL >= 12.0

## Instalacja

1. Klonuj repozytorium:
```bash
git clone <repository-url>
cd debt-management-app
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
```bash
cp .env.example .env
```

4. Edytuj plik `.env` i uzupełnij dane do bazy danych:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=debt_management_app
```

5. Utwórz bazę danych:
```bash
createdb debt_management_app
```

## Uruchomienie

### Tryb deweloperski
```bash
npm run dev
```

### Budowanie
```bash
npm run build
```

### Uruchomienie produkcyjne
```bash
npm start
```

## Testowanie

### Uruchomienie testów
```bash
npm test
```

### Uruchomienie testów w trybie watch
```bash
npm run test:watch
```

### Raport pokrycia testami
```bash
npm run test:coverage
```

## Linting i Formatowanie

### Sprawdzenie kodu
```bash
npm run lint
```

### Formatowanie kodu
```bash
npm run format
```

## Struktura Projektu

```
src/
├── controllers/     # Kontrolery API
├── services/        # Logika biznesowa
├── repositories/    # Dostęp do danych
├── models/          # Modele danych (encje)
├── middleware/      # Middleware Express
├── utils/           # Funkcje pomocnicze
├── config/          # Konfiguracja aplikacji
└── index.ts         # Punkt wejścia aplikacji

tests/
├── unit/            # Testy jednostkowe
└── properties/      # Property-based tests
```

## Architektura

Aplikacja jest zbudowana na architekturze trójwarstwowej:

1. **Presentation Layer** - Kontrolery API
2. **Business Logic Layer** - Serwisy
3. **Data Access Layer** - Repozytoria

## Funkcjonalności

- ✅ Rejestracja i autentykacja użytkowników
- ✅ Zarządzanie pożyczkami udzielonymi
- ✅ Zarządzanie zobowiązaniami (pożyczkami otrzymanymi)
- ✅ Rejestrowanie spłat
- ✅ Historia transakcji
- ✅ Podsumowanie finansowe
- ✅ Powiadomienia o zalegających pożyczkach
- ✅ Eksport danych do CSV
- ✅ Bezpieczeństwo danych (bcrypt, JWT, HTTPS)
- ✅ Responsywny interfejs

## API Endpoints

### Autentykacja
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `GET /api/auth/me` - Pobierz dane bieżącego użytkownika

### Pożyczki
- `POST /api/loans` - Utwórz nową pożyczkę
- `GET /api/loans` - Pobierz listę pożyczek
- `GET /api/loans/:id` - Pobierz szczegóły pożyczki
- `PUT /api/loans/:id` - Edytuj pożyczkę
- `DELETE /api/loans/:id` - Usuń pożyczkę

### Zobowiązania
- `POST /api/obligations` - Utwórz nowe zobowiązanie
- `GET /api/obligations` - Pobierz listę zobowiązań
- `GET /api/obligations/:id` - Pobierz szczegóły zobowiązania
- `PUT /api/obligations/:id` - Edytuj zobowiązanie
- `DELETE /api/obligations/:id` - Usuń zobowiązanie

### Spłaty
- `POST /api/loans/:id/payments` - Zarejestruj spłatę pożyczki
- `GET /api/loans/:id/payments` - Pobierz historię spłat pożyczki
- `POST /api/obligations/:id/payments` - Zarejestruj spłatę zobowiązania
- `GET /api/obligations/:id/payments` - Pobierz historię spłat zobowiązania

### Podsumowanie
- `GET /api/summary` - Pobierz podsumowanie finansowe

### Eksport
- `GET /api/export/csv` - Eksportuj dane do CSV

## Bezpieczeństwo

- Hasła są hashowane za pomocą bcrypt
- Autentykacja oparta na JWT
- HTTPS/TLS dla transmisji danych
- CORS protection
- CSRF protection
- Walidacja wszystkich danych wejściowych
- Ochrona przed SQL injection i XSS

## Licencja

MIT

## Autor

Debt Management App Team
