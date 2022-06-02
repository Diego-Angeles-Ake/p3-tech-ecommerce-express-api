// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');

// Helpers
const AppError = require('../helpers/app-error.helper');
const { catchAsync } = require('../helpers/catch-async.helper');

const productExists = catchAsync(async (req, res, next) => {
  // Retrieve id from query string
  const { id } = req.params;

  // Search for available product with given ID
  const product = await Product.findOne({
    where: { id, status: 'active' },
  });

  if (!product) {
    return next(new AppError('Product not found with given ID', 404));
  }

  // Append product data to the req object
  req.product = product;
  next();
});

const productOwnerAuth = catchAsync(async (req, res, next) => {
  // Retrieve sessionUser from protectToken and product from productExists
  // middlewares
  const { sessionUser, product } = req;

  if (sessionUser.id !== product.userId) {
    return next(new AppError('You do not own this product', 403));
  }

  next();
});

const categoryExists = catchAsync(async (req, res, next) => {
  // Retrieve data from query string
  const { id } = req.params;

  // Search for available category
  const category = await Category.findOne({ where: { id } });

  if (!category)
    return next(new AppError('Category not found with given ID', 404));

  // Append category data to the req object
  req.category = category;
  next();
});

module.exports = {
  productExists,
  productOwnerAuth,
  categoryExists,
};
