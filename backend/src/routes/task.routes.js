const express = require('express');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  taskCreateValidation,
  taskUpdateValidation,
  taskListValidation,
} = require('../validators/task.validator');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', taskListValidation, validate, taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskCreateValidation, validate, taskController.createTask);
router.put('/:id', taskUpdateValidation, validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
