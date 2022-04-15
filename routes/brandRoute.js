const express = require('express');
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
  deleteAll,
} = require('../controllers/brandController');
const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getBrands)
  .post(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  )
  .delete(deleteAll);

// router.use(idValidation);
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.auth,
    authController.allowedTo('admin'),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
