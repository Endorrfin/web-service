module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
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
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      field: 'invoice_number'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'paid', 'cancelled', 'refunded'),
      defaultValue: 'draft'
    },
    description: {
      type: DataTypes.TEXT
    },
    dueDate: {
      type: DataTypes.DATE,
      field: 'due_date'
    },
    paidAt: {
      type: DataTypes.DATE,
      field: 'paid_at'
    },
    stripeInvoiceId: {
      type: DataTypes.STRING,
      unique: true,
      field: 'stripe_invoice_id'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'invoices',
    underscored: true
  });

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Invoice;
};
