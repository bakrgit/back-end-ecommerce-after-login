const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });
const morgan = require('morgan');
require('colors');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./controllers/orderService');

const dbConnection = require('./config/database');

// const categoryRouter = require('./routes/categoryRoute');
// const subCategoryRouter = require('./routes/subCategoryRoute');
// const brandRouter = require('./routes/brandRoute');
// const productRouter = require('./routes/productRoute');
// const userRouter = require('./routes/userRoute');
// const authRouter = require('./routes/authRoute');
// const reviewRouter = require('./routes/reviewRoute');
// const wishlistRouter = require('./routes/wishlistRoute');
// const addressRouter = require('./routes/addressRoute');
// const couponRouter = require('./routes/couponRoute');

// DB Connection
dbConnection();

// Builtin Middleware
const app = express();

app.use(cors());
app.options('*', cors());
app.enable('trust proxy');

// Add hook here before we call body parser, because stripe will send data in the body in form raw
app.post(
  '/webhook-checkout',
  // express.raw({ type: 'application/json' }),
  bodyParser.raw({ type: 'application/json' }),
  webhookCheckout
);

// Used to parse JSON bodies
app.use(express.json());
// app.use(cors());
// app.options('*', cors());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode : ${process.env.NODE_ENV}`.yellow);
}

app.use(compression());

app.use(cors());

// Mount routers
mountRoutes(app);
// app.use('/api/v1/categories', categoryRouter);
// app.use('/api/v1/subcategories', subCategoryRouter);
// app.use('/api/v1/brands', brandRouter);
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/wishlist', wishlistRouter);
// app.use('/api/v1/addresses', addressRouter);
// app.use('/api/v1/coupons', couponRouter);

app.all('*', (req, res, next) => {
  // 3) Use a generic api error
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handler to catch error from express error
// 2) with refactoring
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.green);
});

// we are listening to this unhandled rejection event, which then allow us to handle all
// errors that occur in asynchronous code which were not previously handled
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    console.log('unhandledRejection!! shutting down...');
    process.exit(1);
  });
});
