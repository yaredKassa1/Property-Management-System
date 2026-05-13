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
    console.log('Starting migration: Create procurement_workflows table...');

    // Create workflow state ENUM type
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_procurement_workflows_currentState AS ENUM (
          'pending_approval',
          'pending_vp_approval',
          'pending_property_officer',
          'purchase_notification_sent',
          'pending_qa_inspection',
          'qa_approved',
          'qa_rejected',
          'item_ready',
          'completed',
          'rejected'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created currentState ENUM type');

    // Create decision ENUM type
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_procurement_workflows_decision AS ENUM ('approve', 'reject');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created decision ENUM type');

    // Create procurement_workflows table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS procurement_workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "requestId" UUID NOT NULL REFERENCES requests(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        "currentState" enum_procurement_workflows_currentState NOT NULL DEFAULT 'pending_approval',
        
        -- Approval Authority Stage
        "approvalAuthorityId" UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "approvalAuthorityDecision" enum_procurement_workflows_decision,
        "approvalAuthorityComments" TEXT,
        "approvalAuthorityTimestamp" TIMESTAMP WITH TIME ZONE,
        
        -- Vice President Stage
        "vpId" UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "vpDecision" enum_procurement_workflows_decision,
        "vpComments" TEXT,
        "vpTimestamp" TIMESTAMP WITH TIME ZONE,
        
        -- Property Officer Stage
        "propertyOfficerId" UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "propertyOfficerTimestamp" TIMESTAMP WITH TIME ZONE,
        
        -- Purchase Department Stage
        "purchaseDepartmentNotifiedAt" TIMESTAMP WITH TIME ZONE,
        "itemProcuredAt" TIMESTAMP WITH TIME ZONE,
        "procurementDetails" JSONB,
        
        -- QA Inspector Stage
        "qaInspectorId" UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "qaDecision" enum_procurement_workflows_decision,
        "qaComments" TEXT,
        "qaTimestamp" TIMESTAMP WITH TIME ZONE,
        
        -- Completion Tracking
        "completedAt" TIMESTAMP WITH TIME ZONE,
        
        -- Timestamps
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Created procurement_workflows table');

    // Create indexes
    const indexes = [
      { name: 'idx_procurement_workflows_requestId', column: 'requestId' },
      { name: 'idx_procurement_workflows_currentState', column: 'currentState' },
      { name: 'idx_procurement_workflows_approvalAuthorityId', column: 'approvalAuthorityId' },
      { name: 'idx_procurement_workflows_vpId', column: 'vpId' },
      { name: 'idx_procurement_workflows_propertyOfficerId', column: 'propertyOfficerId' },
      { name: 'idx_procurement_workflows_qaInspectorId', column: 'qaInspectorId' }
    ];

    for (const index of indexes) {
      try {
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS ${index.name} ON procurement_workflows("${index.column}");
        `);
        console.log(`✅ Created index: ${index.name}`);
      } catch (e) {
        console.log(`ℹ Index ${index.name} may already exist:`, e.message);
      }
    }

    // Now add the foreign key constraint to requests.workflowId if it doesn't exist
    try {
      await sequelize.query(`
        DO $$ BEGIN
          ALTER TABLE requests 
          ADD CONSTRAINT fk_requests_workflowId 
          FOREIGN KEY ("workflowId") 
          REFERENCES procurement_workflows(id) 
          ON UPDATE CASCADE 
          ON DELETE SET NULL;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log('✅ Added foreign key constraint to requests.workflowId');
    } catch (e) {
      console.log('ℹ Foreign key constraint may already exist:', e.message);
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
