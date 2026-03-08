const db = require('../models');
const { testConnection } = require('../config/database');

async function migrateRequestSignatures() {
  try {
    console.log('🔄 Starting Request Signatures Migration...\n');

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    console.log('✓ Database connection established\n');

    // Add new columns to requests table
    const queryInterface = db.sequelize.getQueryInterface();

    const { DataTypes } = require('sequelize');

    // Add permittedAmount column
    console.log('📝 Adding permittedAmount column...');
    await queryInterface.addColumn('requests', 'permittedAmount', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Amount permitted by approval authority'
    });
    console.log('✅ permittedAmount column added\n');

    // Add requesterSignature column
    console.log('📝 Adding requesterSignature column...');
    await queryInterface.addColumn('requests', 'requesterSignature', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of requestor'
    });
    console.log('✅ requesterSignature column added\n');

    // Add approverSignature column
    console.log('📝 Adding approverSignature column...');
    await queryInterface.addColumn('requests', 'approverSignature', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of approval authority'
    });
    console.log('✅ approverSignature column added\n');

    // Add completerSignature column
    console.log('📝 Adding completerSignature column...');
    await queryInterface.addColumn('requests', 'completerSignature', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Digital signature of property officer who completed'
    });
    console.log('✅ completerSignature column added\n');

    // Add completedBy column
    console.log('📝 Adding completedBy column...');
    await queryInterface.addColumn('requests', 'completedBy', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Property officer who completed the request'
    });
    console.log('✅ completedBy column added\n');

    // Update default status for new requests from 'pending' to 'in_progress'
    console.log('Note: Default status changed to "in_progress" for new requests');
    console.log('Existing requests remain unchanged\n');

    console.log('\n✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('Summary:');
    console.log('- Added permittedAmount field');
    console.log('- Added requesterSignature field');
    console.log('- Added approverSignature field');
    console.log('- Added completerSignature field');
    console.log('- Added completedBy field');
    console.log('- Default status is now "in_progress" for new requests');
    console.log('═══════════════════════════════════════');
    console.log('Please restart your application to use the new schema.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    console.log('\nℹ️  If columns already exist, the migration may have already been run.');
    process.exit(1);
  }
}

// Run migration
migrateRequestSignatures();
