const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true, // Temporarily allow null for migration
      validate: {
        notEmpty: true
      }
    },
    middleName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true, // Temporarily allow null for migration
      validate: {
        notEmpty: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^\+251[97]\d{8}$/,
          msg: 'Phone number must be in Ethiopian format: +251 9XXXXXXXX (Ethio Telecom) or +251 7XXXXXXXX (Safaricom)'
        }
      }
    },
    role: {
      type: DataTypes.ENUM(
        'administrator',
        'vice_president',
        'property_officer',
        'approval_authority',
        'purchase_department',
        'quality_assurance',
        'staff'
      ),
      allowNull: false,
      defaultValue: 'staff'
    },
    workUnit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Work unit - can be department, college, institute, or administrative unit'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash password before updating if it changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Instance method to get safe user data (without password)
  User.prototype.toSafeObject = function() {
    const { password, ...userWithoutPassword } = this.toJSON();
    // Add computed fullName for backward compatibility
    userWithoutPassword.fullName = `${this.firstName}${this.middleName ? ' ' + this.middleName : ''} ${this.lastName}`.trim();
    return userWithoutPassword;
  };

  // Add virtual field for fullName
  User.prototype.getFullName = function() {
    return `${this.firstName}${this.middleName ? ' ' + this.middleName : ''} ${this.lastName}`.trim();
  };

  return User;
};
