const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Asset = require('./Asset')(sequelize, DataTypes);
const Transfer = require('./Transfer')(sequelize, DataTypes);
const Return = require('./Return')(sequelize, DataTypes);
const Request = require('./Request')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);
const TransferHistory = require('./TransferHistory')(sequelize, DataTypes);

// Define associations
const db = {
  sequelize,
  User,
  Asset,
  Transfer,
  Return,
  Request,
  AuditLog,
  TransferHistory
};

// ==================== User <-> Asset Relationships ====================
db.Asset.belongsTo(db.User, {
  foreignKey: 'assignedTo',
  as: 'assignedUser',
  constraints: false
});

db.Asset.belongsTo(db.User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

db.User.hasMany(db.Asset, {
  foreignKey: 'assignedTo',
  as: 'assignedAssets'
});

db.User.hasMany(db.Asset, {
  foreignKey: 'createdBy',
  as: 'createdAssets'
});

// ==================== Transfer Relationships ====================
db.Transfer.belongsTo(db.Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

db.Transfer.belongsTo(db.User, {
  foreignKey: 'fromUserId',
  as: 'fromUser'
});

db.Transfer.belongsTo(db.User, {
  foreignKey: 'toUserId',
  as: 'toUser'
});

db.Transfer.belongsTo(db.User, {
  foreignKey: 'requestedBy',
  as: 'requester'
});

db.Transfer.belongsTo(db.User, {
  foreignKey: 'approvedBy',
  as: 'approver'
});

db.Transfer.belongsTo(db.User, {
  foreignKey: 'completedBy',
  as: 'completer'
});

db.Asset.hasMany(db.Transfer, {
  foreignKey: 'assetId',
  as: 'transfers'
});

db.User.hasMany(db.Transfer, {
  foreignKey: 'requestedBy',
  as: 'requestedTransfers'
});

// ==================== Return Relationships ====================
db.Return.belongsTo(db.Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

db.Return.belongsTo(db.User, {
  foreignKey: 'returnedBy',
  as: 'returner'
});

db.Return.belongsTo(db.User, {
  foreignKey: 'receivedBy',
  as: 'receiver'
});

db.Return.belongsTo(db.User, {
  foreignKey: 'inspectedBy',
  as: 'inspector'
});

db.Asset.hasMany(db.Return, {
  foreignKey: 'assetId',
  as: 'returns'
});

db.User.hasMany(db.Return, {
  foreignKey: 'returnedBy',
  as: 'myReturns'
});

// ==================== Request Relationships ====================
db.Request.belongsTo(db.Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

db.Request.belongsTo(db.User, {
  foreignKey: 'requestedBy',
  as: 'requester'
});

db.Request.belongsTo(db.User, {
  foreignKey: 'approvalAuthorityId',
  as: 'approvalAuthority'
});

db.Request.belongsTo(db.User, {
  foreignKey: 'approvedBy',
  as: 'approver'
});

db.Asset.hasMany(db.Request, {
  foreignKey: 'assetId',
  as: 'requests'
});

db.User.hasMany(db.Request, {
  foreignKey: 'requestedBy',
  as: 'myRequests'
});

// ==================== AuditLog Relationships ====================
db.AuditLog.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

db.User.hasMany(db.AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});

// ==================== TransferHistory Relationships ====================
db.TransferHistory.belongsTo(db.Transfer, {
  foreignKey: 'transferId',
  as: 'transfer'
});

db.TransferHistory.belongsTo(db.User, {
  foreignKey: 'performedBy',
  as: 'performer'
});

db.Transfer.hasMany(db.TransferHistory, {
  foreignKey: 'transferId',
  as: 'history'
});

db.User.hasMany(db.TransferHistory, {
  foreignKey: 'performedBy',
  as: 'transferActions'
});

module.exports = db;
