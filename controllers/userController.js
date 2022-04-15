const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');
const User = require('../models/userModel');

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = factory.getAll(User);

// @desc      Get specific user by id
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = factory.getOne(User);

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    phone: req.body.phone,
    profileImg: req.body.profileImg,
    password: req.body.password,
  });

  res.status(201).json({ data: user });
});

// @desc      Update user data without(password)
// @route     PATCH /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    next(new ApiError(`No document found for this id: ${req.params.id}`, 404));
  }

  // document.save();
  res.status(200).json({ data: document });
});

// @desc      Update user data without(password)
// @route     PATCH /api/v1/users/:id
// @access    Private/Admin
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    next(new ApiError(`No document found for this id: ${req.params.id}`, 404));
  }

  // document.save();
  res.status(200).json({ data: document });
});

// @desc     Delete user
// @route    DELETE /api/v1/users/:id
// @access   Private
exports.deleteUser = factory.deleteOne(User);

// @desc    Update logged in user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user by token payload (user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2) Generate token
  // logged in again after updating password and send jwt (i will make it optional)
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({ data: user, token });
  next();
});

// body = {name: "ahmed", password: "123"} , allowedFields = ["name", "phone"]
const filterObject = (obj, ...allowedFields) => {
  const newBodyObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newBodyObj[key] = obj[key];
  });
  return newBodyObj;
};
// @desc    Update logged in user data
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  // 1) Select fields that allowed to update
  const allowedBodyFields = filterObject(req.body, 'name', 'email', 'phone');
  // console.log(req.body);
  // console.log(allowedBodyFields);
  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    allowedBodyFields,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// @desc    Update logged in user data
// @route   PUT /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    delete logged in user
// @route   PUT /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: 'Success' });
});
