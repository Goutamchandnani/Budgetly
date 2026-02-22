const request = require('supertest');
const app = require('../../src/server');
require('./setup');

describe('Vulnerability Protection', () => {
    describe('TC-VULN-001: Injection Attacks', () => {
        it('should prevent NoSQL injection in login', async () => {
            const payload = {
                email: { $ne: null },
                password: { $ne: null }
            };

            // This might return 400 (if sanitized validation catches it) 
            // OR 401 (if it treats it as string '[object Object]' and fails lookup)
            // It MUST NOT return 200.

            const res = await request(app)
                .post('/api/auth/login')
                .send(payload);

            expect(res.status).not.toBe(200);
        });
    });

    describe('TC-VULN-003: Stored XSS', () => {
        let token;
        beforeAll(async () => {
            // Create a user for XSS test
            const email = 'xss@test.com';
            await request(app).post('/api/auth/signup').send({
                email, password: 'Password123!', name: 'XSS Tester'
            });
            const login = await request(app).post('/api/auth/login').send({
                email, password: 'Password123!'
            });
            token = login.body.token;
        });

        it('should sanitize or handle XSS payloads in expense description', async () => {
            const xssPayload = '<script>alert("XSS")</script>';

            const res = await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: xssPayload,
                    amount: 10
                })
                .expect(201);

            // Check if it was saved. 
            // Ideally backend should sanitize OR frontend should escape.
            // Requirement says "Description should be sanitized" in TC-VULN-003.
            // If backend doesn't sanitize, this expectation effectively tests if it DOES.
            // If it fails, I'll recommend dompurify or similar.

            // Assuming for now verification means checking response body.
            expect(res.body.expense.description).not.toContain('<script>');
        });
    });

    describe('TC-VULN-009: Security Headers', () => {
        it('should have basic security headers (helmet)', async () => {
            const res = await request(app).get('/api/health');
            // Helmet adds various headers
            expect(res.headers['x-dns-prefetch-control']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined(); // SAMEORIGIN usually
            expect(res.headers['strict-transport-security']).toBeDefined(); // HSTS
            expect(res.headers['x-powered-by']).toBeUndefined(); // Helmet removes this
        });
    });
});
