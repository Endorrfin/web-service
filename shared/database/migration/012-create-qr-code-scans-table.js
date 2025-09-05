'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qr_code_scans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      qr_code_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'qr_codes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      referer: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      scanned_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    await queryInterface.addIndex('qr_code_scans', ['qr_code_id']);
    await queryInterface.addIndex('qr_code_scans', ['scanned_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('qr_code_scans');
  }
};
