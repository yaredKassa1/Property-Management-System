const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'wdupms_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.toString() : '',
  logging: false
});

async function migrateTransferHistory() {
  try {
    console.log('🚀 Starting transfer history table migration...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    const queryInterface = sequelize.getQueryInterface();

    // Check if table exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('transfer_history')) {
      console.log('⚠️  transfer_history table already exists. Skipping creation.\n');
    } else {
      // Create transfer_history table
      console.log('📝 Creating transfer_history table...');
      await queryInterface.createTable('transfer_history', {
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
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ transfer_history table created\n');

      // Create indexes
      console.log('📝 Creating indexes...');
      await queryInterface.addIndex('transfer_history', ['transferId'], {
        name: 'transfer_history_transferId_idx'
      });
      await queryInterface.addIndex('transfer_history', ['performedBy'], {
        name: 'transfer_history_performedBy_idx'
      });
      await queryInterface.addIndex('transfer_history', ['action'], {
        name: 'transfer_history_action_idx'
      });
      await queryInterface.addIndex('transfer_history', ['createdAt'], {
        name: 'transfer_history_createdAt_idx'
      });
      console.log('✅ Indexes created\n');
    }

    console.log('✨ Migration completed successfully!\n');
    console.log('Summary:');
    console.log('- Created transfer_history table for audit trail');
    console.log('- Added indexes for performance');
    console.log('- Tracks all transfer actions with user, timestamp, and metadata\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateTransferHistory();
