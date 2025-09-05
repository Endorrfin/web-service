'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qr_codes', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('url', 'text', 'email', 'phone', 'wifi', 'vcard'),
        defaultValue: 'url'
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      short_url: {
        type: Sequelize.STRING,
        unique: true
      },
      image_url: {
        type: Sequelize.STRING
      },
      scan_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      expires_at: {
        type: Sequelize.DATE
      },
      settings: {
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

    await queryInterface.addIndex('qr_codes', ['user_id']);
    await queryInterface.addIndex('qr_codes', ['short_url']);
    await queryInterface.addIndex('qr_codes', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('qr_codes');
  }
};
