// Authorization
const jwt = require('jsonwebtoken');

// Models
const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/product-in-cart.model');
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/product-img.model');

// Helpers
const AppError = require('../helpers/app-error.helper');
const { catchAsync } = require('../helpers/catch-async.helper');

const allDataUser = catchAsync(async (req, res, next) => {
  // Retrieve query string data
  const { id } = req.params;

  // Search for user with given id and retrive al
  const user = await User.findOne({
    where: { id, status: 'active' },
    include: [
      {
        model: Order,
        required: false,
        include: [{ model: Cart, include: [{ model: ProductInCart }] }],
      },
      {
        model: Cart,
        required: false,
        where: { status: 'active' },
        include: [{ model: ProductInCart, where: { status: 'active' } }],
      },
      {
        model: Product,
        required: false,
        include: [{ model: Category }, { model: ProductImg }],
      },
    ],
    // Obfuscate password
    attributes: { exclude: ['password'] },
  });

  if (!user) return next(new AppError('User not found with given ID', 404));

  // Append user data to the req object
  req.user = user;
  next();
});

const userExists = catchAsync(async (req, res, next) => {
  // Retrieve query string data
  const { id } = req.params;

  // Search for user with given id and retrive al
  const user = await User.findOne({
    where: { id, status: 'active' },

    // Obfuscate password
    attributes: { exclude: ['password'] },
  });

  if (!user) return next(new AppError('User not found with given ID', 404));

  // Append user data to the req object
  req.user = user;
  next();
});

const protectToken = catchAsync(async (req, res, next) => {
  // Validate token
  let token;
  const isValidAuthHeader =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer');
  if (isValidAuthHeader) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Session invalid', 403));
  }

  // Search for user with decoded token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    where: { id: decoded.id, status: 'active' },
  });

  if (!user) {
    return next(
      new AppError('The owner of this token is no longer available', 403)
    );
  }

  req.sessionUser = user;
  next();
});

const ownerAuth = catchAsync(async (req, res, next) => {
  // Retrieve user from userExists and sessionUser from protectToken
  const { sessionUser, user } = req;

  if (sessionUser.id !== user.id) {
    return next(new AppError('You do not own this account', 403));
  }

  next();
});

const adminAuth = catchAsync(async (req, res, next) => {
  if (req.sessionUser.role !== 'admin') {
    return next(new AppError('Access not granted', 403));
  }

  next();
});

const orderExists = catchAsync(async (req, res, next) => {
  // Retrieve query string data
  const { id } = req.params;

  // Retrieve userId from protectToken middleware
  const {
    sessionUser: { id: userId },
  } = req;

  // Search for the order from the current user with given id
  const order = await Order.findOne({
    where: { id, userId },
    include: [
      {
        model: Cart,
        include: [
          {
            model: ProductInCart,
            where: {
              status: 'purchased',
            },
          },
        ],
      },
    ],
  });

  if (!order) return next(new AppError('Order not found with given ID', 404));

  // Append order data to the req object
  req.order = order;
  next();
});

module.exports = {
  userExists,
  protectToken,
  ownerAuth,
  adminAuth,
  orderExists,
  allDataUser,
};
