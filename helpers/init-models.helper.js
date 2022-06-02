const { Cart } = require('../models/cart.model');
const { Category } = require('../models/category.model');
const { Order } = require('../models/order.model');
const { ProductImg } = require('../models/product-img.model');
const { ProductInCart } = require('../models/product-in-cart.model');
const { Product } = require('../models/product.model');
const { User } = require('../models/user.model');

const defineModelAssociations = () => {
  // User 1:N Product
  User.hasMany(Product);
  Product.belongsTo(User);

  // User 1:N Order
  User.hasMany(Order);
  Order.belongsTo(User);

  // User 1:1 Cart
  User.hasOne(Cart);
  Cart.belongsTo(User);

  // Product 1:N ProductImg
  Product.hasMany(ProductImg);
  ProductImg.belongsTo(Product);

  // Category 1:1 Product
  Category.hasOne(Product);
  Product.belongsTo(Category);

  // Cart 1:N ProductInCart
  Cart.hasMany(ProductInCart);
  ProductInCart.belongsTo(Cart);

  // Product 1:1 ProductInCart
  Product.hasOne(ProductInCart);
  ProductInCart.belongsTo(Product);

  // Order 1:1 Cart
  Cart.hasOne(Order);
  Order.belongsTo(Cart);
};

module.exports = { defineModelAssociations };
