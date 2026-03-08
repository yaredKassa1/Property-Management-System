module.exports = (sequelize, DataTypes) => {
  const TransferHistory = sequelize.define('TransferHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    transferId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transfers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    action: {
      type: DataTypes.ENUM(
        'created',
        'approved',
        'rejected',
        'completed',
        'cancelled'
      ),
      allowNull: false
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    previousStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Status before the action'
    },
    newStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Status after the action'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes or reason for action'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata about the action (signatures, etc.)'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of the user who performed the action'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Browser/client information'
    }
  }, {
    tableName: 'transfer_history',
    timestamps: true,
    updatedAt: false, // Only track creation time
    indexes: [
      {
        fields: ['transferId']
      },
      {
        fields: ['performedBy']
      },
      {
        fields: ['action']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return TransferHistory;
};
