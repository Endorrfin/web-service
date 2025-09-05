'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('credits')) {
      console.log('⏭️  credits table already exists, skipping...');
      return;
    }

    await queryInterface.createTable('credits', {
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
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('downgrade_proration', 'refund', 'adjustment', 'promotion'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('credits', ['user_id']);
    await queryInterface.addIndex('credits', ['is_used']);
    await queryInterface.addIndex('credits', ['expires_at']);

    console.log('✅ Created credits table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('credits');
  }
};
