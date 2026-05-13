const { Sequelize, DataTypes } = require('sequelize');
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
    console.log('Starting migration: Create procurement_inspections table...');

    // Create procurement_inspections table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS procurement_inspections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "requestId" UUID NOT NULL REFERENCES requests(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        "assetId" UUID NOT NULL REFERENCES assets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_correction')),
        "inspectedBy" UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "inspectionDate" TIMESTAMP,
        "assessedCondition" VARCHAR(50) CHECK ("assessedCondition" IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
        remarks TEXT,
        "rejectionReason" TEXT,
        "correctionRequired" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Created procurement_inspections table');

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_inspections_request_id ON procurement_inspections("requestId");
    `);
    console.log('✅ Created index on requestId');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_inspections_asset_id ON procurement_inspections("assetId");
    `);
    console.log('✅ Created index on assetId');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_inspections_status ON procurement_inspections(status);
    `);
    console.log('✅ Created index on status');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_inspections_inspected_by ON procurement_inspections("inspectedBy");
    `);
    console.log('✅ Created index on inspectedBy');

    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
