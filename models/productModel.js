const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Product title is required'],
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Too long description'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      maxlength: [32, 'To long price'],
    },
    priceAfterDiscount: {
      type: Number,
    },
    availableColors: [String],
    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to a category'],
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      // default: 0,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 3.6666 * 10 = 36.666  = 37 = 3.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Virtual populate (don't add it know, add it after create review schema)
// productSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'product',
//   localField: '_id',
// });

// Virtual populate: populate review on the product (review pointing to the product not the product pointing to the review) the parent (product) does not know about the child (review)
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// const setImageUrl = (doc) => {
//   if (doc.imageCover) {
//     const imageCoverUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
//     doc.imageCover = imageCoverUrl;
//   }
//   if (doc.images) {
//     const images = [];
//     doc.images.forEach((image) => {
//       const imageUrl = `${process.env.BASE_URL}/products/${image}`;
//       images.push(imageUrl);
//     });
//     doc.images = images;
//   }
// };

// productSchema.post('save', (doc) => {
//   setImageUrl(doc);
// });

module.exports = mongoose.model('Product', productSchema);
