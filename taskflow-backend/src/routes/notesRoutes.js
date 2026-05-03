const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getNotes, createNote, getNote, updateNote, deleteNote } = require('../controllers/notesController');

// All routes require authentication
router.use(authenticate);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
