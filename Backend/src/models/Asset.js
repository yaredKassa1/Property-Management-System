module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assetId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique asset identifier (e.g., WU-LAP-001)'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('fixed', 'fixed_consumable'),
      allowNull: false,
      defaultValue: 'fixed'
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    workUnit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Work unit - can be department, college, institute, or administrative unit'
    },
    status: {
      type: DataTypes.ENUM(
        'available',
        'assigned',
        'in_transfer',
        'under_maintenance',
        'disposed',
        'pending_qa'
      ),
      allowNull: false,
      defaultValue: 'available'
    },
    condition: {
      type: DataTypes.ENUM(
        'excellent',
        'good',
        'fair',
        'poor',
        'damaged'
      ),
      allowNull: false,
      defaultValue: 'excellent'
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    warrantyExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tagNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Auto-generated tag number e.g. WDU2167 for purchased, WU27163 for donation'
    },
    itemCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Item category e.g. Furniture and Fixtures, Electronics, Vehicles'
    },
    sourceType: {
      type: DataTypes.ENUM('purchased', 'donation', 'transferred'),
      allowNull: true,
      defaultValue: 'purchased'
    },
    donorName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Name of donor or supplier'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: { min: 1 }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
  }, {
    tableName: 'assets',
    timestamps: true,
    indexes: [
      {
        fields: ['assetId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['category']
      },
      {
        fields: ['workUnit']
      },
      {
        fields: ['assignedTo']
      }
    ]
  });

  return Asset;
};
