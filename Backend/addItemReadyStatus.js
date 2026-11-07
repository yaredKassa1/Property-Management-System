const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT || 5432, dialect: 'postgres', logging: false }
);

async function run() {
  try {
    // Add 'item_ready' to the requests status enum
    await sequelize.query(`
      ALTER TYPE "enum_requests_status" ADD VALUE IF NOT EXISTS 'item_ready';
    `);
    console.log('✅ Added item_ready to enum_requests_status');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run();
