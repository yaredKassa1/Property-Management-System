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
        'procurement_in_progress',
        'purchased',
        'delivered',
        'completed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'in_progress'
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
    workUnit: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Work unit - can be department, college, institute, or administrative unit'
    },
    approvalAuthorityId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Assigned approval authority who can approve this request'
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
    permittedAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Amount permitted by approval authority'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requesterSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of requestor'
    },
    approverSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of approval authority'
    },
    completerSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of property officer who completed'
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
      comment: 'Property officer who completed the request'
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
    },
    // ── Procurement fields (purchase_department) ──────────────────────────
    procurementStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'procurement_in_progress | purchased | delivered'
    },
    supplierName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    supplierContact: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    quotationAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    procurementNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    procurementDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Purchase department user who processed this request'
    },
    // ── Procurement Workflow fields ──────────────────────────────────────
    fulfillmentPath: {
      type: DataTypes.ENUM('direct', 'procurement'),
      allowNull: true,
      comment: 'Fulfillment path: direct assignment from inventory or procurement workflow'
    },
    workflowId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'procurement_workflows',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to procurement workflow if fulfillmentPath is procurement'
    },
    assignedItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to assigned asset (for direct fulfillment or after procurement)'
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
        fields: ['workUnit']
      },
      {
        fields: ['requestDate']
      },
      {
        fields: ['fulfillmentPath']
      },
      {
        fields: ['workflowId']
      }
    ]
  });

  return Request;
};
