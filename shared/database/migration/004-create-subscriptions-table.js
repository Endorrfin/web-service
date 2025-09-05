'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('active', 'cancelled', 'expired', 'pending'),
        defaultValue: 'pending'
      },
      current_period_start: {
        type: Sequelize.DATE
      },
      current_period_end: {
        type: Sequelize.DATE
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        unique: true
      },
      stripe_customer_id: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('subscriptions', ['user_id']);
    await queryInterface.addIndex('subscriptions', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscriptions');
  }
};
