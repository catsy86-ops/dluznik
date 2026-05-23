# Dokument Wymagań - Aplikacja Dłużnik

## Wprowadzenie

Aplikacja Dłużnik to system do zarządzania pożyczkami i zobowiązaniami finansowymi. Umożliwia użytkownikom monitorowanie, kto jest im dłużny pieniądze (pożyczki udzielone) oraz jakie są ich własne długi (pożyczki otrzymane), ułatwiając kontrolę nad przepływem finansów osobistych.

## Słownik

- **Użytkownik**: Osoba korzystająca z aplikacji
- **Dłużnik**: Osoba, która jest winna pieniądze Użytkownikowi
- **Wierzyciel**: Osoba, której Użytkownik jest winny pieniądze
- **Pożyczka**: Transakcja finansowa, w której jedna strona udziela pieniędzy drugiej stronie
- **Zobowiązanie**: Długi, które Użytkownik ma wobec innych osób
- **Saldo**: Kwota pieniędzy pozostała do spłaty w ramach pożyczki
- **Status pożyczki**: Stan pożyczki (aktywna, spłacona, częściowo spłacona)
- **Transakcja**: Pojedyncza operacja spłaty lub zmiana stanu pożyczki
- **System**: Aplikacja Dłużnik

## Wymagania

### Wymaganie 1: Rejestracja i Autentykacja Użytkownika

**Historia użytkownika:** Jako nowy użytkownik, chcę się zarejestrować w aplikacji, aby móc zarządzać swoimi pożyczkami.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz rejestracji z adresem email i hasłem, THE System SHALL utworzyć nowe konto
2. WHEN adres email jest już zarejestrowany, THE System SHALL zwrócić błąd "Email już istnieje"
3. WHEN Użytkownik loguje się z prawidłowymi danymi, THE System SHALL przyznać dostęp do aplikacji
4. WHEN Użytkownik loguje się z nieprawidłowym hasłem, THE System SHALL zwrócić błąd "Nieprawidłowe dane logowania"
5. WHEN Użytkownik jest zalogowany, THE System SHALL utrzymać sesję przez co najmniej 24 godziny

### Wymaganie 2: Dodawanie Pożyczek Udzielonych

**Historia użytkownika:** Jako Użytkownik, chcę dodać pożyczkę, którą udzieliłem komuś, aby śledzić, kto mi jest dłużny.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz nowej pożyczki z imieniem Dłużnika, kwotą i datą, THE System SHALL zapisać pożyczkę w bazie danych
2. WHEN kwota pożyczki jest mniejsza lub równa zero, THE System SHALL zwrócić błąd "Kwota musi być większa od zera"
3. WHEN Użytkownik nie podaje imienia Dłużnika, THE System SHALL zwrócić błąd "Imię Dłużnika jest wymagane"
4. WHEN pożyczka jest dodana, THE System SHALL przypisać jej unikalny identyfikator
5. WHEN pożyczka jest dodana, THE System SHALL ustawić jej status na "aktywna"

### Wymaganie 3: Dodawanie Zobowiązań (Pożyczek Otrzymanych)

**Historia użytkownika:** Jako Użytkownik, chcę dodać pożyczkę, którą otrzymałem, aby śledzić moje własne długi.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz nowego zobowiązania z imieniem Wierzyciela, kwotą i datą, THE System SHALL zapisać zobowiązanie w bazie danych
2. WHEN kwota zobowiązania jest mniejsza lub równa zero, THE System SHALL zwrócić błąd "Kwota musi być większa od zera"
3. WHEN Użytkownik nie podaje imienia Wierzyciela, THE System SHALL zwrócić błąd "Imię Wierzyciela jest wymagane"
4. WHEN zobowiązanie jest dodane, THE System SHALL przypisać mu unikalny identyfikator
5. WHEN zobowiązanie jest dodane, THE System SHALL ustawić jego status na "aktywne"

### Wymaganie 4: Przeglądanie Listy Pożyczek Udzielonych

**Historia użytkownika:** Jako Użytkownik, chcę zobaczyć listę wszystkich pożyczek, które udzieliłem, aby wiedzieć, kto mi jest dłużny.

#### Kryteria Akceptacji

1. WHEN Użytkownik przechodzi do sekcji "Pożyczki udzielone", THE System SHALL wyświetlić listę wszystkich pożyczek udzielonych
2. WHEN lista pożyczek jest wyświetlana, THE System SHALL pokazać dla każdej pożyczki: imię Dłużnika, kwotę, datę, status i saldo
3. WHEN nie ma żadnych pożyczek udzielonych, THE System SHALL wyświetlić komunikat "Brak pożyczek udzielonych"
4. WHEN Użytkownik sortuje listę, THE System SHALL posortować pożyczki według wybranego kryterium (data, kwota, imię)
5. WHEN Użytkownik filtruje listę, THE System SHALL wyświetlić tylko pożyczki spełniające kryteria filtrowania (status, Dłużnik)

### Wymaganie 5: Przeglądanie Listy Zobowiązań

**Historia użytkownika:** Jako Użytkownik, chcę zobaczyć listę wszystkich moich zobowiązań, aby wiedzieć, ile jestem winny i komu.

#### Kryteria Akceptacji

1. WHEN Użytkownik przechodzi do sekcji "Moje zobowiązania", THE System SHALL wyświetlić listę wszystkich zobowiązań
2. WHEN lista zobowiązań jest wyświetlana, THE System SHALL pokazać dla każdego zobowiązania: imię Wierzyciela, kwotę, datę, status i saldo
3. WHEN nie ma żadnych zobowiązań, THE System SHALL wyświetlić komunikat "Brak zobowiązań"
4. WHEN Użytkownik sortuje listę, THE System SHALL posortować zobowiązania według wybranego kryterium (data, kwota, imię)
5. WHEN Użytkownik filtruje listę, THE System SHALL wyświetlić tylko zobowiązania spełniające kryteria filtrowania (status, Wierzyciel)

### Wymaganie 6: Rejestrowanie Spłat Pożyczek

**Historia użytkownika:** Jako Użytkownik, chcę zarejestrować spłatę pożyczki, aby śledzić postęp spłacania.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz spłaty z kwotą i datą, THE System SHALL zarejestrować transakcję spłaty
2. WHEN kwota spłaty jest większa niż saldo pożyczki, THE System SHALL zwrócić błąd "Kwota spłaty nie może być większa niż saldo"
3. WHEN kwota spłaty jest mniejsza lub równa zero, THE System SHALL zwrócić błąd "Kwota spłaty musi być większa od zera"
4. WHEN spłata jest zarejestrowana, THE System SHALL zmniejszyć saldo pożyczki o kwotę spłaty
5. WHEN saldo pożyczki osiąga zero, THE System SHALL zmienić status pożyczki na "spłacona"

### Wymaganie 7: Rejestrowanie Spłat Zobowiązań

**Historia użytkownika:** Jako Użytkownik, chcę zarejestrować spłatę mojego zobowiązania, aby śledzić postęp spłacania moich długów.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz spłaty zobowiązania z kwotą i datą, THE System SHALL zarejestrować transakcję spłaty
2. WHEN kwota spłaty jest większa niż saldo zobowiązania, THE System SHALL zwrócić błąd "Kwota spłaty nie może być większa niż saldo"
3. WHEN kwota spłaty jest mniejsza lub równa zero, THE System SHALL zwrócić błąd "Kwota spłaty musi być większa od zera"
4. WHEN spłata jest zarejestrowana, THE System SHALL zmniejszyć saldo zobowiązania o kwotę spłaty
5. WHEN saldo zobowiązania osiąga zero, THE System SHALL zmienić status zobowiązania na "spłacone"

### Wymaganie 8: Przeglądanie Historii Transakcji

**Historia użytkownika:** Jako Użytkownik, chcę zobaczyć historię wszystkich transakcji dla konkretnej pożyczki lub zobowiązania, aby śledzić szczegóły spłat.

#### Kryteria Akceptacji

1. WHEN Użytkownik kliknie na konkretną pożyczkę lub zobowiązanie, THE System SHALL wyświetlić historię wszystkich transakcji
2. WHEN historia transakcji jest wyświetlana, THE System SHALL pokazać dla każdej transakcji: datę, kwotę, typ (spłata/dodanie) i saldo po transakcji
3. WHEN nie ma żadnych transakcji, THE System SHALL wyświetlić komunikat "Brak transakcji"
4. WHEN Użytkownik sortuje historię, THE System SHALL posortować transakcje chronologicznie (najnowsze najpierw)

### Wymaganie 9: Edycja Pożyczek i Zobowiązań

**Historia użytkownika:** Jako Użytkownik, chcę edytować szczegóły pożyczki lub zobowiązania, aby poprawić błędy lub zaktualizować informacje.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła formularz edycji z nowymi danymi, THE System SHALL zaktualizować pożyczkę lub zobowiązanie
2. WHEN Użytkownik zmienia kwotę, THE System SHALL sprawdzić, czy nowa kwota jest większa od już spłaconej części
3. WHEN nowa kwota jest mniejsza od spłaconej części, THE System SHALL zwrócić błąd "Nowa kwota nie może być mniejsza od spłaconej części"
4. WHEN edycja jest zapisana, THE System SHALL zaktualizować saldo na podstawie nowej kwoty
5. WHEN Użytkownik edytuje pożyczkę o statusie "spłacona", THE System SHALL wymagać potwierdzenia przed zmianą

### Wymaganie 10: Usuwanie Pożyczek i Zobowiązań

**Historia użytkownika:** Jako Użytkownik, chcę usunąć pożyczkę lub zobowiązanie, jeśli zostały dodane przez pomyłkę.

#### Kryteria Akceptacji

1. WHEN Użytkownik kliknie przycisk usunięcia, THE System SHALL wyświetlić potwierdzenie
2. WHEN Użytkownik potwierdzi usunięcie, THE System SHALL usunąć pożyczkę lub zobowiązanie z bazy danych
3. WHEN pożyczka lub zobowiązanie jest usunięte, THE System SHALL usunąć również wszystkie powiązane transakcje
4. IF pożyczka lub zobowiązanie ma status "spłacona", THEN THE System SHALL wymagać dodatkowego potwierdzenia przed usunięciem

### Wymaganie 11: Podsumowanie Finansowe

**Historia użytkownika:** Jako Użytkownik, chcę zobaczyć podsumowanie mojej sytuacji finansowej, aby szybko zrozumieć, ile pieniędzy mi się należy i ile jestem winny.

#### Kryteria Akceptacji

1. WHEN Użytkownik przechodzi do strony głównej, THE System SHALL wyświetlić podsumowanie finansowe
2. WHEN podsumowanie jest wyświetlane, THE System SHALL pokazać: całkowitą kwotę pożyczek udzielonych, całkowitą kwotę zobowiązań, saldo netto (różnica)
3. WHEN podsumowanie jest wyświetlane, THE System SHALL pokazać liczbę aktywnych pożyczek i zobowiązań
4. WHEN podsumowanie jest wyświetlane, THE System SHALL pokazać liczbę spłaconych pożyczek i zobowiązań

### Wymaganie 12: Powiadomienia o Pożyczkach

**Historia użytkownika:** Jako Użytkownik, chcę otrzymywać powiadomienia o pożyczkach, które nie zostały spłacone w określonym czasie, aby pamiętać o ściganiu długów.

#### Kryteria Akceptacji

1. WHEN pożyczka jest aktywna przez więcej niż 30 dni, THE System SHALL wysłać powiadomienie do Użytkownika
2. WHEN powiadomienie jest wysłane, THE System SHALL zawierać imię Dłużnika, kwotę i datę pożyczki
3. WHERE Użytkownik wyłączył powiadomienia, THE System SHALL nie wysyłać powiadomień
4. WHEN Użytkownik kliknie na powiadomienie, THE System SHALL przejść do szczegółów pożyczki

### Wymaganie 13: Eksport Danych

**Historia użytkownika:** Jako Użytkownik, chcę wyeksportować moje dane do pliku, aby mieć kopię zapasową lub analizować je w innym programie.

#### Kryteria Akceptacji

1. WHEN Użytkownik kliknie przycisk eksportu, THE System SHALL wyeksportować wszystkie pożyczki i zobowiązania do pliku CSV
2. WHEN plik jest eksportowany, THE System SHALL zawierać wszystkie istotne informacje (imię, kwota, data, status, saldo)
3. WHEN eksport jest ukończony, THE System SHALL umożliwić pobranie pliku
4. WHEN Użytkownik eksportuje dane, THE System SHALL zawierać również historię transakcji

### Wymaganie 14: Bezpieczeństwo Danych

**Historia użytkownika:** Jako Użytkownik, chcę mieć pewność, że moje dane finansowe są bezpieczne, aby móc ufać aplikacji.

#### Kryteria Akceptacji

1. WHEN Użytkownik przesyła dane, THE System SHALL szyfrować je podczas transmisji (HTTPS)
2. WHEN dane są przechowywane, THE System SHALL szyfrować hasła za pomocą algorytmu bcrypt
3. WHEN Użytkownik wyloguje się, THE System SHALL zniszczyć sesję
4. WHEN Użytkownik jest nieaktywny przez 30 minut, THE System SHALL automatycznie wylogować go

### Wymaganie 15: Responsywny Interfejs

**Historia użytkownika:** Jako Użytkownik, chcę korzystać z aplikacji na różnych urządzeniach, aby móc zarządzać pożyczkami z telefonu, tabletu lub komputera.

#### Kryteria Akceptacji

1. WHEN aplikacja jest otwierana na urządzeniu mobilnym, THE System SHALL wyświetlić interfejs zoptymalizowany dla mobilnych
2. WHEN aplikacja jest otwierana na komputerze, THE System SHALL wyświetlić pełny interfejs
3. WHEN rozmiar okna zmienia się, THE System SHALL dostosować układ interfejsu
4. WHEN aplikacja jest otwierana na tablecie, THE System SHALL wyświetlić interfejs zoptymalizowany dla tabletów
