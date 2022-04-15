const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      // index: true,
      required: [true, 'Category required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

/* Indexes :  to improve read performance from databases.
when we will use Indexes ? when we will query field more, but when we have collection with
high read-write ratio don't create Indexes for fields in this collection, because it will take
more resources. this size of Indexes is bigger than the size of collection itself
 */
// (Single Field Index) => we sorting the price index asc , -1 desc
// tourSchema.index({ price: 1 });
// (Compound Field Index) => multi Index
categorySchema.index({ name: 1 });

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

categorySchema.post('init', (doc) => {
  setImageUrl(doc);
});

categorySchema.post('save', (doc) => {
  setImageUrl(doc);
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
