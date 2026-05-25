/**
 * Update user email
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

async function updateEmail() {
  try {
    await sequelize.authenticate();
    
    const username = process.argv[2] || 'admin';
    const newEmail = process.argv[3] || 'akelubayd@gmail.com';
    
    console.log(`🔄 Updating email for user: ${username}`);
    console.log(`   New email: ${newEmail}\n`);

    const user = await db.User.findOne({
      where: { username }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log(`   Old email: ${user.email}`);
    
    await user.update({ email: newEmail });
    
    console.log(`✅ Email updated successfully!`);
    console.log(`   Username: ${user.username}`);
    console.log(`   New Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

updateEmail();
