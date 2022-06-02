const { body, validationResult } = require('express-validator');
const AppError = require('../helpers/app-error.helper');

const signUpValidations = [
  body('username').notEmpty().withMessage('Must provide a name'),
  body('email').notEmpty().isEmail().withMessage('Must provide a valid email'),
  body('password')
    .notEmpty()
    .isStrongPassword({ minSymbols: 0 })
    .withMessage(
      'Must provide a password with a minimum length of 8 characters, 1 uppercase character and 1 lowercase character'
    ),
  body('role')
    .default('normal')
    .isIn(['admin', 'normal'])
    .notEmpty()
    .withMessage('Must provide a valid role'),
];

const loginValidations = [
  body('email').notEmpty().withMessage('Must provide an email'),
  body('password').notEmpty().withMessage('Must provide a password'),
];

const createProductValidations = [
  body('title')
    .notEmpty()
    .withMessage('Must provide a title')
    .isLength({ max: 46 })
    .withMessage('Max title length is 46 characters '),
  body('description')
    .notEmpty()
    .withMessage('Must provide a description')
    .isLength({ max: 280 })
    .withMessage('Max description length is 280 characters'),
  body('quantity')
    .notEmpty()
    .withMessage('Must provide a quantity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Must be an integer between 1 - 999'),
  body('price')
    .notEmpty()
    .withMessage('Must provide a price')
    .isFloat({ min: 0.0, max: 99999.9 })
    .withMessage('Price must be a float between 0.0 - 99999.9'),
  body('categoryId').notEmpty().withMessage('Must provide a categoryId'),
];

const updateProductValidations = [
  body('title')
    .optional()
    .isLength({ max: 46 })
    .withMessage('Max title length is 46 characters '),
  body('description')
    .optional()
    .isLength({ max: 280 })
    .withMessage('Max description length is 280 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Must be an integer between 1 - 999'),
  body('price')
    .optional()
    .isFloat({ min: 0.0, max: 99999.9 })
    .withMessage('Price must be a float between 0.0 - 99999.9'),
];

const createCategoryValidations = [
  body('name')
    .notEmpty()
    .withMessage('Must provide a name')
    .isLength({ max: 46 })
    .withMessage('Max name length is 46 characters '),
];

const updateCategoryValidations = [
  body('name')
    .isLength({ max: 46 })
    .withMessage('Max name length is 46 characters '),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);

    // [msg, msg, msg] -> 'msg. msg. msg'
    const errorMsg = messages.join('.\n');

    return next(new AppError(errorMsg, 400));
  }

  next();
};

module.exports = {
  signUpValidations,
  loginValidations,
  createProductValidations,
  updateProductValidations,
  createCategoryValidations,
  updateCategoryValidations,
  checkValidations,
};
