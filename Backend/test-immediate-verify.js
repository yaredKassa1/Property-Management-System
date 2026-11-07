/**
 * Test Immediate Verification (no delay)
 */

require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'selemonbeke6@gmail.com';

async function testImmediateVerify() {
  console.log('⚡ Testing Immediate Verification\n');

  try {
    await sequelize.authenticate();

    // Step 1: Request password reset
    console.log('📧 Step 1: Requesting NEW password reset...');
    const response = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log('✅', response.data.message);
    
    // Wait just 500ms for database to update
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Get the code from database
    console.log('\n🔍 Step 2: Getting code from database...');
    const user = await db.User.findOne({
      where: { email: TEST_EMAIL }
    });

    if (!user || !user.resetCode) {
      console.log('❌ No reset code found!');
      return;
    }

    const now = new Date();
    const expiry = user.resetCodeExpiry;
    const diffMs = expiry - now;
    const diffSeconds = Math.floor(diffMs / 1000);

    console.log(`✅ Code: ${user.resetCode}`);
    console.log(`   Generated at: ${now.toISOString()}`);
    console.log(`   Expires at: ${expiry.toISOString()}`);
    console.log(`   Time until expiry: ${diffSeconds} seconds`);
    console.log(`   Should be valid: ${diffMs > 0 ? 'YES ✅' : 'NO ❌'}`);

    // Step 3: Immediately verify
    console.log('\n🔐 Step 3: Verifying code IMMEDIATELY...');
    try {
      const verifyResponse = await axios.post(`${API_URL}/verify-reset-code`, {
        email: TEST_EMAIL,
        code: user.resetCode
      });
      console.log('✅ SUCCESS! Verification passed!');
      console.log('   Message:', verifyResponse.data.message);
      console.log('\n🎉 The password reset flow is working correctly!');
    } catch (error) {
      console.log('❌ FAILED! Verification failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('\n🐛 This indicates a bug in the verification logic.');
      
      // Debug the comparison
      console.log('\n🔍 Debug Info:');
      console.log(`   Code matches: ${user.resetCode === user.resetCode}`);
      console.log(`   Time diff (ms): ${diffMs}`);
      console.log(`   Is expired (should be false): ${now > expiry}`);
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

console.log('⚠️  This test will request a NEW reset code and verify it immediately.\n');
testImmediateVerify();
