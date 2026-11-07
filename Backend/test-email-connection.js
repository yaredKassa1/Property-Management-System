/**
 * Email Connection Test Script
 * Tests SMTP connection and email sending
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('╔════════════════════════════════════════════╗');
console.log('║     Email Connection Test                 ║');
console.log('╚════════════════════════════════════════════╝\n');

// Display configuration
console.log('📧 Email Configuration:');
console.log('   Host:', process.env.EMAIL_HOST);
console.log('   Port:', process.env.EMAIL_PORT);
console.log('   Secure:', process.env.EMAIL_SECURE);
console.log('   User:', process.env.EMAIL_USER);
console.log('   Password:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('   From:', process.env.EMAIL_FROM);
console.log('');

// Check if credentials are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: Email credentials not configured!');
  console.error('   Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true, // Enable debug output
  logger: true  // Log to console
});

async function testConnection() {
  try {
    console.log('🔄 Testing SMTP connection...\n');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📧 Sending test email...\n');
    
    const testEmail = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - WDUPMS Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Test Successful!</h2>
          <p>This is a test email from the Woldia University Property Management System.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 14px;">
            <strong>Configuration Details:</strong><br>
            Host: ${process.env.EMAIL_HOST}<br>
            Port: ${process.env.EMAIL_PORT}<br>
            User: ${process.env.EMAIL_USER}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('');
    console.log('📬 Check your inbox:', process.env.EMAIL_USER);
    console.log('   (Also check spam/junk folder)');
    console.log('');
    console.log('✅ Email configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ Email test failed!\n');
    console.error('Error Details:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('');
    
    // Provide specific troubleshooting
    if (error.code === 'EAUTH') {
      console.error('🔧 AUTHENTICATION ERROR:');
      console.error('   - Make sure you are using an App Password, not your regular Gmail password');
      console.error('   - Generate App Password at: https://myaccount.google.com/apppasswords');
      console.error('   - Make sure 2-Factor Authentication is enabled');
      console.error('   - Remove any spaces from the App Password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('🔧 CONNECTION ERROR:');
      console.error('   - Check your internet connection');
      console.error('   - Verify EMAIL_HOST is correct:', process.env.EMAIL_HOST);
      console.error('   - Verify EMAIL_PORT is correct:', process.env.EMAIL_PORT);
      console.error('   - Check if firewall is blocking port 587');
    } else if (error.code === 'ESOCKET') {
      console.error('🔧 SOCKET ERROR:');
      console.error('   - Try changing EMAIL_SECURE to true');
      console.error('   - Try using port 465 instead of 587');
    } else {
      console.error('🔧 UNKNOWN ERROR:');
      console.error('   Full error:', error);
    }
    
    console.error('');
    console.error('📚 For more help, see: GMAIL_APP_PASSWORD_SETUP_GUIDE.md');
    process.exit(1);
  }
}

// Run test
testConnection();
