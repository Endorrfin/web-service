module.exports = (sequelize, DataTypes) => {
  const BillingHistory = sequelize.define('BillingHistory', {
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
    subscriptionId: {
      type: DataTypes.UUID,
      field: 'subscription_id'
    },
    type: {
      type: DataTypes.ENUM(
        'subscription_created',
        'subscription_renewed',
        'subscription_cancelled',
        'plan_upgraded',
        'plan_downgraded',
        'payment_succeeded',
        'payment_failed',
        'refund_issued',
        'credit_applied'
      ),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    description: {
      type: DataTypes.TEXT
    },
    stripeInvoiceId: {
      type: DataTypes.STRING,
      field: 'stripe_invoice_id'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'billing_history',
    underscored: true
  });

  BillingHistory.associate = (models) => {
    BillingHistory.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    BillingHistory.belongsTo(models.Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
  };

  return BillingHistory;
};
