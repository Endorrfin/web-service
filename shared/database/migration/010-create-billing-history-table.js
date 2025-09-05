'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('billing_history')) {
      console.log('⏭️  billing_history table already exists, skipping...');
      return;
    }

    await queryInterface.createTable('billing_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM(
          'subscription_created',
          'subscription_renewed',
          'subscription_cancelled',
          'plan_upgraded',
          'plan_downgraded',
          'payment_succeeded',
          'payment_failed',
          'refund_issued',
          'credit_applied'
        ),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      description: {
        type: Sequelize.TEXT
      },
      stripe_invoice_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    await queryInterface.addIndex('billing_history', ['user_id']);
    await queryInterface.addIndex('billing_history', ['subscription_id']);
    await queryInterface.addIndex('billing_history', ['type']);
    await queryInterface.addIndex('billing_history', ['created_at']);

    console.log('✅ Created billing_history table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('billing_history');
  }
};
