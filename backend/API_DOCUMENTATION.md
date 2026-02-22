# Budgetly API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "_id": "65f1234567890abcdef12345",
    "email": "student@example.com",
    "name": "John Doe",
    "monthlyBudget": 100,
    "currency": "GBP",
    "createdAt": "2026-02-02T18:30:00.000Z",
    "updatedAt": "2026-02-02T18:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Email already registered
- `400` - Validation errors

---

### POST /auth/login

Login to existing account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "_id": "65f1234567890abcdef12345",
    "email": "student@example.com",
    "name": "John Doe",
    "monthlyBudget": 100,
    "currency": "GBP"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid email or password

---

### GET /auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "65f1234567890abcdef12345",
    "email": "student@example.com",
    "name": "John Doe",
    "monthlyBudget": 100,
    "currency": "GBP",
    "telegramChatId": null,
    "telegramUsername": null
  }
}
```

**Errors:**
- `401` - Invalid or missing token
- `404` - User not found

---

## Budget Endpoints

### GET /budget

Get user's monthly budget.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "monthlyBudget": 100,
  "currency": "GBP"
}
```

---

### PUT /budget

Update monthly budget.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "monthlyBudget": 150
}
```

**Response (200):**
```json
{
  "monthlyBudget": 150,
  "currency": "GBP"
}
```

**Errors:**
- `400` - Budget cannot be negative

---

## Expense Endpoints

### GET /expenses

Get all expenses for a specific month.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional) - Format: `YYYY-MM` (e.g., `2026-02`)
- If not provided, defaults to current month

**Example:**
```
GET /expenses?month=2026-02
```

**Response (200):**
```json
{
  "expenses": [
    {
      "_id": "65f1234567890abcdef12346",
      "userId": "65f1234567890abcdef12345",
      "description": "Coffee",
      "amount": 4.5,
      "category": "Food",
      "date": "2026-02-02T10:30:00.000Z",
      "addedVia": "web",
      "createdAt": "2026-02-02T10:30:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12347",
      "userId": "65f1234567890abcdef12345",
      "description": "Bus ticket",
      "amount": 2.5,
      "category": "Transport",
      "date": "2026-02-01T08:15:00.000Z",
      "addedVia": "telegram",
      "createdAt": "2026-02-01T08:15:00.000Z"
    }
  ],
  "total": 7,
  "budget": 100,
  "remaining": 93
}
```

---

### POST /expenses

Create a new expense.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "description": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-02-02T10:30:00.000Z"
}
```

**Fields:**
- `description` (required) - Expense description
- `amount` (required) - Amount spent
- `category` (optional) - Category name (defaults to "Other")
- `date` (optional) - ISO 8601 date (defaults to current time)

**Response (201):**
```json
{
  "expense": {
    "_id": "65f1234567890abcdef12346",
    "userId": "65f1234567890abcdef12345",
    "description": "Coffee",
    "amount": 4.5,
    "category": "Food",
    "date": "2026-02-02T10:30:00.000Z",
    "addedVia": "web",
    "createdAt": "2026-02-02T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Validation errors (missing description/amount, negative amount)

---

### DELETE /expenses/:id

Delete an expense by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```
DELETE /expenses/65f1234567890abcdef12346
```

**Response (200):**
```json
{
  "message": "Expense deleted"
}
```

**Errors:**
- `404` - Expense not found or doesn't belong to user
- `400` - Invalid ID format

---

### GET /expenses/stats

Get expense statistics for current month.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "monthlyTotal": 87.5,
  "count": 15,
  "averageExpense": 5.83,
  "budget": 100,
  "remaining": 12.5,
  "percentUsed": 87.5,
  "byCategory": {
    "Food": 45.5,
    "Transport": 22,
    "Entertainment": 20
  }
}
```

---

## Telegram Integration Endpoints

### POST /telegram/generate-code

Generate a 6-digit linking code for Telegram account connection.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "linkingCode": "123456",
  "expiresAt": "2026-02-02T18:40:00.000Z"
}
```

**Note:** Code expires in 10 minutes.

---

### GET /telegram/status

Check if Telegram account is connected.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "connected": true,
  "telegramUsername": "johndoe"
}
```

Or if not connected:
```json
{
  "connected": false,
  "telegramUsername": null
}
```

---

### DELETE /telegram/disconnect

Disconnect Telegram account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Telegram disconnected"
}
```

---

### POST /telegram/webhook

Webhook endpoint for Telegram bot (called by Agent 3).

**No authentication required** - This is called by the Telegram bot.

**Link Account Request:**
```json
{
  "chatId": "123456789",
  "linkingCode": "123456",
  "username": "johndoe"
}
```

**Link Account Response (200):**
```json
{
  "success": true,
  "message": "Account linked successfully",
  "user": {
    "name": "John Doe",
    "email": "student@example.com"
  }
}
```

**Create Expense Request:**
```json
{
  "chatId": "123456789",
  "description": "Lunch",
  "amount": "12.50"
}
```

**Create Expense Response (200):**
```json
{
  "success": true,
  "expense": {
    "id": "65f1234567890abcdef12346",
    "description": "Lunch",
    "amount": 12.5,
    "date": "2026-02-02T12:30:00.000Z"
  },
  "total": 99.5,
  "budget": 100,
  "remaining": 0.5,
  "currency": "GBP"
}
```

**Errors:**
- `400` - Invalid or expired linking code
- `404` - User not found (account not linked)
- `400` - Missing description or amount

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

All API endpoints are rate-limited to **100 requests per 15 minutes** per IP address.

If exceeded, you'll receive:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Health Check

### GET /health

Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T18:30:00.000Z"
}
```
