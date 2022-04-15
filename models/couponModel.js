const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'coupon name required'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'coupon expire time required'],
    },
    discount: {
      type: Number,
      required: [true, 'coupon discount required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
