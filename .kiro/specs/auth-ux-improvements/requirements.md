# Requirements Document

## Introduction

Ten dokument definiuje 10 usprawnień UX dla procesu uwierzytelniania w aplikacji "Dłużnik". Usprawnienia obejmują: przełącznik widoczności hasła, walidację hasła w czasie rzeczywistym, checkbox "Zapamiętaj mnie", przepływ resetowania hasła, lepsze atrybuty autouzupełniania, walidację email w czasie rzeczywistym, logowanie społecznościowe (OAuth), ulepszone komunikaty błędów, pasek postępu rejestracji oraz uwierzytelnianie biometryczne.

## Glossary

- **Login_Form**: Formularz logowania zawierający pola email i hasło
- **Registration_Form**: Formularz rejestracji zawierający pola email, hasło i potwierdzenie hasła
- **Password_Toggle**: Przycisk z ikoną oka pozwalający przełączać widoczność hasła między tekstem a kropkami
- **Password_Validator**: Komponent walidujący siłę hasła w czasie rzeczywistym
- **Password_Strength_Indicator**: Wizualny wskaźnik pokazujący siłę hasła (słabe/średnie/silne)
- **Remember_Me_Checkbox**: Pole wyboru pozwalające użytkownikowi wydłużyć czas trwania sesji
- **Session_Token**: Token JWT przechowywany w localStorage określający czas trwania sesji użytkownika
- **Password_Reset_Service**: Usługa backendowa obsługująca proces resetowania hasła przez email
- **Reset_Token**: Jednorazowy token wysyłany na email użytkownika w celu autoryzacji zmiany hasła
- **Email_Validator**: Komponent walidujący format email i sugerujący poprawki literówek
- **OAuth_Provider**: Zewnętrzny dostawca uwierzytelniania (Google, Facebook, Apple)
- **OAuth_Service**: Usługa backendowa integrująca przepływ OAuth 2.0
- **Error_Message_Formatter**: Komponent formatujący komunikaty błędów na przyjazne dla użytkownika
- **Registration_Progress_Bar**: Wizualny wskaźnik pokazujący aktualny krok w procesie rejestracji
- **Biometric_Service**: Usługa obsługująca uwierzytelnianie biometryczne (Face ID, Touch ID, Windows Hello)
- **WebAuthn_API**: Standardowy interfejs przeglądarki do uwierzytelniania biometrycznego

## Requirements

### Requirement 1: Show/Hide Password Toggle

**User Story:** Jako użytkownik wypełniający formularz logowania lub rejestracji, chcę móc przełączać widoczność hasła, abym mógł sprawdzić czy wpisałem je poprawnie.

#### Acceptance Criteria

1. THE Login_Form SHALL display a Password_Toggle button as an icon positioned within the password input field, aligned to the right edge with a minimum of 8 pixels padding from the field border
2. THE Registration_Form SHALL display a Password_Toggle button for both the password field and the confirm password field, where each toggle controls only its associated field independently
3. WHEN the Password_Toggle button is clicked, THE password input field SHALL toggle between type="password" (masked) and type="text" (visible)
4. WHEN the password is visible, THE Password_Toggle SHALL display an "eye-slash" icon indicating that clicking will hide the password
5. WHEN the password is masked, THE Password_Toggle SHALL display an "eye" icon indicating that clicking will reveal the password
6. THE Password_Toggle button SHALL have an aria-label attribute describing its current action ("Pokaż hasło" or "Ukryj hasło")
7. WHEN the user tabs through the form using keyboard navigation, THE Password_Toggle button SHALL be focusable and activatable with the Enter or Space key
8. WHEN the Password_Toggle button receives keyboard focus, THE button SHALL display a visible focus indicator with a minimum contrast ratio of 3:1 against the background
9. THE password input field SHALL be masked (type="password") by default when the form is initially rendered

### Requirement 2: Real-Time Password Validation

**User Story:** Jako użytkownik rejestrujący konto, chcę widzieć w czasie rzeczywistym czy moje hasło spełnia wymagania bezpieczeństwa, abym mógł stworzyć silne hasło za pierwszym razem.

#### Acceptance Criteria

1. WHEN the user types in the password field during registration, THE Password_Validator SHALL evaluate the password strength in real-time with a maximum delay of 300 milliseconds after the last keystroke
2. THE Password_Strength_Indicator SHALL display one of three states: "Słabe" (red), "Średnie" (yellow), or "Silne" (green) based on the password strength score
3. THE Password_Validator SHALL display a checklist showing the status of each requirement: minimum 8 characters, at least one uppercase letter, at least one lowercase letter, at least one number, and at least one special character from the set !@#$%^&*()_+-=[]{}|;:,.<>?
4. WHEN a requirement is met, THE Password_Validator SHALL display that requirement with a green checkmark icon
5. WHEN a requirement is not met, THE Password_Validator SHALL display that requirement with a gray circle icon
6. THE Password_Validator SHALL calculate strength as "Słabe" when fewer than 3 requirements are met, "Średnie" when 3-4 requirements are met, and "Silne" when all 5 requirements are met
7. THE Registration_Form SHALL disable the submit button WHILE the password strength is "Słabe"
8. THE Password_Validator SHALL display a visual progress bar that fills proportionally to the number of requirements met (0-100%)
9. WHEN the password field is empty, THE Password_Strength_Indicator SHALL display "Słabe" with all requirement icons in gray
10. THE password field SHALL accept a maximum of 128 characters
11. WHEN the user attempts to enter more than 128 characters, THE password field SHALL prevent input beyond the 128-character limit

### Requirement 3: Remember Me Checkbox

**User Story:** Jako użytkownik często korzystający z aplikacji, chcę móc zaznaczyć opcję "Zapamiętaj mnie" przy logowaniu, abym nie musiał logować się ponownie po każdym zamknięciu przeglądarki.

#### Acceptance Criteria

1. THE Login_Form SHALL display a Remember_Me_Checkbox labeled "Zapamiętaj mnie" below the password field
2. WHEN the Remember_Me_Checkbox is checked and the user successfully logs in, THE Authentication_Service SHALL issue a Session_Token with an expiration time of 30 days
3. WHEN the Remember_Me_Checkbox is unchecked and the user successfully logs in, THE Authentication_Service SHALL issue a Session_Token with an expiration time of 24 hours
4. THE Remember_Me_Checkbox SHALL persist its checked state across page refreshes until the user unchecks it
5. WHEN the Session_Token expires, THE Application SHALL redirect the user to the login page and display a message indicating the session has expired
6. THE Remember_Me_Checkbox SHALL be keyboard accessible and toggleable using the Space key when focused
7. THE Remember_Me_Checkbox SHALL be unchecked by default when the Login_Form is initially rendered
8. WHEN the user login fails due to incorrect credentials, THE Remember_Me_Checkbox SHALL retain its current checked state
9. WHEN the user explicitly logs out, THE Application SHALL clear the Session_Token and redirect to the login page

### Requirement 4: Forgot Password Flow

**User Story:** Jako użytkownik, który zapomniał hasła, chcę móc zresetować hasło przez email, abym mógł odzyskać dostęp do mojego konta.

#### Acceptance Criteria

1. THE Login_Form SHALL display a "Zapomniałeś hasła?" link below the password field that navigates to the password reset page
2. WHEN the user submits the password reset form with an email address in valid RFC 5322 format, THE Password_Reset_Service SHALL send a Reset_Token to that email address within 60 seconds
3. THE Password_Reset_Service SHALL send the reset email regardless of whether the email exists in the database to prevent email enumeration attacks
4. THE Reset_Token SHALL expire after 1 hour from generation and SHALL be invalidated after a single successful use
5. WHEN the user clicks the reset link containing a valid Reset_Token, THE Application SHALL navigate to a password change form pre-authenticated with that token
6. WHEN the user submits the password change form with a valid Reset_Token and a new password meeting all strength requirements from Requirement 2, THE Password_Reset_Service SHALL update the password, invalidate the token, and redirect to the login page with a success message
7. IF the Reset_Token has expired or been used, THEN THE Application SHALL display a message indicating the token is invalid and provide a link to request a new reset email
8. THE Password_Reset_Service SHALL rate-limit password reset requests to a maximum of 3 requests per email address per hour
9. WHEN a new Reset_Token is generated for an email address, THE Password_Reset_Service SHALL invalidate all previously issued Reset_Tokens for that email address
10. WHEN the user submits the password reset form with an email address in invalid RFC 5322 format, THE Application SHALL display an error message "Nieprawidłowy format email" and SHALL NOT send a reset email
11. WHEN the user attempts to submit a 4th password reset request within 1 hour for the same email address, THE Application SHALL display an error message "Zbyt wiele prób resetowania hasła. Spróbuj ponownie za [X] minut" where X is the remaining wait time
12. WHEN the user submits the password change form with a new password that does not meet strength requirements, THE Application SHALL display an error message "Hasło musi spełniać wszystkie wymagania bezpieczeństwa" and SHALL NOT update the password

### Requirement 5: Better Autocomplete and Autofocus

**User Story:** Jako użytkownik korzystający z menedżera haseł przeglądarki, chcę aby formularz logowania i rejestracji poprawnie współpracował z autouzupełnianiem, abym mógł szybko się zalogować.

#### Acceptance Criteria

1. THE Login_Form email field SHALL have type="email" and autocomplete attribute set to "email" or "username"
2. THE Login_Form password field SHALL have type="password" and autocomplete attribute set to "current-password"
3. THE Registration_Form email field SHALL have type="email" and autocomplete attribute set to "email"
4. THE Registration_Form password field SHALL have type="password" and autocomplete attribute set to "new-password"
5. THE Registration_Form confirm password field SHALL have type="password" and autocomplete attribute set to "new-password"
6. WHEN the Login_Form loads, THE email field SHALL receive focus automatically within 100 milliseconds, verified by document.activeElement
7. WHEN the Registration_Form loads, THE email field SHALL receive focus automatically within 100 milliseconds, verified by document.activeElement
8. THE Login_Form and Registration_Form SHALL be wrapped in a form element with autocomplete="on" to enable browser password managers
9. IF autofocus fails due to browser restrictions or user settings, THEN THE Application SHALL continue to function normally without displaying an error
10. WHEN the user presses Enter while focused on any input field in the Login_Form or Registration_Form, THE form SHALL submit

### Requirement 6: Real-Time Email Validation

**User Story:** Jako użytkownik wpisujący adres email, chcę otrzymywać natychmiastową informację o błędach w formacie oraz sugestie poprawek literówek, abym mógł podać poprawny adres za pierwszym razem.

#### Acceptance Criteria

1. WHEN the user types in the email field, THE Email_Validator SHALL validate the email format using RFC 5322 standard within 500 milliseconds after the last keystroke
2. WHEN the user blurs the email field, THE Email_Validator SHALL validate the email format using RFC 5322 standard within 200 milliseconds
3. IF the email format is invalid, THEN THE Email_Validator SHALL display an error message "Nieprawidłowy format email" below the email field
4. THE Email_Validator SHALL detect typos in popular email domains using edit distance algorithm (Levenshtein distance 1-2) for domains: gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, protonmail.com, wp.pl, onet.pl, interia.pl, o2.pl
5. WHEN a typo is detected, THE Email_Validator SHALL display a suggestion message "Czy chodziło Ci o [corrected_domain]?" with a clickable link
6. WHEN the user clicks the suggestion link, THE Email_Validator SHALL update the email field with the corrected email address and clear the suggestion message
7. THE Email_Validator SHALL display a green checkmark icon next to the email field WHEN the email format is valid and no typos are detected
8. WHEN the email field is empty, THE Email_Validator SHALL NOT display any error message or icon
9. WHEN the user corrects an invalid email to a valid format, THE Email_Validator SHALL remove the error message and display the green checkmark icon
10. WHEN the user types in the email field after a suggestion has been displayed, THE Email_Validator SHALL clear the suggestion message
11. IF the email domain is not in the list of popular domains and the email format is valid per RFC 5322, THEN THE Email_Validator SHALL accept the email and display the green checkmark icon
12. THE Email_Validator SHALL display the error message "Nieprawidłowy format email" in red text below the email field with a minimum contrast ratio of 4.5:1 against the background

### Requirement 7: Social Login (OAuth)

**User Story:** Jako użytkownik, chcę móc zalogować się za pomocą mojego konta Google, Facebook lub Apple, abym nie musiał tworzyć i zapamiętywać kolejnego hasła.

#### Acceptance Criteria

1. THE Login_Form SHALL display three OAuth login buttons immediately below the standard login form: "Zaloguj przez Google", "Zaloguj przez Facebook", and "Zaloguj przez Apple"
2. WHEN the user clicks an OAuth login button, THE OAuth_Service SHALL redirect to the respective OAuth_Provider authorization page within 3 seconds
3. WHEN the OAuth_Provider successfully authenticates the user and returns an authorization code, THE OAuth_Service SHALL exchange the code for user profile information (email, name, profile picture) within 10 seconds
4. IF the email from the OAuth_Provider matches an existing user account, THEN THE OAuth_Service SHALL log the user in and issue a Session_Token
5. IF the email from the OAuth_Provider does not match an existing account, THEN THE OAuth_Service SHALL create a new user account with emailVerified set to true and log the user in
6. WHEN the user successfully authenticates via OAuth, THE OAuth_Service SHALL store the OAuth provider identifier and user ID to enable future logins with the same provider
7. WHEN the OAuth authentication fails or the user cancels, THE Application SHALL redirect back to the login page and display an error message indicating the login was cancelled or failed
8. THE OAuth_Service SHALL request only the minimum required scopes from each provider: email and basic profile information
9. IF the OAuth_Provider does not return an email address in the user profile, THEN THE OAuth_Service SHALL redirect to the login page and display an error message indicating that email is required for authentication
10. IF the OAuth_Provider returns an invalid or expired authorization code, THEN THE OAuth_Service SHALL redirect to the login page and display an error message indicating authentication failed
11. IF the OAuth_Service cannot create a new user account due to database constraints or system errors, THEN THE Application SHALL redirect to the login page and display an error message indicating account creation failed
12. IF the OAuth_Provider does not respond within 30 seconds or returns a network error, THEN THE OAuth_Service SHALL redirect to the login page and display an error message indicating the authentication service is unavailable

### Requirement 8: Better Error Messages

**User Story:** Jako użytkownik napotykający błąd podczas logowania lub rejestracji, chcę otrzymać jasny i pomocny komunikat błędu, abym wiedział jak rozwiązać problem.

#### Acceptance Criteria

1. WHEN the user attempts to log in with an incorrect email or password, THE Error_Message_Formatter SHALL display "Email lub hasło jest nieprawidłowe" above the login form
2. WHEN the user attempts to register with an email that already exists, THE Error_Message_Formatter SHALL display "Ten adres email jest już zarejestrowany. Spróbuj się zalogować lub użyj opcji 'Zapomniałeś hasła?'" above the registration form
3. WHEN the user attempts to register with a password that does not meet strength requirements, THE Error_Message_Formatter SHALL display "Hasło musi spełniać wszystkie wymagania bezpieczeństwa" above the registration form and highlight the unmet requirements in the Password_Validator
4. WHEN the user attempts to register with passwords that do not match, THE Error_Message_Formatter SHALL display "Hasła nie są identyczne" below the confirm password field
5. WHEN a network error occurs during login or registration, THE Error_Message_Formatter SHALL display "Nie można połączyć z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie" above the form
6. WHEN the server returns a 500 error, THE Error_Message_Formatter SHALL display "Wystąpił błąd serwera. Spróbuj ponownie za chwilę" above the form
7. WHEN the user is rate-limited, THE Error_Message_Formatter SHALL display "Zbyt wiele prób. Spróbuj ponownie za [X] minut" above the form, where X is the remaining wait time rounded up to the nearest minute
8. THE Error_Message_Formatter SHALL display error messages with a warning icon (⚠️) and a background color that provides a contrast ratio of at least 3:1 against the page background
9. WHEN the user submits a form with empty required fields, THE Error_Message_Formatter SHALL display "Wszystkie pola są wymagane" above the form
10. WHEN the user modifies any field that triggered an error message, THE Error_Message_Formatter SHALL remove the error message associated with that field
11. WHEN multiple errors occur simultaneously, THE Error_Message_Formatter SHALL display the highest priority error message first, with priority order: network errors > server errors > rate limiting > validation errors
12. THE Error_Message_Formatter SHALL display error messages in red text with a minimum contrast ratio of 4.5:1 against the background

### Requirement 9: Registration Progress Bar

**User Story:** Jako użytkownik przechodzący przez proces rejestracji, chcę widzieć wizualny wskaźnik postępu, abym wiedział ile kroków zostało do ukończenia rejestracji.

#### Acceptance Criteria

1. THE Registration_Form SHALL display a Registration_Progress_Bar showing 3 steps: "Dane konta", "Weryfikacja email", and "Gotowe"
2. WHEN the user is on the initial registration form, THE Registration_Progress_Bar SHALL mark step 1 "Dane konta" as active with a distinct visual indicator
3. WHEN the user submits the registration form and the system accepts the submission, THE Registration_Progress_Bar SHALL advance to step 2 "Weryfikacja email" and display the email verification prompt
4. WHEN the user completes email verification and the system confirms the verification, THE Registration_Progress_Bar SHALL advance to step 3 "Gotowe" and display a success message with a button to proceed to the dashboard
5. IF email verification fails or expires, THEN THE Registration_Progress_Bar SHALL remain on step 2 "Weryfikacja email" and display an error message indicating the verification failure
6. THE Registration_Progress_Bar SHALL display completed steps with a checkmark icon
7. THE Registration_Progress_Bar SHALL display the active step with a background that provides a contrast ratio of at least 3:1 against adjacent steps and bold text with font-weight of 600 or greater
8. THE Registration_Progress_Bar SHALL display future steps with reduced opacity (50% or less) and no icon
9. THE Registration_Progress_Bar SHALL display horizontally on viewports with min-width 768px and vertically on viewports with max-width 767px
10. THE Registration_Progress_Bar SHALL prevent user navigation to future incomplete steps
11. THE Registration_Progress_Bar SHALL allow user navigation back to completed steps

### Requirement 10: Biometric Authentication

**User Story:** Jako użytkownik urządzenia z czytnikiem biometrycznym, chcę móc logować się za pomocą Face ID, Touch ID lub Windows Hello, abym mógł szybko i bezpiecznie uzyskać dostęp do aplikacji.

#### Acceptance Criteria

1. WHEN the user's browser supports the WebAuthn_API and the device has at least one OS-level enrolled biometric authenticator, THE Login_Form SHALL display a "Zaloguj biometrycznie" button
2. WHEN the user clicks the "Zaloguj biometrycznie" button for the first time, THE Biometric_Service SHALL prompt the user to register their biometric credential using the device's native biometric prompt within 60 seconds
3. WHEN the user successfully registers a biometric credential, THE Biometric_Service SHALL store the credential ID associated with the user's account on the server
4. WHEN the user clicks the "Zaloguj biometrycznie" button on subsequent visits, THE Biometric_Service SHALL prompt for biometric authentication using the device's native prompt within 60 seconds
5. WHEN biometric authentication succeeds, THE Biometric_Service SHALL verify the credential signature on the server within 10 seconds and issue a Session_Token
6. IF biometric authentication fails or is cancelled, THEN THE Application SHALL display a message "Uwierzytelnianie biometryczne nie powiodło się. Użyj hasła aby się zalogować"
7. THE Biometric_Service SHALL support at least the following authenticator types: platform authenticators (Face ID, Touch ID, Windows Hello) with user verification required
8. THE Application SHALL allow users to manage registered biometric credentials in their profile settings, including the ability to view credential names and remove credentials
9. IF the browser does not support WebAuthn_API or the device lacks OS-level enrolled biometric authenticators, THEN THE Login_Form SHALL hide the "Zaloguj biometrycznie" button entirely
10. IF the network connection fails during biometric credential verification, THEN THE Application SHALL display an error message "Nie można zweryfikować uwierzytelnienia biometrycznego. Sprawdź połączenie internetowe"
11. IF the server verification fails due to invalid signature or expired credential, THEN THE Application SHALL display an error message "Uwierzytelnianie biometryczne nie powiodło się. Użyj hasła aby się zalogować"
12. THE Biometric_Service SHALL allow a maximum of 5 registered biometric credentials per user account

