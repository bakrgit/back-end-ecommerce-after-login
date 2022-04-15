const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// Middleware to create filterObject for get reviews In product
exports.createFilterObj = (req, res, next) => {
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };
  req.filterObject = filter;
  next();
};

// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @access    Public
exports.getReviews = factory.getAll(Review);

// @desc      Get specific review by id
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = factory.getOne(Review);

// Allow nested routes
exports.setProductAndUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc      Create review
// @route     POST /api/v1/reviews
// @access    Private/Protect
exports.createReview = factory.createOne(Review);

// @desc      Update review
// @route     PATCH /api/v1/reviews/:id
// @access    Private/Protect
exports.updateReview = factory.updateOne(Review);

// @desc     Delete review
// @route    DELETE /api/v1/reviews/:id
// @access   Private/Protect
exports.deleteReview = factory.deleteOne(Review);
