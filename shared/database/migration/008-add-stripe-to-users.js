'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.stripe_customer_id) {
      // Column doesn't exist, add it
      await queryInterface.addColumn('users', 'stripe_customer_id', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      });

      const indexes = await queryInterface.showIndex('users');
      const indexExists = indexes.some(index =>
        index.fields.some(field => field.attribute === 'stripe_customer_id')
      );

      if (!indexExists) {
        await queryInterface.addIndex('users', ['stripe_customer_id']);
      }

      console.log('✅ Added stripe_customer_id column to users table');
    } else {
      console.log('⏭️  stripe_customer_id column already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('users');

    if (tableDescription.stripe_customer_id) {
      await queryInterface.removeColumn('users', 'stripe_customer_id');
      console.log('✅ Removed stripe_customer_id column from users table');
    }
  }
};
