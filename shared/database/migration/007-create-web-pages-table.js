'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('web_pages', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT
      },
      template: {
        type: Sequelize.STRING
      },
      custom_css: {
        type: Sequelize.TEXT
      },
      custom_js: {
        type: Sequelize.TEXT
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      published_at: {
        type: Sequelize.DATE
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('web_pages', ['user_id']);
    await queryInterface.addIndex('web_pages', ['slug']);
    await queryInterface.addIndex('web_pages', ['is_published']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('web_pages');
  }
};
