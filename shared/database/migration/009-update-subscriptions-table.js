'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('subscriptions');

    // Add pending_plan_id if it doesn't exist
    if (!tableDescription.pending_plan_id) {
      await queryInterface.addColumn('subscriptions', 'pending_plan_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'plans',
          key: 'id'
        }
      });
      console.log('✅ Added pending_plan_id column');
    } else {
      console.log('⏭️  pending_plan_id already exists');
    }

    if (!tableDescription.pending_change_date) {
      await queryInterface.addColumn('subscriptions', 'pending_change_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added pending_change_date column');
    } else {
      console.log('⏭️  pending_change_date already exists');
    }

    if (!tableDescription.cancelled_at) {
      await queryInterface.addColumn('subscriptions', 'cancelled_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added cancelled_at column');
    } else {
      console.log('⏭️  cancelled_at already exists');
    }

    try {
      const [results] = await queryInterface.sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'enum_subscriptions_status'
        )
      `);

      const existingValues = results.map(r => r.enumlabel);

      if (!existingValues.includes('pending_cancellation')) {
        await queryInterface.sequelize.query(`
          ALTER TYPE enum_subscriptions_status ADD VALUE IF NOT EXISTS 'pending_cancellation';
        `);
        console.log('✅ Added pending_cancellation to status enum');
      } else {
        console.log('⏭️  pending_cancellation already in status enum');
      }
    } catch (error) {
      console.log('⚠️  Could not modify status enum, it may already be correct:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('subscriptions');

    if (tableDescription.pending_plan_id) {
      await queryInterface.removeColumn('subscriptions', 'pending_plan_id');
    }
    if (tableDescription.pending_change_date) {
      await queryInterface.removeColumn('subscriptions', 'pending_change_date');
    }
    if (tableDescription.cancelled_at) {
      await queryInterface.removeColumn('subscriptions', 'cancelled_at');
    }

    console.log('Note: Enum value pending_cancellation not removed (PostgreSQL limitation)');
  }
};
