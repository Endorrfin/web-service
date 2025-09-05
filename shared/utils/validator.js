const Joi = require('joi');

const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('admin', 'creator', 'viewer').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  // User schemas
  updateUser: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zipCode: Joi.string().optional()
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // QR Code schemas
  createQRCode: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('url', 'text', 'email', 'phone', 'wifi', 'vcard').required(),
    data: Joi.string().required(),
    expiresAt: Joi.date().optional(),
    settings: Joi.object().optional()
  }),

  updateQRCode: Joi.object({
    name: Joi.string().optional(),
    data: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    expiresAt: Joi.date().optional(),
    settings: Joi.object().optional()
  })
};

module.exports = schemas;
