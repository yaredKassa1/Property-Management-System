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
    console.log('Starting migration: Add procurement fields to requests table...');

    // Add procurement status ENUM value to requests status
    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_requests_status' AND e.enumlabel = 'procurement_in_progress') THEN
          ALTER TYPE "enum_requests_status" ADD VALUE 'procurement_in_progress';
        END IF;
      END $$;
    `);
    console.log('✅ Added procurement_in_progress status');

    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_requests_status' AND e.enumlabel = 'purchased') THEN
          ALTER TYPE "enum_requests_status" ADD VALUE 'purchased';
        END IF;
      END $$;
    `);
    console.log('✅ Added purchased status');

    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_requests_status' AND e.enumlabel = 'delivered') THEN
          ALTER TYPE "enum_requests_status" ADD VALUE 'delivered';
        END IF;
      END $$;
    `);
    console.log('✅ Added delivered status');

    // Add procurement fields to requests table
    const addColumnIfNotExists = async (column, definition) => {
      try {
        await sequelize.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS "${column}" ${definition}`);
        console.log(`✅ Added column: ${column}`);
      } catch (e) {
        console.log(`ℹ Column ${column} may already exist:`, e.message);
      }
    };

    await addColumnIfNotExists('procurementStatus', 'VARCHAR(50) DEFAULT NULL');
    await addColumnIfNotExists('supplierName', 'VARCHAR(200) DEFAULT NULL');
    await addColumnIfNotExists('supplierContact', 'VARCHAR(200) DEFAULT NULL');
    await addColumnIfNotExists('quotationAmount', 'DECIMAL(15,2) DEFAULT NULL');
    await addColumnIfNotExists('purchaseOrderNumber', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfNotExists('procurementNotes', 'TEXT DEFAULT NULL');
    await addColumnIfNotExists('procurementDate', 'TIMESTAMP DEFAULT NULL');
    await addColumnIfNotExists('expectedDeliveryDate', 'TIMESTAMP DEFAULT NULL');
    await addColumnIfNotExists('actualDeliveryDate', 'TIMESTAMP DEFAULT NULL');
    await addColumnIfNotExists('processedBy', 'UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
