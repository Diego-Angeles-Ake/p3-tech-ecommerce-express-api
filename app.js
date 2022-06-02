const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Routes
const { usersRouter } = require('./routes/user.route');
const { productsRouter } = require('./routes/product.route');
const { cartRouter } = require('./routes/cart.route');
const { globalErrorHandler } = require('./controllers/error.controller');

// Instance app
const app = express();

// Enable CORS
app.use(cors());

// Enable JSON
app.use(express.json());

// Enable incoming Form-Data
app.use(express.urlencoded({ extended: true }));

// Enable security headers
app.use(helmet());

// Compress responses
app.use(compression());

//Log incoming requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests',
});

// Apply the rate limiting middleware to API calls only
app.use(apiLimiter);

// Endpoints
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

// Global error handler
app.use('*', globalErrorHandler);

module.exports = { app };
