// Firebase
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../helpers/firebase.helper');

// Models
const { Product } = require('../models/product.model');
const { ProductImg } = require('../models/product-img.model');

// Helpers
const AppError = require('../helpers/app-error.helper');
const { catchAsync } = require('../helpers/catch-async.helper');
const { Category } = require('../models/category.model');

const createProduct = catchAsync(async (req, res, next) => {
  // Retrieve userId from protectToken middleware
  const {
    sessionUser: { id: userId },
  } = req;

  // Retrieve data
  const { title, description, quantity, price, categoryId } = req.body;

  // Store product data
  const product = await Product.create({
    title,
    description,
    quantity,
    price,
    userId,
    categoryId,
  });

  // Create an array of promises of the images that are going to be uploaded to
  // the ProductImg model
  const productImgsPromises = req.files.map(async (file) => {
    // Create a reference for the image in the database
    const imgRef = ref(
      storage,
      // Create unique file name to avoid data overwrite
      `products/${product.id}-${Date.now()}-${file.originalname}`
    );

    // Upload the image to get the URL from the UploadResult
    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    // Populate the promises array with the records that are going to be stored
    return await ProductImg.create({
      // Store the id of the record created for the Product relation
      productId: product.id,
      // Store the image URL
      imgUrl: imgUploaded.metadata.fullPath,
    });
  });

  // Wait for all the records to get stored in the ProductImg relation
  await Promise.all(productImgsPromises);

  // Send success response
  res.status(200).json({ status: 'success', product });
});

const getAllAvailableProducts = catchAsync(async (req, res, next) => {
  // Search for available products
  const products = await Product.findAll({
    where: { status: 'active' },
    include: [{ model: ProductImg }],
  });

  // Get all product images
  const productPromises = products.map(async (product) => {
    // Get images from firebase
    const prodImgsPromises = product.productImgs.map(async (prodImg) => {
      const imgRef = ref(storage, prodImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      // Update postImgUrl prop
      prodImg.imgUrl = url;
      return prodImg;
    });

    // Resolve pending promises
    const prodImgsResolved = await Promise.all(prodImgsPromises);
    product.productImgs = prodImgsResolved;

    return product;
  });

  const productResolved = await Promise.all(productPromises);

  res.status(200).json({
    products: productResolved,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  // Retrieve product data from productExists middleware
  const { product } = req;

  // Send success response
  res.status(200).json({ product });
});

const updateProduct = catchAsync(async (req, res, next) => {
  // Retrieve product data from productExists middleware
  const { product } = req;

  // Retrieve data
  const { title, description, price, quantity } = req.body;

  // Update product
  await product.update({ title, description, price, quantity });

  // Send success response
  res.status(200).json({ status: 'success' });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  // Retrieve product data from prouductExists middleware
  const { product } = req;

  // Soft-delete record
  await product.update({ status: 'inactive' });

  // Send success response
  res.status(200).json({ status: 'success' });
});

const createCategory = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { name } = req.body;

  // Store category
  const category = await Category.create({ name });

  // Send success response
  res.status(201).json({ category });
});

const getAvailableCategories = catchAsync(async (req, res, next) => {
  // Search for available categories
  const categories = await Category.findAll({ where: { status: 'active' } });

  // Send success response
  res.status(200).json({ categories });
});

const updateCategory = catchAsync(async (req, res, next) => {
  // Retrieve category from categoryExists middleware
  const { category } = req;

  // Send success response
  res.status(200).json({ category });
});

module.exports = {
  createProduct,
  getAllAvailableProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createCategory,
  getAvailableCategories,
  updateCategory,
};
