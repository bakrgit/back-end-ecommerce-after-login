const slugify = require('slugify');
const { check, body } = require('express-validator');
const {
  validatorMiddleware,
} = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
// Check email is email
// check if password confirm = password
// check if email already in user
// make validation like schema
exports.signupValidator = [
  check('name')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('name required field')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required field')
    .isEmail()
    .withMessage('Invalid email formate')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`E-mail already in use`));
        }
      })
    ),
  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('must be at least 6 chars')
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error(`Password confirmation is incorrect`);
      }
      return true;
    }),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('passwordConfirm is required field'),

  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('accept only egypt phone numbers'),

  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email required field')
    .isEmail()
    .withMessage('Invalid email formate'),

  check('password').notEmpty().withMessage('Password required'),

  validatorMiddleware,
];
