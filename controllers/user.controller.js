// Authorization & Encryption
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/product-in-cart.model');

// Helpers
const AppError = require('../helpers/app-error.helper');
const { catchAsync } = require('../helpers/catch-async.helper');
const { Email } = require('../helpers/email.helper');

const signup = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { username, email, password, role } = req.body;

  // Encrypt password
  const salt = await bcryptjs.genSalt(12);

  const hashPassword = await bcryptjs.hash(password, salt);

  // Store user
  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
  });

  // Obfuscate password
  newUser.password = undefined;

  // Send welcome email
  await new Email(newUser.email).sendWelcome(newUser.name);

  // Send success response
  res.status(201).json({ newUser });
});

const login = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { email, password } = req.body;

  // Validate that user exists
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Validate credentials
  const areValidCredentials =
    user && (await bcryptjs.compare(password, user.password));

  if (!areValidCredentials) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Obfuscate password
  user.password = undefined;

  // Send success response
  res.status(200).json({ token, user });
});

const getUserProducts = catchAsync(async (req, res, next) => {
  // Retrieve sessionUser from protectToken middleware
  const {
    sessionUser: { id: userId },
  } = req;

  // Search for products created by the current user
  const products = await Product.findAll({
    where: {
      userId,
    },
  });

  // Send success response
  res.status(200).json({ products });
});

const updateUser = catchAsync(async (req, res, next) => {
  // Retrieve user from userExists middleware
  const { user } = req;

  // Retrieve data
  const { username, email } = req.body;

  // Update user
  await user.update({ username, email });

  // Send success response
  res.status(200).json({ status: 'success' });
});

const deleteUser = catchAsync(async (req, res, next) => {
  // Retrieve user data from userExists middleware
  const { user } = req;

  // Soft-delete user
  await user.update({ status: 'inactive' });

  // Send success response
  res.status(200).json({ status: 'success' });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  // Retrieve userId of current user from protectToken middleware
  const {
    sessionUser: { id: userId },
  } = req;

  // Seach for all
  const orders = await Order.findAll({
    where: {
      userId,
    },
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

  // Send success response
  res.status(200).json({ orders });
});

const getUserOrderById = catchAsync(async (req, res, next) => {
  // Retrieve order data from orderExists middleware
  const { order } = req;

  // Send success response
  res.status(200).json({ order });
});

const allUserInfo = catchAsync(async (req, res, next) => {
  // Retrieve data from allData user middleware
  const { user } = req;

  res.status(200).json({ user });
});

module.exports = {
  signup,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrderById,
  allUserInfo,
};
