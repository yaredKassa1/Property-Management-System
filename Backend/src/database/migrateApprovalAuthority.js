const db = require('../models');
const { testConnection } = require('../config/database');

async function migrateApprovalAuthority() {
  try {
    console.log('🚀 Starting approval authority migration...\n');

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    console.log('✅ Database connection established\n');

    const queryInterface = db.sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    // Add approvalAuthorityId column to requests table
    console.log('📝 Adding approvalAuthorityId column to requests table...');
    await queryInterface.addColumn('requests', 'approvalAuthorityId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Assigned approval authority who can approve this request'
    });
    console.log('✅ approvalAuthorityId column added\n');

    console.log('✨ Migration completed successfully!\n');
    console.log('Summary:');
    console.log('- Added approvalAuthorityId field to requests table');
    console.log('- Field references users table for approval authority assignment');
    console.log('- Only assigned approval authority can approve/reject requests');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    console.log('\nℹ️  If column already exists, the migration may have already been run.');
    process.exit(1);
  }
}

// Run migration
migrateApprovalAuthority()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
