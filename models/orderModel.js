const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

// npm install --save --legacy-peer-deps mongoose-auto-increment
const connection = mongoose.createConnection(process.env.DB_URI);
autoIncrement.initialize(connection);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'order must belong to user'],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        count: { type: Number, default: 1 },
        color: String,
        price: Number,
      },
    ],
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    taxPrice: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
    },
    totalOrderPrice: {
      type: Number,
      default: 0.0,
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImg email phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover ratingsAverage ratingsQuantity',
  });

  next();
});

orderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'id',
  startAt: 1,
  incrementBy: 1,
});

module.exports = mongoose.model('Order', orderSchema);
