const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'Category must be unique'],
      minlength: [2, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Sub Category must be belong to category'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubCategory', subCategorySchema);
