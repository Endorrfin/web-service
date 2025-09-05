const express = require('express');
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const Joi = require('joi');


const router = express.Router();

// Validation schemas
const createCheckoutSchema = Joi.object({
  planId: Joi.string().uuid().required()
});

const changePlanSchema = Joi.object({
  planId: Joi.string().uuid().required()
});

const cancelSubscriptionSchema = Joi.object({
  immediately: Joi.boolean().optional()
});

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/plans', subscriptionController.getPlans);
router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/checkout', validate(createCheckoutSchema), subscriptionController.createCheckoutSession);
router.post('/change-plan', validate(changePlanSchema), subscriptionController.changePlan);
router.get('/validate-downgrade/:planId', subscriptionController.validateDowngrade);
router.post('/cancel', validate(cancelSubscriptionSchema), subscriptionController.cancelSubscription);
router.get('/billing-history', subscriptionController.getBillingHistory);

module.exports = router;
