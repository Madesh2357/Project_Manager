const { body, query } = require('express-validator');

const PROJECT_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

const projectCreateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 200 })
    .withMessage('Project name must not exceed 200 characters'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid end date format'),
];

const projectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Project name must not exceed 200 characters'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Invalid end date format'),
];

const projectListValidation = [
  query('search').optional().trim().isLength({ max: 200 }),
  query('status')
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'status', 'createdAt', 'startDate', 'endDate'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

module.exports = {
  projectCreateValidation,
  projectUpdateValidation,
  projectListValidation,
  PROJECT_STATUSES,
};
