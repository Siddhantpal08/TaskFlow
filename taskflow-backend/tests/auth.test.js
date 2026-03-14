const request = require('supertest');
const { app } = require('../src/app'); // Import express app
const db = require('../src/utils/db');

// Mock db queries specifically for auth tests
jest.mock('../src/utils/db', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

describe('Auth API Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            db.query.mockResolvedValueOnce([[]]); // check existing email -> none
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert success
            const bcrypt = require('bcrypt');
            bcrypt.hash.mockResolvedValueOnce('hashedpassword');

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', 1);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should return 409 if email already exists', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, email: 'test@example.com' }]]); // existing email

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(409);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toMatch(/already registered/);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            db.query.mockResolvedValueOnce([[{
                id: 1,
                email: 'test@example.com',
                password: 'hashedpassword'
            }]]); // user found
            const bcrypt = require('bcrypt');
            bcrypt.compare.mockResolvedValueOnce(true);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should return 401 with incorrect password', async () => {
            db.query.mockResolvedValueOnce([[{
                id: 1,
                email: 'test@example.com',
                password: 'hashedpassword'
            }]]); // user found
            const bcrypt = require('bcrypt');
            bcrypt.compare.mockResolvedValueOnce(false);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.status).toBe('fail');
        });
    });
});
