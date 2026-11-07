/**
 * Check if user email exists
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

async function checkUser() {
  try {
    await sequelize.authenticate();
    
    const email = process.argv[2] || 'akelubayd@gmail.com';
    
    console.log(`🔍 Searching for user with email: ${email}\n`);

    const user = await db.User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('   This email is not registered in the system');
      console.log('');
      console.log('📋 Available users:');
      
      const allUsers = await db.User.findAll({
        attributes: ['username', 'email', 'role']
      });
      
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.username}) - ${u.role}`);
      });
      
    } else {
      console.log('✅ User found!');
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Reset Code: ${user.resetCode || 'None'}`);
      console.log(`   Reset Code Expiry: ${user.resetCodeExpiry || 'None'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUser();
