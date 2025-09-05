module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'plan_id'
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired', 'pending'),
      defaultValue: 'pending'
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      field: 'current_period_start'
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      field: 'current_period_end'
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      unique: true,
      field: 'stripe_subscription_id'
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      field: 'stripe_customer_id'
    },
    pendingPlanId: {
      type: DataTypes.UUID,
      field: 'pending_plan_id'
    },
    pendingChangeDate: {
      type: DataTypes.DATE,
      field: 'pending_change_date'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    }
  }, {
    tableName: 'subscriptions',
    underscored: true
  });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Subscription.belongsTo(models.Plan, { foreignKey: 'planId', as: 'plan' });
  };

  return Subscription;
};
