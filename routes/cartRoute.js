const express = require('express');
const {
  addProductToCart,
  updateCartProductCount,
  getLoggedUserCart,
  removeCartProduct,
  clearLoggedUserCart,
  applyCouponToCart,
} = require('../controllers/cartService');

const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.auth, authController.allowedTo('user'));

router.route('/applyCoupon').put(applyCouponToCart);

router
  .route('/')
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearLoggedUserCart);

router.route('/:itemId').put(updateCartProductCount).delete(removeCartProduct);

module.exports = router;
