const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const db = require('../models');
const { testConnection } = require('../config/database');

const requiredVariables = [
  'BOOTSTRAP_ADMIN_USERNAME',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_PASSWORD',
  'BOOTSTRAP_ADMIN_FIRST_NAME',
  'BOOTSTRAP_ADMIN_LAST_NAME'
];

const initialize = async () => {
  let exitCode = 0;

  try {
    const missingVariables = requiredVariables.filter((name) => !process.env[name]);
    if (missingVariables.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    }

    if (process.env.BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
      throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters long');
    }

    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    await db.sequelize.sync({ force: false, alter: false, logging: false });

    if (await db.User.count() !== 0) {
      throw new Error('Database already contains users; refusing to create the initial administrator');
    }

    await db.User.create({
      username: process.env.BOOTSTRAP_ADMIN_USERNAME.trim(),
      email: process.env.BOOTSTRAP_ADMIN_EMAIL.trim(),
      password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
      firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME.trim(),
      lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME.trim(),
      role: 'administrator',
      workUnit: process.env.BOOTSTRAP_ADMIN_WORK_UNIT || 'IT Department',
      isActive: true
    });

    console.log('Database initialized and initial administrator created.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    exitCode = 1;
  } finally {
    await db.sequelize.close();
    process.exitCode = exitCode;
  }
};

initialize();
