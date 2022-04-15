const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');
const {
  validatorMiddleware,
} = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
// Check email is email
// check if password confirm = password
// check if email already in user
// make validation like schema
exports.createUserValidator = [
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
    .custom(async (val, { req }) => {
      req.body.password = await bcrypt.hash(val, 12);
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

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body('password')
    .optional()
    .custom(async (val, { req }) => {
      req.body.password = await bcrypt.hash(val, 12);
      console.log(req.body.password);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  check('currentPassword').notEmpty().withMessage('currentPassword required'),
  check('passwordConfirm').notEmpty().withMessage('passwordConfirm required'),
  check('password')
    .notEmpty()
    .withMessage('Password Required')
    .custom(async (val, { req }) => {
      // 1- Verify current password
      const user = await User.findById(req.params.id);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error(`Incorrect current password`);
      }
      // 2- Verify confirmation password
      if (val !== req.body.passwordConfirm) {
        throw new Error(`Password confirmation is incorrect`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.changeLoggedUserPassValidator = [
  check('currentPassword').notEmpty().withMessage('currentPassword required'),
  check('passwordConfirm').notEmpty().withMessage('passwordConfirm required'),
  check('password')
    .notEmpty()
    .withMessage('Password Required')
    .custom(async (val, { req }) => {
      // 1- Verify current password
      const user = await User.findById(req.user._id);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error(`Incorrect current password`);
      }
      // 2- Verify confirmation password
      if (val !== req.body.passwordConfirm) {
        throw new Error(`Password confirmation is incorrect`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email formate')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`E-mail already in use`));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('accept only egypt phone numbers'),
  validatorMiddleware,
];
