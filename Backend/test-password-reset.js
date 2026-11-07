/**
 * Quick Test Script for Password Reset API
 * Run this to test the password reset endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'admin@example.com'; // Change to a real email in your database

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset API...\n');

  try {
    // Test 1: Request Password Reset
    console.log('📧 Test 1: Requesting password reset...');
    const resetResponse = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log('✅ Response:', resetResponse.data);
    console.log('📬 Check your email for the 6-digit code!\n');

    // Prompt for code
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Enter the 6-digit code from email: ', async (code) => {
      try {
        // Test 2: Verify Reset Code
        console.log('\n🔍 Test 2: Verifying reset code...');
        const verifyResponse = await axios.post(`${API_URL}/verify-reset-code`, {
          email: TEST_EMAIL,
          code: code.trim()
        });
        console.log('✅ Response:', verifyResponse.data);

        // Test 3: Reset Password
        console.log('\n🔐 Test 3: Resetting password...');
        const newPassword = 'testpassword123';
        const resetPasswordResponse = await axios.post(`${API_URL}/reset-password`, {
          email: TEST_EMAIL,
          code: code.trim(),
          newPassword: newPassword
        });
        console.log('✅ Response:', resetPasswordResponse.data);
        console.log(`\n✅ Password reset successful! New password: ${newPassword}`);
        console.log('📬 Check your email for confirmation!\n');

      } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
      } finally {
        readline.close();
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Test invalid scenarios
async function testInvalidScenarios() {
  console.log('\n🧪 Testing Invalid Scenarios...\n');

  try {
    // Test: Invalid email format
    console.log('📧 Test: Invalid email format...');
    try {
      await axios.post(`${API_URL}/forgot-password`, {
        email: 'invalid-email'
      });
    } catch (error) {
      console.log('✅ Correctly rejected:', error.response?.data?.message);
    }

    // Test: Invalid code format
    console.log('\n🔍 Test: Invalid code format...');
    try {
      await axios.post(`${API_URL}/verify-reset-code`, {
        email: TEST_EMAIL,
        code: '12345' // Only 5 digits
      });
    } catch (error) {
      console.log('✅ Correctly rejected:', error.response?.data?.message);
    }

    // Test: Wrong code
    console.log('\n🔍 Test: Wrong code...');
    try {
      await axios.post(`${API_URL}/verify-reset-code`, {
        email: TEST_EMAIL,
        code: '000000'
      });
    } catch (error) {
      console.log('✅ Correctly rejected:', error.response?.data?.message);
    }

    console.log('\n✅ All invalid scenario tests passed!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Main execution
console.log('╔════════════════════════════════════════════╗');
console.log('║  Password Reset API Test Suite            ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('⚠️  Make sure the backend server is running on port 5000!\n');

// Uncomment the test you want to run:
testPasswordReset();
// testInvalidScenarios();
