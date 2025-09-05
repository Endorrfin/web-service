const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const schemas = require('../../shared/utils/validator');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh', validate(schemas.refreshToken), authController.refreshToken);
router.post('/logout', validate(schemas.refreshToken), authController.logout);


// Protected routes
router.get('/me', authenticate, authController.me);


module.exports = router;
