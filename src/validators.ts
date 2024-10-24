import { body, param } from 'express-validator';

export const isValidTodoId = [
  param('id').isNumeric().withMessage('The ID parameter must be a number'),
];

export const isValidPostTodo = [
  body('todo').exists().withMessage('The Todo sent is invalid'),
  body('todo.title', 'Todo title text is required')
    .exists()
    .bail()
    .trim()
    .matches(/^[^<>/\\'-]+$/u)
    .withMessage('Todo title contain invalid characters')
    .isLength({ max: 100 })
    .withMessage('Todo title is too long'),
  body('todo.assignedTo', 'An assigned persons name is required')
    .exists()
    .bail()
    .trim()
    .matches(/^[^<>/\\'-]+$/u)
    .withMessage('Assigned persons name contain invalid characters')
    .isLength({ max: 100 })
    .withMessage('Assigned persons name is too long'),
];

// All fields as optional
export const isValidUpdateTodo = [
  body('todo').exists().withMessage('The Todo sent is invalid'),
  body('todo.title', 'Todo title text is required')
    .exists()
    .bail()
    .trim()
    .matches(/^[^<>/\\'-]+$/u)
    .withMessage('Todo title contain invalid characters')
    .isLength({ max: 100 })
    .withMessage('Todo title is too long')
    .optional(),
  body('todo.assignedTo', 'An assigned persons name is required')
    .exists()
    .bail()
    .trim()
    .matches(/^[^<>/\\'-]+$/u)
    .withMessage('Assigned persons name contain invalid characters')
    .isLength({ max: 100 })
    .withMessage('Assigned persons name is too long')
    .optional(),
  body('todo.done', 'Todo must be checked correctly').isBoolean().optional(),
];
