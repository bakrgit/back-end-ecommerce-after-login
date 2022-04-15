const sharp = require('sharp'); // image processing lib for nodejs
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/imageUpload');
const Category = require('../models/categoryModel');

// 1- Use diskStorage Engine (configure destination & image name)
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/categories');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, `${filename}`);
//   },
// });

// 2- Use a memory storage to store files on a memory as a buffer to make image processing
// const multerStorage = multer.memoryStorage();

// Accept only images
// const multerFilter = (req, file, cb) => {
//   if (!req.body.name) {
//     cb(new ApiError('Category name required', 400), false);
//   } else if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new ApiError('only images allowed', 400), false);
//   }
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// exports.uploadCategoryImage = upload.single('image');
exports.uploadCategoryImage = uploadSingleImage('image');

// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  // req.file.filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  const ext = req.file.mimetype.split('/')[1];
  const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;

  await sharp(req.file.buffer)
    // .resize(500, 500)
    .toFile(`uploads/categories/${filename}`); // write into a file on the disk

  req.body.image = filename;
  next();
});

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = factory.getAll(Category);

// @desc      Get specific category by id
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getCategory = factory.getOne(Category);

// @desc      Create category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = factory.createOne(Category);

// @desc      Update category
// @route     PATCH /api/v1/categories/:id
// @access    Private
exports.updateCategory = factory.updateOne(Category);

// @desc     Delete category
// @route    DELETE /api/v1/categories/:id
// @access   Private
exports.deleteCategory = factory.deleteOne(Category);

exports.deleteAll = factory.deleteAll(Category);
