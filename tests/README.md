# Test Structure

This directory contains all tests for the Debt Management Application.

## Directory Structure

```
tests/
├── unit/                    # Unit tests for individual functions and classes
│   ├── services/           # Tests for business logic services
│   ├── repositories/       # Tests for data access layer
│   ├── controllers/        # Tests for API controllers
│   ├── models/             # Tests for data models
│   └── utils/              # Tests for utility functions
├── properties/             # Property-based tests using fast-check
│   ├── services/           # Property tests for services
│   ├── models/             # Property tests for models
│   └── integration/        # Property tests for integrated components
├── setup.ts               # Global test setup and utilities
└── README.md              # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- tests/unit/services/auth.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Payment"
```

## Test Types

### Unit Tests (`tests/unit/`)
- Test individual functions and classes in isolation
- Use mocks for external dependencies
- Focus on specific behavior and edge cases
- File naming: `*.test.ts` or `*.spec.ts`

Example:
```typescript
describe('AuthService', () => {
  it('should hash password with bcrypt', () => {
    // Test implementation
  });
});
```

### Property-Based Tests (`tests/properties/`)
- Test universal properties across randomly generated inputs
- Use fast-check for input generation
- Verify correctness properties hold for all valid inputs
- File naming: `*.property.ts` or `*.properties.ts`

Example:
```typescript
import fc from 'fast-check';

describe('Payment Amount Validation', () => {
  it('should validate payment amount is positive and not exceed balance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 1, max: 1000000 }),
        (balance, payment) => {
          // Property test implementation
        }
      )
    );
  });
});
```

## Coverage Reporting

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD integration
- `coverage/coverage-summary.json` - JSON summary

View the HTML report:
```bash
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

## Coverage Thresholds

The project enforces minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Tests will fail if coverage falls below these thresholds.

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   - ✅ `should return error when payment exceeds balance`
   - ❌ `test payment`

2. **Test Organization**: Group related tests using `describe` blocks
   ```typescript
   describe('LoanService', () => {
     describe('createLoan', () => {
       it('should create loan with valid data', () => {});
       it('should reject loan with invalid amount', () => {});
     });
   });
   ```

3. **Arrange-Act-Assert Pattern**: Structure tests clearly
   ```typescript
   it('should update balance after payment', () => {
     // Arrange
     const loan = new Loan({ balance: 1000 });
     
     // Act
     loan.registerPayment(200);
     
     // Assert
     expect(loan.balance).toBe(800);
   });
   ```

4. **Property-Based Testing**: Use meaningful generators
   ```typescript
   fc.property(
     fc.integer({ min: 1, max: 1000000 }), // balance
     fc.integer({ min: 1, max: 1000000 }), // payment
     (balance, payment) => {
       // Test that payment <= balance
       fc.pre(payment <= balance);
       // ... test implementation
     }
   );
   ```

5. **Avoid Test Interdependence**: Each test should be independent
   - Don't rely on test execution order
   - Clean up after each test using `afterEach`
   - Use fresh test data for each test

## Debugging Tests

### Run single test
```bash
npm test -- --testNamePattern="specific test name"
```

### Run with verbose output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## CI/CD Integration

Coverage reports are automatically generated and can be integrated with:
- GitHub Actions
- GitLab CI
- Jenkins
- Codecov
- Coveralls

The `coverage/lcov.info` file is the standard format for CI/CD tools.
