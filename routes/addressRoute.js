const express = require('express');
const {
  addAddressToUser,
  removeAddress,
  myAddresses,
  updateAddress,
  getAddress,
} = require('../controllers/addressController');

const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.auth, addAddressToUser)
  .get(authController.auth, myAddresses);

router
  .route('/:addressId')
  .get(authController.auth, getAddress)
  .delete(authController.auth, removeAddress)
  .put(authController.auth, updateAddress);

module.exports = router;
