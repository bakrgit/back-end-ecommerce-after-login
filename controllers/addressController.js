const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');

// @desc      Add address to user addresses
// @route     POST /api/v1/addresses
// @access    Private/User
exports.addAddressToUser = asyncHandler(async (req, res, next) => {
  // const { place,details,phone } = req.body;
  // $addToSet => add address object to addresses array if productId not exits
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Address added successfully',
    data: user.addresses,
  });
});

// @desc      Remove address from addresses list
// @route     DELETE /api/v1/addresses/:addressId
// @access    Private/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  console.log(addressId);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        addresses: { _id: addressId },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Address removed successfully',
    data: user.addresses,
  });
});

// @desc      update address from addresses list
// @route     PUT /api/v1/addresses/:addressId
// @access    Private/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  address.alias = req.body.alias || address.alias;
  address.details = req.body.details || address.details;
  address.phone = req.body.phone || address.phone;
  address.city = req.body.city || address.city;
  address.postalCode = req.body.postalCode || address.postalCode;

  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'Address updated successfully',
    data: address,
  });
});

// @desc      Get Specific address from addresses list
// @route     Get /api/v1/addresses/:addressId
// @access    Private/User
exports.getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  return res.status(200).json({
    status: 'success',
    data: address,
  });
});

// @desc      Get logged user  addresses
// @route     GET /api/v1/addresses
// @access    Private/User
exports.myAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('addresses')
    .populate('addresses');

  res.status(200).json({
    results: user.addresses.length,
    status: 'success',
    data: user.addresses,
  });
});
