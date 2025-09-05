module.exports = (sequelize, DataTypes) => {
  const QRCodeScan = sequelize.define('QRCodeScan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    qrCodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'qr_code_id'
    },
    ipAddress: {
      type: DataTypes.STRING,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    },
    referer: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.JSONB
    },
    scannedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'scanned_at'
    }
  }, {
    tableName: 'qr_code_scans',
    underscored: true,
    timestamps: false
  });

  QRCodeScan.associate = (models) => {
    QRCodeScan.belongsTo(models.QRCode, { foreignKey: 'qrCodeId', as: 'qrCode' });
  };

  return QRCodeScan;
};
