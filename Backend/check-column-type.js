/**
 * Check Column Type in Database
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function checkColumnType() {
  try {
    await sequelize.authenticate();
    console.log('🔍 Checking resetCodeExpiry column type\n');

    const [results] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        datetime_precision,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('resetCodeExpiry', 'createdAt', 'updatedAt', 'lastLogin');
    `);

    console.log('📊 Date/Time Columns in users table:\n');
    results.forEach(col => {
      console.log(`  ${col.column_name}:`);
      console.log(`    Type: ${col.data_type}`);
      console.log(`    Precision: ${col.datetime_precision}`);
      console.log(`    Nullable: ${col.is_nullable}`);
      console.log('');
    });

    // Check actual data
    const [userData] = await sequelize.query(`
      SELECT 
        "resetCodeExpiry",
        pg_typeof("resetCodeExpiry") as expiry_type
      FROM users
      WHERE email = 'selemonbeke6@gmail.com';
    `);

    if (userData.length > 0) {
      console.log('📊 Actual Data:');
      console.log(`  resetCodeExpiry: ${userData[0].resetCodeExpiry}`);
      console.log(`  PostgreSQL Type: ${userData[0].expiry_type}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkColumnType();
