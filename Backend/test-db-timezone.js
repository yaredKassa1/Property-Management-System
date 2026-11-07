/**
 * Test Database Timezone Handling
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

async function testDatabaseTimezone() {
  console.log('🔍 Testing Database Timezone Handling\n');

  try {
    await sequelize.authenticate();

    // Test 1: Check PostgreSQL timezone setting
    console.log('📊 Test 1: PostgreSQL Timezone Settings');
    const [results] = await sequelize.query("SHOW TIMEZONE");
    console.log('  PostgreSQL Timezone:', results[0]);
    console.log('');

    // Test 2: Create a test date and save it
    console.log('📊 Test 2: Date Storage Test');
    const testDate = new Date();
    console.log('  JavaScript Date (local):', testDate.toString());
    console.log('  JavaScript Date (ISO/UTC):', testDate.toISOString());
    console.log('  JavaScript valueOf:', testDate.valueOf());
    console.log('');

    // Test 3: Save and retrieve a date
    console.log('📊 Test 3: Save and Retrieve Date');
    const user = await db.User.findOne({
      where: { email: 'selemonbeke6@gmail.com' }
    });

    if (!user) {
      console.log('  ❌ User not found');
      return;
    }

    // Create expiry date: 10 minutes from now
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (10 * 60 * 1000));
    
    console.log('  Before Save:');
    console.log('    Current time:', now.toISOString());
    console.log('    Expiry time:', expiryDate.toISOString());
    console.log('    Difference (ms):', expiryDate.getTime() - now.getTime());
    console.log('    Difference (min):', (expiryDate.getTime() - now.getTime()) / 60000);
    console.log('');

    // Save to database
    await user.update({
      resetCodeExpiry: expiryDate
    });

    console.log('  ✅ Saved to database');
    console.log('');

    // Retrieve from database
    await user.reload();
    
    console.log('  After Retrieve:');
    console.log('    Retrieved expiry:', user.resetCodeExpiry.toISOString());
    console.log('    Retrieved (local):', user.resetCodeExpiry.toString());
    console.log('    Retrieved valueOf:', user.resetCodeExpiry.valueOf());
    console.log('');

    // Compare
    const nowAfterRetrieve = new Date();
    const diff = user.resetCodeExpiry.getTime() - nowAfterRetrieve.getTime();
    const diffMinutes = diff / 60000;

    console.log('  Comparison:');
    console.log('    Current time:', nowAfterRetrieve.toISOString());
    console.log('    Expiry time:', user.resetCodeExpiry.toISOString());
    console.log('    Difference (ms):', diff);
    console.log('    Difference (min):', diffMinutes.toFixed(2));
    console.log('    Is expired:', nowAfterRetrieve > user.resetCodeExpiry);
    console.log('    Should be expired:', diffMinutes < 0);
    console.log('');

    if (diffMinutes > 9 && diffMinutes < 11) {
      console.log('  ✅ Date storage is working correctly!');
    } else {
      console.log('  ❌ Date storage has timezone issues!');
      console.log('     Expected ~10 minutes, got', diffMinutes.toFixed(2), 'minutes');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabaseTimezone();
