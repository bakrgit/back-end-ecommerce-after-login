const express = require('express');
const {
  addProductToWishlist,
  removeProductFromWishlist,
  myWishlist,
} = require('../controllers/wishlistController');

const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.auth, addProductToWishlist)
  .get(authController.auth, myWishlist);

router.delete('/:productId', authController.auth, removeProductFromWishlist);

module.exports = router;
