const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    role: {
      type: DataTypes.ENUM('admin', 'creator', 'viewer'),
      defaultValue: 'viewer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      field: 'stripe_customer_id',
      unique: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    },
    profileImage: {
      type: DataTypes.STRING,
      field: 'profile_image'
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.JSONB
    }
  }, {
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || 12));
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || 12));
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  User.associate = (models) => {
    User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
    User.hasOne(models.Subscription, { foreignKey: 'userId', as: 'subscription' });
    User.hasMany(models.QRCode, { foreignKey: 'userId', as: 'qrCodes' });
    User.hasMany(models.Invoice, { foreignKey: 'userId', as: 'invoices' });
    User.hasMany(models.WebPage, { foreignKey: 'userId', as: 'webPages' });
  };

  return User;
};

