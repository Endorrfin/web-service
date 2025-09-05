'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const plans = [
      {
        id: uuidv4(),
        name: 'Basic',
        slug: 'basic',
        price: 10.00,
        currency: 'USD',
        interval: 'month',
        qr_code_limit: 5,
        features: JSON.stringify([
          '5 QR codes',
          'Basic analytics',
          'Standard support',
          'Basic templates'
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Professional',
        slug: 'professional',
        price: 25.00,
        currency: 'USD',
        interval: 'month',
        qr_code_limit: 20,
        features: JSON.stringify([
          '20 QR codes',
          'Advanced analytics',
          'Priority support',
          'Custom templates',
          'Remove branding',
          'Bulk operations'
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('plans', plans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('plans', null, {});
  }
};
