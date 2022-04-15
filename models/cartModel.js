const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    // cartItems
    products: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        count: { type: Number, default: 1 },
        color: String,
        price: Number,
      },
    ],
    totalCartPrice: Number,
    totalAfterDiscount: Number,
    cartOwner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    coupon: String,
  },
  { timestamps: true }
);

// cartSchema.pre(/^find/, function (next) {
// this.populate({
//   path: 'products.product',
//   populate: { path: 'category', select: 'name', model: 'Category' },
// }).populate({
//     path: 'products.product',
//     populate: { path: 'brand', select: 'name', model: 'Brand' },
//   });
//   next();
// });

module.exports = mongoose.model('Cart', cartSchema);
