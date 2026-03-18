module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('Return', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    returnedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'User returning the asset'
    },
    receivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Property officer who received the return'
    },
    inspectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'QA officer who inspected the asset'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'received',
        'under_inspection',
        'approved',
        'rejected',
        'completed'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    returnCondition: {
      type: DataTypes.ENUM(
        'excellent',
        'good',
        'fair',
        'poor',
        'damaged'
      ),
      allowNull: true,
      comment: 'Condition assessed during inspection'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    inspectionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    damageDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    inspectionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'returns',
    timestamps: true,
    indexes: [
      {
        fields: ['assetId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['returnedBy']
      },
      {
        fields: ['returnDate']
      }
    ]
  });

  return Return;
};
