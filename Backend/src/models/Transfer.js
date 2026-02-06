module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define('Transfer', {
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
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User transferring the asset (null if from storage)'
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'User receiving the asset'
    },
    fromLocation: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    toLocation: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    fromDepartment: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    toDepartment: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'approved',
        'rejected',
        'in_transit',
        'completed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    requestedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'transfers',
    timestamps: true,
    indexes: [
      {
        fields: ['assetId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['toUserId']
      },
      {
        fields: ['fromUserId']
      },
      {
        fields: ['requestDate']
      }
    ]
  });

  return Transfer;
};
