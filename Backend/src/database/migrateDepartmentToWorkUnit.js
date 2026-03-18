const db = require('../models');
const { testConnection } = require('../config/database');

/**
 * Migration Script: Rename 'department' field to 'workUnit'
 * 
 * This script renames the 'department' column to 'workUnit' in the following tables:
 * - users
 * - assets
 * - requests
 * - transfers (fromDepartment -> fromWorkUnit, toDepartment -> toWorkUnit)
 * 
 * Run this script ONCE after updating the code to rename the field.
 */

const migrateDepartmentToWorkUnit = async () => {
  try {
    console.log('🔄 Starting department to workUnit migration...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    const queryInterface = db.sequelize.getQueryInterface();

    // 1. Rename column in users table
    console.log('📝 Migrating users table...');
    await queryInterface.renameColumn('users', 'department', 'workUnit');
    console.log('✅ Users table migrated');

    // 2. Rename column in assets table
    console.log('📝 Migrating assets table...');
    await queryInterface.renameColumn('assets', 'department', 'workUnit');
    console.log('✅ Assets table migrated');

    // 3. Rename column in requests table
    console.log('📝 Migrating requests table...');
    await queryInterface.renameColumn('requests', 'department', 'workUnit');
    console.log('✅ Requests table migrated');

    // 4. Rename columns in transfers table
    console.log('📝 Migrating transfers table...');
    await queryInterface.renameColumn('transfers', 'fromDepartment', 'fromWorkUnit');
    await queryInterface.renameColumn('transfers', 'toDepartment', 'toWorkUnit');
    console.log('✅ Transfers table migrated');

    console.log('\n✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('All "department" fields have been renamed to "workUnit"');
    console.log('Please restart your application to use the new schema.');
    console.log('═══════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    console.log('\nℹ️  If columns already exist, the migration may have already been run.');
    process.exit(1);
  }
};

// Run migration
migrateDepartmentToWorkUnit();
