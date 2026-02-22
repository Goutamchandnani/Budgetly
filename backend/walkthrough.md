# Backend API Walkthrough

I have successfully built the **Budgetly Backend API** using Express.js and MongoDB.

## What has been done?

1.  **Project Structure**:
    - Reorganized `backend/src` with proper separation of concerns (Controllers, Models, Routes, Middleware).
    - Configured `package.json` to correctly point to `src/server.js`.

2.  **Core Features Implemented**:
    - **Authentication**: `authController.js` handles Signup, Login (JWT), and User Profile.
    - **Budget Management**: `budgetController.js` allows viewing and updating monthly budgets.
    - **Expense Tracking**: `expenseController.js` supports CRUD operations and basic stats.
    - **Telegram Integration**: `telegramController.js` manages linking codes and webhooks.

3.  **Database Models**:
    - `User`: Stores profile, budget settings, and Telegram linking info.
    - `Expense`: Tracks transactions with categorization.

4.  **Security & Stability**:
    - Added `helmet` for security headers.
    - Added `express-rate-limit` to prevent abuse.
    - Configured `cors` for frontend communication.
    - Implemented global error handling and input validation.

5.  **Environment**:
    - Created `.env` with validated configuration fields.
    - Fixed `server.js` to prevent auto-start during tests.

## Verification Results

- **Dependencies**: `npm install` completed successfully.
- **Server Startup**: Confirmed `server.js` initializes valid Express app and connects to Telegram Bot logic.
- **Tests**: detailed unit tests in `tests/api.test.js` covering all endpoints.

## How to Run

1.  **Start MongoDB** (if not running).
2.  Start the server:
    ```bash
    cd backend
    npm run dev
    ```
3.  The API will be available at `http://localhost:3000/api`.

## API Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Add expense |
| POST | `/api/telegram/generate-code` | Get Telegram link code |
