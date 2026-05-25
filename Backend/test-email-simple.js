/**
 * Simple Email Test
 */

require('dotenv').config();

console.log('Testing email service...\n');

// Import the email service
const emailService = require('./src/utils/emailService');

async function testEmail() {
  try {
    console.log('📧 Email Configuration:');
    console.log('   User:', process.env.EMAIL_USER);
    console.log('   Host:', process.env.EMAIL_HOST);
    console.log('   Port:', process.env.EMAIL_PORT);
    console.log('');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email credentials not configured!');
      console.error('   Set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return;
    }

    console.log('🔄 Sending test password reset code...\n');

    // Test the password reset email function
    const result = await emailService.sendPasswordResetCode(
      process.env.EMAIL_USER, // Send to yourself
      '123456', // Test code
      'Test User',
      10 // 10 minutes
    );

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('');
      console.log('📬 Check your inbox:', process.env.EMAIL_USER);
      console.log('   (Also check spam/junk folder)');
    } else if (result.skipped) {
      console.log('⚠️  Email skipped (not configured)');
    } else {
      console.error('❌ Email failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    
    if (error.message.includes('Invalid login')) {
      console.error('🔧 AUTHENTICATION ERROR:');
      console.error('   - Use App Password, not regular Gmail password');
      console.error('   - Generate at: https://myaccount.google.com/apppasswords');
      console.error('   - Enable 2-Factor Authentication first');
    }
  }
}

testEmail();
