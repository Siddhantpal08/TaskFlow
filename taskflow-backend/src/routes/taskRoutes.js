const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
    listTasks,
    createTask,
    getTask,
    updateTask,
    updateStatus,
    delegateTask,
    splitTask,
    deleteTask,
    bulkDelete,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', listTasks);
router.post('/', createTask);
router.delete('/', bulkDelete);          // must be before /:id
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateStatus);
router.patch('/:id/delegate', delegateTask);
router.post('/:id/split', splitTask);
router.delete('/:id', deleteTask);

module.exports = router;
