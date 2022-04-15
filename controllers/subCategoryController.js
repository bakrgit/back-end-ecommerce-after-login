const SubCategory = require('../models/subCategoryModel');
const factory = require('./handlersFactory');

// Middleware to Set CategoryId to body before creating subcategory (create subcategory for category)
exports.setCategoryIdBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Middleware to create filterObject for get subcategories In category
exports.createFilterObj = (req, res, next) => {
  let filter = {};
  if (req.params.categoryId) filter = { category: req.params.categoryId };
  req.filterObject = filter;
  next();
};
// @desc      Get all subcategory
// @route     GET /api/v1/categories
// @access    Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc      Get specific subcategory by id
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc      Create subcategory
// @route     POST /api/v1/subcategories
// @access    Private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc      Update subcategory
// @route     PATCH /api/v1/categories/:id
// @access    Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc     Delete subcategory
// @route    DELETE /api/v1/categories/:id
// @access   Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
