const asyncWrapper = require('../utils/asyncWrapper');
const calendarModel = require('../models/calendarModel');
const notificationService = require('../services/notificationService');
const { AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

// ─── Validation ───────────────────────────────────────────────────────────────

const createEventSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(2000).allow('', null).optional(),
    event_date: Joi.string().isoDate().required(),
    end_date: Joi.string().isoDate().allow(null, '').optional(),
    event_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).allow(null, '').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').default('low'),
    recurrence: Joi.string().valid('none', 'weekly', 'monthly').default('none'),
});

const validateBody = (schema, body) => {
    const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        throw { statusCode: 422, message: messages, status: 'fail' };
    }
    if (value.event_date) value.event_date = new Date(value.event_date).toISOString().split('T')[0];
    if (value.end_date) value.end_date = new Date(value.end_date).toISOString().split('T')[0];
    return value;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/calendar/events?year=2025&month=3
 * Returns events + task due dates for the given month.
 */
const listEvents = asyncWrapper(async (req, res) => {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
        return res.status(422).json({ status: 'fail', message: 'Month must be between 1 and 12.' });
    }

    const data = await calendarModel.getEventsForMonth(req.user.id, year, month);
    res.status(200).json({ success: true, data });
});

/** POST /api/v1/calendar/events */
const createEvent = asyncWrapper(async (req, res) => {
    const data = validateBody(createEventSchema, req.body);
    const event = await calendarModel.createEvent(req.user.id, data);

    // Notify the creator themselves (for the event creation notification type)
    await notificationService.sendNotification(
        req.user.id,
        'event_created',
        `New event created: "${event.title}" on ${event.event_date}`,
        event.id
    );

    res.status(201).json({ success: true, data: event });
});

/** PUT /api/v1/calendar/events/:id */
const updateEvent = asyncWrapper(async (req, res) => {
    const data = validateBody(createEventSchema, req.body);
    const existing = await calendarModel.getEventById(parseInt(req.params.id, 10), req.user.id);
    if (!existing) throw new AppError('Event not found.', 404);

    const event = await calendarModel.updateEvent(parseInt(req.params.id, 10), req.user.id, data);
    res.status(200).json({ success: true, data: event });
});

/** DELETE /api/v1/calendar/events/:id */
const deleteEvent = asyncWrapper(async (req, res) => {
    const deleted = await calendarModel.deleteEvent(parseInt(req.params.id, 10), req.user.id);
    if (!deleted) throw new AppError('Event not found.', 404);
    res.status(200).json({ success: true, message: 'Event deleted.' });
});

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
