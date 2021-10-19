const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const ErrorResponse = require('./utils/errorResponse');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const sslRedirect = require('heroku-ssl-redirect');
const morgan = require('morgan');
const helmet = require('helmet');
require('colors');

require('dotenv').config({ path: './config/config.env' });

const app = express();

// Connect to the database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Prevent XSS attack
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Cookie parser
app.use(cookieParser());

// Add libraries to the development environment
if (process.env.NODE_ENV === 'development') {
  // Logging
  app.use(morgan('dev'));
}

// Add libraries to the production environment
if (process.env.NODE_ENV === 'production') {
  // Redirect all the http to https
  app.use(sslRedirect());

  // Rate Limiting
  const Limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
  });

  app.use(Limiter);
}

// Define Routes
app.use('/api/auth', require('./routes/authRoute'));

// // Catch 404 to route does not exist and forward it to the error handler
// app.use((req, res, next) => {
//   return next(new ErrorResponse('الصفحة المطلوبة غير موجودة', 404));
// });

// Handle all the errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode`));
