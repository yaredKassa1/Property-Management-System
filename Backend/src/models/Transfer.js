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
    fromWorkUnit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Source work unit - can be department, college, institute, or administrative unit'
    },
    toWorkUnit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Destination work unit - can be department, college, institute, or administrative unit'
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
    },
    transferorSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of the staff transferring the asset (fromUser)'
    },
    recipientSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of the staff receiving the asset (toUser)'
    },
    propertyOfficerSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of property officer who completed the transfer'
    },
    completedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Property officer who completed the transfer'
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
