const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'Brand must be unique'],
      minlength: [3, 'Too short brand name'],
      maxlength: [32, 'Too long brand name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
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
brandSchema.index({ name: 1 });

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post('init', (doc) => {
  setImageUrl(doc);
});

brandSchema.post('save', (doc) => {
  setImageUrl(doc);
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
