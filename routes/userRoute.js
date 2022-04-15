const express = require('express');
const {
  getUser,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserPassword,
  updateLoggedUserPassword,
  updateLoggedUserData,
  getLoggedUserData,
  deleteLoggedUser,
} = require('../controllers/userController');
const {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPassValidator,
  updateLoggedUserValidator,
} = require('../utils/validators/userValidator');
const authController = require('../controllers/authController');

const router = express.Router();

// user
router.put(
  '/changeMyPassword',
  authController.auth,
  changeLoggedUserPassValidator,
  updateLoggedUserPassword
);

router.put(
  '/updateMe',
  authController.auth,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.get('/getMe', authController.auth, getLoggedUserData, getUser);
router.delete('/deleteMe', authController.auth, deleteLoggedUser);

// Admin
router.put(
  '/change-password/:id',
  changeUserPasswordValidator,
  updateUserPassword
);
router
  .route('/')
  .get(authController.auth, authController.allowedTo('admin'), getUsers)
  .post(
    authController.auth,
    authController.allowedTo('admin'),
    createUserValidator,
    createUser
  );

router
  .route('/:id')
  .get(
    authController.auth,
    authController.allowedTo('admin'),
    getUserValidator,
    getUser
  )
  .put(
    authController.auth,
    authController.allowedTo('admin'),
    updateUserValidator,
    updateUser
  )
  .delete(
    authController.auth,
    authController.allowedTo('admin'),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
