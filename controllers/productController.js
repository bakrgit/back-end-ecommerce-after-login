const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const multer = require('multer');

const ApiError = require('../utils/apiError');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');

// Storage
const multerStorage = multer.memoryStorage();

// Accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('only images allowed', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // 1) Image Process for imageCover
  if (req.files.imageCover) {
    const ext = req.files.imageCover[0].mimetype.split('/')[1];
    const imageCoverFilename = `products-${uuidv4()}-${Date.now()}-cover.${ext}`;
    await sharp(req.files.imageCover[0].buffer)
      // .resize(2000, 1333)
      // .toFormat('jpeg')
      // .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFilename}`); // write into a file on the disk

    // Save imageCover into database
    req.body.imageCover = imageCoverFilename;
  }
  req.body.images = [];
  // 2- Image processing for images
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const ext = img.mimetype.split('/')[1];
        const filename = `products-${uuidv4()}-${Date.now()}-${
          index + 1
        }.${ext}`;
        await sharp(img.buffer)
          // .resize(800, 800)
          // .toFormat('jpeg')
          // .jpeg({ quality: 90 })
          .toFile(`uploads/products/${filename}`);

        // Save images into database
        req.body.images.push(filename);
      })
    );
  }

  // console.log(req.body.imageCover);
  // console.log(req.body.images);
  next();
});

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = factory.getAll(Product, 'Products');

// @desc      Get specific product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = factory.createOne(Product);
// @desc      Update product
// @route     PATCH /api/v1/products/:id
// @access    Private
exports.updateProduct = factory.updateOne(Product);

// @desc     Delete product
// @route    DELETE /api/v1/products/:id
// @access   Private
exports.deleteProduct = factory.deleteOne(Product);
