const express = require('express');

// Middlewares
const { protectToken } = require('../middlewares/user.middleware');
const {
  cartExists,
  enoughProducts,
  productAlreadyInCart,
  enoughUpdateProducts,
  productExists,
} = require('../middlewares/cart.middleware');

// Controllers
const {
  addProduct,
  updateProduct,
  purchaseCart,
  removeProduct,
} = require('../controllers/cart.controller');

const router = express.Router();

// Protected routes
router.use(protectToken);

router.post(
  '/add-product',
  cartExists,
  enoughProducts,
  productAlreadyInCart,
  addProduct
);
router.patch('/update-cart', cartExists, enoughUpdateProducts, updateProduct);
router.post('/purchase', cartExists, purchaseCart);
router.delete('/:productId', cartExists, productExists, removeProduct);

module.exports = { cartRouter: router };
