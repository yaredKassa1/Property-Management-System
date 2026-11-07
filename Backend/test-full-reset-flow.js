/**
 * Test Complete Password Reset Flow
 */

require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'selemonbeke6@gmail.com';

async function testFullFlow() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Complete Password Reset Flow Test        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    await sequelize.authenticate();

    // Step 1: Request Password Reset
    console.log('📧 STEP 1: Requesting password reset...');
    console.log(`   Email: ${TEST_EMAIL}\n`);

    const resetResponse = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });

    console.log('✅ Response:', resetResponse.data.message);
    console.log('');

    // Step 2: Check database for reset code
    console.log('🔍 STEP 2: Checking database for reset code...\n');

    const user = await db.User.findOne({
      where: { email: TEST_EMAIL }
    });

    if (!user) {
      console.log('❌ User not found in database!');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Reset Code: ${user.resetCode}`);
    console.log(`   Code Expiry: ${user.resetCodeExpiry}`);
    console.log(`   Attempts: ${user.resetCodeAttempts}`);
    console.log('');

    if (!user.resetCode) {
      console.log('❌ Reset code was not saved to database!');
      console.log('   This is the problem - the code is not being stored.');
      return;
    }

    // Check if expired
    const now = new Date();
    const expiry = new Date(user.resetCodeExpiry);
    const isExpired = now > expiry;
    const timeLeft = Math.floor((expiry - now) / 1000 / 60);

    console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
    if (!isExpired) {
      console.log(`   Time Left: ${timeLeft} minutes`);
    }
    console.log('');

    // Step 3: Verify the code
    console.log('🔐 STEP 3: Verifying reset code...');
    console.log(`   Code to verify: ${user.resetCode}\n`);

    try {
      const verifyResponse = await axios.post(`${API_URL}/verify-reset-code`, {
        email: TEST_EMAIL,
        code: user.resetCode
      });

      console.log('✅ Verification successful!');
      console.log('   Response:', verifyResponse.data.message);
      console.log('');

      // Step 4: Reset password
      console.log('🔑 STEP 4: Resetting password...\n');

      const newPassword = 'testpassword123';
      const resetPasswordResponse = await axios.post(`${API_URL}/reset-password`, {
        email: TEST_EMAIL,
        code: user.resetCode,
        newPassword: newPassword
      });

      console.log('✅ Password reset successful!');
      console.log('   Response:', resetPasswordResponse.data.message);
      console.log(`   New password: ${newPassword}`);
      console.log('');

      console.log('🎉 ALL TESTS PASSED!');
      console.log('   The password reset flow is working correctly.');

    } catch (verifyError) {
      console.error('❌ Verification failed!');
      console.error('   Status:', verifyError.response?.status);
      console.error('   Error:', verifyError.response?.data?.message || verifyError.message);
      console.log('');
      console.log('🔍 Debug Info:');
      console.log(`   Code in DB: "${user.resetCode}"`);
      console.log(`   Code type: ${typeof user.resetCode}`);
      console.log(`   Code length: ${user.resetCode?.length}`);
      console.log(`   Is expired: ${isExpired}`);
    }

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('   Error:', error.response?.data?.message || error.message);
  } finally {
    await sequelize.close();
  }
}

// Check if server is running
console.log('⚠️  Make sure the backend server is running on port 5000!\n');
console.log('   Run: npm run dev\n');

setTimeout(() => {
  testFullFlow();
}, 1000);
