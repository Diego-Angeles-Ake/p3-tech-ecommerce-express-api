// Models
const { ProductInCart } = require('../models/product-in-cart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');

// Helpers
const { catchAsync } = require('../helpers/catch-async.helper');
const AppError = require('../helpers/app-error.helper');

const addProduct = catchAsync(async (req, res, next) => {
  // Retrieve cartId from cartExists middleware
  const {
    cart: { id: cartId },
    // Retrieve productId from enoughProducts middleware
    product: { id: productId },
  } = req;

  // Retrieve productInCart from alreadyInCart middleware
  let { productInCart } = req;

  // Retrieve data
  const { quantity } = req.body;

  // Case for adding a new product
  if (!productInCart) {
    productInCart = await ProductInCart.create({ quantity, cartId, productId });
    // Case for adding back a product
  } else if (productInCart.status === 'removed') {
    await productInCart.update({
      status: 'active',
      quantity,
    });
    // Unexpected cases
  } else {
    return next(new AppError('Unable to add your product', 400));
  }

  res.status(201).json({ productInCart });
});

const updateProduct = catchAsync(async (req, res, next) => {
  // Retrieve cartId from cartExists middleware
  const {
    cart: { id: cartId },
    // Retrieve productId from enoughUpdateProducts middleware
    product: { id: productId },
  } = req;

  // Retrieve data
  const { newQty } = req.body;

  // Search for requested product
  let productInCart = await ProductInCart.findOne({
    where: { cartId, productId },
  });

  // In case the product is not in the cart
  if (!productInCart) {
    return next(new AppError('Add the product to your cart first', 400));
    // Remove the product
  } else if (newQty === 0) {
    await productInCart.update({ status: 'removed', quantity: newQty });
    // Update product quantity
  } else if (newQty > 0) {
    await productInCart.update({ status: 'active', quantity: newQty });
    // Unexpected cases
  } else {
    return next(new AppError('Unable to update your product', 400));
  }

  // Send success response
  res.status(200).json({ status: 'success' });
});

const removeProduct = catchAsync(async (req, res, next) => {
  // Retrieve productInCart from productExists middleware
  const { productInCart } = req;

  // Soft-delete record
  await productInCart.update({ status: 'removed', quantity: 0 });

  // Send success response
  res.status(200).json({ status: 'success' });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  // Retrieve sessionUser from protectToken middleware
  const {
    sessionUser: { id: userId },
    // Retrieve cart from cartExists middleware
    cart,
  } = req;

  let total = 0;

  //  Look for active cart and include all of the active products
  const productInCart = await ProductInCart.findAll({
    where: {
      status: 'active',
      cartId: cart.id,
    },
  });

  // Check if the cart has items
  if (!productInCart?.length > 0) {
    return next(new AppError('The cart is empty', 400));
  }

  //  Traverse the products in the cart
  const totalPromises = productInCart.map(async (prodInCart) => {
    // Destructure arg
    const { productId, quantity } = prodInCart;

    // Search for the requested product
    const product = await Product.findOne({
      where: {
        status: 'active',
        id: productId,
      },
    });

    // Substract requested quantity from product stock
    await product.decrement({ quantity });

    // Add cost of the requested item(s) to the total
    total += +quantity * +product.price;

    // Update status of product to purchased
    return await prodInCart.update({ status: 'purchased' });
  });

  // Wait for the total cost computing stage to finish
  await Promise.all(totalPromises);

  //  Change the  cart status to purchased
  await cart.update({ status: 'purchased' });

  //  Create a register in the models order
  const order = await Order.create(
    {
      userId,
      cartId: cart.id,
      totalPrice: total,
    },
    {
      include: [
        {
          model: Cart,
          include: [{ model: ProductInCart, where: { status: 'purchased' } }],
        },
      ],
    }
  );

  //  Send success response
  res.status(200).json({ order });
});

module.exports = {
  addProduct,
  updateProduct,
  purchaseCart,
  removeProduct,
};
