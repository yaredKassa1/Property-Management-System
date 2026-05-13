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
    console.log('Starting migration: Add procurement workflow fields to requests table...');

    // Create fulfillmentPath ENUM type if it doesn't exist
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_requests_fulfillmentPath AS ENUM ('direct', 'procurement');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created fulfillmentPath ENUM type');

    // Add procurement workflow fields to requests table
    const addColumnIfNotExists = async (column, definition) => {
      try {
        await sequelize.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS "${column}" ${definition}`);
        console.log(`✅ Added column: ${column}`);
      } catch (e) {
        console.log(`ℹ Column ${column} may already exist:`, e.message);
      }
    };

    await addColumnIfNotExists(
      'fulfillmentPath',
      'enum_requests_fulfillmentPath DEFAULT NULL'
    );

    // Check if procurement_workflows table exists before adding foreign key
    const [workflowTableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'procurement_workflows'
      );
    `);

    if (workflowTableExists[0].exists) {
      await addColumnIfNotExists(
        'workflowId',
        'UUID REFERENCES procurement_workflows(id) ON UPDATE CASCADE ON DELETE SET NULL'
      );
    } else {
      // Add column without foreign key constraint for now
      await addColumnIfNotExists(
        'workflowId',
        'UUID DEFAULT NULL'
      );
      console.log('ℹ procurement_workflows table does not exist yet. Foreign key constraint will be added later.');
    }

    await addColumnIfNotExists(
      'assignedItemId',
      'UUID REFERENCES assets(id) ON UPDATE CASCADE ON DELETE SET NULL'
    );

    // Create indexes for the new fields
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_requests_fulfillmentPath ON requests("fulfillmentPath");
      `);
      console.log('✅ Created index on fulfillmentPath');
    } catch (e) {
      console.log('ℹ Index on fulfillmentPath may already exist:', e.message);
    }

    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_requests_workflowId ON requests("workflowId");
      `);
      console.log('✅ Created index on workflowId');
    } catch (e) {
      console.log('ℹ Index on workflowId may already exist:', e.message);
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
