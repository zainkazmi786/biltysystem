import { body, validationResult } from 'express-validator';

export const validateClub = [
  // Club validation
  body('club.id')
    .isInt().withMessage('Club ID must be an integer')
    .toInt(),
    
  body('club.name')
    .trim()
    .notEmpty().withMessage('Club name is required')
    .isLength({ max: 100 }).withMessage('Club name cannot exceed 100 characters'),
    
  body('club.contact_email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Invalid email address'),
    
  // Check-in settings validation
  body('club_check_in_settings')
    .isArray().withMessage('Check-in settings must be an array')
    .optional(),
    
  body('club_check_in_settings.*.type')
    .isIn(['booking', 'tournament', 'event'])
    .withMessage('Invalid check-in type'),
    
  body('club_check_in_settings.*.open_ms_before')
    .isInt({ min: 0 }).withMessage('Must be a positive number')
    .toInt(),
    
  body('club_check_in_settings.*.close_ms_after')
    .isInt({ min: 0 }).withMessage('Must be a positive number')
    .toInt(),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];