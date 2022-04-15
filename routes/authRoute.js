const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require('../controllers/authController');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

router.post('/forgotPasswords', forgotPassword);
router.post('/verifyResetCode', verifyPasswordResetCode);
router.put('/resetPassword', resetPassword);

module.exports = router;
