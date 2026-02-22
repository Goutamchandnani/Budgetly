const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Expense = require('../../src/models/Expense');
require('./setup');


describe('Authorization Security', () => {
    let user1, user2;
    let token1, token2;
    let expense1;

    beforeAll(async () => {
        // Create two users
        await request(app).post('/api/auth/signup').send({
            email: 'authz1@test.com',
            password: 'Password123!',
            name: 'User One'
        });

        const login1 = await request(app).post('/api/auth/login').send({
            email: 'authz1@test.com',
            password: 'Password123!'
        });
        token1 = login1.body.token;
        user1 = login1.body.user;

        await request(app).post('/api/auth/signup').send({
            email: 'authz2@test.com',
            password: 'Password123!',
            name: 'User Two'
        });

        const login2 = await request(app).post('/api/auth/login').send({
            email: 'authz2@test.com',
            password: 'Password123!'
        });
        token2 = login2.body.token;
        user2 = login2.body.user;
    });

    describe('TC-AUTHZ-001: Resource Access Control', () => {
        beforeAll(async () => {
            // User 1 creates an expense
            const res = await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    description: 'User 1 Private Expense',
                    amount: 50
                });
            expense1 = res.body.expense;
            // Verify creation succeeded
            expect(res.status).toBe(201);
            expect(expense1).toBeDefined();
        });

        it('should not allow User 2 to view User 1 expenses', async () => {
            const res = await request(app)
                .get('/api/expenses')
                .set('Authorization', `Bearer ${token2}`)
                .expect(200);

            const found = res.body.expenses.find(e => e._id === expense1._id);
            expect(found).toBeUndefined();
        });

        it('should not allow User 2 to delete User 1 expense', async () => {
            await request(app)
                .delete(`/api/expenses/${expense1._id}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(404); // Controller returns 404 if not found for that user
        });
    });

    describe('TC-AUTHZ-002: Budget Modification Authorization', () => {
        it('should not allow modifying another users budget', async () => {
            // User 2 tries to modify User 1's budget (conceptually, by passing userId if it were possible)
            // But since the endpoint uses req.userId from token, User 2 modifies their OWN budget.
            // We verify that User 2's action does NOT affect User 1.

            await request(app)
                .put('/api/budget')
                .set('Authorization', `Bearer ${token2}`)
                .send({ monthlyBudget: 5000 });

            const user1Data = await request(app)
                .get('/api/budget')
                .set('Authorization', `Bearer ${token1}`);

            // User 1 budget should remain default (100) or whatever it was
            expect(user1Data.body.monthlyBudget).not.toBe(5000);
        });
    });

    describe('TC-AUTHZ-003: Protected Routes', () => {
        const protectedPaths = [
            { method: 'get', path: '/api/budget' },
            { method: 'post', path: '/api/expenses' },
        ];

        it('should reject requests without token', async () => {
            for (const { method, path } of protectedPaths) {
                await request(app)[method](path).expect(401);
            }
        });
    });

    describe('TC-AUTHZ-004: Telegram Account Linking Security', () => {
        it('should generate a linking code for authenticated user', async () => {
            const res = await request(app)
                .post('/api/telegram/generate-code')
                .set('Authorization', `Bearer ${token1}`)
                .expect(200);
            expect(res.body.linkingCode).toBeDefined();
        });

        // Additional tests for expiration would go here (mocking time)
    });
});
