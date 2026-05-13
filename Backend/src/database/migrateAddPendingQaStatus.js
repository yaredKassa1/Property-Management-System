const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function migrate() {
  try {
    console.log('Starting migration: Add pending_qa to asset status ENUM...');

    // Add 'pending_qa' to the asset status ENUM
    await sequelize.query(
      `ALTER TYPE "enum_assets_status" ADD VALUE IF NOT EXISTS 'pending_qa'`
    );

    console.log('✅ Successfully added pending_qa status to assets table');
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
