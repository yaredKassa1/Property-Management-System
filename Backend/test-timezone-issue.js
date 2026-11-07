/**
 * Test Timezone Issue with Reset Code
 */

require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'selemonbeke6@gmail.com';

async function testTimezoneIssue() {
  console.log('🔍 Testing Timezone Issue\n');

  try {
    await sequelize.authenticate();

    // Step 1: Request password reset
    console.log('📧 Step 1: Requesting password reset...');
    const response = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log('✅', response.data.message);
    console.log('');

    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Check what's in the database
    console.log('🔍 Step 2: Checking database...');
    const user = await db.User.findOne({
      where: { email: TEST_EMAIL }
    });

    if (!user || !user.resetCode) {
      console.log('❌ No reset code found in database!');
      return;
    }

    console.log('✅ Reset code found:');
    console.log(`   Code: ${user.resetCode}`);
    console.log(`   Expiry (from DB): ${user.resetCodeExpiry}`);
    console.log(`   Expiry type: ${typeof user.resetCodeExpiry}`);
    console.log(`   Expiry constructor: ${user.resetCodeExpiry.constructor.name}`);
    console.log('');

    // Step 3: Test the comparison logic
    console.log('🧪 Step 3: Testing comparison logic...');
    const now = new Date();
    const expiryFromDB = user.resetCodeExpiry;
    const expiryAsNewDate = new Date(user.resetCodeExpiry);

    console.log(`   Current time: ${now}`);
    console.log(`   Current time (ISO): ${now.toISOString()}`);
    console.log(`   Current time (valueOf): ${now.valueOf()}`);
    console.log('');
    console.log(`   Expiry from DB: ${expiryFromDB}`);
    console.log(`   Expiry from DB (ISO): ${expiryFromDB.toISOString()}`);
    console.log(`   Expiry from DB (valueOf): ${expiryFromDB.valueOf()}`);
    console.log('');
    console.log(`   Expiry as new Date: ${expiryAsNewDate}`);
    console.log(`   Expiry as new Date (ISO): ${expiryAsNewDate.toISOString()}`);
    console.log(`   Expiry as new Date (valueOf): ${expiryAsNewDate.valueOf()}`);
    console.log('');

    // Test comparisons
    const isExpired1 = now > expiryFromDB;
    const isExpired2 = now > expiryAsNewDate;
    const isExpired3 = now.valueOf() > expiryFromDB.valueOf();

    console.log('📊 Comparison Results:');
    console.log(`   now > expiryFromDB: ${isExpired1}`);
    console.log(`   now > new Date(expiry): ${isExpired2}`);
    console.log(`   now.valueOf() > expiry.valueOf(): ${isExpired3}`);
    console.log('');

    // Calculate time difference
    const diffMs = expiryFromDB - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);

    console.log('⏱️  Time Difference:');
    console.log(`   Milliseconds: ${diffMs}`);
    console.log(`   Minutes: ${diffMinutes}`);
    console.log(`   Seconds: ${diffSeconds}`);
    console.log('');

    if (diffMs > 0) {
      console.log('✅ Code should be VALID (expiry is in the future)');
    } else {
      console.log('❌ Code should be EXPIRED (expiry is in the past)');
    }
    console.log('');

    // Step 4: Try to verify the code
    console.log('🔐 Step 4: Attempting to verify code...');
    try {
      const verifyResponse = await axios.post(`${API_URL}/verify-reset-code`, {
        email: TEST_EMAIL,
        code: user.resetCode
      });
      console.log('✅ Verification successful!');
      console.log('   Message:', verifyResponse.data.message);
    } catch (error) {
      console.log('❌ Verification failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  } finally {
    await sequelize.close();
  }
}

testTimezoneIssue();
