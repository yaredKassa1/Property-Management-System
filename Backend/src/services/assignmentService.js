const { Asset, Request, User } = require('../models');

/**
 * Assignment Service
 * Handles item assignment to requestors
 */
class AssignmentService {
  /**
   * Assign an item to a requestor
   * @param {string} itemId - ID of item to assign
   * @param {string} requestorId - ID of requestor
   * @param {string} requestId - ID of request
   * @param {Object} transaction - Database transaction
   * @returns {Promise<Object>} Assignment result
   */
  async assignItem(itemId, requestorId, requestId, transaction) {
    try {
      // Get the requestor to update location
      const requestor = await User.findByPk(requestorId, { transaction });
      
      if (!requestor) {
        throw new Error('Requestor not found');
      }

      // Update the asset
      const item = await Asset.findByPk(itemId, { transaction });
      
      if (!item) {
        throw new Error('Item not found');
      }

      await item.update({
        status: 'assigned',
        assignedTo: requestorId,
        assignmentDate: new Date(),
        location: requestor.workUnit || 'Assigned' // Update location to user's work unit
      }, { transaction });

      // Update the request
      await Request.update({
        assignedItemId: itemId,
        status: 'completed',
        completionDate: new Date()
      }, {
        where: { id: requestId },
        transaction
      });

      return {
        success: true,
        assignment: {
          id: `${itemId}-${requestorId}`,
          itemId,
          requestorId,
          requestId,
          assignedAt: new Date(),
          status: 'assigned'
        }
      };
    } catch (error) {
      console.error('Error assigning item:', error);
      throw error;
    }
  }

  /**
   * Get assignment details
   * @param {string} assignmentId - ID of assignment (format: itemId-requestorId)
   * @returns {Promise<Object>} Assignment details
   */
  async getAssignment(assignmentId) {
    const [itemId, requestorId] = assignmentId.split('-');
    
    const item = await Asset.findOne({
      where: {
        id: itemId,
        assignedTo: requestorId
      },
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!item) {
      return null;
    }

    return {
      id: assignmentId,
      itemId: item.id,
      requestorId: item.assignedTo,
      assignedAt: item.assignmentDate,
      status: 'assigned',
      item
    };
  }

  /**
   * Get all assignments for a user
   * @param {string} userId - ID of user
   * @returns {Promise<Array>} User's assignments
   */
  async getUserAssignments(userId) {
    const items = await Asset.findAll({
      where: {
        assignedTo: userId
      },
      order: [['assignmentDate', 'DESC']]
    });

    return items.map(item => ({
      id: `${item.id}-${userId}`,
      itemId: item.id,
      requestorId: userId,
      assignedAt: item.assignmentDate,
      status: 'assigned',
      item
    }));
  }
}

module.exports = new AssignmentService();
