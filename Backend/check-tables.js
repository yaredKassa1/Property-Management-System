const { sequelize } = require('./src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking existing tables...\n');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    if (results.length === 0) {
      console.log('❌ No tables found in the database!');
      console.log('\n💡 You need to run the migration first:');
      console.log('   npm run migrate\n');
    } else {
      console.log(`✅ Found ${results.length} tables:\n`);
      results.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
      console.log('\n✅ Database is ready! You can now run:');
      console.log('   npm run seed\n');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
