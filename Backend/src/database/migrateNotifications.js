// Must strip quotes BEFORE any other require that loads the DB config
const dotenv = require('dotenv');
dotenv.config();
// Strip surrounding double-quotes from DB_PASSWORD (common .env formatting issue)
if (process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = process.env.DB_PASSWORD.replace(/^"|"$/g, '');
}

const { sequelize } = require('../config/database');
const db = require('../models');

async function migrateNotifications() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await db.Notification.sync({ alter: true });
    console.log('✅ notifications table created/updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateNotifications();
