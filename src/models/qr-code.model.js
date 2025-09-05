module.exports = (sequelize, DataTypes) => {
  const QRCode = sequelize.define('QRCode', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('url', 'text', 'email', 'phone', 'wifi', 'vcard'),
      defaultValue: 'url'
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shortUrl: {
      type: DataTypes.STRING,
      unique: true,
      field: 'short_url'
    },
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url'
    },
    scanCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'scan_count'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'qr_codes',
    underscored: true
  });

  QRCode.associate = (models) => {
    QRCode.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    QRCode.hasMany(models.QRCodeScan, { foreignKey: 'qrCodeId', as: 'scans' });
    QRCode.hasMany(models.PrintOrder, { foreignKey: 'qrCodeId', as: 'printOrders' });
  };

  return QRCode;
};
