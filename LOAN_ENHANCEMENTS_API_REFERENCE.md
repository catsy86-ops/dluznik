# Loan Enhancements - API Reference Guide

## Quick Navigation

### Tier 1 Endpoints (Basic Features)
- [Payment Schedule Generator](#payment-schedule-generator)
- [Advanced Search/Filters](#advanced-searchfilters)
- [Payment Suggestion AI](#payment-suggestion-ai)
- [Loan Comparison](#loan-comparison)

### Tier 2 Endpoints (Interest & Health)
- [Interest Breakdown](#interest-breakdown)
- [Loan Health Score](#loan-health-score)

### Tier 3 Endpoints (Advanced)
- [Payment Forecasting](#payment-forecasting)
- [Payment Rules Engine](#payment-rules-engine)

---

## TIER 1 ENDPOINTS

### Payment Schedule Generator

#### GET /api/loans/:id/payment-schedule
Generate amortization schedule for a loan.

**Query Parameters:**
```
months: number (optional, default: 12)
```

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/payment-schedule?months=24" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Harmonogram spłat wygenerowany",
  "data": {
    "loanId": "123",
    "borrowerName": "John Doe",
    "totalBalance": 5000,
    "interestRate": 5,
    "months": 24,
    "monthlyPayment": 213.45,
    "schedule": [
      {
        "month": 1,
        "dueDate": "2024-02-15",
        "principalPayment": 200.00,
        "interestPayment": 13.45,
        "totalPayment": 213.45,
        "remainingBalance": 4800.00
      }
    ],
    "totalInterestCharged": 145.80
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Loan not found

---

### Advanced Search/Filters

#### GET /api/loans/search/advanced
Search and filter loans with multiple criteria.

**Query Parameters:**
```
status: string (active|paid|overdue|paused|disputed|cancelled)
minAmount: number (minimum current balance)
maxAmount: number (maximum current balance)
dateFrom: ISO string (creation date from)
dateTo: ISO string (creation date to)
category: string (loan category)
searchTerm: string (full-text search in names/descriptions)
page: number (default: 1)
limit: number (default: 10, max: 100)
```

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/search/advanced?status=active&minAmount=1000&maxAmount=10000&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pożyczki przefiltrowane",
  "data": {
    "loans": [
      {
        "id": "123",
        "borrowerName": "John",
        "originalAmount": 5000,
        "currentBalance": 3500,
        "status": "active",
        "createdAt": "2024-01-15",
        "interestRate": 5
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Payment Suggestion AI

#### POST /api/loans/:id/suggest-payment
Get intelligent payment suggestions based on loan analysis.

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/loans/123/suggest-payment" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sugestia płatności",
  "data": {
    "loanId": "123",
    "minimum": {
      "amount": 100.00,
      "description": "Minimalna płatność aby uniknąć opóźnienia (2.9% salda)",
      "avoidOverdue": true
    },
    "recommended": {
      "amount": 350.00,
      "description": "Rekomendowana płatność dla szybszego spłacenia",
      "percentageOfRemaining": 10.0
    },
    "fullPayment": {
      "amount": 3500.00,
      "description": "Pełna spłata pożyczki",
      "includingInterest": false
    },
    "interestSavings": {
      "byPayingMore": 245.50,
      "timeframeMonths": 12
    },
    "urgency": "soon"
  }
}
```

---

### Loan Comparison

#### GET /api/loans/compare/multiple
Compare multiple loans side by side.

**Query Parameters:**
```
ids: string (comma-separated loan IDs, e.g., "id1,id2,id3")
```

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/compare/multiple?ids=loan1,loan2,loan3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Porównanie pożyczek",
  "data": {
    "loans": [
      {
        "id": "loan1",
        "borrowerName": "John",
        "originalAmount": 5000,
        "remainingBalance": 3500,
        "percentagePaid": 30,
        "interestRate": 5.5,
        "daysToDue": 45,
        "status": "active",
        "interestAccrued": 245.50,
        "healthScore": 72.5,
        "recommendedAction": "Regularnie zwiększać płatności"
      },
      {
        "id": "loan2",
        "borrowerName": "Jane",
        "originalAmount": 10000,
        "remainingBalance": 8000,
        "percentagePaid": 20,
        "interestRate": 8,
        "daysToDue": 15,
        "status": "active",
        "interestAccrued": 520.00,
        "healthScore": 55.0,
        "recommendedAction": "Wydłużenie terminu spłaty powinno być rozważone"
      }
    ],
    "summary": {
      "totalLoans": 2,
      "totalOriginalAmount": 15000,
      "totalRemaining": 11500,
      "averageHealthScore": 63.75,
      "loansAtRisk": 1
    }
  }
}
```

---

## TIER 2 ENDPOINTS

### Interest Breakdown

#### GET /api/loans/:id/interest-breakdown
Get detailed interest breakdown.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/interest-breakdown" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rozkład odsetek",
  "data": {
    "loanId": "123",
    "principal": 5000,
    "interestAccrued": 245.50,
    "totalAccrued": 5245.50,
    "principalPaid": 1500,
    "interestPaid": 100.25,
    "totalPaid": 1600.25,
    "remainingPrincipal": 3500,
    "remainingInterest": 145.25,
    "totalRemaining": 3645.25,
    "percentageCompletion": 30,
    "interestPercentageOfOriginal": 4.9
  }
}
```

---

#### GET /api/loans/:id/interest-accrual
Get real-time accrued interest (current moment).

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/interest-accrual" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bieżące naliczanie odsetek",
  "data": {
    "loanId": "123",
    "currentAccruedInterest": 245.50,
    "accruedSinceLastPayment": 12.35,
    "dailyAccrualRate": 0.68,
    "lastPaymentDate": "2024-01-25"
  }
}
```

---

### Loan Health Score

#### GET /api/loans/:id/health-score
Calculate comprehensive health score (0-100).

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/health-score" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Wskaźnik zdrowotności pożyczki",
  "data": {
    "loanId": "123",
    "score": 72.5,
    "category": "good",
    "breakdown": {
      "timelinessScore": {
        "score": 40,
        "weight": 40,
        "daysToOverdue": 45,
        "daysSinceOverdue": 0
      },
      "balanceScore": {
        "score": 30,
        "weight": 40,
        "remainingPercentage": 70,
        "remainingAmount": 3500
      },
      "velocityScore": {
        "score": 2.5,
        "weight": 20,
        "percentagePaid": 30,
        "averageMonthlyPayment": 125.50,
        "paymentFrequency": 6
      }
    },
    "risks": [
      "SLOW_PROGRESS: Postępy w spłacaniu są wolne"
    ],
    "recommendations": [
      "Ustaw regularne automatyczne płatności",
      "Na obecnym tempie, spłacisz za ok. 28 miesięcy"
    ]
  }
}
```

**Health Categories:**
- 90-100: excellent
- 75-89: good
- 50-74: fair
- 25-49: poor
- 0-24: critical

---

## TIER 3 ENDPOINTS

### Payment Forecasting

#### GET /api/loans/:id/forecast
Forecast payment completion date using ML-inspired analysis.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/forecast" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Prognoza spłaty",
  "data": {
    "loanId": "123",
    "currentBalance": 3500,
    "estimatedCompletionDate": "2025-03-15",
    "estimatedMonths": 28,
    "confidence": 78.5,
    "riskOfOverdue": "low",
    "analysis": {
      "lastTransactionsCount": 8,
      "averageMonthlyPayment": 125.50,
      "paymentTrend": "stable",
      "trendStrength": 0.72,
      "totalPaymentVelocity": 4.18
    },
    "scenarios": [
      {
        "name": "Konserwatywny",
        "monthlyPayment": 100,
        "completionDate": "2025-05-15",
        "months": 35
      },
      {
        "name": "Umiarkowany",
        "monthlyPayment": 125.50,
        "completionDate": "2025-03-15",
        "months": 28
      },
      {
        "name": "Agresywny",
        "monthlyPayment": 188.25,
        "completionDate": "2025-01-15",
        "months": 19
      }
    ]
  }
}
```

---

### Payment Rules Engine

#### POST /api/loans/:id/rules
Create a new payment rule.

**Request Body:**
```json
{
  "type": "fixed_amount",
  "trigger": "monthly",
  "action": "pay_500",
  "amount": 500,
  "description": "Monthly automatic payment of 500 PLN"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/loans/123/rules" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed_amount",
    "trigger": "monthly",
    "action": "pay_500",
    "amount": 500,
    "description": "Monthly automatic payment"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Reguła płatności utworzona",
  "data": {
    "id": "rule-123",
    "loanId": "123",
    "type": "fixed_amount",
    "trigger": "monthly",
    "action": "pay_500",
    "amount": 500,
    "percentage": null,
    "startDate": null,
    "endDate": null,
    "isActive": true,
    "description": "Monthly automatic payment",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Rule Types:**
- `fixed_amount`: Pay a fixed amount (e.g., 500 PLN)
- `percentage`: Pay percentage of remaining balance (e.g., 5%)
- `on_date`: Pay on specific day (e.g., 15-of-month)
- `on_event`: Pay on event (e.g., payment_overdue, balance_threshold)

---

#### GET /api/loans/:id/rules
Get all payment rules for a loan.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/rules" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reguły płatności",
  "data": [
    {
      "id": "rule-123",
      "loanId": "123",
      "type": "fixed_amount",
      "trigger": "monthly",
      "action": "pay_500",
      "amount": 500,
      "isActive": true,
      "createdAt": "2024-01-15"
    }
  ]
}
```

---

#### GET /api/loans/:id/rules/active
Get only active payment rules.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/rules/active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET /api/loans/:id/rules/suggested
Get AI-suggested payment rules for a loan.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/loans/123/rules/suggested" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sugerowane reguły płatności",
  "data": [
    {
      "type": "fixed_amount",
      "trigger": "monthly",
      "action": "pay_416.67",
      "description": "Automatyczna miesięczna płatność 416.67 PLN (spłaci pożyczkę w 12 miesięcy)"
    },
    {
      "type": "fixed_amount",
      "trigger": "biweekly",
      "action": "pay_192.31",
      "description": "Automatyczna płatność co dwa tygodnie 192.31 PLN (szybsza spłata)"
    },
    {
      "type": "percentage",
      "trigger": "monthly",
      "action": "pay_5_percent",
      "description": "5% pozostałego salda każdego miesiąca"
    }
  ]
}
```

---

#### PUT /api/loans/rules/:ruleId
Update a payment rule.

**Request Body (any field):**
```json
{
  "amount": 600,
  "isActive": true,
  "description": "Updated monthly payment"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/loans/rules/rule-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 600}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reguła płatności zaktualizowana",
  "data": {
    "id": "rule-123",
    "amount": 600
  }
}
```

---

#### DELETE /api/loans/rules/:ruleId
Delete a payment rule.

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/loans/rules/rule-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reguła usunięta",
  "data": null
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "status": 400,
    "code": "INVALID_INPUT",
    "message": "Invalid request parameters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "status": 401,
    "code": "UNAUTHORIZED",
    "message": "User is not authenticated"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "status": 404,
    "code": "LOAN_NOT_FOUND",
    "message": "Loan not found"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "status": 500,
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Authentication

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

Recommended rate limits (can be configured):
- 100 requests per minute per user
- 10 requests per second per endpoint

---

## Pagination

Most list endpoints support pagination:
- `page`: Page number (1-indexed, default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes:
```json
{
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
