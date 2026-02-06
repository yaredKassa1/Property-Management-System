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
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'available',
        'assigned',
        'in_transfer',
        'under_maintenance',
        'disposed'
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
        fields: ['department']
      },
      {
        fields: ['assignedTo']
      }
    ]
  });

  return Asset;
};
