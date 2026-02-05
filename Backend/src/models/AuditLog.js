module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who performed the action'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed (e.g., CREATE_USER, UPDATE_ASSET, LOGIN)'
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of entity affected (user, asset, transfer, etc.)'
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the affected entity'
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional details about the action'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of the user'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent string'
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'error'),
      allowNull: false,
      defaultValue: 'success'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if action failed'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['entityType']
      },
      {
        fields: ['entityId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['status']
      }
    ]
  });

  return AuditLog;
};
