const { Asset } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  async checkAvailability(itemDetails) {
    const { itemType, quantity = 1 } = itemDetails;
    const availableItems = await Asset.findAll({
      where: { name: { [Op.iLike]: `%${itemType}%` }, status: 'available', assignedTo: null },
      limit: quantity
    });
    if (availableItems.length >= quantity) {
      return { available: true, itemId: availableItems[0].id, items: availableItems.slice(0, quantity) };
    }
    return { available: false, matchedCount: availableItems.length };
  }

  async reserveItem(itemId, requestId, transaction) {
    try {
      const item = await Asset.findOne({ where: { id: itemId }, lock: transaction.LOCK.UPDATE, transaction });
      if (!item) return { success: false, error: 'Item not found' };
      if (item.status !== 'available' || item.assignedTo !== null) return { success: false, error: 'Item is no longer available' };
      await item.update({ status: 'reserved', notes: `Reserved for request ${requestId}` }, { transaction });
      return { success: true, item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async storeItem(itemDetails, procurementWorkflowId, transaction, createdBy) {
    if (!createdBy) {
      throw new Error('createdBy is required when storing an item');
    }
    
    const { itemType, quantity = 1 } = itemDetails;
    const item = await Asset.create({
      assetId: `PROC-${Date.now()}`,
      name: itemDetails.itemName || itemType,
      category: 'fixed',
      status: 'available',
      condition: 'excellent',
      value: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      location: 'Store',
      workUnit: 'Central Store',  // Add default workUnit
      quantity: quantity || 1,
      description: `Procured via workflow ${procurementWorkflowId}`,
      assignedTo: null,
      createdBy: createdBy
    }, { transaction });
    return item;
  }

  async getItem(itemId) {
    return await Asset.findByPk(itemId);
  }

  async getAvailableItemsByType(itemType) {
    return await Asset.findAll({
      where: { name: { [Op.iLike]: `%${itemType}%` }, status: 'available', assignedTo: null }
    });
  }
}

module.exports = new InventoryService();

