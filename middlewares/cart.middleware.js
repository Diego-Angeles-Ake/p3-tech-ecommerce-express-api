// Models
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/product-in-cart.model');

// Helpers
const { catchAsync } = require('../helpers/catch-async.helper');
const AppError = require('../helpers/app-error.helper');

const cartExists = catchAsync(async (req, res, next) => {
  // Retrieve userId from protectToken middleware
  const {
    sessionUser: { id: userId },
  } = req;

  // Search for user cart
  let cart = await Cart.findOne({ where: { userId, status: 'active' } });

  // Create a cart in case user does not have one
  if (!cart) cart = await Cart.create({ userId });

  // Append cart data to the req object
  req.cart = cart;
  next();
});

const enoughProducts = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { productId, quantity } = req.body;

  // Search for the desired product to buy
  const product = await Product.findOne({ where: { id: productId } });

  // Check for product availability
  if (!product) {
    return next(
      new AppError(
        'The product you are looking for is no longer available',
        400
      )
    );
  }

  // In case user requests more than the available quantity
  if (quantity > product.quantity)
    return next(new AppError('Not enough products available', 400));

  // Append product data to the req object
  req.product = product;
  next();
});

const enoughUpdateProducts = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { productId, newQty } = req.body;

  // Search for the desired product to buy
  const product = await Product.findOne({ where: { id: productId } });

  // Check for product availability
  if (!product) {
    return next(
      new AppError(
        'The product you are looking for is no longer available',
        400
      )
    );
  }

  // In case user requests more than the available quantity
  if (newQty > product.quantity)
    return next(new AppError('Not enough products available', 400));

  // Append product data to the req object
  req.product = product;
  next();
});

const productAlreadyInCart = catchAsync(async (req, res, next) => {
  // Retrieve cartId from cartExists middleware
  const {
    cart: { id: cartId },
  } = req;

  // Retrieve productId
  const { productId } = req.body;

  const productInCart = await ProductInCart.findOne({
    where: {
      productId,
      cartId,
    },
  });

  if (productInCart && productInCart.status === 'active') {
    return next(
      new AppError(
        'The product you are trying to add is already in the cart',
        400
      )
    );
  }

  // Append productInCart data to the req object
  req.productInCart = productInCart;
  next();
});

const productExists = catchAsync(async (req, res, next) => {
  // Retrieve cartId from cartExists middleware
  const {
    cart: { id: cartId },
  } = req;

  // Retrieve id from query string
  const { productId } = req.params;

  // Search for requested product to delete
  const productInCart = await ProductInCart.findOne({
    where: {
      status: 'active',
      productId,
      cartId,
    },
  });

  if (!productInCart) {
    return next(
      new AppError('Can not delete a product that has not been added', 400)
    );
  }

  // Append productInCart to the req object
  req.productInCart = productInCart;
  next();
});

module.exports = {
  cartExists,
  enoughProducts,
  productAlreadyInCart,
  enoughUpdateProducts,
  productExists,
};
