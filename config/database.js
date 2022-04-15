const mongoose = require('mongoose');

// Connect to db
const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) => {
      console.log(
        `Database Connected : ${conn.connection.host}`.cyan.underline
      );
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`.red);
      process.exit(1);
    });
};

module.exports = dbConnection;
