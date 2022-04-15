const express = require('express');
const {
  getSubCategories,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdBody,
  createFilterObj,
} = require('../controllers/subCategoryController');
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require('../utils/validators/subCategoryValidator');

const authController = require('../controllers/authController');

// mergeParams: allow us to access parameters on other routers
// ex: we access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFilterObj, getSubCategories)
  .post(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    setCategoryIdBody,
    createSubCategoryValidator,
    createSubCategory
  );
router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authController.auth,
    authController.allowedTo('admin'),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
