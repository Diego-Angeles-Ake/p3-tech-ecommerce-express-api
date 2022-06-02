const express = require('express');
const { protectToken } = require('../middlewares/user.middleware');
const {
  createProduct,
  getAllAvailableProducts,
  createCategory,
  getAvailableCategories,
  updateCategory,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const {
  createProductValidations,
  updateProductValidations,
  createCategoryValidations,
  updateCategoryValidations,
  checkValidations,
} = require('../middlewares/validation.middleware');
const {
  categoryExists,
  productExists,
  productOwnerAuth,
} = require('../middlewares/product.middleware');

const { upload } = require('../helpers/multer.helper');

const router = express.Router();

// Protected routes
router.use(protectToken);

router.get('/', getAllAvailableProducts);

router.post(
  '/',
  upload.array('productImgs', 3),
  createProductValidations,
  checkValidations,
  createProduct
);

router.post(
  '/categories',
  createCategoryValidations,
  checkValidations,
  createCategory
);
router.get('/categories', getAvailableCategories);
router.get(
  '/categories/:id',
  categoryExists,
  updateCategoryValidations,
  checkValidations,
  updateCategory
);

router
  .route('/:id')
  .get(productExists, getProductById)
  .patch(
    productExists,
    productOwnerAuth,
    updateProductValidations,
    checkValidations,
    updateProduct
  )
  .delete(productExists, productOwnerAuth, deleteProduct);

module.exports = { productsRouter: router };
