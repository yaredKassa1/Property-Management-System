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

    // Sync all models with database
    // For existing tables, use alter: true
    // For new installations, you can use force: true (WARNING: drops all data!)
    await db.sequelize.sync({ alter: true, logging: false });
    
    console.log('✅ Database migration completed successfully');
    console.log('📋 Tables created/updated:');
    console.log('   - users');
    console.log('   - assets');
    console.log('   - transfers');
    console.log('   - returns');
    console.log('   - requests');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 If you see constraint errors, you may need to:');
    console.error('   1. Back up your data');
    console.error('   2. Drop the problematic table');
    console.error('   3. Run migration again');
    console.error('\n   Or start fresh with a new database.');
    process.exit(1);
  }
};

// Run migration
migrate();
