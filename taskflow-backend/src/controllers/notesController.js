const asyncWrapper = require('../utils/asyncWrapper');
const notesService = require('../services/notesService');
const Joi = require('joi');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createPageSchema = Joi.object({
    parentId: Joi.string().uuid().allow(null, '').optional(),
    title: Joi.string().max(255).default('Untitled'),
    emoji: Joi.string().max(8).allow(null, '').optional(),
    position: Joi.number().integer().min(0).default(0),
});

const updatePageSchema = Joi.object({
    title: Joi.string().max(255).optional(),
    emoji: Joi.string().max(8).allow(null, '').optional(),
    position: Joi.number().integer().min(0).optional(),
});

const createBlockSchema = Joi.object({
    type: Joi.string().default('p'),
    content: Joi.string().allow('', null).optional(),
    checked: Joi.boolean().truthy(1, '1').falsy(0, '0').default(false),
    position: Joi.number().integer().min(0).default(0),
    indent: Joi.number().integer().min(0).max(4).default(0),
});

const updateBlockSchema = Joi.object({
    type: Joi.string().optional(),
    content: Joi.string().allow('', null).optional(),
    checked: Joi.boolean().truthy(1, '1').falsy(0, '0').optional(),
    indent: Joi.number().integer().min(0).max(4).optional(),
    position: Joi.number().integer().min(0).optional(),
});

const reorderSchema = Joi.object({
    orderedIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const validateBody = (schema, body) => {
    const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        throw { statusCode: 422, message: messages, status: 'fail' };
    }
    return value;
};

// ─── Page Controllers ─────────────────────────────────────────────────────────

/** GET /api/v1/notes/pages */
const getPageTree = asyncWrapper(async (req, res) => {
    const tree = await notesService.getPageTree(req.user.id);
    res.status(200).json({ success: true, data: tree });
});

/** POST /api/v1/notes/pages */
const createPage = asyncWrapper(async (req, res) => {
    const data = validateBody(createPageSchema, req.body);
    const page = await notesService.createPage(req.user.id, data);
    res.status(201).json({ success: true, data: page });
});

/** GET /api/v1/notes/pages/:id */
const getPage = asyncWrapper(async (req, res) => {
    const page = await notesService.getPage(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: page });
});

/** PUT /api/v1/notes/pages/:id */
const updatePage = asyncWrapper(async (req, res) => {
    const data = validateBody(updatePageSchema, req.body);
    const page = await notesService.updatePage(req.params.id, req.user.id, data);
    res.status(200).json({ success: true, data: page });
});

/** DELETE /api/v1/notes/pages/:id */
const deletePage = asyncWrapper(async (req, res) => {
    const result = await notesService.deletePage(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
});

/** PATCH /api/v1/notes/pages/:id/reorder */
const reorderChildren = asyncWrapper(async (req, res) => {
    const data = validateBody(reorderSchema, req.body);
    await notesService.reorderChildren(req.params.id, req.user.id, data.orderedIds);
    res.status(200).json({ success: true, message: 'Pages reordered successfully.' });
});

// ─── Block Controllers ────────────────────────────────────────────────────────

/** POST /api/v1/notes/pages/:id/blocks */
const createBlock = asyncWrapper(async (req, res) => {
    const data = validateBody(createBlockSchema, req.body);
    const block = await notesService.createBlock(req.params.id, req.user.id, data);
    res.status(201).json({ success: true, data: block });
});

/** PUT /api/v1/notes/blocks/:id */
const updateBlock = asyncWrapper(async (req, res) => {
    const data = validateBody(updateBlockSchema, req.body);
    const block = await notesService.updateBlock(req.params.id, req.user.id, data);
    res.status(200).json({ success: true, data: block });
});

/** DELETE /api/v1/notes/blocks/:id */
const deleteBlock = asyncWrapper(async (req, res) => {
    await notesService.deleteBlock(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Block deleted.' });
});

module.exports = {
    getPageTree, createPage, getPage, updatePage, deletePage, reorderChildren,
    createBlock, updateBlock, deleteBlock,
};
