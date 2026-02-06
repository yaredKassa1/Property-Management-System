module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requestType: {
      type: DataTypes.ENUM(
        'withdrawal',
        'purchase',
        'transfer',
        'maintenance',
        'disposal'
      ),
      allowNull: false
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Asset ID for withdrawal/transfer/disposal requests'
    },
    itemName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Name of asset or item being requested'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Estimated cost for purchase requests'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'under_review',
        'approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM(
        'low',
        'medium',
        'high',
        'urgent'
      ),
      allowNull: false,
      defaultValue: 'medium'
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
    department: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional justification for the request'
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed specifications for purchase requests'
    },
    approvalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reviewDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'requests',
    timestamps: true,
    indexes: [
      {
        fields: ['requestType']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['requestedBy']
      },
      {
        fields: ['department']
      },
      {
        fields: ['requestDate']
      }
    ]
  });

  return Request;
};
