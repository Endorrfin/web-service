const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../../shared/constants/user-roles');

const router = express.Router();

// All routes require authentication
router.use(authenticate);


// Admin only routes
router.get('/', authorize(USER_ROLES.ADMIN), userController.getAllUsers);
router.get('/:id', authorize(USER_ROLES.ADMIN), userController.getUserById);
router.patch('/:id', authorize(USER_ROLES.ADMIN), userController.updateUser);
router.delete('/:id', authorize(USER_ROLES.ADMIN), userController.deleteUser);


module.exports = router;
