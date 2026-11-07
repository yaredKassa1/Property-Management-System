const db = require('../models');
const { testConnection } = require('../config/database');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    // Drop all tables first (in correct order)
    console.log('🗑️  Dropping existing tables...');
    await db.sequelize.query('DROP TABLE IF EXISTS transfer_history CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS audit_logs CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS procurement_inspections CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS returns CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS transfers CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS procurement_workflows CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS requests CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS assets CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS users CASCADE;');

    // Drop all ENUM types
    console.log('🗑️  Dropping existing ENUM types...');
    const enumTypes = [
      'enum_users_role', 'enum_users_wing',
      'enum_assets_category', 'enum_assets_status', 'enum_assets_condition', 'enum_assets_sourceType',
      'enum_requests_requestType', 'enum_requests_status', 'enum_requests_priority', 'enum_requests_fulfillmentPath',
      'enum_transfers_status',
      'enum_returns_status', 'enum_returns_returnCondition',
      'enum_procurement_workflows_currentState', 'enum_procurement_workflows_approvalAuthorityDecision',
      'enum_procurement_workflows_vpDecision', 'enum_procurement_workflows_qaDecision', 'enum_procurement_workflows_workflowType',
      'enum_procurement_inspections_status', 'enum_procurement_inspections_assessedCondition',
      'enum_notifications_type',
      'enum_audit_logs_status',
      'enum_transfer_history_action'
    ];

    for (const enumType of enumTypes) {
      await db.sequelize.query(`DROP TYPE IF EXISTS "public"."${enumType}" CASCADE;`);
    }

    // Now sync with force: true (will create fresh tables)
    console.log('📦 Creating tables...');
    await db.sequelize.sync({ force: false, logging: false });
    
    console.log('✅ Database migration completed successfully');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - assets');
    console.log('   - transfers');
    console.log('   - transfer_history');
    console.log('   - returns');
    console.log('   - requests');
    console.log('   - procurement_workflows');
    console.log('   - procurement_inspections');
    console.log('   - notifications');
    console.log('   - audit_logs');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run migration
migrate();
