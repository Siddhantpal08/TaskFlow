const asyncWrapper = require('../utils/asyncWrapper');
const notesModel = require('../models/notesModel');
const Joi = require('joi');

const noteSchema = Joi.object({
    title: Joi.string().max(255).optional(),
    content: Joi.string().allow('', null).optional(),
});

const validate = (schema, body) => {
    const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        throw { statusCode: 422, message: messages, status: 'fail' };
    }
    return value;
};

/** GET /api/v1/notes */
const getNotes = asyncWrapper(async (req, res) => {
    const notes = await notesModel.getAllNotes(req.user.id);
    res.status(200).json({ success: true, data: notes });
});

/** POST /api/v1/notes */
const createNote = asyncWrapper(async (req, res) => {
    const data = validate(noteSchema, req.body);
    const note = await notesModel.createNote(req.user.id, data);
    res.status(201).json({ success: true, data: note });
});

/** GET /api/v1/notes/:id */
const getNote = asyncWrapper(async (req, res) => {
    const note = await notesModel.getNoteById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    res.status(200).json({ success: true, data: note });
});

/** PUT /api/v1/notes/:id */
const updateNote = asyncWrapper(async (req, res) => {
    const data = validate(noteSchema, req.body);
    const note = await notesModel.updateNote(req.params.id, req.user.id, data);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    res.status(200).json({ success: true, data: note });
});

/** DELETE /api/v1/notes/:id */
const deleteNote = asyncWrapper(async (req, res) => {
    const deleted = await notesModel.deleteNote(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Note not found.' });
    res.status(200).json({ success: true, message: 'Note deleted.' });
});

module.exports = { getNotes, createNote, getNote, updateNote, deleteNote };
