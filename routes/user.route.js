const express = require('express');

// Middlewares
const {
  protectToken,
  userExists,
  orderExists,
  ownerAuth,
  allDataUser,
} = require('../middlewares/user.middleware');
const {
  signUpValidations,
  checkValidations,
  loginValidations,
} = require('../middlewares/validation.middleware');

// Controllers
const {
  signup,
  login,
  getUserProducts,
  getUserOrders,
  getUserOrderById,
  updateUser,
  deleteUser,
  allUserInfo,
} = require('../controllers/user.controller');

const router = express.Router();

// Public routes
router.post('/', signUpValidations, checkValidations, signup);
router.post('/login', loginValidations, checkValidations, login);

// Protected routes
router.use(protectToken);
router.get('/me', getUserProducts);
router.get('/orders', getUserOrders);
router.get('/orders/:id', orderExists, getUserOrderById);
router
  .route('/:id')
  // Added the get endpoint to retrieve all of the current user information
  .get(allDataUser, ownerAuth, allUserInfo)
  .patch(userExists, ownerAuth, updateUser)
  .delete(userExists, ownerAuth, deleteUser);

module.exports = { usersRouter: router };
