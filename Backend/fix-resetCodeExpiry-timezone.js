/**
 * Fix Migration: Change resetCodeExpiry to TIMESTAMP WITH TIME ZONE
 * This fixes the timezone bug where dates were losing 3 hours
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wdupms_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  logging: console.log
});

async function fixResetCodeExpiryTimezone() {
  try {
    console.log('🔄 Starting fix: Change resetCodeExpiry to TIMESTAMP WITH TIME ZONE...\n');

    // Check current column type
    const [results] = await sequelize.query(`
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'resetCodeExpiry';
    `);

    if (results.length === 0) {
      console.log('❌ resetCodeExpiry column not found!');
      return;
    }

    console.log(`📊 Current column type: ${results[0].data_type}`);

    if (results[0].data_type === 'timestamp with time zone') {
      console.log('✅ Column is already TIMESTAMP WITH TIME ZONE. No fix needed.');
      return;
    }

    console.log('\n🔧 Altering column type...');

    // Alter the column type
    await sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN "resetCodeExpiry" 
      TYPE TIMESTAMP WITH TIME ZONE 
      USING "resetCodeExpiry" AT TIME ZONE 'UTC';
    `);

    console.log('✅ Column type changed to TIMESTAMP WITH TIME ZONE');

    // Verify the change
    const [verifyResults] = await sequelize.query(`
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'resetCodeExpiry';
    `);

    console.log(`\n📊 New column type: ${verifyResults[0].data_type}`);
    console.log('\n✅ Fix completed successfully!');
    console.log('\n⚠️  IMPORTANT: Restart the backend server for changes to take effect!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run fix
if (require.main === module) {
  fixResetCodeExpiryTimezone()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fix error:', error);
      process.exit(1);
    });
}

module.exports = fixResetCodeExpiryTimezone;
