const express = require('express');
const {
  createCashOrder,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require('../controllers/orderService');

const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.auth);

router.get('/checkout-session/:cartId', checkoutSession);

router
  .route('/:cartId')
  .post(authController.allowedTo('user'), createCashOrder);

router
  .route('/')
  .get(
    authController.allowedTo('user', 'admin', 'manager'),
    filterOrdersForLoggedUser,
    getAllOrders
  );

router
  .route('/:id')
  .get(authController.allowedTo('user', 'admin', 'manager'), getSpecificOrder);

router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);

module.exports = router;
