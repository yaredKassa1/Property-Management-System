const db = require('../models');
const { testConnection } = require('../config/database');

const migrateNewTables = async () => {
  try {
    console.log('🔄 Starting migration for new tables...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database');
      process.exit(1);
    }

    // Only sync the new models (Transfer, Return, Request)
    console.log('📋 Creating new tables:');
    
    // Sync Transfer table
    await db.Transfer.sync({ alter: true });
    console.log('   ✅ transfers');
    
    // Sync Return table
    await db.Return.sync({ alter: true });
    console.log('   ✅ returns');
    
    // Sync Request table
    await db.Request.sync({ alter: true });
    console.log('   ✅ requests');
    
    console.log('\n✅ New tables migration completed successfully!');
    console.log('\n💡 Your existing tables (users, assets) remain unchanged.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
};

// Run migration
migrateNewTables();
