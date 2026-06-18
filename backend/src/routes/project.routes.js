const express = require('express');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  projectCreateValidation,
  projectUpdateValidation,
  projectListValidation,
} = require('../validators/project.validator');
const projectController = require('../controllers/project.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', projectListValidation, validate, projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectCreateValidation, validate, projectController.createProject);
router.put('/:id', projectUpdateValidation, validate, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
