module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    interval: {
      type: DataTypes.ENUM('month', 'year'),
      defaultValue: 'month'
    },
    qrCodeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'qr_code_limit'
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    stripePriceId: {
      type: DataTypes.STRING,
      field: 'stripe_price_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'plans',
    underscored: true
  });

  Plan.associate = (models) => {
    Plan.hasMany(models.Subscription, { foreignKey: 'planId', as: 'subscriptions' });
  };

  return Plan;
};
