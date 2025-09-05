const express = require('express');
const webhookController = require('../controllers/webhook.controller');


const router = express.Router();


// Stripe webhook - needs raw body, not JSON
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
