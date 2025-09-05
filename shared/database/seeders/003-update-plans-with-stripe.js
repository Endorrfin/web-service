'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing plans with Stripe price IDs
    // Need to create these products and prices in Stripe dashboard first
    // ✅ Then update these IDs with actual Stripe price IDs

    await queryInterface.bulkUpdate('plans', {
      // stripe_price_id: 'price_BASIC_MONTHLY_PRICE_ID' from actual Stripe price ID
      stripe_price_id: 'price_1S3umrH5p7EUmVB1OA5u9vub'
    }, {
      slug: 'basic'
    });

    await queryInterface.bulkUpdate('plans', {
      // stripe_price_id: 'price_PROFESSIONAL_MONTHLY_PRICE_ID' from actual Stripe price ID
      stripe_price_id: 'price_1S3uphH5p7EUmVB1gmL6lRhw'
    }, {
      slug: 'professional'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate('plans', {
      stripe_price_id: null
    }, {});
  }
};
