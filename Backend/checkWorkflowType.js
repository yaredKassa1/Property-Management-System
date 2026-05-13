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
    const workflow = await sequelize.query(
      `SELECT id, "currentState", "workflowType" 
       FROM procurement_workflows 
       WHERE id = 'cd3d64c8-8616-4660-97c1-8eeddf87a2ac'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Workflow details:');
    console.log(JSON.stringify(workflow, null, 2));
    
    // Check if workflowType column exists
    const columns = await sequelize.query(
      `SELECT column_name, data_type, column_default 
       FROM information_schema.columns 
       WHERE table_name = 'procurement_workflows' 
       AND column_name = 'workflowType'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\nworkflowType column info:');
    console.log(JSON.stringify(columns, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
