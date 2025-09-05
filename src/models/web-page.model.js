module.exports = (sequelize, DataTypes) => {
  const WebPage = sequelize.define('WebPage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    template: {
      type: DataTypes.STRING
    },
    customCss: {
      type: DataTypes.TEXT,
      field: 'custom_css'
    },
    customJs: {
      type: DataTypes.TEXT,
      field: 'custom_js'
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_published'
    },
    publishedAt: {
      type: DataTypes.DATE,
      field: 'published_at'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'web_pages',
    underscored: true
  });

  WebPage.associate = (models) => {
    WebPage.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return WebPage;
};
