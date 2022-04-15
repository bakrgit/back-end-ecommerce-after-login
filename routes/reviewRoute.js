const express = require('express');
const {
  getReview,
  getReviews,
  updateReview,
  createReview,
  deleteReview,
  setProductAndUserIds,
  createFilterObj,
} = require('../controllers/reviewController');

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFilterObj, getReviews)
  .post(
    authController.auth,
    authController.allowedTo('user'),
    setProductAndUserIds,
    createReviewValidator,
    createReview
  );

router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authController.auth,
    authController.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authController.auth,
    authController.allowedTo('user', 'manager', 'admin'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
