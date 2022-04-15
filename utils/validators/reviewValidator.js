const { check, body } = require('express-validator');
const {
  validatorMiddleware,
} = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

// check() => check body and params etc
exports.createReviewValidator = [
  check('review')
    .notEmpty()
    .withMessage('Review required')
    .custom((val, { req }) =>
      Review.findOne({ user: req.body.user, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error(`You already added review on this product`)
            );
          }
        }
      )
    ),
  check('rating')
    .notEmpty()
    .withMessage('Review required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating min value 1.0 and max 5.0'),
  check('user').isMongoId().withMessage('Invalid User Id formate'),
  check('product').isMongoId().withMessage('Invalid Product Id formate'),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((val, { req }) =>
      Review.findOne({ _id: val }).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review for this id ${val}`)
          );
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((val, { req }) => {
      if (req.user.role === 'user') {
        return Review.findOne({ _id: val, user: req.user._id }).then(
          (review) => {
            if (!review) {
              return Promise.reject(
                new Error(`You are not allowed to perform this action`)
              );
            }
          }
        );
      }
      return true;
    }),
  validatorMiddleware,
];
