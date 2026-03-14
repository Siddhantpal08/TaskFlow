const request = require('supertest');
const { app } = require('../src/app');
const db = require('../src/utils/db');
const jwt = require('../src/utils/jwt');

jest.mock('../src/utils/db', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

// Mock socket.io to avoid setup errors in tests
jest.mock('../src/utils/socket', () => ({
    initSocket: jest.fn(),
    emitToUser: jest.fn(),
    getIo: jest.fn()
}));

describe('Tasks API Endpoints', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.generateTokens(1).accessToken;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/tasks', () => {
        it('should fetch tasks for authenticated user', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, title: 'Task 1', assigned_to: 1 }]]); // user tasks

            const res = await request(app)
                .get('/api/v1/tasks')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data[0]).toHaveProperty('title', 'Task 1');
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/v1/tasks');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/v1/tasks', () => {
        it('should create a task successfully', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 10 }]); // insert
            db.query.mockResolvedValueOnce([[{ id: 10, title: 'New task' }]]); // get created

            const res = await request(app)
                .post('/api/v1/tasks')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    title: 'New task',
                    priority: 'high',
                    assigned_to: 1
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New task');
        });

        it('should return 422 for invalid body', async () => {
            const res = await request(app)
                .post('/api/v1/tasks')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ priority: 'extreme' }); // missing title, invalid priority

            expect(res.status).toBe(422);
            expect(res.body.status).toBe('fail');
        });
    });

    describe('PATCH /api/v1/tasks/:id/status', () => {
        it('should return 409 for invalid status transition (done to active)', async () => {
            db.query.mockResolvedValue([[{ id: 10, status: 'done', assigned_to: 1, assigned_by: 1 }]]); // get task

            const res = await request(app)
                .patch('/api/v1/tasks/10/status')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ status: 'active' });

            expect(res.status).toBe(409);
            expect(res.body.message).toMatch(/Cannot transition from 'done' to 'active'/);
        });

        it('should allow pending to active transition', async () => {
            db.query.mockResolvedValueOnce([[{ id: 10, status: 'pending', assigned_to: 1, assigned_by: 1 }]]); // get task
            db.query.mockResolvedValueOnce([{}]); // update
            db.query.mockResolvedValueOnce([[{ id: 10, status: 'active' }]]); // get updated

            const res = await request(app)
                .patch('/api/v1/tasks/10/status')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ status: 'active' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('active');
        });
    });
});
