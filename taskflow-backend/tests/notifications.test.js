const request = require('supertest');
const { app } = require('../src/app');
const db = require('../src/utils/db');
const jwt = require('../src/utils/jwt');

jest.mock('../src/utils/db', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../src/utils/socket', () => ({
    initSocket: jest.fn(),
    emitToUser: jest.fn(),
    getIo: jest.fn()
}));

describe('Notifications API Endpoints', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.generateTokens(1).accessToken;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/notifications', () => {
        it('should list notifications and unread count', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, message: 'Test notif', is_read: 0 }]]); // get notifications
            db.query.mockResolvedValueOnce([[{ count: 1 }]]); // get unread count

            const res = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.notifications).toBeInstanceOf(Array);
            expect(res.body.data.unreadCount).toBe(1);
        });
    });

    describe('PATCH /api/v1/notifications/:id/read', () => {
        it('should return 200 on successful mark as read', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // mark read success

            const res = await request(app)
                .patch('/api/v1/notifications/1/read')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/marked as read/);
        });
    });

    describe('PATCH /api/v1/notifications/read-all', () => {
        it('should mark all notifications as read', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 5 }]); // mark all read

            const res = await request(app)
                .patch('/api/v1/notifications/read-all')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/All notifications marked as read/);
        });
    });
});
