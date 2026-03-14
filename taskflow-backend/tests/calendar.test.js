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

jest.mock('../src/services/notificationService', () => ({
    sendNotification: jest.fn()
}));

describe('Calendar API Endpoints', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.generateTokens(1).accessToken;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/calendar/events', () => {
        it('should fetch events and task dates for a specific month', async () => {
            // events
            db.query.mockResolvedValueOnce([[{ id: 1, title: 'Meeting', event_date: '2023-10-15' }]]);
            // task dates
            db.query.mockResolvedValueOnce([[{ id: 10, title: 'Task Due', due_date: '2023-10-20' }]]);

            const res = await request(app)
                .get('/api/v1/calendar/events?year=2023&month=10')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.events).toBeInstanceOf(Array);
            expect(res.body.data.taskDates).toBeInstanceOf(Array);
            expect(res.body.data.events[0].title).toBe('Meeting');
        });
    });

    describe('POST /api/v1/calendar/events', () => {
        it('should create an event successfully', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 5 }]); // insert event
            db.query.mockResolvedValueOnce([[{ id: 5, title: 'New Event', event_date: '2023-10-10' }]]); // get event

            const res = await request(app)
                .post('/api/v1/calendar/events')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    title: 'New Event',
                    event_date: '2023-10-10',
                    priority: 'high'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(5);
            expect(res.body.data.title).toBe('New Event');
        });
    });

    describe('DELETE /api/v1/calendar/events/:id', () => {
        it('should return 404 if event not found or unauthorized', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // delete affected 0

            const res = await request(app)
                .delete('/api/v1/calendar/events/999')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/not found/);
        });

        it('should return 200 on successful deletion', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete success

            const res = await request(app)
                .delete('/api/v1/calendar/events/5')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Event deleted/);
        });
    });
});
