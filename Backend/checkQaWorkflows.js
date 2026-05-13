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
    logging: false
  }
);

async function check() {
  try {
    const workflows = await sequelize.query(
      `SELECT id, "requestId", "currentState", "qaInspectorId", "qaDecision" 
       FROM procurement_workflows 
       WHERE "currentState" = 'pending_qa_inspection' 
       LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Workflows in pending_qa_inspection state:');
    console.log(JSON.stringify(workflows, null, 2));
    
    if (workflows.length > 0) {
      // Check the enum type for qaDecision column
      const columnInfo = await sequelize.query(
        `SELECT column_name, data_type, udt_name 
         FROM information_schema.columns 
         WHERE table_name = 'procurement_workflows' 
         AND column_name IN ('qaDecision', 'approvalAuthorityDecision', 'vpDecision')`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('\nColumn type information:');
      console.log(JSON.stringify(columnInfo, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
