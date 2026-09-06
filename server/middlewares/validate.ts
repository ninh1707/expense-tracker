import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  };
};

// Validation Rules
export const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

export const budgetValidation = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('limit').isFloat({ min: 0 }).withMessage('Limit must be a positive number'),
  body('period').isIn(['monthly', 'weekly', 'yearly']).withMessage('Invalid period'),
];

export const savingsValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be positive'),
  body('deadline').isISO8601().withMessage('Invalid deadline date'),
];

export const recurringValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
  body('nextDueDate').isISO8601().withMessage('Invalid next due date'),
];

export const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];