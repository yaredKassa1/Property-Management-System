module.exports = (sequelize, DataTypes) => {
  const ProcurementWorkflow = sequelize.define('ProcurementWorkflow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'requests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Reference to the procurement request'
    },
    currentState: {
      type: DataTypes.ENUM(
        'pending_approval',
        'pending_vp_approval',
        'pending_property_officer',
        'purchase_notification_sent',
        'pending_qa_inspection',
        'qa_approved',
        'qa_rejected',
        'item_ready',
        'completed',
        'rejected'
      ),
      allowNull: false,
      defaultValue: 'pending_approval',
      comment: 'Current state in the workflow state machine'
    },
    // ── Approval Authority Stage ──────────────────────────────────────
    approvalAuthorityId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Approval Authority who reviewed the request'
    },
    approvalAuthorityDecision: {
      type: DataTypes.ENUM('approve', 'reject'),
      allowNull: true,
      comment: 'Approval Authority decision'
    },
    approvalAuthorityComments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comments from Approval Authority'
    },
    approvalAuthorityTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of Approval Authority decision'
    },
    permittedAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantity permitted by Approval Authority (may differ from requested)'
    },
    // ── Vice President Stage ──────────────────────────────────────────
    vpId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Vice President who reviewed the purchase permission'
    },
    vpDecision: {
      type: DataTypes.ENUM('approve', 'reject'),
      allowNull: true,
      comment: 'Vice President decision'
    },
    vpComments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comments from Vice President'
    },
    vpTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of Vice President decision'
    },
    // ── Property Officer Stage ────────────────────────────────────────
    propertyOfficerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Property Officer who completed the request'
    },
    propertyOfficerTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when Property Officer completed the request'
    },
    // ── Purchase Department Stage ─────────────────────────────────────
    purchaseDepartmentNotifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when Purchase Department was notified'
    },
    itemProcuredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when item was marked as procured'
    },
    procurementDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Details about the procurement (supplier, cost, etc.)'
    },
    // ── QA Inspector Stage ────────────────────────────────────────────
    qaInspectorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'QA Inspector who inspected the procured item'
    },
    qaDecision: {
      type: DataTypes.ENUM('approve', 'reject'),
      allowNull: true,
      comment: 'QA Inspector decision'
    },
    qaComments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comments from QA Inspector'
    },
    qaTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of QA inspection'
    },
    // ── Completion Tracking ───────────────────────────────────────────
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when workflow was completed'
    },
    workflowType: {
      type: DataTypes.ENUM('existing_asset', 'new_item'),
      allowNull: false,
      defaultValue: 'new_item',
      comment: 'existing_asset: AA→PropertyOfficer; new_item: AA→VP→PropertyOfficer→Purchase→QA'
    }
  }, {
    tableName: 'procurement_workflows',
    timestamps: true,
    indexes: [
      {
        fields: ['requestId']
      },
      {
        fields: ['currentState']
      },
      {
        fields: ['approvalAuthorityId']
      },
      {
        fields: ['vpId']
      },
      {
        fields: ['propertyOfficerId']
      },
      {
        fields: ['qaInspectorId']
      }
    ]
  });

  return ProcurementWorkflow;
};
