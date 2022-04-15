const AppError = require('../utils/apiError');
// 1) With out development mode
// const customError = (err, req, res, next) => {
//   // console.log(err.stack);

//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
// };

const sendErrorForDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProduction = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
// module.exports = customError;
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. please login again', 401);

const handleExpiredJWT = () =>
  new AppError('Expired Token. please login again', 401);

/* Define a global error handling middleware by specifying 4 parameters express know automatically that
    this is error handling middleware   */
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  } else {
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleExpiredJWT();
    sendErrorForProduction(err, req, res);
  }
};

module.exports = globalError;
