const db = require('../models');
const { testConnection } = require('../config/database');

const migrateAuditLogs = async () => {
  try {
    console.log('🔄 Starting migration for audit_logs table...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    // Sync AuditLog table
    await db.AuditLog.sync({ alter: true });
    console.log('   ✅ audit_logs table created/updated');
    
    console.log('\n✅ Audit logs table migration completed successfully!');
    console.log('\n💡 Audit logging is now active for:');
    console.log('   - Login/Logout attempts');
    console.log('   - User creation, updates, deletions');
    console.log('   - Password resets');
    console.log('   - Role changes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
};

// Run migration
migrateAuditLogs();
