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
    console.log('Fixing QA decision enum type...');

    // Check current column type
    const result = await sequelize.query(`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'procurement_workflows' 
      AND column_name = 'qaDecision';
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Current qaDecision column type:', result);

    // If the column is using the wrong enum type, we need to fix it
    // First, drop the constraint if it exists
    await sequelize.query(`
      ALTER TABLE procurement_workflows 
      ALTER COLUMN "qaDecision" DROP DEFAULT;
    `).catch(e => console.log('No default to drop:', e.message));

    // Change the column to use the correct enum type
    await sequelize.query(`
      ALTER TABLE procurement_workflows 
      ALTER COLUMN "qaDecision" 
      TYPE enum_procurement_workflows_decision 
      USING "qaDecision"::text::enum_procurement_workflows_decision;
    `);

    console.log('✅ Fixed qaDecision enum type');

    // Do the same for other decision columns
    const decisionColumns = [
      'approvalAuthorityDecision',
      'vpDecision'
    ];

    for (const column of decisionColumns) {
      try {
        await sequelize.query(`
          ALTER TABLE procurement_workflows 
          ALTER COLUMN "${column}" DROP DEFAULT;
        `).catch(e => console.log(`No default to drop for ${column}`));

        await sequelize.query(`
          ALTER TABLE procurement_workflows 
          ALTER COLUMN "${column}" 
          TYPE enum_procurement_workflows_decision 
          USING "${column}"::text::enum_procurement_workflows_decision;
        `);
        console.log(`✅ Fixed ${column} enum type`);
      } catch (e) {
        console.log(`ℹ ${column} may already be correct:`, e.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

migrate();
