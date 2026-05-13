module.exports = (sequelize, DataTypes) => {
  const ProcurementInspection = sequelize.define('ProcurementInspection', {
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
      onDelete: 'RESTRICT'
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
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'needs_correction'),
      allowNull: false,
      defaultValue: 'pending'
    },
    inspectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    inspectionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assessedCondition: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    correctionRequired: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'procurement_inspections',
    timestamps: true,
    indexes: [
      {
        fields: ['requestId']
      },
      {
        fields: ['assetId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['inspectedBy']
      }
    ]
  });

  return ProcurementInspection;
};
