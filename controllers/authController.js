const crypto = require('crypto');

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');

// @desc      Signup
// @route     POST /api/v1/auth/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    phone: req.body.phone,
    profileImg: req.body.profileImg,
    password: req.body.password,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ data: user, token });
});

// @desc      Login
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) Check of email and password exist in the body (validation layer)
  // 2) Check if user exist && password correct
  const user = await User.findOne({ email: req.body.email });

  let isCorrectPassword = false;
  if (user) {
    isCorrectPassword = await bcrypt.compare(req.body.password, user.password);
  }

  if (!user || !isCorrectPassword) {
    return next(new ApiError('Incorrect email or password'), 401);
  }
  // 3) Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // delete the password from the response
  // https://stackoverflow.com/questions/18821212/mongoose-whats-up-with-doc#:~:text=_doc%20exist%20on%20the%20mongoose,from%20the%20database%2C%20because%20console.
  delete user._doc.password;

  res.status(200).json({ data: user, token });
});

// @desc     Make sure that user is logged in
exports.auth = asyncHandler(async (req, res, next) => {
  // 1- Get the token and check if exists
  // console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }
  if (!token) {
    return next(
      new ApiError('You are not logged in. Please login to get access', 401)
    );
  }
  // 2- Verify the token (check if the token changes the payload or the token is expired)
  // two errors maybe happens : 1- invalid token 2- expired token
  // convert a method that returns responses using a callback function to return a responses in a promise object
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3- Check the user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ApiError('The user that belong to this token does no longer exist')
    );
  }
  // 4- Check if user change his password after generating the token
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          'User recently changed password! Please login again..',
          401
        )
      );
    }
    // console.log(passChangedTimestamp, decoded.iat);
  }
  // Grant access to the protected routes
  req.user = currentUser;
  next();
});

// Authorization check if the certain user is allowed to access the specific route or not allowed
// even is logged in because not all logged in users able to access the routes
// authController.allowedTo( c) ...roles  => rest parameter syntax es6
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // ["admin"] or ["admin", "editor"]
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to perform this action', 403)
      );
    }
    next();
  });

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email address ${email}`, 404)
    );
  }
  // 2) Generate the random reset token or random 6 digits and save it in db (explain it on draw.io)
  // 2) Generate random reset code and save it in db
  // save the encrypted reset code into our db and send the un encrypted via email
  // https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/
  // generate 6 digit random number in javascript
  const resetCode = Math.floor(Math.random() * 1000000 + 1).toString();
  // encrypt the reset code before saving it in db (Security)
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // console.log(resetCode);
  // console.log(hashedResetCode);

  // Save password reset code into database
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min for example)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // because user maybe send new code after verify one
  user.resetCodeVerified = false;
  user.save();

  // 3)  Send password reset code via email
  // We use try and catch because i want to implement logic if error happens
  const message = `Forgot your password? Submit this reset password code : ${resetCode}\n If you didn't forgot your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Reset code sent to your email',
      // userId: user.id,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new ApiError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

// @desc      Verify reset password code
// @route     POST /api/v1/auth/verifyResetCode
// @access    Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code ! because we have not user id
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  // 2) Check if reset code is valid or expired
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code is invalid or has expired', 400));
  }
  // 4) If reset code has not expired, and there is user send res with userId
  user.resetCodeVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});

// @desc      Reset password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(
        `There is no user with this email address ${req.body.email}`,
        404
      )
    );
  }
  // Check if user verify the reset code
  if (!user.resetCodeVerified) {
    return next(new ApiError('reset code not verified', 400));
  }
  // 2) Update user password & Hide passwordResetCode & passwordResetExpires from the result
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.resetCodeVerified = undefined;

  await user.save();

  // 3) If everything ok, send token to client
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ token });
});
