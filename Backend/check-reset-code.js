/**
 * Check Reset Code in Database
 * Debug script to see what's stored in the database
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');
const { Op } = require('sequelize');

async function checkResetCode() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all users with reset codes
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'email', 'resetCode', 'resetCodeExpiry', 'resetCodeAttempts'],
      where: {
        resetCode: { [Op.ne]: null }
      }
    });

    if (users.length === 0) {
      console.log('❌ No users with reset codes found');
      console.log('   Try requesting a password reset first');
      return;
    }

    console.log('📊 Users with Reset Codes:\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.username} (${user.email})`);
      console.log(`   Reset Code: ${user.resetCode}`);
      console.log(`   Code Expiry: ${user.resetCodeExpiry}`);
      console.log(`   Attempts: ${user.resetCodeAttempts}`);
      
      // Check if expired
      const now = new Date();
      const expiry = new Date(user.resetCodeExpiry);
      const isExpired = now > expiry;
      const timeLeft = Math.floor((expiry - now) / 1000 / 60); // minutes
      
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
      if (!isExpired) {
        console.log(`   Time Left: ${timeLeft} minutes`);
      }
      console.log('');
    });

    // Get the most recent one
    const latestUser = users[users.length - 1];
    console.log('🔍 Latest Reset Code Details:');
    console.log(`   Email: ${latestUser.email}`);
    console.log(`   Code: ${latestUser.resetCode}`);
    console.log(`   Code Type: ${typeof latestUser.resetCode}`);
    console.log(`   Code Length: ${latestUser.resetCode?.length}`);
    console.log(`   Expiry: ${latestUser.resetCodeExpiry}`);
    console.log(`   Current Time: ${new Date()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkResetCode();
