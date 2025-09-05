module.exports = (sequelize, DataTypes) => {
  const Credit = sequelize.define('Credit', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('downgrade_proration', 'refund', 'adjustment', 'promotion'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_used'
    },
    usedAt: {
      type: DataTypes.DATE,
      field: 'used_at'
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at'
    }
  }, {
    tableName: 'credits',
    underscored: true
  });

  Credit.associate = (models) => {
    Credit.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Credit;
};
