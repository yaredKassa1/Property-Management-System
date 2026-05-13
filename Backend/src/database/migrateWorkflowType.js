const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT || 5432, dialect: 'postgres', logging: false }
);

async function migrate() {
  try {
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_procurement_workflows_workflowType AS ENUM ('existing_asset', 'new_item');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      ALTER TABLE procurement_workflows
      ADD COLUMN IF NOT EXISTS "workflowType" enum_procurement_workflows_workflowType NOT NULL DEFAULT 'new_item';
    `);

    console.log('✅ workflowType column added');
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

migrate();
