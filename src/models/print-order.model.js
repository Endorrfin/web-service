module.exports = (sequelize, DataTypes) => {
  const PrintOrder = sequelize.define('PrintOrder', {
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
    qrCodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'qr_code_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    size: {
      type: DataTypes.STRING
    },
    material: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'printing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      field: 'shipping_address'
    },
    trackingNumber: {
      type: DataTypes.STRING,
      field: 'tracking_number'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'total_amount'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'print_orders',
    underscored: true
  });

  PrintOrder.associate = (models) => {
    PrintOrder.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    PrintOrder.belongsTo(models.QRCode, { foreignKey: 'qrCodeId', as: 'qrCode' });
  };

  return PrintOrder;
};
