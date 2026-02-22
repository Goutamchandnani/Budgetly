# Backend API Requirements for Telegram Bot

This document specifies the API endpoints that the backend (Agent 2) must implement for the Telegram bot to function correctly.

## Base URL

All endpoints should be prefixed with: `/api/telegram`

Example: `https://your-backend.com/api/telegram/link`

## Authentication

The bot identifies users by their Telegram `chatId`. The backend should:
1. Store `telegramChatId` in the user model
2. Link Telegram accounts to user accounts via verification codes
3. Authenticate requests using the `chatId` parameter

## Required Endpoints

### 1. Account Linking

#### POST `/api/telegram/link`

Link a Telegram account to a user account.

**Request Body:**
```json
{
  "code": "ABC123",
  "chatId": 123456789,
  "username": "john_doe"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Account linked successfully",
  "user": {
    "id": "user_id",
    "telegramChatId": 123456789,
    "telegramUsername": "john_doe"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid or expired code"
}
```

**Implementation Notes:**
- Verify the linking code is valid and not expired
- Check code hasn't been used already
- Update user record with `telegramChatId` and `telegramUsername`
- Invalidate the code after successful linking
- Codes should expire after 10 minutes

---

### 2. Check Link Status

#### GET `/api/telegram/check/:chatId`

Check if a Telegram user is linked to an account.

**Parameters:**
- `chatId` (path parameter): Telegram chat ID

**Response (200):**
```json
{
  "linked": true,
  "userId": "user_id"
}
```

or

```json
{
  "linked": false
}
```

**Implementation Notes:**
- Query database for user with matching `telegramChatId`
- Return `linked: true` if found, `false` otherwise

---

### 3. Add Expense

#### POST `/api/telegram/expense`

Add a new expense via Telegram.

**Request Body:**
```json
{
  "chatId": 123456789,
  "amount": 15.50,
  "description": "lunch at cafe",
  "date": "2026-02-02T12:30:00.000Z"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "expense": {
    "id": "expense_id",
    "amount": 15.50,
    "description": "lunch at cafe",
    "date": "2026-02-02T12:30:00.000Z"
  },
  "budget": 200,
  "spent": 85.50,
  "remaining": 114.50
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found or not linked"
}
```

**Implementation Notes:**
- Find user by `telegramChatId`
- Create expense record linked to user
- Calculate current month's total expenses
- Return updated budget status
- Validate amount is positive number
- Validate description is not empty

---

### 4. Get Budget Status

#### GET `/api/telegram/budget/:chatId`

Get current budget status for a user.

**Parameters:**
- `chatId` (path parameter): Telegram chat ID

**Response (200):**
```json
{
  "budget": 200,
  "spent": 85.50,
  "remaining": 114.50,
  "count": 12,
  "currency": "GBP"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Implementation Notes:**
- Find user by `telegramChatId`
- Get user's monthly budget setting
- Calculate total expenses for current month
- Calculate remaining budget
- Count number of expenses this month
- Return all values in user's currency (default: GBP)

---

### 5. Get Recent Expenses

#### GET `/api/telegram/expenses/:chatId`

Get recent expenses for a user.

**Parameters:**
- `chatId` (path parameter): Telegram chat ID
- `limit` (query parameter, optional): Number of expenses to return (default: 10)

**Example:** `/api/telegram/expenses/123456789?limit=10`

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "expense_id_1",
      "amount": 15.50,
      "description": "lunch",
      "date": "2026-02-02T12:00:00.000Z",
      "category": "Food"
    },
    {
      "id": "expense_id_2",
      "amount": 3.99,
      "description": "coffee",
      "date": "2026-02-02T09:00:00.000Z",
      "category": "Food"
    }
  ],
  "total": 2
}
```

**Implementation Notes:**
- Find user by `telegramChatId`
- Query expenses for current month
- Order by date descending (most recent first)
- Limit results to specified number
- Include category if available

---

### 6. Update Budget

#### PUT `/api/telegram/budget/:chatId`

Update user's monthly budget.

**Parameters:**
- `chatId` (path parameter): Telegram chat ID

**Request Body:**
```json
{
  "monthlyBudget": 200
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "budget": 200,
  "message": "Budget updated successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid budget amount"
}
```

**Implementation Notes:**
- Find user by `telegramChatId`
- Validate budget is positive number
- Update user's monthly budget setting
- Return new budget value

---

## Database Schema Requirements

### User Model Updates

Add these fields to your User model:

```javascript
{
  // Existing fields...
  telegramChatId: {
    type: Number,
    unique: true,
    sparse: true  // Allow null values
  },
  telegramUsername: {
    type: String
  },
  telegramLinkedAt: {
    type: Date
  }
}
```

### Linking Code Model

Create a new model for temporary linking codes:

```javascript
{
  code: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    // Set to 10 minutes from creation
    default: () => new Date(Date.now() + 10 * 60 * 1000)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Code Generation Endpoint (Web App)

The web app needs an endpoint to generate linking codes:

#### POST `/api/user/telegram/generate-code`

**Headers:**
```
Authorization: Bearer <user_jwt_token>
```

**Response (200):**
```json
{
  "code": "ABC123",
  "expiresAt": "2026-02-02T13:00:00.000Z"
}
```

**Implementation:**
- Generate random 6-character alphanumeric code
- Store in LinkingCode model
- Set expiration to 10 minutes
- Return code to user
- Clean up expired codes periodically

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200` - Success
- `201` - Created (for new expenses)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

---

## Testing Endpoints

Use these curl commands to test:

### Link Account
```bash
curl -X POST http://localhost:3000/api/telegram/link \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC123","chatId":123456789,"username":"test_user"}'
```

### Check Link
```bash
curl http://localhost:3000/api/telegram/check/123456789
```

### Add Expense
```bash
curl -X POST http://localhost:3000/api/telegram/expense \
  -H "Content-Type: application/json" \
  -d '{"chatId":123456789,"amount":15.50,"description":"test expense","date":"2026-02-02T12:00:00.000Z"}'
```

### Get Budget
```bash
curl http://localhost:3000/api/telegram/budget/123456789
```

### Get Expenses
```bash
curl http://localhost:3000/api/telegram/expenses/123456789?limit=5
```

### Update Budget
```bash
curl -X PUT http://localhost:3000/api/telegram/budget/123456789 \
  -H "Content-Type: application/json" \
  -d '{"monthlyBudget":200}'
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on all endpoints
   - Linking: 5 attempts per hour per IP
   - Expense creation: 60 per hour per user
   - Budget queries: 120 per hour per user

2. **Validation**: Validate all inputs
   - Amount: positive number, max 2 decimal places
   - Description: non-empty, max 200 characters
   - ChatId: valid number

3. **Sanitization**: Sanitize user inputs to prevent injection attacks

4. **Logging**: Log all Telegram bot interactions for debugging

---

## CORS Configuration

Allow requests from the bot server:

```javascript
const corsOptions = {
  origin: process.env.BOT_SERVER_URL || 'http://localhost',
  credentials: true
};
```

---

## Environment Variables

Backend should use:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token  # For verification if needed
BOT_SERVER_URL=http://localhost    # For CORS

# Linking Code Settings
LINKING_CODE_LENGTH=6
LINKING_CODE_EXPIRY_MINUTES=10
```

---

## Coordination Checklist

Backend team (Agent 2) should:

- [ ] Add `telegramChatId` and `telegramUsername` to User model
- [ ] Create LinkingCode model
- [ ] Implement all 6 required endpoints
- [ ] Add code generation endpoint for web app
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up error handling
- [ ] Configure CORS
- [ ] Test all endpoints with curl
- [ ] Document any deviations from this spec

Bot team (Agent 3) provides:

- [ ] Expected request/response formats (this document)
- [ ] Error handling requirements
- [ ] Testing commands
- [ ] Bot server URL for CORS

---

## Questions for Backend Team

1. What is the base URL for the API in development?
2. What is the base URL for the API in production?
3. Are there any existing authentication middleware we should be aware of?
4. What database are you using (MongoDB, PostgreSQL, etc.)?
5. Do you have a preferred method for generating random codes?
6. Should we implement any additional security measures?

---

## Support

For questions or clarifications, contact the bot development team or refer to the main project documentation.
