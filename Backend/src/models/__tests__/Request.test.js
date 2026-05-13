const { Sequelize, DataTypes } = require('sequelize');

describe('Request Model', () => {
  let Request;

  beforeAll(() => {
    // Create a mock sequelize instance
    const sequelize = {
      define: jest.fn((modelName, attributes, options) => {
        return {
          rawAttributes: attributes,
          options: options
        };
      })
    };

    // Load the Request model
    Request = require('../Request')(sequelize, DataTypes);
  });

  describe('Model Definition', () => {
    test('should have all required fields defined', () => {
      const attributes = Request.rawAttributes;

      // Core fields
      expect(attributes.id).toBeDefined();
      expect(attributes.requestType).toBeDefined();
      expect(attributes.itemName).toBeDefined();
      expect(attributes.quantity).toBeDefined();
      expect(attributes.status).toBeDefined();
      expect(attributes.requestedBy).toBeDefined();
      expect(attributes.workUnit).toBeDefined();
      expect(attributes.purpose).toBeDefined();

      // Procurement workflow fields (new)
      expect(attributes.fulfillmentPath).toBeDefined();
      expect(attributes.workflowId).toBeDefined();
      expect(attributes.assignedItemId).toBeDefined();
    });

    test('fulfillmentPath should be an ENUM with correct values', () => {
      const fulfillmentPath = Request.rawAttributes.fulfillmentPath;
      
      expect(fulfillmentPath.type.constructor.name).toBe('ENUM');
      expect(fulfillmentPath.type.values).toEqual(['direct', 'procurement']);
      expect(fulfillmentPath.allowNull).toBe(true);
    });

    test('workflowId should be a UUID with correct references', () => {
      const workflowId = Request.rawAttributes.workflowId;
      
      // DataTypes.UUID is a function, so we check the type property
      expect(workflowId.type).toBe(DataTypes.UUID);
      expect(workflowId.allowNull).toBe(true);
      expect(workflowId.references).toBeDefined();
      expect(workflowId.references.model).toBe('procurement_workflows');
      expect(workflowId.references.key).toBe('id');
    });

    test('assignedItemId should be a UUID with correct references', () => {
      const assignedItemId = Request.rawAttributes.assignedItemId;
      
      // DataTypes.UUID is a function, so we check the type property
      expect(assignedItemId.type).toBe(DataTypes.UUID);
      expect(assignedItemId.allowNull).toBe(true);
      expect(assignedItemId.references).toBeDefined();
      expect(assignedItemId.references.model).toBe('assets');
      expect(assignedItemId.references.key).toBe('id');
    });

    test('status ENUM should include all required values', () => {
      const status = Request.rawAttributes.status;
      
      expect(status.type.constructor.name).toBe('ENUM');
      expect(status.type.values).toContain('pending');
      expect(status.type.values).toContain('under_review');
      expect(status.type.values).toContain('approved');
      expect(status.type.values).toContain('rejected');
      expect(status.type.values).toContain('in_progress');
      expect(status.type.values).toContain('procurement_in_progress');
      expect(status.type.values).toContain('purchased');
      expect(status.type.values).toContain('delivered');
      expect(status.type.values).toContain('completed');
      expect(status.type.values).toContain('cancelled');
    });

    test('should have proper indexes defined', () => {
      const indexes = Request.options.indexes;
      
      // Check that indexes array exists
      expect(indexes).toBeDefined();
      expect(Array.isArray(indexes)).toBe(true);

      // Extract field names from indexes
      const indexedFields = indexes.map(idx => idx.fields[0]);

      // Verify new indexes are present
      expect(indexedFields).toContain('fulfillmentPath');
      expect(indexedFields).toContain('workflowId');

      // Verify existing indexes are still present
      expect(indexedFields).toContain('requestType');
      expect(indexedFields).toContain('status');
      expect(indexedFields).toContain('requestedBy');
    });
  });

  describe('Field Validation', () => {
    test('required fields should not allow null', () => {
      const attributes = Request.rawAttributes;

      expect(attributes.requestType.allowNull).toBe(false);
      expect(attributes.itemName.allowNull).toBe(false);
      expect(attributes.quantity.allowNull).toBe(false);
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.requestedBy.allowNull).toBe(false);
      expect(attributes.workUnit.allowNull).toBe(false);
      expect(attributes.purpose.allowNull).toBe(false);
    });

    test('procurement workflow fields should allow null', () => {
      const attributes = Request.rawAttributes;

      // These fields are optional and should allow null
      expect(attributes.fulfillmentPath.allowNull).toBe(true);
      expect(attributes.workflowId.allowNull).toBe(true);
      expect(attributes.assignedItemId.allowNull).toBe(true);
    });

    test('quantity should have minimum value validation', () => {
      const quantity = Request.rawAttributes.quantity;
      
      expect(quantity.validate).toBeDefined();
      expect(quantity.validate.min).toBe(1);
    });
  });

  describe('Foreign Key Constraints', () => {
    test('workflowId should have CASCADE on update and SET NULL on delete', () => {
      const workflowId = Request.rawAttributes.workflowId;
      
      expect(workflowId.onUpdate).toBe('CASCADE');
      expect(workflowId.onDelete).toBe('SET NULL');
    });

    test('assignedItemId should have CASCADE on update and SET NULL on delete', () => {
      const assignedItemId = Request.rawAttributes.assignedItemId;
      
      expect(assignedItemId.onUpdate).toBe('CASCADE');
      expect(assignedItemId.onDelete).toBe('SET NULL');
    });

    test('requestedBy should have CASCADE on update and RESTRICT on delete', () => {
      const requestedBy = Request.rawAttributes.requestedBy;
      
      expect(requestedBy.onUpdate).toBe('CASCADE');
      expect(requestedBy.onDelete).toBe('RESTRICT');
    });
  });
});
